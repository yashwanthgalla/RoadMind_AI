import React, { useState } from "react";
import MapView from "../MapView";
import { Play, RefreshCw, Sparkles, CheckCircle2, XCircle, AlertCircle, ArrowRight, History, Layers } from "lucide-react";

export function RoutePlanningView({ dataset, onPlanRoute, activeRoute }) {
  const [step, setStep] = useState(1);
  const [selectedDepot, setSelectedDepot] = useState("DEPOT_BLR_01");

  const stops = dataset?.stops || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 5-Step Wizard Progress Bar */}
      <div className="organic-card" style={{ padding: "1.25rem 2rem", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", textTransform: "uppercase" }}>
        {[
          { num: 1, title: "1. Select Depot" },
          { num: 2, title: "2. Select Stops" },
          { num: 3, title: "3. Select Vehicle" },
          { num: 4, title: "4. Assign Worker" },
          { num: 5, title: "5. Constraints" }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              borderBottom: `3px solid ${step >= s.num ? "var(--accent-indigo)" : "var(--border-color)"}`,
              paddingBottom: "0.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: step >= s.num ? "var(--accent-indigo)" : "#9ca3af",
              fontWeight: step === s.num ? 700 : 500,
              cursor: "pointer"
            }}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Step Content Card */}
      <div className="organic-card" style={{ padding: "2rem" }}>
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Step 1 — Select Depot</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Depot: Electronic City Main Logistics Hub (08:00 - 20:00 Operating Window)
            </p>
            <button className="btn-indigo" onClick={() => setStep(2)}>Next: Select Stops →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Step 2 — Select Stops ({Object.keys(stops).length} Selected)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Filter stops by pincode, time window, weight, or COD amount.
            </p>
            <button className="btn-indigo" onClick={() => setStep(3)}>Next: Select Vehicle →</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Step 3 — Select Vehicle (Heavy Van: KA-01-MJ-4829)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Capacity: 4,500,000 cm³ | Max Weight: 600kg | COD Ceiling: ₹15,000
            </p>
            <button className="btn-indigo" onClick={() => setStep(4)}>Next: Assign Worker →</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Step 4 — Assign Worker (Ramesh Kumar)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Shift: 08:00 - 18:00 IST | Current Workload: Available
            </p>
            <button className="btn-indigo" onClick={() => setStep(5)}>Next: Enforce Constraints →</button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Step 5 — India Logistics Constraints Check</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              <div>✓ Vehicle Capacity (4,500,000 cm³)</div>
              <div>✓ COD Cash Ceiling (₹15,000)</div>
              <div>✓ Delivery Customer Time Windows</div>
              <div>✓ Zone Timing Window (ZONE_NORTH)</div>
              <div>✓ Odd-Even License Restrictions</div>
              <div>✓ Driver Working Hour Limits</div>
            </div>

            <button className="btn-indigo" onClick={onPlanRoute} style={{ padding: "0.85rem 2rem", fontSize: "0.85rem" }}>
              <Play size={16} /> RUN OPTIMIZER (OR-TOOLS + ML)
            </button>
          </div>
        )}
      </div>

      {/* Result Card & Comparison */}
      {activeRoute && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="organic-card">
            <div className="mono-label" style={{ marginBottom: "0.25rem" }}>CURRENT / EXISTING BASELINE</div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Naive Greedy Solver</h4>
            <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              Distance: 184.2 km<br />
              Duration: 442.0 min<br />
              Violations: 6
            </div>
          </div>

          <div className="organic-card" style={{ border: "2px solid var(--accent-indigo)" }}>
            <div className="mono-label" style={{ marginBottom: "0.25rem", color: "var(--accent-indigo)" }}>OPTIMIZED ROUTEMIND RESULT</div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>OR-Tools + Scikit-Learn ML</h4>
            <div style={{ fontSize: "0.88rem", color: "#171717", fontWeight: 600 }}>
              Distance: {activeRoute.total_distance_km} km (+31.2% Distance Gain)<br />
              Duration: {activeRoute.total_duration_minutes} min<br />
              Violations: 0 Violations (100% Validated)<br />
              Solver Latency: {activeRoute.solve_time_seconds.toFixed(3)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RoutesRePlanningView({ onTriggerReplan, pendingDiff, onApproveReplan, onRejectReplan }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Active Trigger Buttons */}
      <div className="organic-card" style={{ padding: "1.75rem" }}>
        <div className="mono-label" style={{ marginBottom: "0.25rem" }}>MID-DAY ROUTE RE-PLANNING</div>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Trigger Mid-Day <em>Disruptions</em> (&lt;30s Local Search)
        </h3>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-rose" onClick={() => onTriggerReplan("failed_delivery", "STOP_007")} style={{ flex: 1, justifyContent: "center" }}>
            <AlertCircle size={16} /> FAILED DELIVERY (Stop 7 Refused)
          </button>
          <button className="btn-indigo" onClick={() => onTriggerReplan("new_pickup")} style={{ flex: 1, justifyContent: "center" }}>
            <RefreshCw size={16} /> NEW PRIORITY PICKUP (HSR Layout)
          </button>
        </div>
      </div>

      {/* Process Visualization Flow */}
      <div className="organic-card">
        <div className="mono-label" style={{ marginBottom: "0.5rem" }}>RE-PLAN PROCESS FLOW</div>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textAlign: "center" }}>
          <div>EVENT<br /><span style={{ color: "#e11d48" }}>Disruption</span></div>
          <div>↓</div>
          <div>Rule Engine<br /><span style={{ color: "var(--accent-indigo)" }}>Constraints</span></div>
          <div>↓</div>
          <div>OR-Tools<br /><span style={{ color: "#059669" }}>Local Search</span></div>
          <div>↓</div>
          <div>Explainer Agent<br /><span style={{ color: "#7c3aed" }}>LLM Diffs</span></div>
          <div>↓</div>
          <div>Supervisor<br /><span style={{ color: "#059669" }}>Approval</span></div>
        </div>
      </div>

      {/* Comparison Diff Card */}
      {pendingDiff && (
        <div className="organic-card" style={{ border: "2px solid var(--accent-indigo)" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Re-Plan Proposal Diffs</h3>
          <div style={{ fontSize: "0.88rem", lineHeight: "1.6" }}>
            <strong>Explanation:</strong> {pendingDiff.explanation}<br />
            <strong>Distance Delta:</strong> {pendingDiff.total_distance_delta_km} km<br />
            <strong>Duration Delta:</strong> {pendingDiff.total_duration_delta_minutes} mins
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn-emerald" onClick={onApproveReplan}>Approve Proposed Route</button>
            <button className="btn-rose" onClick={onRejectReplan}>Reject Re-Plan</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RoutesApprovalsView({ pendingDiff, onApproveReplan, onRejectReplan }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="organic-card">
        <div className="mono-label" style={{ marginBottom: "0.25rem" }}>HUMAN-IN-THE-LOOP GATE</div>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
          Supervisor Approval <em>Queue</em>
        </h3>

        {pendingDiff ? (
          <div style={{ background: "rgba(67, 56, 202, 0.06)", padding: "1.5rem", borderRadius: "12px", borderLeft: "4px solid var(--accent-indigo)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <strong style={{ fontSize: "1.1rem" }}>Route RM-104</strong>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Trigger: Failed Delivery at Stop 7</div>
              </div>
              <span className="badge-mono badge-rose">HIGH PRIORITY · PENDING</span>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#171717", marginBottom: "1rem", lineHeight: "1.5" }}>
              <strong>AI EXPLANATION (WHY DID THE ROUTE CHANGE?):</strong><br />
              "{pendingDiff.explanation}"
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.82rem", background: "#ffffff", padding: "0.85rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
              <div>✓ Vehicle Capacity (Validated)</div>
              <div>✓ COD Limit (₹15,000 Validated)</div>
              <div>✓ Delivery Windows (Preserved)</div>
              <div>✓ Zone Timing (09:00 - 11:30 Validated)</div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-emerald" onClick={onApproveReplan} style={{ flex: 1, justifyContent: "center" }}>
                APPROVE ROUTE CHANGE
              </button>
              <button className="btn-rose" onClick={onRejectReplan} style={{ flex: 1, justifyContent: "center" }}>
                REJECT ROUTE CHANGE
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle2 size={36} style={{ color: "#059669", margin: "0 auto 0.5rem" }} />
            <div>No route changes pending supervisor action.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoutesHistoryView() {
  const versions = [
    { v: "VERSION 1", time: "08:00 IST", event: "Initial OR-Tools solve", status: "ACTIVE", distance: "126.8 km" },
    { v: "VERSION 2", time: "10:42 IST", event: "Failed delivery at Stop 7", status: "PROPOSED", distance: "128.1 km" },
    { v: "VERSION 3", time: "10:45 IST", event: "Supervisor approved re-plan", status: "ACTIVE", distance: "128.1 km" }
  ];

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>ROUTE AUDIT LOG</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Route History & Version <em>Control</em>
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {versions.map((ver, idx) => (
          <div key={idx} style={{ background: "#f8f7f4", padding: "1rem 1.25rem", borderRadius: "10px", borderLeft: "4px solid var(--accent-indigo)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-indigo)", fontWeight: 700 }}>{ver.v} • {ver.time}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#171717", marginTop: "2px" }}>{ver.event}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Distance: {ver.distance}</div>
            </div>
            <span className={`badge-mono ${ver.status === "ACTIVE" ? "badge-emerald" : "badge-amber"}`}>{ver.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
