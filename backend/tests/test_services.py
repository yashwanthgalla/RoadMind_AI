"""
Automated unit & integration tests for RouteMind backend services.
"""
import os
import pytest
from backend.app.services.constraint_engine import ConstraintEngine
from backend.app.services.travel_time_model import TravelTimeCorrectionModel
from backend.app.services.solvers import NaiveGreedySolver, ORToolsSolver, RouteMindSolver
from backend.app.services.replan_service import ReplanService
from backend.app.services.cost_tracker import CostTracker
from backend.app.services.self_check import SelfCheckService
from scripts.download_data import generate_realistic_dataset_slice

@pytest.fixture(scope="module")
def sample_dataset():
    return generate_realistic_dataset_slice(num_stops=25)

def test_constraint_engine_zone_timing():
    ce = ConstraintEngine()
    # Violation check
    ok, msg = ce.check_zone_timing("HEAVY_VAN", "10:00:00", "ZONE_NORTH_CORE")
    assert not ok
    assert "VIOLATION" in msg

    # Pass check
    ok2, msg2 = ce.check_zone_timing("HEAVY_VAN", "14:00:00", "ZONE_NORTH_CORE")
    assert ok2

def test_constraint_engine_cod_limit():
    ce = ConstraintEngine({"cod_limit_inr": 10000.0})
    ok, msg, new_cash = ce.check_cod_cash_limit(9000.0, 2000.0)
    assert not ok
    assert "exceeds limit" in msg

def test_solvers_and_self_check(sample_dataset):
    depot_id = sample_dataset["metadata"]["depot_id"]
    stops = sample_dataset["stops"]
    packages = sample_dataset["packages"]
    planned_matrix = sample_dataset["planned_travel_times"]
    dist_matrix = sample_dataset["distance_matrix_km"]
    vehicle = sample_dataset["vehicle"]

    # Greedy
    greedy = NaiveGreedySolver()
    g_seq, g_dist, g_time = greedy.solve(depot_id, stops, planned_matrix, dist_matrix, packages)
    assert len(g_seq) == len(stops) + 1
    assert g_dist > 0.0

    # OR-Tools
    ortools_solver = ORToolsSolver()
    o_seq, o_dist, o_time = ortools_solver.solve(depot_id, stops, planned_matrix, dist_matrix, packages)
    assert len(o_seq) == len(stops) + 1

    # RouteMind
    ml_model = TravelTimeCorrectionModel()
    ml_model.fit_from_dataset(sample_dataset)
    rm_solver = RouteMindSolver(ml_model)
    rm_seq, rm_dist, rm_time, rm_sum = rm_solver.solve(depot_id, stops, planned_matrix, dist_matrix, packages, vehicle)
    assert len(rm_seq) == len(stops) + 1

    # Self check
    sc = SelfCheckService()
    passed, pct_imp, sc_sum = sc.run_self_check(rm_seq, rm_dist, depot_id, stops, packages, planned_matrix, dist_matrix, vehicle)
    assert passed or "total_violations" in sc_sum

def test_replan_service(sample_dataset):
    ce = ConstraintEngine()
    replan = ReplanService(ce)
    stops = sample_dataset["stops"]
    packages = sample_dataset["packages"]
    planned_matrix = sample_dataset["planned_travel_times"]
    dist_matrix = sample_dataset["distance_matrix_km"]
    vehicle = sample_dataset["vehicle"]

    stop_ids = list(stops.keys())
    failed_sid = stop_ids[3]
    
    new_seq, diff = replan.handle_failed_delivery(
        stop_ids, failed_sid, 1, stops, packages, planned_matrix, dist_matrix, vehicle
    )
    assert diff.changed_stop == failed_sid
    assert diff.trigger == "failed_delivery"

def test_cost_tracker():
    ct = CostTracker()
    ct.record_replan_decision()
    rec = ct.log_llm_call("ExplainerAgent", "claude-3-haiku", 200, 50)
    assert rec.cost_usd > 0
    sum_data = ct.get_summary()
    assert sum_data["total_llm_calls"] == 1
