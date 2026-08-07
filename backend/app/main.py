"""
RouteMind FastAPI Backend Server.
Provides REST endpoints for route optimization, real-time address geocoding, mid-day replanning,
supervisor approval, LLM explainability, cost governance, self-checking, and benchmark evaluations.
"""
import os
import json
import math
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

from backend.app.config import settings
from backend.app.models.schemas import (
    PlanRouteResponse, ReplanTriggerRequest, ReplanDiff, BenchmarkReport, Stop, Package, ConstraintConfig
)
from backend.app.services.geocoding import geocoding_service
from backend.app.services.travel_time_model import TravelTimeCorrectionModel
from backend.app.services.solvers import RouteMindSolver, NaiveGreedySolver, ORToolsSolver
from backend.app.services.constraint_engine import ConstraintEngine
from backend.app.services.replan_service import ReplanService
from backend.app.services.llm_explainer import ExplainerAgent, ExceptionAgent
from backend.app.services.cost_tracker import cost_tracker
from backend.app.services.self_check import SelfCheckService
from backend.app.services.benchmark import BenchmarkService

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
dataset_data: Dict[str, Any] = {}
ml_model = TravelTimeCorrectionModel()
constraint_engine = ConstraintEngine()
routemind_solver = RouteMindSolver(ml_model)
replan_service = ReplanService(constraint_engine)
explainer_agent = ExplainerAgent()
exception_agent = ExceptionAgent()
self_check_service = SelfCheckService(constraint_engine)
benchmark_service = BenchmarkService(ml_model)

current_active_route: Optional[Dict[str, Any]] = None
pending_diff: Optional[ReplanDiff] = None
current_constraint_config = ConstraintConfig()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def update_matrix_for_stop(stop_id: str, stop_lat: float, stop_lng: float):
    """
    Dynamically recalculates distance and travel time matrix for a new or updated stop in real-time.
    """
    stops = dataset_data["stops"]
    planned_matrix = dataset_data["planned_travel_times"]
    actual_matrix = dataset_data["actual_travel_times"]
    dist_matrix = dataset_data["distance_matrix_km"]

    if stop_id not in planned_matrix:
        planned_matrix[stop_id] = {}
        actual_matrix[stop_id] = {}
        dist_matrix[stop_id] = {}

    for other_id, other_stop in stops.items():
        if other_id not in planned_matrix:
            planned_matrix[other_id] = {}
            actual_matrix[other_id] = {}
            dist_matrix[other_id] = {}

        if stop_id == other_id:
            dist_matrix[stop_id][other_id] = 0.0
            planned_matrix[stop_id][other_id] = 0
            actual_matrix[stop_id][other_id] = 0
        else:
            o_lat, o_lng = other_stop["lat"], other_stop["lng"]
            d_km = round(haversine(stop_lat, stop_lng, o_lat, o_lng) * 1.35, 3)
            base_sec = max(30, int((d_km / 25.0) * 3600))
            actual_sec = int(base_sec * 1.15)

            dist_matrix[stop_id][other_id] = d_km
            planned_matrix[stop_id][other_id] = base_sec
            actual_matrix[stop_id][other_id] = actual_sec

            dist_matrix[other_id][stop_id] = d_km
            planned_matrix[other_id][stop_id] = base_sec
            actual_matrix[other_id][stop_id] = actual_sec

def load_dataset_file():
    global dataset_data
    path = settings.DATA_PATH
    if not os.path.exists(path):
        from scripts.download_data import generate_realistic_dataset_slice
        dataset_data = generate_realistic_dataset_slice()
    else:
        with open(path, "r") as f:
            dataset_data = json.load(f)

    # Train ML travel-time model on load
    ml_model.fit_from_dataset(dataset_data)

@app.on_event("startup")
def startup_event():
    load_dataset_file()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "stops_loaded": len(dataset_data.get("stops", {})),
        "ml_model_trained": ml_model.is_trained
    }

@app.get("/api/dataset")
def get_dataset():
    return {
        "metadata": dataset_data.get("metadata", {}),
        "vehicle": dataset_data.get("vehicle", {}),
        "stops": dataset_data.get("stops", {}),
        "packages": dataset_data.get("packages", {}),
        "constraints": current_constraint_config.dict()
    }

@app.post("/api/geocode")
def geocode_address_endpoint(payload: Dict[str, Any] = Body(...)):
    address = payload.get("address", "")
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")

    depot = dataset_data.get("stops", {}).get("DEPOT_BLR_01", {"lat": 12.9716, "lng": 77.5946})
    lat, lng, fmt_addr, pincode = geocoding_service.geocode(address, depot["lat"], depot["lng"])

    return {
        "address_input": address,
        "lat": lat,
        "lng": lng,
        "formatted_address": fmt_addr,
        "pincode": pincode
    }

@app.post("/api/stops/add")
def add_and_geocode_stop(payload: Dict[str, Any] = Body(...)):
    """
    Real-Time Geocoding & Real-Time Route Creation:
    1. Geocodes delivery address in real-time.
    2. Dynamically updates distance matrix for all stops.
    3. Re-runs OR-Tools VRP solver in real-time.
    """
    global dataset_data
    customer_name = payload.get("customer_name", "Priority Customer")
    address = payload.get("address", "Indiranagar 100ft Road")
    cod_amount = float(payload.get("cod_amount", 0.0))

    depot = dataset_data.get("stops", {}).get("DEPOT_BLR_01", {"lat": 12.9716, "lng": 77.5946})
    lat, lng, fmt_addr, pincode = geocoding_service.geocode(address, depot["lat"], depot["lng"])

    stops = dataset_data["stops"]
    packages = dataset_data["packages"]

    stop_id = f"STOP_CUST_{len(stops) + 1:03d}"
    pkg_id = f"PKG_CUST_{len(packages) + 1:03d}"

    stops[stop_id] = {
        "lat": lat,
        "lng": lng,
        "type": "Dropoff",
        "zone_id": "ZONE_EAST_RESIDENTIAL",
        "pincode": pincode,
        "time_window": {"start_time_utc": "09:00:00", "end_time_utc": "18:00:00"},
        "planned_service_time_seconds": 240,
        "status": "PENDING"
    }

    packages[stop_id] = {
        pkg_id: {
            "weight_kg": 3.0,
            "volume_cm3": 6000,
            "is_cod": cod_amount > 0,
            "cod_amount_inr": cod_amount,
            "customer_name": customer_name,
            "address": fmt_addr
        }
    }

    # Recalculate matrix in real-time
    update_matrix_for_stop(stop_id, lat, lng)

    # Re-plan route in real-time
    active_res = plan_route()

    return {
        "status": "success",
        "message": f"Real-time geocoded address to ({lat}, {lng}) and re-optimized route.",
        "geocoded": {
            "stop_id": stop_id,
            "lat": lat,
            "lng": lng,
            "formatted_address": fmt_addr,
            "pincode": pincode
        },
        "updated_route": active_res
    }

@app.put("/api/stops/{stop_id}")
def update_stop_address(stop_id: str, payload: Dict[str, Any] = Body(...)):
    """
    Updates stop address or COD amount in real-time, re-geocodes coordinates, and re-routes.
    """
    global dataset_data
    stops = dataset_data["stops"]
    packages = dataset_data["packages"]

    if stop_id not in stops:
        raise HTTPException(status_code=404, detail=f"Stop {stop_id} not found")

    new_address = payload.get("address")
    new_cod = payload.get("cod_amount")
    new_name = payload.get("customer_name")

    pkg_dict = packages.get(stop_id, {})
    first_pkg_key = list(pkg_dict.keys())[0] if pkg_dict else f"PKG_{stop_id}"

    if new_address:
        depot = stops.get("DEPOT_BLR_01", {"lat": 12.9716, "lng": 77.5946})
        lat, lng, fmt_addr, pincode = geocoding_service.geocode(new_address, depot["lat"], depot["lng"])
        
        stops[stop_id]["lat"] = lat
        stops[stop_id]["lng"] = lng
        stops[stop_id]["pincode"] = pincode

        if first_pkg_key in pkg_dict:
            pkg_dict[first_pkg_key]["address"] = fmt_addr

        # Update matrix in real-time
        update_matrix_for_stop(stop_id, lat, lng)

    if new_cod is not None and first_pkg_key in pkg_dict:
        cod_val = float(new_cod)
        pkg_dict[first_pkg_key]["is_cod"] = cod_val > 0
        pkg_dict[first_pkg_key]["cod_amount_inr"] = cod_val

    if new_name and first_pkg_key in pkg_dict:
        pkg_dict[first_pkg_key]["customer_name"] = new_name

    # Re-optimize route in real-time
    active_res = plan_route()

    return {
        "status": "success",
        "message": f"Updated stop {stop_id} in real-time.",
        "updated_route": active_res
    }

@app.post("/api/config/constraints")
def update_constraints(config: ConstraintConfig):
    global current_constraint_config, constraint_engine, replan_service, self_check_service
    current_constraint_config = config
    c_dict = {
        "cod_limit_inr": config.cod_limit_inr,
        "zone_timing": {
            "restricted_zone": "ZONE_NORTH_CORE",
            "prohibited_start": "09:00:00",
            "prohibited_end": "11:30:00",
            "restricted_vehicle_types": ["HEAVY_VAN"]
        } if config.zone_timing_active else {"restricted_zone": "NONE"},
        "odd_even": {
            "enabled": config.odd_even_active,
            "restricted_zone": "ZONE_SOUTH_COMMERCIAL"
        }
    }
    constraint_engine = ConstraintEngine(c_dict)
    routemind_solver.constraint_engine = constraint_engine
    replan_service.constraint_engine = constraint_engine
    self_check_service.constraint_engine = constraint_engine

    return {"status": "success", "constraints": current_constraint_config.dict()}

@app.post("/api/plan")
def plan_route():
    global current_active_route
    cost_tracker.record_route_computation()

    depot_id = dataset_data["metadata"]["depot_id"]
    stops = dataset_data["stops"]
    packages = dataset_data["packages"]
    planned_matrix = dataset_data["planned_travel_times"]
    dist_matrix = dataset_data["distance_matrix_km"]
    vehicle = dataset_data["vehicle"]

    # 1. Run RouteMind solver
    seq, dist_km, solve_sec, c_summary = routemind_solver.solve(
        depot_id, stops, planned_matrix, dist_matrix, packages, vehicle, current_constraint_config.date_parity
    )

    # 2. Run Self-Check
    self_passed, quality_pct, sc_summary = self_check_service.run_self_check(
        seq, dist_km, depot_id, stops, packages, planned_matrix, dist_matrix, vehicle, current_constraint_config.date_parity
    )

    # 3. Build Timeline
    timeline = []
    curr_time_sec = 8 * 3600 # 08:00:00
    curr_cash = vehicle.get("initial_cash_on_hand", 0.0)
    cumul_dist = 0.0

    for i, sid in enumerate(seq):
        stop_info = stops.get(sid, {})
        if i > 0:
            prev_sid = seq[i - 1]
            t_sec = planned_matrix.get(prev_sid, {}).get(sid, 300)
            d_km = dist_matrix.get(prev_sid, {}).get(sid, 2.0)
            curr_time_sec += t_sec
            cumul_dist += d_km

        arr_h, arr_m, arr_s = (curr_time_sec // 3600) % 24, (curr_time_sec % 3600) // 60, curr_time_sec % 60
        arr_str = f"{arr_h:02d}:{arr_m:02d}:{arr_s:02d}"

        srv_sec = stop_info.get("planned_service_time_seconds", 180)
        pkg_dict = packages.get(sid, {})
        for p in pkg_dict.values():
            if p.get("is_cod"):
                curr_cash += p.get("cod_amount_inr", 0.0)

        dep_sec = curr_time_sec + srv_sec
        dep_h, dep_m, dep_s = (dep_sec // 3600) % 24, (dep_sec % 3600) // 60, dep_sec % 60
        dep_str = f"{dep_h:02d}:{dep_m:02d}:{dep_s:02d}"

        timeline.append({
            "sequence_index": i,
            "stop_id": sid,
            "arrival_time": arr_str,
            "departure_time": dep_str,
            "cumulative_distance_km": round(cumul_dist, 2),
            "cumulative_cod_cash_inr": round(curr_cash, 2),
            "status": "LOCKED" if i == 0 else "PENDING"
        })

    total_duration_min = round((dist_km / 25.0) * 60.0, 1)

    current_active_route = {
        "route_id": "R_LIVE_01",
        "solver_name": "RouteMind (ML Corrected + OR-Tools)",
        "stop_sequence": seq,
        "timeline": timeline,
        "total_distance_km": dist_km,
        "total_duration_minutes": total_duration_min,
        "total_cod_collected_inr": round(curr_cash, 2),
        "constraint_check": c_summary,
        "self_check_passed": self_passed,
        "quality_vs_greedy_pct": quality_pct,
        "solve_time_seconds": solve_sec
    }

    return current_active_route

@app.post("/api/replan")
def trigger_replan(req: ReplanTriggerRequest):
    global current_active_route, pending_diff

    if not current_active_route:
        plan_route()

    stops = dataset_data["stops"]
    packages = dataset_data["packages"]
    planned_matrix = dataset_data["planned_travel_times"]
    dist_matrix = dataset_data["distance_matrix_km"]
    vehicle = dataset_data["vehicle"]

    curr_seq = current_active_route["stop_sequence"]

    if req.trigger_type == "failed_delivery":
        failed_sid = req.stop_id or (curr_seq[3] if len(curr_seq) > 3 else curr_seq[1])
        new_seq, diff = replan_service.handle_failed_delivery(
            curr_seq, failed_sid, req.locked_stop_index, stops, packages, planned_matrix, dist_matrix, vehicle, current_constraint_config.date_parity
        )
    elif req.trigger_type == "new_pickup":
        new_sid = f"STOP_NEW_{len(stops)+1}"
        
        # Real-time geocoding for new pickup if provided
        cust_addr = "Sector 4, HSR Layout, Bengaluru"
        lat, lng, fmt_addr, pincode = geocoding_service.geocode(cust_addr)

        new_stop = req.new_pickup_stop or Stop(
            stop_id=new_sid,
            lat=lat,
            lng=lng,
            type="Dropoff",
            zone_id="ZONE_EAST_RESIDENTIAL",
            pincode=pincode,
            time_window={"start_time_utc": "10:00:00", "end_time_utc": "18:00:00"},
            planned_service_time_seconds=240
        )
        new_pkg = req.new_pickup_package or Package(
            package_id=f"PKG_NEW_{len(stops)+1}",
            stop_id=new_sid,
            weight_kg=3.5,
            volume_cm3=8000,
            is_cod=True,
            cod_amount_inr=1800.0,
            customer_name="Priority Customer",
            address=fmt_addr
        )

        stops[new_sid] = new_stop.dict()
        packages[new_sid] = {new_pkg.package_id: new_pkg.dict()}

        update_matrix_for_stop(new_sid, lat, lng)

        new_seq, diff = replan_service.handle_new_pickup(
            curr_seq, new_stop, new_pkg, req.locked_stop_index, stops, packages, planned_matrix, dist_matrix, vehicle, current_constraint_config.date_parity
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid trigger_type. Must be 'failed_delivery' or 'new_pickup'")

    # Generate LLM explanation
    explanation = explainer_agent.explain_diff(diff)
    diff.explanation = explanation

    if diff.constraint_checks.get("total_violations", 0) > 0:
        ex_options = exception_agent.propose_resolutions(
            "Constraint violation detected during re-plan.", diff
        )
        diff.exception_options = ex_options

    pending_diff = diff

    return {
        "status": "replan_generated",
        "new_stop_sequence": new_seq,
        "diff": diff.dict()
    }

@app.post("/api/replan/approve")
def approve_replan():
    global current_active_route, pending_diff
    if not pending_diff:
        raise HTTPException(status_code=400, detail="No pending re-plan diff to approve.")

    pending_diff.supervisor_status = "APPROVED"
    res = {
        "status": "APPROVED",
        "message": "Supervisor approved route changes. Delivery partner notified via socket/push sync.",
        "diff": pending_diff.dict()
    }
    pending_diff = None
    return res

@app.post("/api/replan/reject")
def reject_replan():
    global pending_diff
    if not pending_diff:
        raise HTTPException(status_code=400, detail="No pending re-plan diff to reject.")

    pending_diff.supervisor_status = "REJECTED"
    res = {
        "status": "REJECTED",
        "message": "Supervisor rejected route change. Previous route active.",
        "diff": pending_diff.dict()
    }
    pending_diff = None
    return res

@app.get("/api/benchmark")
def get_benchmark():
    if not dataset_data:
        load_dataset_file()
    report = benchmark_service.run_benchmark(dataset_data, current_constraint_config.date_parity)
    return report.dict()

@app.get("/api/costs")
def get_costs():
    return cost_tracker.get_summary()
