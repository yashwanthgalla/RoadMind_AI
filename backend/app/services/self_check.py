"""
Self-Check Service for RouteMind.
Re-validates all hard constraints and computes quality score vs. greedy baseline before final dispatch.
"""
from typing import Dict, Any, List, Tuple
from backend.app.services.constraint_engine import ConstraintEngine
from backend.app.services.solvers import NaiveGreedySolver

class SelfCheckService:
    def __init__(self, constraint_engine: ConstraintEngine = None):
        self.constraint_engine = constraint_engine or ConstraintEngine()
        self.greedy_solver = NaiveGreedySolver()

    def run_self_check(
        self,
        candidate_sequence: List[str],
        candidate_distance_km: float,
        depot_id: str,
        stops_dict: Dict[str, Any],
        packages_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        vehicle_dict: Dict[str, Any],
        date_parity: str = "EVEN"
    ) -> Tuple[bool, float, Dict[str, Any]]:
        """
        1. Validates all 4 constraints.
        2. Computes baseline greedy distance and quality improvement percentage.
        Returns (passed, quality_vs_greedy_pct, constraint_summary).
        """
        # 1. Constraint validation
        passed, violations, summary = self.constraint_engine.validate_entire_route(
            candidate_sequence, stops_dict, packages_dict, travel_times_sec, vehicle_dict, date_parity
        )

        # 2. Greedy baseline comparison
        greedy_seq, greedy_dist, _ = self.greedy_solver.solve(
            depot_id, stops_dict, travel_times_sec, dist_matrix_km, packages_dict
        )

        if greedy_dist > 0:
            pct_better = round(((greedy_dist - candidate_distance_km) / greedy_dist) * 100.0, 2)
        else:
            pct_better = 0.0

        summary["greedy_baseline_distance_km"] = greedy_dist
        summary["candidate_distance_km"] = candidate_distance_km
        summary["quality_improvement_pct"] = pct_better
        summary["self_check_status"] = "PASSED" if passed else "FAILED"

        return passed, pct_better, summary
