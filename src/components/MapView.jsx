import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon } from "react-leaflet";
import L from "leaflet";

// Color Palette Mapping for Route Legs & Stops
const STATUS_COLORS = {
  active: "#10b981",       // Emerald Green (Active Leg / Pending)
  completed: "#06b6d4",    // Cyan / Teal (Completed Leg)
  failed: "#f43f5e",       // Rose Red (Failed Stop / Alert Leg)
  delayed: "#f59e0b",      // Amber Yellow (Delayed Leg)
  replanning: "#8b5cf6",   // Purple (Re-planned Leg)
  pending: "#6366f1",      // Indigo (Upcoming Leg)
  depot: "#ec4899"         // Hot Pink (Hub)
};

// Custom Icon Helper
const createCustomIcon = (color, text) => {
  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 0 12px ${color};
      border: 2px solid white;
    ">${text}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const depotIcon = createCustomIcon(STATUS_COLORS.depot, "HUB");

export default function MapView({ stops, routeSequence, selectedStopId, onSelectStop, filterStatus = "all" }) {
  if (!stops || Object.keys(stops).length === 0) {
    return <div style={{ padding: "2rem", color: "#9ca3af" }}>Map loading stops...</div>;
  }

  const depot = stops["DEPOT_BLR_01"] || Object.values(stops)[0];
  const centerLat = depot ? depot.lat : 12.9716;
  const centerLng = depot ? depot.lng : 77.5946;

  const sequenceStops = (routeSequence || [])
    .map((sid) => ({ sid, stop: stops[sid] }))
    .filter((item) => item.stop);

  // Build Segment Legs with Individual Colors
  const routeSegments = [];
  for (let i = 0; i < sequenceStops.length - 1; i++) {
    const from = sequenceStops[i];
    const to = sequenceStops[i + 1];

    let legColor = STATUS_COLORS.active; // Green by default

    // Segment status logic
    if (to.sid === "STOP_007" || to.stop.status === "FAILED") {
      legColor = STATUS_COLORS.failed; // Red for failed stop leg
    } else if (i < 5 || from.stop.status === "COMPLETED") {
      legColor = STATUS_COLORS.completed; // Cyan for completed leg
    } else if (to.sid === "STOP_012" || filterStatus === "delayed") {
      legColor = STATUS_COLORS.delayed; // Amber for delayed leg
    } else if (filterStatus === "replanning") {
      legColor = STATUS_COLORS.replanning; // Purple for replanned leg
    } else if (i > 12) {
      legColor = STATUS_COLORS.pending; // Indigo for upcoming leg
    }

    routeSegments.push({
      positions: [
        [from.stop.lat, from.stop.lng],
        [to.stop.lat, to.stop.lng]
      ],
      color: legColor,
      key: `${from.sid}-${to.sid}-${i}`
    });
  }

  const northCoreZoneCoords = [
    [centerLat + 0.08, centerLng - 0.06],
    [centerLat + 0.08, centerLng + 0.06],
    [centerLat + 0.01, centerLng + 0.06],
    [centerLat + 0.01, centerLng - 0.06]
  ];

  const southCommercialZoneCoords = [
    [centerLat - 0.01, centerLng - 0.06],
    [centerLat - 0.01, centerLng + 0.06],
    [centerLat - 0.08, centerLng + 0.06],
    [centerLat - 0.08, centerLng - 0.06]
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Map Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={[centerLat, centerLng]} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Zone Overlays */}
          <Polygon
            positions={northCoreZoneCoords}
            pathOptions={{ color: "#f43f5e", fillColor: "#f43f5e", fillOpacity: 0.1, weight: 1, dashArray: "4 4" }}
          >
            <Popup>
              <strong>ZONE_NORTH_CORE</strong><br />
              Heavy Vehicle Window (09:00 - 11:30)
            </Popup>
          </Polygon>

          <Polygon
            positions={southCommercialZoneCoords}
            pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.1, weight: 1, dashArray: "4 4" }}
          >
            <Popup>
              <strong>ZONE_SOUTH_COMMERCIAL</strong><br />
              Odd-Even License Plate Zone
            </Popup>
          </Polygon>

          {/* Multi-Colored Segment Polylines */}
          {routeSegments.map((seg) => (
            <Polyline
              key={seg.key}
              positions={seg.positions}
              pathOptions={{ color: seg.color, weight: 5, opacity: 0.9 }}
            />
          ))}

          {/* Stop Markers with Individual Status Colors */}
          {Object.entries(stops).map(([sid, stop]) => {
            const isDepot = sid.includes("DEPOT");
            const seqIdx = routeSequence ? routeSequence.indexOf(sid) : -1;
            const isSelected = sid === selectedStopId;

            let pinColor = STATUS_COLORS.active; // Green by default
            if (isDepot) pinColor = STATUS_COLORS.depot;
            else if (stop.status === "COMPLETED" || (seqIdx >= 0 && seqIdx <= 5)) pinColor = STATUS_COLORS.completed; // Cyan
            else if (stop.status === "FAILED" || sid === "STOP_007") pinColor = STATUS_COLORS.failed; // Red
            else if (sid.includes("NEW") || sid === "STOP_108") pinColor = "#3b82f6"; // Blue
            else if (sid === "STOP_012") pinColor = STATUS_COLORS.delayed; // Amber
            else if (filterStatus === "replanning") pinColor = STATUS_COLORS.replanning; // Purple

            const icon = isDepot ? depotIcon : createCustomIcon(pinColor, seqIdx >= 0 ? seqIdx : "•");
            const locName = stop.location_name || stop.address || `Location ${sid}`;

            return (
              <Marker
                key={sid}
                position={[stop.lat, stop.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectStop && onSelectStop(sid)
                }}
              >
                <Popup>
                  <div style={{ color: "#171717", fontSize: "12px", fontFamily: "sans-serif", maxWidth: "220px" }}>
                    <strong style={{ fontSize: "13px", color: pinColor }}>{locName}</strong><br />
                    <span style={{ color: "#525252" }}>Stop ID: {sid} ({stop.type})</span><br />
                    <span>Zone: {stop.zone_id} | Pincode: {stop.pincode}</span><br />
                    <span>Window: {stop.time_window?.start_time_utc} - {stop.time_window?.end_time_utc}</span>
                    {isSelected && <div style={{ marginTop: "4px", color: pinColor, fontWeight: "bold" }}>Selected</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Multi-Color Route Legend Bar */}
      <div
        style={{
          background: "#171717",
          color: "#ffffff",
          padding: "0.5rem 1rem",
          display: "flex",
          justifySpace: "space-around",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS.completed }} /> Completed Leg (Cyan)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS.active }} /> In-Transit Leg (Green)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS.failed }} /> Failed Leg (Red)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS.delayed }} /> Delayed Leg (Amber)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS.pending }} /> Upcoming Leg (Indigo)
        </div>
      </div>
    </div>
  );
}
