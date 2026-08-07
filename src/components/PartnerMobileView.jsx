import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import { cachePartnerRoute, getCachedPartnerRoute } from "../services/offlineCache";
import { Truck, CheckCircle2, XCircle, Wifi, WifiOff, MapPin, DollarSign, Navigation, List, Map } from "lucide-react";

export default function PartnerMobileView({ activeRoute, dataset, onMarkStopComplete, onMarkStopFailed }) {
  const [isOnline, setIsOnline] = useState(true);
  const [displayedRoute, setDisplayedRoute] = useState(null);
  const [viewMode, setViewMode] = useState("both"); // "both", "map", "timeline"
  const [selectedStopId, setSelectedStopId] = useState(null);

  // Sync route data with offline cache whenever updated
  useEffect(() => {
    if (activeRoute && isOnline) {
      cachePartnerRoute(activeRoute);
      setDisplayedRoute(activeRoute);
    } else if (!isOnline) {
      const cached = getCachedPartnerRoute();
      if (cached && cached.route) {
        setDisplayedRoute(cached.route);
      }
    }
  }, [activeRoute, isOnline]);

  const stops = dataset?.stops || {};
  const packages = dataset?.packages || {};
  const vehicle = dataset?.vehicle || { driver_name: "Ramesh Kumar", plate_number: "KA-01-MJ-4829" };

  const timeline = displayedRoute?.timeline || [];
  const currentCash = displayedRoute?.total_cod_collected_inr || 0;

  return (
    <div style={{ maxWidth: "620px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Mobile Header Card */}
      <div className="organic-card" style={{ padding: "1.25rem", background: "var(--bg-dark)", color: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#059669", padding: "0.5rem", borderRadius: "10px", color: "#fff" }}>
              <Truck size={22} />
            </div>
            <div>
              <div className="mono-label" style={{ color: "#9ca3af" }}>DELIVERY WORKER</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{vehicle.driver_name}</h3>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "var(--font-mono)" }}>
                Vehicle: {vehicle.plate_number}
              </div>
            </div>
          </div>

          {/* Network Toggle Button */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            style={{
              background: isOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
              color: isOnline ? "#34d399" : "#f87171",
              border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
              padding: "0.45rem 0.85rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? "ONLINE" : "OFFLINE (Cached)"}
          </button>
        </div>

        {/* View Switcher & COD Cash Tracker */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.85rem" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "0.5rem 0.85rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700, color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
            COD Cash: ₹{currentCash.toLocaleString()} / ₹15,000 max
          </div>

          <div style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.08)", padding: "0.25rem", borderRadius: "8px" }}>
            <button
              onClick={() => setViewMode("both")}
              style={{
                background: viewMode === "both" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "both" ? "#fff" : "#9ca3af",
                border: "none",
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                cursor: "pointer"
              }}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("map")}
              style={{
                background: viewMode === "map" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "map" ? "#fff" : "#9ca3af",
                border: "none",
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem"
              }}
            >
              <Map size={12} /> Map
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              style={{
                background: viewMode === "timeline" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "timeline" ? "#fff" : "#9ca3af",
                border: "none",
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem"
              }}
            >
              <List size={12} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#d97706", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.82rem" }}>
          ⚠️ Network disconnected. Rendering last saved route sequence and cached map offline.
        </div>
      )}

      {/* Live Map View */}
      {(viewMode === "both" || viewMode === "map") && (
        <div className="organic-card" style={{ padding: "0.85rem", height: "350px" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)" }}>
            <Navigation size={14} /> LIVE WORKER ROUTE MAP (REAL-TIME UPDATES)
          </div>
          <div style={{ height: "290px", borderRadius: "10px", overflow: "hidden" }}>
            <MapView
              stops={stops}
              routeSequence={displayedRoute?.stop_sequence}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
            />
          </div>
        </div>
      )}

      {/* Timeline List */}
      {(viewMode === "both" || viewMode === "timeline") && (
        timeline.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div className="mono-label" style={{ marginBottom: "0.2rem" }}>DELIVERY STOP SCHEDULE</div>
            {timeline.map((item, idx) => {
              const sid = item.stop_id;
              const stopInfo = stops[sid] || {};
              const pkgDict = packages[sid] || {};
              const pkg = Object.values(pkgDict)[0] || {};
              const isDepot = sid.includes("DEPOT");
              const isSelected = sid === selectedStopId;

              return (
                <div
                  key={idx}
                  className="organic-card"
                  style={{
                    padding: "1rem 1.25rem",
                    borderLeft: `4px solid ${
                      isDepot ? "#ec4899" : item.status === "COMPLETED" ? "#059669" : item.status === "FAILED" ? "#e11d48" : "#4338ca"
                    }`,
                    background: isSelected ? "#f4f3ef" : "#ffffff"
                  }}
                  onClick={() => setSelectedStopId(sid)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        STOP #{idx} • Arrival: {item.arrival_time}
                      </div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, marginTop: "2px", color: "#171717" }}>
                        {isDepot ? "Logistics Hub Station" : (pkg.customer_name || `Customer ${sid}`)}
                      </div>
                    </div>
                    <span
                      className={`badge-mono ${
                        item.status === "COMPLETED" ? "badge-emerald" : item.status === "FAILED" ? "badge-rose" : "badge-indigo"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {!isDepot && (
                    <>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <MapPin size={14} style={{ color: "var(--accent-indigo)" }} />
                          {pkg.address || `Sector ${idx}, Zone ${stopInfo.zone_id || "A"}`}
                        </div>
                        {pkg.is_cod && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "4px", color: "#d97706", fontWeight: 600 }}>
                            <DollarSign size={14} />
                            Collect Cash: ₹{pkg.cod_amount_inr}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {item.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
                          <button
                            className="btn-emerald"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkStopComplete && onMarkStopComplete(sid);
                            }}
                            style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem", justifyContent: "center" }}
                          >
                            <CheckCircle2 size={14} /> Delivered
                          </button>
                          <button
                            className="btn-rose"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkStopFailed && onMarkStopFailed(sid);
                            }}
                            style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem", justifyContent: "center" }}
                          >
                            <XCircle size={14} /> Failed (Notify)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="organic-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            No active route assigned. Waiting for Admin to dispatch route.
          </div>
        )
      )}
    </div>
  );
}
