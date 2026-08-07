"""
Native Python Unittest runner for RouteMind backend services.
"""
import unittest
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.services.constraint_engine import ConstraintEngine
from backend.app.services.travel_time_model import TravelTimeCorrectionModel
from backend.app.services.solvers import NaiveGreedySolver, ORToolsSolver, RouteMindSolver
from backend.app.services.replan_service import ReplanService
from backend.app.services.cost_tracker import CostTracker
from backend.app.services.self_check import SelfCheckService
from scripts.download_data import generate_realistic_dataset_slice

class TestRouteMindBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.dataset = generate_realistic_dataset_slice(num_stops=25)
        cls.depot_id = cls.dataset["metadata"]["depot_id"]
        cls.stops = cls.dataset["stops"]
        cls.packages = cls.dataset["packages"]
        cls.planned_matrix = cls.dataset["planned_travel_times"]
        cls.dist_matrix = cls.dataset["distance_matrix_km"]
        cls.vehicle = cls.dataset["vehicle"]

    def test_01_constraint_engine_zone_timing(self):
        ce = ConstraintEngine()
        ok, msg = ce.check_zone_timing("HEAVY_VAN", "10:00:00", "ZONE_NORTH_CORE")
        self.assertFalse(ok)
        self.assertIn("VIOLATION", msg)

        ok2, msg2 = ce.check_zone_timing("HEAVY_VAN", "14:00:00", "ZONE_NORTH_CORE")
        self.assertTrue(ok2)

    def test_02_constraint_engine_cod_limit(self):
        ce = ConstraintEngine({"cod_limit_inr": 10000.0})
        ok, msg, new_cash = ce.check_cod_cash_limit(9000.0, 2000.0)
        self.assertFalse(ok)
        self.assertIn("exceeds limit", msg)

    def test_03_solvers(self):
        greedy = NaiveGreedySolver()
        g_seq, g_dist, g_time = greedy.solve(self.depot_id, self.stops, self.planned_matrix, self.dist_matrix, self.packages)
        self.assertEqual(len(g_seq), len(self.stops) + 1)

        ortools_solver = ORToolsSolver()
        o_seq, o_dist, o_time = ortools_solver.solve(self.depot_id, self.stops, self.planned_matrix, self.dist_matrix, self.packages)
        self.assertEqual(len(o_seq), len(self.stops) + 1)

        ml_model = TravelTimeCorrectionModel()
        ml_model.fit_from_dataset(self.dataset)
        rm_solver = RouteMindSolver(ml_model)
        rm_seq, rm_dist, rm_time, rm_sum = rm_solver.solve(
            self.depot_id, self.stops, self.planned_matrix, self.dist_matrix, self.packages, self.vehicle
        )
        self.assertEqual(len(rm_seq), len(self.stops) + 1)

    def test_04_replan_service(self):
        ce = ConstraintEngine()
        replan = ReplanService(ce)
        stop_ids = list(self.stops.keys())
        failed_sid = stop_ids[3]

        new_seq, diff = replan.handle_failed_delivery(
            stop_ids, failed_sid, 1, self.stops, self.packages, self.planned_matrix, self.dist_matrix, self.vehicle
        )
        self.assertEqual(diff.changed_stop, failed_sid)
        self.assertEqual(diff.trigger, "failed_delivery")

    def test_05_cost_tracker(self):
        ct = CostTracker()
        ct.record_replan_decision()
        rec = ct.log_llm_call("ExplainerAgent", "claude-3-haiku", 200, 50)
        self.assertGreaterThan(rec.cost_usd, 0)
        summary = ct.get_summary()
        self.assertEqual(summary["total_llm_calls"], 1)

    def assertGreaterThan(self, a, b):
        self.assertTrue(a > b)

if __name__ == "__main__":
    unittest.main()
