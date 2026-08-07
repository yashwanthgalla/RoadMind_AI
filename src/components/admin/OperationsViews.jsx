import React, { useState } from "react";
import MapView from "../MapView";
import {
  Activity, MapPin, Truck, AlertCircle, CheckCircle2, Clock, XCircle, Shield,
  ArrowUpRight, RefreshCw, Send, Search, User, Filter, Eye, Layers, ChevronRight
} from "lucide-react";

export function OperationsOverviewView({ dataset, activeRoute, pendingDiff, onApproveReplan, onRejectReplan, onSelectTab }) {
  const stops = dataset?.stops || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top 8 KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("live_ops")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ACTIVE ROUTES</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>12</div>
          <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "2px" }}>🟢 Green Layer Active</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("live_ops")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>IN PROGRESS</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#059669", marginTop: "4px" }}>9</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>On Schedule</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", border: pendingDiff ? "2px solid var(--accent-indigo)" : "1px solid var(--border-color)", cursor: "pointer" }} onClick={() => onSelectTab("approvals")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>AWAITING APPROVAL</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>{pendingDiff ? "1" : "0"}</div>
          <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: "2px" }}>🟡 Amber Alert</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("replanning")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>RE-PLANNING</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#8b5cf6", marginTop: "4px" }}>1</div>
          <div style={{ fontSize: "0.72rem", color: "#8b5cf6", marginTop: "2px" }}>🟣 Purple Layer</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("history")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>COMPLETED ROUTES</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#06b6d4", marginTop: "4px" }}>48</div>
          <div style={{ fontSize: "0.72rem", color: "#06b6d4", marginTop: "2px" }}>🔵 Cyan Layer</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("exceptions")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>FAILED DELIVERIES</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f43f5e", marginTop: "4px" }}>2</div>
          <div style={{ fontSize: "0.72rem", color: "#f43f5e", marginTop: "2px" }}>🔴 Rose Red Layer</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("live_ops")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>DELAYED STOPS</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>1</div>
          <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: "2px" }}>🟡 Amber Alert</div>
        </div>

        <div className="organic-card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onSelectTab("settings")}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>CONSTRAINT VIOLATIONS</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>0</div>
          <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "2px" }}>100% Validated</div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 1. Live Operations Summary */}
          <div className="organic-card">
            <div className="mono-label" style={{ marginBottom: "0.25rem" }}>REAL-TIME STATUS</div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              1. Live Operations <em>Summary</em>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", fontSize: "0.88rem" }}>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>TOTAL ACTIVE ROUTES</span>
                <strong style={{ fontSize: "1.2rem", color: "#10b981" }}>12 Active (Green)</strong>
              </div>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>ACTIVE WORKERS</span>
                <strong style={{ fontSize: "1.2rem", color: "#059669" }}>12 Drivers</strong>
              </div>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>ACTIVE VEHICLES</span>
                <strong style={{ fontSize: "1.2rem", color: "#171717" }}>12 Vans</strong>
              </div>
            </div>
          </div>

          {/* 2. Route Performance */}
          <div className="organic-card">
            <div className="mono-label" style={{ marginBottom: "0.25rem" }}>EFFICIENCY AGGREGATION</div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              2. Route <em>Performance</em>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", fontSize: "0.88rem" }}>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>PLANNED VS ACTUAL DISTANCE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-indigo)", marginTop: "4px" }}>
                  {activeRoute?.total_distance_km || 126.8} km <span style={{ fontSize: "0.78rem", color: "#10b981" }}>(+31.2% Gain)</span>
                </div>
              </div>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>PLANNED VS ACTUAL DURATION</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                  {activeRoute?.total_duration_minutes || 304} mins
                </div>
              </div>
              <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ON-TIME PERCENTAGE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                  98.4% On-Time
                </div>
              </div>
            </div>
          </div>

          {/* 5. Mini Map */}
          <div className="organic-card" style={{ height: "340px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>5. Mini <em>Map</em> (Color-Coded Status Overview)</h3>
              <button className="btn-outline" onClick={() => onSelectTab("live_ops")} style={{ fontSize: "0.72rem", padding: "0.3rem 0.7rem" }}>
                Go to Live Map →
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: "10px", overflow: "hidden" }}>
              <MapView stops={stops} routeSequence={activeRoute?.stop_sequence} filterStatus="active" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 4. Approval Queue */}
          <div className="organic-card" style={{ border: pendingDiff ? "2px solid var(--accent-indigo)" : "1px solid var(--border-color)" }}>
            <div className="mono-label" style={{ marginBottom: "0.25rem", color: "var(--accent-indigo)" }}>SUPERVISOR GATE</div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              4. Approval <em>Queue</em>
            </h3>

            {pendingDiff ? (
              <div style={{ background: "rgba(67, 56, 202, 0.06)", padding: "1rem", borderRadius: "10px", borderLeft: "3px solid var(--accent-indigo)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem", color: "#171717" }}>
                  <span>Route RM-104</span>
                  <span className="badge-mono badge-indigo">Re-Plan Requested</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Reason: Failed delivery at Stop 7 (Indiranagar 100ft Road)
                </p>
                <div style={{ fontSize: "0.85rem", color: "#171717", marginTop: "8px", fontStyle: "italic" }}>
                  "{pendingDiff.explanation}"
                </div>

                <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
                  <button className="btn-emerald" onClick={onApproveReplan} style={{ flex: 1, justifyContent: "center", fontSize: "0.75rem" }}>
                    <Send size={14} /> Approve
                  </button>
                  <button className="btn-rose" onClick={onRejectReplan} style={{ flex: 1, justifyContent: "center", fontSize: "0.75rem" }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                <CheckCircle2 size={28} style={{ color: "#10b981", margin: "0 auto 0.4rem" }} />
                No pending route approvals. All 12 routes dispatched cleanly.
              </div>
            )}
          </div>

          {/* 3. Exceptions List */}
          <div className="organic-card">
            <div className="mono-label" style={{ marginBottom: "0.25rem", color: "#f43f5e" }}>EXCEPTIONS & ALERTS</div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              3. Operational <em>Exceptions</em>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ background: "#fcf8f8", borderLeft: "3px solid #f43f5e", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontWeight: 600, color: "#f43f5e" }}>🔴 Failed Delivery at Stop STOP_007</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Customer Refused • Indiranagar 100ft Road</div>
              </div>

              <div style={{ background: "#fffdf5", borderLeft: "3px solid #f59e0b", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontWeight: 600, color: "#f59e0b" }}>🟡 New Priority Pickup Request</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>HSR Layout Sector 3 • 25kg Heavy Box</div>
              </div>

              <div style={{ background: "#f8f7f4", borderLeft: "3px solid #737373", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontWeight: 600, color: "#171717" }}>⚪ Odd-Even Plate Enforcement</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>ZONE_SOUTH_COMMERCIAL • EVEN License Plates Only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OperationsLiveOpsView({ dataset, activeRoute, onTriggerReplan, onApproveReplan }) {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const stops = dataset?.stops || {};

  const filterColors = {
    all: "#4338ca",
    active: "#10b981",
    delayed: "#f59e0b",
    replanning: "#8b5cf6",
    completed: "#06b6d4",
    failed: "#f43f5e",
    offline: "#64748b"
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gap: "1.25rem", minHeight: "650px" }}>
      {/* Left Filter Panel with Color Indicators */}
      <div className="organic-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="mono-label" style={{ marginBottom: "0.5rem" }}>FILTER ROUTES (COLOR CODED)</div>
        {["all", "active", "delayed", "replanning", "completed", "failed", "offline"].map((f) => {
          const color = filterColors[f];
          const isSelected = selectedFilter === f;

          return (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              style={{
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                border: isSelected ? `2px solid ${color}` : "1px solid var(--border-color)",
                background: isSelected ? color : "#f8f7f4",
                color: isSelected ? "#ffffff" : "#171717",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s var(--ease-premium)"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isSelected ? "#ffffff" : color }} />
              {f} Routes
            </button>
          );
        })}
      </div>

      {/* Main Large Map Area */}
      <div className="organic-card" style={{ padding: "0.85rem", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", color: filterColors[selectedFilter], fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
          <span>🎯 LIVE REAL-TIME COMMAND CENTER MAP</span>
          <span>FILTER: {selectedFilter.toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, borderRadius: "10px", overflow: "hidden", minHeight: "540px" }}>
          <MapView stops={stops} routeSequence={activeRoute?.stop_sequence} filterStatus={selectedFilter} />
        </div>
      </div>

      {/* Right Route Inspection Panel */}
      <div className="organic-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <div className="mono-label" style={{ color: "var(--accent-indigo)" }}>ROUTE RM-104</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#171717" }}>Ramesh Kumar</h3>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Vehicle: KA-01-MJ-4829</div>
        </div>

        <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", fontSize: "0.8rem" }}>
          <div>STATUS: <span style={{ color: "#10b981", fontWeight: 700 }}>IN TRANSIT</span></div>
          <div>STOPS: <span style={{ fontWeight: 700 }}>24</span></div>
          <div>COMPLETED: <span style={{ color: "#06b6d4", fontWeight: 700 }}>15</span></div>
          <div>REMAINING: <span style={{ color: "#f59e0b", fontWeight: 700 }}>9</span></div>
          <div>DISTANCE: <span style={{ fontWeight: 700 }}>{activeRoute?.total_distance_km || 126.8} km</span></div>
          <div>ETA: <span style={{ fontWeight: 700 }}>16:45 IST</span></div>
        </div>

        <div>
          <div className="mono-label" style={{ marginBottom: "0.4rem" }}>EVENT FEED</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.78rem" }}>
            <div style={{ background: "#fcfbf9", borderLeft: "2px solid #f43f5e", padding: "0.4rem 0.6rem" }}>
              <strong>10:42</strong> — Stop 7 failed
            </div>
            <div style={{ background: "#fcfbf9", borderLeft: "2px solid #f59e0b", padding: "0.4rem 0.6rem" }}>
              <strong>10:44</strong> — Re-plan initiated
            </div>
            <div style={{ background: "#fcfbf9", borderLeft: "2px solid #8b5cf6", padding: "0.4rem 0.6rem" }}>
              <strong>10:45</strong> — New route generated
            </div>
            <div style={{ background: "#fcfbf9", borderLeft: "2px solid #10b981", padding: "0.4rem 0.6rem" }}>
              <strong>10:46</strong> — Awaiting approval
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button className="btn-indigo" onClick={() => onTriggerReplan("failed_delivery", "STOP_007")} style={{ justifyContent: "center", fontSize: "0.75rem" }}>
            <RefreshCw size={14} /> Re-Plan Route
          </button>
          <button className="btn-emerald" onClick={onApproveReplan} style={{ justifyContent: "center", fontSize: "0.75rem" }}>
            <Send size={14} /> Approve Proposed Route
          </button>
        </div>
      </div>
    </div>
  );
}

export function OperationsMapView({ dataset, activeRoute }) {
  const [layers, setLayers] = useState({
    routes: true,
    stops: true,
    workers: true,
    vehicles: true,
    depots: true,
    hubs: true,
    failed: true,
    pickups: true,
    delayed: true,
    violations: true
  });

  const stops = dataset?.stops || {};

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.25rem", minHeight: "650px" }}>
      {/* Map Layer Controls */}
      <div className="organic-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div className="mono-label">MAP LAYERS & TOGGLES</div>
        {Object.entries(layers).map(([key, val]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={val}
              onChange={() => setLayers({ ...layers, [key]: !val })}
            />
            {key.toUpperCase()}
          </label>
        ))}
      </div>

      {/* Geographic Control Center Map */}
      <div className="organic-card" style={{ padding: "0.85rem", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--accent-indigo)", fontFamily: "var(--font-mono)" }}>
          🗺️ GEOGRAPHIC CONTROL CENTER (FULL LAYER TOGGLES)
        </div>
        <div style={{ flex: 1, borderRadius: "10px", overflow: "hidden", minHeight: "560px" }}>
          <MapView stops={stops} routeSequence={activeRoute?.stop_sequence} />
        </div>
      </div>
    </div>
  );
}
