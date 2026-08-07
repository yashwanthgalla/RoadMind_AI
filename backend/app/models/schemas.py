from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class TimeWindow(BaseModel):
    start_time_utc: str
    end_time_utc: str

class Stop(BaseModel):
    stop_id: str
    lat: float
    lng: float
    type: str  # Dropoff or Station
    zone_id: str
    pincode: Optional[str] = "560001"
    time_window: TimeWindow
    planned_service_time_seconds: int = 180
    status: str = "PENDING"  # PENDING, EN_ROUTE, COMPLETED, FAILED

class Package(BaseModel):
    package_id: str
    stop_id: str
    weight_kg: float
    volume_cm3: int
    is_cod: bool
    cod_amount_inr: float
    customer_name: Optional[str] = "Customer"
    address: Optional[str] = ""

class ConstraintConfig(BaseModel):
    cod_limit_inr: float = 15000.0
    zone_timing_active: bool = True
    odd_even_active: bool = True
    date_parity: str = "EVEN"  # EVEN or ODD

class Vehicle(BaseModel):
    capacity_cm3: int = 4500000
    max_weight_kg: float = 600.0
    plate_number: str = "KA-01-MJ-4829"
    vehicle_type: str = "HEAVY_VAN"
    driver_name: str = "Ramesh Kumar"
    initial_cash_on_hand: float = 0.0

class RouteSequenceItem(BaseModel):
    sequence_index: int
    stop_id: str
    arrival_time: str
    departure_time: str
    cumulative_distance_km: float
    cumulative_cod_cash_inr: float
    status: str = "PENDING"  # LOCKED (if dispatched/en route), PENDING, COMPLETED, FAILED

class PlanRouteResponse(BaseModel):
    route_id: str
    solver_name: str
    stop_sequence: List[str]
    timeline: List[RouteSequenceItem]
    total_distance_km: float
    total_duration_minutes: float
    total_cod_collected_inr: float
    constraint_check: Dict[str, Any]
    self_check_passed: bool
    quality_vs_greedy_pct: float
    solve_time_seconds: float

class ReplanTriggerRequest(BaseModel):
    trigger_type: str  # "failed_delivery" or "new_pickup"
    stop_id: Optional[str] = None
    new_pickup_stop: Optional[Stop] = None
    new_pickup_package: Optional[Package] = None
    locked_stop_index: int = 0  # Stops up to this index are locked en-route

class ReplanDiff(BaseModel):
    route_id: str
    trigger: str
    changed_stop: str
    moved_from_position: Optional[int] = None
    moved_to_position: Optional[int] = None
    affected_partners: List[str] = ["P001"]
    constraint_checks: Dict[str, Any]
    total_distance_delta_km: float
    total_duration_delta_minutes: float
    explanation: Optional[str] = None
    requires_supervisor_approval: bool = True
    supervisor_status: str = "PENDING"  # PENDING, APPROVED, REJECTED
    exception_options: Optional[List[str]] = None

class CostRecord(BaseModel):
    agent_name: str
    model_used: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    timestamp: str

class BenchmarkRow(BaseModel):
    approach: str
    total_distance_km: float
    total_time_minutes: float
    constraint_violations: int
    solve_time_seconds: float
    notes: str

class BenchmarkReport(BaseModel):
    benchmark_table: List[BenchmarkRow]
    summary: str
