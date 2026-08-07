import React from "react";
import { DollarSign } from "lucide-react";

export default function CostTrackerWidget({ costs }) {
  if (!costs) return null;

  return (
    <div className="organic-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="mono-label" style={{ marginBottom: "0.2rem" }}>METERED GOVERNANCE</div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign style={{ color: "#059669" }} size={20} />
            Cost <em>Tracker</em>
          </h3>
        </div>
        <span className="badge-mono badge-indigo">$0.00 ROUTE SOLVES</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.2em" }}>COST PER ROUTE</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#059669", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
            ${costs.cost_per_route_computed_usd.toFixed(4)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-sub)", marginTop: "2px" }}>OR-Tools (No LLM)</div>
        </div>

        <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.2em" }}>COST PER REPLAN</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-indigo)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
            ${costs.cost_per_re_plan_decision_usd.toFixed(5)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-sub)", marginTop: "2px" }}>Explainer Agent</div>
        </div>

        <div style={{ background: "#f8f7f4", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.2em" }}>TOTAL COST</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7c3aed", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
            ${costs.total_cost_usd.toFixed(5)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-sub)", marginTop: "2px" }}>{costs.total_llm_calls} Agent Calls</div>
        </div>
      </div>

      {/* Token log */}
      {costs.recent_records && costs.recent_records.length > 0 && (
        <div style={{ fontSize: "0.8rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.2em" }}>RECENT AGENT CALLS:</div>
          <div style={{ maxHeight: "110px", overflowY: "auto" }}>
            {costs.recent_records.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.35rem 0.6rem",
                  borderBottom: "1px solid var(--border-color)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem"
                }}
              >
                <span style={{ color: "var(--accent-indigo)" }}>[{r.agent_name}]</span>
                <span style={{ color: "var(--text-muted)" }}>{r.model_used}</span>
                <span>{r.input_tokens}in / {r.output_tokens}out</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>${r.cost_usd.toFixed(6)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
