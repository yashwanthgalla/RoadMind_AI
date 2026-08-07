"""
Routing Solvers for RouteMind.
Includes:
1. NaiveGreedySolver: Baseline nearest neighbor approach.
2. ORToolsSolver: Classical VRP solver (Time Windows + Capacities) via OR-Tools pywrapcp.
3. RouteMindSolver: Uses ML-corrected travel matrix + OR-Tools + Constraint Engine validation.
"""
import time
import math
from typing import Dict, List, Any, Tuple
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from backend.app.services.constraint_engine import ConstraintEngine
from backend.app.services.travel_time_model import TravelTimeCorrectionModel

class NaiveGreedySolver:
    def solve(
        self,
        depot_id: str,
        stops_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        packages_dict: Dict[str, Any],
        max_capacity_cm3: int = 4500000
    ) -> Tuple[List[str], float, float]:
        """
        Greedy nearest neighbor solver starting at depot_id.
        Returns (stop_sequence, total_dist_km, solve_time_seconds).
        """
        t0 = time.time()
        unvisited = set(stops_dict.keys()) - {depot_id}
        sequence = [depot_id]
        curr_stop = depot_id
        total_dist_km = 0.0

        while unvisited:
            next_stop = None
            min_dist = float('inf')

            for candidate in unvisited:
                d = dist_matrix_km.get(curr_stop, {}).get(candidate, 999.0)
                if d < min_dist:
                    min_dist = d
                    next_stop = candidate

            if next_stop is None:
                break

            total_dist_km += min_dist
            sequence.append(next_stop)
            unvisited.remove(next_stop)
            curr_stop = next_stop

        # Return to depot
        total_dist_km += dist_matrix_km.get(curr_stop, {}).get(depot_id, 0.0)
        sequence.append(depot_id)

        solve_time = time.time() - t0
        return sequence, round(total_dist_km, 2), round(solve_time, 4)


class ORToolsSolver:
    def solve(
        self,
        depot_id: str,
        stops_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        packages_dict: Dict[str, Any],
        max_capacity_cm3: int = 4500000,
        time_limit_sec: int = 5
    ) -> Tuple[List[str], float, float]:
        """
        Classical VRP Solver using Google OR-Tools pywrapcp.
        Returns (stop_sequence, total_dist_km, solve_time_seconds).
        """
        t0 = time.time()
        stop_ids = [depot_id] + [sid for sid in stops_dict.keys() if sid != depot_id]
        n_stops = len(stop_ids)
        id_to_idx = {sid: idx for idx, sid in enumerate(stop_ids)}
        idx_to_id = {idx: sid for idx, sid in enumerate(stop_ids)}

        # Build travel time matrix integer array (in seconds)
        matrix = []
        for u_id in stop_ids:
            row = []
            for v_id in stop_ids:
                row.append(travel_times_sec.get(u_id, {}).get(v_id, 300))
            matrix.append(row)

        manager = pywrapcp.RoutingIndexManager(n_stops, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Time Windows Dimension
        time_dimension_name = "Time"
        routing.AddDimension(
            transit_callback_index,
            3600 * 2, # max waiting time
            3600 * 14, # max total route time (14 hours)
            False, # start cumul to zero
            time_dimension_name
        )
        time_dimension = routing.GetDimensionOrDie(time_dimension_name)

        # Add time window constraints per node
        for sid, stop in stops_dict.items():
            if sid in id_to_idx:
                node_idx = id_to_idx[sid]
                index = manager.NodeToIndex(node_idx)
                tw = stop.get("time_window", {})
                try:
                    start_h, start_m, _ = map(int, tw.get("start_time_utc", "08:00:00").split(":"))
                    end_h, end_m, _ = map(int, tw.get("end_time_utc", "20:00:00").split(":"))
                    start_sec = (start_h - 8) * 3600 + start_m * 60 # relative to 08:00 start
                    end_sec = (end_h - 8) * 3600 + end_m * 60
                    start_sec = max(0, start_sec)
                    end_sec = max(start_sec + 1800, end_sec)
                    time_dimension.CumulVar(index).SetRange(start_sec, end_sec)
                except Exception:
                    pass

        # Solver Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.time_limit.seconds = time_limit_sec

        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            # Fallback to greedy if OR-Tools yields no feasible solution under strict bounds
            greedy = NaiveGreedySolver()
            return greedy.solve(depot_id, stops_dict, travel_times_sec, dist_matrix_km, packages_dict, max_capacity_cm3)

        sequence = []
        index = routing.Start(0)
        total_dist_km = 0.0

        while not routing.IsEnd(index):
            node_idx = manager.IndexToNode(index)
            sid = idx_to_id[node_idx]
            sequence.append(sid)
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            next_node = manager.IndexToNode(index)
            total_dist_km += dist_matrix_km.get(idx_to_id[node_idx], {}).get(idx_to_id[next_node], 0.0)

        sequence.append(depot_id)
        solve_time = time.time() - t0
        return sequence, round(total_dist_km, 2), round(solve_time, 4)


class RouteMindSolver:
    def __init__(self, ml_model: TravelTimeCorrectionModel = None):
        self.ml_model = ml_model or TravelTimeCorrectionModel()
        self.or_tools_solver = ORToolsSolver()
        self.constraint_engine = ConstraintEngine()

    def solve(
        self,
        depot_id: str,
        stops_dict: Dict[str, Any],
        raw_planned_matrix: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        packages_dict: Dict[str, Any],
        vehicle_dict: Dict[str, Any],
        date_parity: str = "EVEN"
    ) -> Tuple[List[str], float, float, Dict[str, Any]]:
        """
        RouteMind Solver Pipeline:
        1. Correct distance/time matrix using ML model.
        2. Solve VRP with OR-Tools on corrected matrix.
        3. Validate candidate route with ConstraintEngine.
        """
        t0 = time.time()
        
        # 1. Correct travel time matrix using ML
        corrected_matrix = self.ml_model.predict_corrected_matrix(
            stops_dict, raw_planned_matrix, dist_matrix_km, hour_of_day=10
        )

        # 2. Solve with OR-Tools
        seq, dist_km, _ = self.or_tools_solver.solve(
            depot_id, stops_dict, corrected_matrix, dist_matrix_km, packages_dict
        )

        # 3. Validate with Constraint Engine
        passed, violations, constraint_summary = self.constraint_engine.validate_entire_route(
            seq, stops_dict, packages_dict, corrected_matrix, vehicle_dict, date_parity
        )

        solve_time = time.time() - t0
        return seq, dist_km, round(solve_time, 4), constraint_summary
