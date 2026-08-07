import React from "react";
import { Award, Zap } from "lucide-react";

export default function BenchmarkPanel({ benchmarkData, selfCheckPassed, qualityPct, onRunBenchmark, loading }) {
  return (
    <div className="organic-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="mono-label" style={{ marginBottom: "0.2rem" }}>EMPIRICAL PROOF</div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award style={{ color: "var(--accent-indigo)" }} size={20} />
            Routing Solver <em>Benchmarks</em>
          </h3>
        </div>
        <button className="btn-outline" onClick={onRunBenchmark} disabled={loading} style={{ fontSize: "0.75rem", padding: "0.45rem 0.9rem" }}>
          {loading ? "Benchmarking..." : "Re-Run Benchmark"}
        </button>
      </div>

      {/* Quality Badge */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.25rem",
          padding: "0.85rem 1.1rem",
          borderRadius: "12px",
          background: selfCheckPassed ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
          border: `1px solid ${selfCheckPassed ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)"}`
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Zap style={{ color: selfCheckPassed ? "#059669" : "#e11d48" }} size={24} />
          <div>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              System Self-Check Status
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: selfCheckPassed ? "#059669" : "#e11d48" }}>
              {selfCheckPassed ? "PASSED — All Constraints Verified" : "FAIL — Violation Detected"}
            </div>
          </div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Gain vs Greedy</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-indigo)", fontFamily: "var(--font-mono)" }}>
            +{qualityPct || 0}% Efficient
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      {benchmarkData && benchmarkData.benchmark_table ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                <th style={{ padding: "0.6rem" }}>APPROACH</th>
                <th style={{ padding: "0.6rem" }}>DISTANCE</th>
                <th style={{ padding: "0.6rem" }}>DURATION</th>
                <th style={{ padding: "0.6rem" }}>VIOLATIONS</th>
                <th style={{ padding: "0.6rem" }}>LATENCY</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData.benchmark_table.map((row, idx) => {
                const isRouteMind = row.approach.includes("RouteMind");
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      background: isRouteMind ? "rgba(67, 56, 202, 0.05)" : "transparent",
                      fontWeight: isRouteMind ? 600 : 400
                    }}
                  >
                    <td style={{ padding: "0.7rem 0.6rem", color: isRouteMind ? "var(--accent-indigo)" : "#171717" }}>
                      {row.approach}
                    </td>
                    <td style={{ padding: "0.7rem 0.6rem", fontFamily: "var(--font-mono)" }}>{row.total_distance_km} km</td>
                    <td style={{ padding: "0.7rem 0.6rem", fontFamily: "var(--font-mono)" }}>{row.total_time_minutes} m</td>
                    <td style={{ padding: "0.7rem 0.6rem" }}>
                      {row.constraint_violations === 0 ? (
                        <span className="badge-mono badge-emerald">0</span>
                      ) : (
                        <span className="badge-mono badge-rose">{row.constraint_violations}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.7rem 0.6rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {row.solve_time_seconds.toFixed(3)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Click Re-Run Benchmark to calculate comparative matrix...</div>
      )}
    </div>
  );
}
