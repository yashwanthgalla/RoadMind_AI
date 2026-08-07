"""
Constraint Engine for RouteMind.
Pure rule functions for Indian logistics constraints & delivery windows.
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime, time
from backend.app.config import settings

class ConstraintEngine:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.cod_limit_inr = self.config.get("cod_limit_inr", settings.COD_CASH_LIMIT_INR)
        self.zone_timing = self.config.get("zone_timing", settings.ZONE_TIMING_RESTRICTION)
        self.odd_even = self.config.get("odd_even", settings.ODD_EVEN_RULE)

    def check_zone_timing(self, vehicle_type: str, arrival_time_str: str, zone_id: str) -> Tuple[bool, str]:
        """
        Check 1: Zone Timing / No-Heavy-Vehicle Window
        Vehicles of specified type cannot be inside restricted zone during prohibited window.
        """
        restricted_zone = self.zone_timing.get("restricted_zone", "ZONE_NORTH_CORE")
        if zone_id != restricted_zone:
            return True, "Passed (Out of restricted zone)"

        restricted_types = self.zone_timing.get("restricted_vehicle_types", ["HEAVY_VAN"])
        if vehicle_type not in restricted_types:
            return True, "Passed (Vehicle type exempt)"

        try:
            arr_time = datetime.strptime(arrival_time_str, "%H:%M:%S").time()
            p_start = datetime.strptime(self.zone_timing.get("prohibited_start", "09:00:00"), "%H:%M:%S").time()
            p_end = datetime.strptime(self.zone_timing.get("prohibited_end", "11:30:00"), "%H:%M:%S").time()

            if p_start <= arr_time <= p_end:
                return False, f"VIOLATION: Vehicle {vehicle_type} entered {zone_id} during heavy vehicle window ({p_start}-{p_end}) at {arrival_time_str}"
        except ValueError:
            pass

        return True, "Passed"

    def check_odd_even(self, plate_number: str, date_parity: str, zone_id: str) -> Tuple[bool, str]:
        """
        Check 2: Odd-Even Style Restriction
        Only vehicles whose plate's last digit matches date parity may enter restricted zone.
        """
        if not self.odd_even.get("enabled", True):
            return True, "Passed (Odd-even disabled)"

        restricted_zone = self.odd_even.get("restricted_zone", "ZONE_SOUTH_COMMERCIAL")
        if zone_id != restricted_zone:
            return True, "Passed (Out of odd-even zone)"

        # Extract last digit from plate e.g. "KA-01-MJ-4829" -> 9 (ODD)
        digits = [c for c in plate_number if c.isdigit()]
        if not digits:
            return True, "Passed (No plate digit)"

        last_digit = int(digits[-1])
        plate_parity = "EVEN" if last_digit % 2 == 0 else "ODD"

        if plate_parity != date_parity.upper():
            return False, f"VIOLATION: Vehicle plate {plate_number} ({plate_parity}) restricted in {zone_id} on {date_parity} days"

        return True, "Passed"

    def check_cod_cash_limit(self, current_cash: float, package_cod: float) -> Tuple[bool, str, float]:
        """
        Check 3: COD Cash-Carry Limit
        Drivers cannot hold more cash on hand than the ceiling.
        Returns (is_passed, message, new_cash_balance).
        """
        projected_cash = current_cash + package_cod
        if projected_cash > self.cod_limit_inr:
            return False, f"VIOLATION: Projected cash INR {projected_cash:,.2f} exceeds limit INR {self.cod_limit_inr:,.2f}", projected_cash
        return True, "Passed", projected_cash

    def check_time_window(self, arrival_time_str: str, tw_start_str: str, tw_end_str: str) -> Tuple[bool, str]:
        """
        Check 4: Customer Delivery Time Window
        Arrival must be between start and end time window.
        """
        try:
            arr_time = datetime.strptime(arrival_time_str, "%H:%M:%S").time()
            start_time = datetime.strptime(tw_start_str, "%H:%M:%S").time()
            end_time = datetime.strptime(tw_end_str, "%H:%M:%S").time()

            if arr_time < start_time:
                return True, f"Early arrival (driver waits until {tw_start_str})"
            if arr_time > end_time:
                return False, f"VIOLATION: Arrival at {arrival_time_str} missed window [{tw_start_str} - {tw_end_str}]"
        except ValueError:
            pass

        return True, "Passed"

    def validate_entire_route(
        self,
        stop_sequence: List[str],
        stops_dict: Dict[str, Any],
        packages_dict: Dict[str, Any],
        travel_times_sec: Dict[str, Dict[str, int]],
        vehicle_dict: Dict[str, Any],
        date_parity: str = "EVEN"
    ) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Validates an entire route sequence against all 4 constraint rules.
        """
        violations = []
        vehicle_type = vehicle_dict.get("vehicle_type", "HEAVY_VAN")
        plate_number = vehicle_dict.get("plate_number", "KA-01-MJ-4829")

        current_time_sec = 8 * 3600  # Start day at 08:00:00
        current_cash = vehicle_dict.get("initial_cash_on_hand", 0.0)

        cod_violations = 0
        zone_timing_violations = 0
        odd_even_violations = 0
        time_window_violations = 0

        for i in range(len(stop_sequence)):
            curr_stop_id = stop_sequence[i]
            stop_info = stops_dict.get(curr_stop_id, {})
            zone_id = stop_info.get("zone_id", "ZONE_DEFAULT")

            if i > 0:
                prev_stop_id = stop_sequence[i - 1]
                t_sec = travel_times_sec.get(prev_stop_id, {}).get(curr_stop_id, 300)
                current_time_sec += t_sec

            # Format arrival time
            hrs = (current_time_sec // 3600) % 24
            mins = (current_time_sec % 3600) // 60
            secs = current_time_sec % 60
            arr_time_str = f"{hrs:02d}:{mins:02d}:{secs:02d}"

            # 1. Zone timing
            z_ok, z_msg = self.check_zone_timing(vehicle_type, arr_time_str, zone_id)
            if not z_ok:
                violations.append(f"Stop {curr_stop_id}: {z_msg}")
                zone_timing_violations += 1

            # 2. Odd-even
            oe_ok, oe_msg = self.check_odd_even(plate_number, date_parity, zone_id)
            if not oe_ok:
                violations.append(f"Stop {curr_stop_id}: {oe_msg}")
                odd_even_violations += 1

            # 3. Time Window
            tw = stop_info.get("time_window", {})
            tw_s = tw.get("start_time_utc", "08:00:00")
            tw_e = tw.get("end_time_utc", "20:00:00")
            tw_ok, tw_msg = self.check_time_window(arr_time_str, tw_s, tw_e)
            if not tw_ok:
                violations.append(f"Stop {curr_stop_id}: {tw_msg}")
                time_window_violations += 1

            # 4. COD Limit
            pkg_info = packages_dict.get(curr_stop_id, {})
            pkg_cod = 0.0
            for p in pkg_info.values():
                if p.get("is_cod"):
                    pkg_cod += p.get("cod_amount_inr", 0.0)

            cod_ok, cod_msg, new_cash = self.check_cod_cash_limit(current_cash, pkg_cod)
            if not cod_ok:
                violations.append(f"Stop {curr_stop_id}: {cod_msg}")
                cod_violations += 1
            else:
                current_cash = new_cash

            # Service time
            service_sec = stop_info.get("planned_service_time_seconds", 180)
            current_time_sec += service_sec

        passed = len(violations) == 0
        summary = {
            "cod_limit": "pass" if cod_violations == 0 else f"fail ({cod_violations})",
            "zone_timing": "pass" if zone_timing_violations == 0 else f"fail ({zone_timing_violations})",
            "odd_even": "pass" if odd_even_violations == 0 else f"fail ({odd_even_violations})",
            "time_windows": "pass" if time_window_violations == 0 else f"fail ({time_window_violations})",
            "total_violations": len(violations),
            "final_cod_cash_inr": current_cash
        }

        return passed, violations, summary
