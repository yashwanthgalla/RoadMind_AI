"""
Re-plan Service for RouteMind.
Executes mid-day fast local search heuristics (Insertion/Removal) under <30s latency,
enforces locked stop constraints, and generates structured diff objects.
"""
import time
from typing import Dict, List, Any, Tuple, Optional
from backend.app.models.schemas import ReplanDiff, Stop, Package
from backend.app.services.constraint_engine import ConstraintEngine

class ReplanService:
    def __init__(self, constraint_engine: Optional[ConstraintEngine] = None):
        self.constraint_engine = constraint_engine or ConstraintEngine()

    def handle_failed_delivery(
        self,
        current_sequence: List[str],
        failed_stop_id: str,
        locked_index: int,
        stops_dict: Dict[str, Any],
        packages_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        vehicle_dict: Dict[str, Any],
        date_parity: str = "EVEN"
    ) -> Tuple[List[str], ReplanDiff]:
        """
        Heuristic: Remove failed stop from current position (after locked_index) and re-insert 
        near the end of the route or after a grace period.
        """
        t0 = time.time()
        new_sequence = list(current_sequence)

        if failed_stop_id not in new_sequence:
            raise ValueError(f"Stop {failed_stop_id} not found in current route.")

        orig_pos = new_sequence.index(failed_stop_id)
        if orig_pos <= locked_index:
            # Locked stop cannot be moved
            raise ValueError(f"Stop {failed_stop_id} at index {orig_pos} is locked (partner already en-route). Cannot re-plan.")

        # Remove from orig_pos
        new_sequence.remove(failed_stop_id)

        # Try inserting near end of route (e.g. 2 stops before final depot)
        insert_pos = max(locked_index + 1, len(new_sequence) - 1)
        new_sequence.insert(insert_pos, failed_stop_id)

        # Validate constraints
        passed, violations, c_summary = self.constraint_engine.validate_entire_route(
            new_sequence, stops_dict, packages_dict, travel_times_sec, vehicle_dict, date_parity
        )

        # Calculate distance delta
        old_dist = self._calc_route_distance(current_sequence, dist_matrix_km)
        new_dist = self._calc_route_distance(new_sequence, dist_matrix_km)
        dist_delta = round(new_dist - old_dist, 2)
        dur_delta = round((dist_delta / 25.0) * 60.0, 1) # ~25 km/h avg speed

        elapsed = time.time() - t0
        print(f"Re-plan failed delivery executed in {elapsed:.3f}s")

        diff = ReplanDiff(
            route_id="R_LIVE_01",
            trigger="failed_delivery",
            changed_stop=failed_stop_id,
            moved_from_position=orig_pos,
            moved_to_position=insert_pos,
            affected_partners=[vehicle_dict.get("driver_name", "P001")],
            constraint_checks=c_summary,
            total_distance_delta_km=dist_delta,
            total_duration_delta_minutes=dur_delta,
            requires_supervisor_approval=True,
            supervisor_status="PENDING"
        )

        return new_sequence, diff

    def handle_new_pickup(
        self,
        current_sequence: List[str],
        new_stop: Stop,
        new_package: Package,
        locked_index: int,
        stops_dict: Dict[str, Any],
        packages_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        vehicle_dict: Dict[str, Any],
        date_parity: str = "EVEN"
    ) -> Tuple[List[str], ReplanDiff]:
        """
        Heuristic: Cheapest insertion for a new pickup stop in the remaining unlocked sequence.
        """
        t0 = time.time()

        # Add new stop & package to dicts temporarily for calculation
        stops_dict[new_stop.stop_id] = new_stop.dict()
        packages_dict[new_stop.stop_id] = {new_package.package_id: new_package.dict()}

        best_pos = None
        best_additional_dist = float('inf')
        best_seq = list(current_sequence)

        # Search for cheapest insertion position after locked_index
        search_start = max(1, locked_index + 1)
        search_end = len(current_sequence) # can insert before final depot

        for pos in range(search_start, search_end):
            cand_seq = current_sequence[:pos] + [new_stop.stop_id] + current_sequence[pos:]
            # Compute distance addition
            prev_s = current_sequence[pos - 1]
            next_s = current_sequence[pos]
            d_prev_new = dist_matrix_km.get(prev_s, {}).get(new_stop.stop_id, 3.0)
            d_new_next = dist_matrix_km.get(new_stop.stop_id, {}).get(next_s, 3.0)
            d_prev_next = dist_matrix_km.get(prev_s, {}).get(next_s, 3.0)
            add_dist = d_prev_new + d_new_next - d_prev_next

            if add_dist < best_additional_dist:
                best_additional_dist = add_dist
                best_pos = pos
                best_seq = cand_seq

        if best_pos is None:
            best_pos = len(current_sequence) - 1
            best_seq = current_sequence[:-1] + [new_stop.stop_id] + [current_sequence[-1]]

        # Validate constraints
        passed, violations, c_summary = self.constraint_engine.validate_entire_route(
            best_seq, stops_dict, packages_dict, travel_times_sec, vehicle_dict, date_parity
        )

        old_dist = self._calc_route_distance(current_sequence, dist_matrix_km)
        new_dist = self._calc_route_distance(best_seq, dist_matrix_km)
        dist_delta = round(new_dist - old_dist, 2)
        dur_delta = round((dist_delta / 25.0) * 60.0, 1)

        elapsed = time.time() - t0
        print(f"Re-plan new pickup executed in {elapsed:.3f}s")

        diff = ReplanDiff(
            route_id="R_LIVE_01",
            trigger="new_pickup",
            changed_stop=new_stop.stop_id,
            moved_from_position=None,
            moved_to_position=best_pos,
            affected_partners=[vehicle_dict.get("driver_name", "P001")],
            constraint_checks=c_summary,
            total_distance_delta_km=dist_delta,
            total_duration_delta_minutes=dur_delta,
            requires_supervisor_approval=True,
            supervisor_status="PENDING"
        )

        return best_seq, diff

    def _calc_route_distance(self, sequence: List[str], dist_matrix_km: Dict[str, Dict[str, float]]) -> float:
        d = 0.0
        for i in range(len(sequence) - 1):
            u, v = sequence[i], sequence[i+1]
            d += dist_matrix_km.get(u, {}).get(v, 0.0)
        return d
