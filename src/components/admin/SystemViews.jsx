import React, { useState } from "react";
import { Database, Link2, Bell, FileText, Settings, Shield, CheckCircle2 } from "lucide-react";

export function SystemDataView({ dataset }) {
  const metadata = dataset?.metadata || {};

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>DATASETS & PIPELINES</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Data Pipeline <em>Sources</em>
      </h3>

      <div style={{ background: "#f8f7f4", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-indigo)" }}>
          {metadata.dataset_name || "Amazon Last Mile Routing Research Challenge (ALMRRC 2021)"}
        </h4>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Origin S3: s3://amazon-last-mile-challenges/almrrc2021/<br />
          Stops Imported: {metadata.num_stops || 120} Stops | Packages Imported: {metadata.total_packages || 120} Packages | Status: VALIDATED & LOADED
        </p>
      </div>
    </div>
  );
}

export function SystemIntegrationsView() {
  const integrations = [
    { name: "OpenStreetMap Nominatim API", type: "Geocoding & Location Names", status: "CONNECTED" },
    { name: "Google Maps Geocoding API", type: "Address Resolution", status: "CONNECTED" },
    { name: "Google OR-Tools pywrapcp", type: "CVRPTW VRP Solver", status: "CONNECTED" },
    { name: "Claude 3 / Local AI Agent", type: "Diff Explainer & Exception Agent", status: "CONNECTED" }
  ];

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>EXTERNAL API SERVICES</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Service <em>Integrations</em> Health
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {integrations.map((item, idx) => (
          <div key={idx} style={{ background: "#f8f7f4", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#171717" }}>{item.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.type}</div>
            </div>
            <span className="badge-mono badge-emerald">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemNotificationsView({ pendingDiff }) {
  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>ADMIN NOTIFICATION CENTER</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        System <em>Notifications</em>
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {pendingDiff && (
          <div style={{ background: "rgba(67, 56, 202, 0.08)", borderLeft: "4px solid var(--accent-indigo)", padding: "1rem", borderRadius: "10px" }}>
            <div style={{ fontWeight: 700, color: "var(--accent-indigo)" }}>Route RM-104 Requires Supervisor Approval</div>
            <div style={{ fontSize: "0.85rem", color: "#171717", marginTop: "2px" }}>
              Failed delivery at Stop 7 triggered a route re-plan heuristic.
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>10:42 AM IST</div>
          </div>
        )}

        <div style={{ background: "#f8f7f4", borderLeft: "4px solid #059669", padding: "1rem", borderRadius: "10px" }}>
          <div style={{ fontWeight: 700, color: "#059669" }}>System Self-Check Passed</div>
          <div style={{ fontSize: "0.85rem", color: "#171717", marginTop: "2px" }}>
            All 4 Indian logistics constraints validated across 12 active routes.
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>08:00 AM IST</div>
        </div>
      </div>
    </div>
  );
}

export function SystemAuditLogsView() {
  const logs = [
    { time: "10:45 IST", user: "Hub Supervisor", action: "APPROVED_ROUTE", entity: "Route RM-104", desc: "Approved route version 3" },
    { time: "10:42 IST", user: "System Re-plan", action: "REPLAN_GENERATED", entity: "Route RM-104", desc: "Local search insertion heuristic" },
    { time: "08:00 IST", user: "Hub Supervisor", action: "SOLVE_DISPATCHED", entity: "All 12 Routes", desc: "OR-Tools CVRPTW solver execution" }
  ];

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>ACCOUNTABILITY & AUDIT</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Administrative <em>Audit Logs</em>
      </h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
              <th style={{ padding: "0.75rem" }}>TIMESTAMP</th>
              <th style={{ padding: "0.75rem" }}>USER</th>
              <th style={{ padding: "0.75rem" }}>ACTION</th>
              <th style={{ padding: "0.75rem" }}>ENTITY</th>
              <th style={{ padding: "0.75rem" }}>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{l.time}</td>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>{l.user}</td>
                <td style={{ padding: "0.75rem" }}>
                  <span className="badge-mono badge-indigo">{l.action}</span>
                </td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)" }}>{l.entity}</td>
                <td style={{ padding: "0.75rem" }}>{l.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SystemSettingsView({ constraints, onUpdateConstraints }) {
  const [codLimit, setCodLimit] = useState(constraints?.cod_limit_inr || 15000);
  const [oddEvenActive, setOddEvenActive] = useState(constraints?.odd_even_active ?? true);
  const [zoneTimingActive, setZoneTimingActive] = useState(constraints?.zone_timing_active ?? true);
  const [dateParity, setDateParity] = useState(constraints?.date_parity || "EVEN");

  const handleSave = () => {
    onUpdateConstraints({
      cod_limit_inr: parseFloat(codLimit),
      odd_even_active: oddEvenActive,
      zone_timing_active: zoneTimingActive,
      date_parity: dateParity
    });
  };

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>SYSTEM & RULE CONFIGURATOR</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Admin <em>Settings</em> (8 Sections)
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", fontSize: "0.88rem" }}>
        {/* Profile & Security */}
        <div style={{ background: "#f8f7f4", padding: "1.25rem", borderRadius: "10px" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Profile & Security</h4>
          <div>User: Hub Supervisor (admin@routemind.ai)</div>
          <div>MFA: Active • Session: Authenticated</div>
        </div>

        {/* Constraint Rules */}
        <div style={{ background: "#f8f7f4", padding: "1.25rem", borderRadius: "10px" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>India Constraint Rules</h4>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            COD Cash Limit (INR ₹):
            <input
              type="number"
              value={codLimit}
              onChange={(e) => setCodLimit(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "4px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "6px" }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <button className="btn-indigo" onClick={handleSave}>Save Admin Settings</button>
      </div>
    </div>
  );
}
