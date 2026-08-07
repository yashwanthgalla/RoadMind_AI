import React, { useState } from "react";
import { Package, MapPin, Truck, Users, Warehouse, Search, Plus, Edit3, Trash2 } from "lucide-react";

export function LogisticsShipmentsView({ dataset }) {
  const packages = dataset?.packages || {};
  const stops = dataset?.stops || {};

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>SHIPMENT MANIFEST</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Active <em>Shipments</em> & Packages
      </h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
              <th style={{ padding: "0.75rem" }}>SHIPMENT ID</th>
              <th style={{ padding: "0.75rem" }}>STOP ID</th>
              <th style={{ padding: "0.75rem" }}>DELIVERY LOCATION ADDRESS</th>
              <th style={{ padding: "0.75rem" }}>WEIGHT (KG)</th>
              <th style={{ padding: "0.75rem" }}>COD AMOUNT</th>
              <th style={{ padding: "0.75rem" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(packages).slice(0, 15).map(([sid, pkgDict]) => {
              const pkg = Object.values(pkgDict)[0] || {};
              const st = stops[sid] || {};
              return (
                <tr key={sid} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-indigo)", fontWeight: 600 }}>PKG_{sid}</td>
                  <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)" }}>{sid}</td>
                  <td style={{ padding: "0.75rem" }}>{st.location_name || pkg.address || "Bengaluru Metro Sector"}</td>
                  <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)" }}>{pkg.weight_kg || 2.5} kg</td>
                  <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: pkg.is_cod ? "#d97706" : "inherit" }}>
                    {pkg.is_cod ? `₹${pkg.cod_amount_inr}` : "PREPAID"}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge-mono badge-indigo">IN TRANSIT</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LogisticsStopsView({ dataset, onAddStop, onEditStop, onDeleteStop, onOpenAddModal }) {
  const stops = dataset?.stops || {};

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <div className="mono-label">DELIVERY LOCATION STOPS</div>
          <h3 style={{ fontSize: "1.4rem" }}>
            Stops <em>Manager</em> ({Object.keys(stops).length} Total Stops)
          </h3>
        </div>

        <button className="btn-indigo" onClick={onOpenAddModal}>
          <Plus size={15} /> Geocode & Add Stop
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
              <th style={{ padding: "0.75rem" }}>STOP ID</th>
              <th style={{ padding: "0.75rem" }}>REAL LOCATION ADDRESS</th>
              <th style={{ padding: "0.75rem" }}>TYPE</th>
              <th style={{ padding: "0.75rem" }}>TIME WINDOW</th>
              <th style={{ padding: "0.75rem" }}>PINCODE</th>
              <th style={{ padding: "0.75rem" }}>ZONE</th>
              <th style={{ padding: "0.75rem" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stops).slice(0, 15).map(([sid, st]) => (
              <tr key={sid} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-indigo)", fontWeight: 600 }}>{sid}</td>
                <td style={{ padding: "0.75rem" }}>{st.location_name || "Bengaluru Metro Sector"}</td>
                <td style={{ padding: "0.75rem" }}>{st.type}</td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)" }}>{st.time_window?.start_time_utc} - {st.time_window?.end_time_utc}</td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)" }}>{st.pincode}</td>
                <td style={{ padding: "0.75rem" }}>{st.zone_id}</td>
                <td style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => onDeleteStop && onDeleteStop(sid)}
                      style={{ background: "none", border: "none", color: "#e11d48", cursor: "pointer" }}
                      title="Simulate Disruption / Delete Stop"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LogisticsFleetView({ dataset }) {
  const vehicle = dataset?.vehicle || { plate_number: "KA-01-MJ-4829", driver_name: "Ramesh Kumar" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <div className="organic-card" style={{ padding: "1.1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TOTAL VEHICLES</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent-indigo)" }}>12</div>
        </div>
        <div className="organic-card" style={{ padding: "1.1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>AVAILABLE</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#059669" }}>2</div>
        </div>
        <div className="organic-card" style={{ padding: "1.1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>IN TRANSIT</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#059669" }}>10</div>
        </div>
        <div className="organic-card" style={{ padding: "1.1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>MAINTENANCE</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e11d48" }}>0</div>
        </div>
      </div>

      <div className="organic-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Vehicle Fleet Roster</h3>
        <div style={{ background: "#f8f7f4", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-indigo)" }}>{vehicle.plate_number} (Heavy Van)</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Assigned Driver: {vehicle.driver_name}</div>
            </div>
            <span className="badge-mono badge-emerald">IN TRANSIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LogisticsWorkersView({ dataset }) {
  const vehicle = dataset?.vehicle || {};

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>DELIVERY PARTNER ROSTER</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Delivery Partners & <em>Drivers</em>
      </h3>

      <div style={{ background: "#f8f7f4", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#171717" }}>{vehicle.driver_name || "Ramesh Kumar"} (ID: EMP_4829)</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Assigned Vehicle: {vehicle.plate_number || "KA-01-MJ-4829"} | Depot: Electronic City Main Hub
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
          <span className="badge-mono badge-emerald">ONLINE</span>
          <span className="badge-mono badge-indigo">ACTIVE ROUTE RM-104</span>
        </div>
      </div>
    </div>
  );
}

export function LogisticsDepotsView({ dataset }) {
  const metadata = dataset?.metadata || {};

  return (
    <div className="organic-card" style={{ padding: "2rem" }}>
      <div className="mono-label" style={{ marginBottom: "0.25rem" }}>HUB OPERATIONS</div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
        Operational <em>Depots</em>
      </h3>

      <div style={{ background: "#f8f7f4", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-indigo)" }}>
          {metadata.depot_name || "Electronic City Main Logistics Hub"} (DEPOT_BLR_01)
        </h4>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Location: Bengaluru Logistics Belt (12.9716, 77.5946)<br />
          Operating Hours: 08:00 - 20:00 UTC<br />
          Active Routes: 12 Active Routes | Active Vehicles: 12 Heavy Vans
        </p>
      </div>
    </div>
  );
}
