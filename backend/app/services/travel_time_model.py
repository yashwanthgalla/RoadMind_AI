"""
ML Travel-Time Correction Model for RouteMind.
Uses Scikit-Learn (GradientBoostingRegressor) trained on planned vs. actual travel times
to produce an accurate distance/time matrix before OR-Tools solving.
"""
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from typing import Dict, Any, Tuple

class TravelTimeCorrectionModel:
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        self.is_trained = False

    def _extract_features(
        self,
        planned_sec: float,
        dist_km: float,
        from_zone: str,
        to_zone: str,
        hour_of_day: int = 10
    ) -> np.ndarray:
        """
        Feature vector: [planned_sec, dist_km, is_core_zone, is_same_zone, hour_of_day]
        """
        is_core = 1.0 if "CORE" in from_zone or "CORE" in to_zone else 0.0
        is_same = 1.0 if from_zone == to_zone else 0.0
        return np.array([planned_sec, dist_km, is_core, is_same, hour_of_day])

    def fit_from_dataset(self, dataset: Dict[str, Any]):
        """
        Trains the model using dataset planned vs actual travel time matrices.
        """
        stops = dataset["stops"]
        planned_matrix = dataset["planned_travel_times"]
        actual_matrix = dataset["actual_travel_times"]
        dist_matrix = dataset["distance_matrix_km"]

        X, y = [], []
        stop_ids = list(stops.keys())

        for u in stop_ids:
            from_zone = stops[u].get("zone_id", "")
            for v in stop_ids:
                if u == v:
                    continue
                to_zone = stops[v].get("zone_id", "")
                planned = planned_matrix[u][v]
                actual = actual_matrix[u][v]
                dist = dist_matrix[u][v]

                feat = self._extract_features(planned, dist, from_zone, to_zone, hour_of_day=10)
                X.append(feat)
                y.append(actual)

        if len(X) > 0:
            X_arr = np.array(X)
            y_arr = np.array(y)
            self.model.fit(X_arr, y_arr)
            self.is_trained = True
            print(f"ML Travel-Time Correction Model trained on {len(X)} matrix pairs.")

    def predict_corrected_matrix(
        self,
        stops_dict: Dict[str, Any],
        planned_matrix: Dict[str, Dict[str, int]],
        dist_matrix_km: Dict[str, Dict[str, float]],
        hour_of_day: int = 10
    ) -> Dict[str, Dict[str, int]]:
        """
        Predicts corrected travel time matrix in seconds.
        """
        corrected_matrix = {}
        stop_ids = list(stops_dict.keys())

        if not self.is_trained:
            # Fallback heuristic multiplier if fit hasn't run yet
            for u in stop_ids:
                corrected_matrix[u] = {}
                from_zone = stops_dict[u].get("zone_id", "")
                for v in stop_ids:
                    mult = 1.25 if "CORE" in from_zone else 1.10
                    corrected_matrix[u][v] = int(planned_matrix[u][v] * mult)
            return corrected_matrix

        features = []
        pairs = []
        for u in stop_ids:
            corrected_matrix[u] = {}
            from_zone = stops_dict[u].get("zone_id", "")
            for v in stop_ids:
                if u == v:
                    corrected_matrix[u][v] = 0
                else:
                    to_zone = stops_dict[v].get("zone_id", "")
                    planned = planned_matrix[u][v]
                    dist = dist_matrix_km[u][v]
                    feat = self._extract_features(planned, dist, from_zone, to_zone, hour_of_day)
                    features.append(feat)
                    pairs.append((u, v))

        if features:
            preds = self.model.predict(np.array(features))
            for idx, (u, v) in enumerate(pairs):
                pred_sec = max(30, int(round(preds[idx])))
                corrected_matrix[u][v] = pred_sec

        return corrected_matrix
