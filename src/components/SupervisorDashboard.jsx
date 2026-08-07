import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { OperationsOverviewView, OperationsLiveOpsView, OperationsMapView } from "./admin/OperationsViews";
import { RoutePlanningView, RoutesRePlanningView, RoutesApprovalsView, RoutesHistoryView } from "./admin/RoutesViews";
import { LogisticsShipmentsView, LogisticsStopsView, LogisticsFleetView, LogisticsWorkersView, LogisticsDepotsView } from "./admin/LogisticsViews";
import { IntelligenceOptimizationView, IntelligenceAIOpsView, IntelligenceBenchmarksView, IntelligenceExceptionsView } from "./admin/IntelligenceViews";
import { AnalyticsPerformanceView, AnalyticsCostView } from "./admin/AnalyticsViews";
import { SystemDataView, SystemIntegrationsView, SystemNotificationsView, SystemAuditLogsView, SystemSettingsView } from "./admin/SystemViews";
import { geocodeAddress } from "../services/api";
import { Play, Plus, Shield, Search } from "lucide-react";

export default function SupervisorDashboard({
  dataset,
  activeRoute,
  pendingDiff,
  benchmarkData,
  costs,
  constraints,
  onPlanRoute,
  onTriggerReplan,
  onApproveReplan,
  onRejectReplan,
  onRunBenchmark,
  onUpdateConstraints,
  onAddStop,
  onEditStop,
  onDeleteStop
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form states
  const [newCustomerName, setNewCustomerName] = useState("Rajesh Sharma");
  const [newAddress, setNewAddress] = useState("Indiranagar 100ft Road, Bengaluru");
  const [newCodAmount, setNewCodAmount] = useState(1500);
  const [geocodingStatus, setGeocodingStatus] = useState("");

  const [editAddress, setEditAddress] = useState("");
  const [editCodAmount, setEditCodAmount] = useState(0);
  const [editCustomerName, setEditCustomerName] = useState("");

  const [codLimit, setCodLimit] = useState(constraints?.cod_limit_inr || 15000);
  const [oddEvenActive, setOddEvenActive] = useState(constraints?.odd_even_active ?? true);
  const [zoneTimingActive, setZoneTimingActive] = useState(constraints?.zone_timing_active ?? true);
  const [dateParity, setDateParity] = useState(constraints?.date_parity || "EVEN");

  const stops = dataset?.stops || {};

  const handleTestGeocode = async (addr) => {
    if (!addr) return;
    try {
      setGeocodingStatus("Geocoding location name in real-time...");
      const geo = await geocodeAddress(addr);
      setGeocodingStatus(`📍 Real Location: ${geo.formatted_address} (${geo.pincode})`);
    } catch (err) {
      setGeocodingStatus("Failed to resolve location name.");
    }
  };

  const handleCreatePickup = () => {
    onAddStop({
      customerName: newCustomerName,
      address: newAddress,
      codAmount: parseFloat(newCodAmount) || 0
    });
    setShowAddModal(false);
    setGeocodingStatus("");
  };

  const handleSaveConstraints = () => {
    onUpdateConstraints({
      cod_limit_inr: parseFloat(codLimit),
      odd_even_active: oddEvenActive,
      zone_timing_active: zoneTimingActive,
      date_parity: dateParity
    });
    setShowConfigModal(false);
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem", width: "100%" }}>
      {/* Sidebar with 6 Categories */}
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Dashboard Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Top Header Bar */}
        <div className="organic-card" style={{ padding: "1.25rem 1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono-label" style={{ marginBottom: "0.25rem" }}>ADMINISTRATION · {activeTab.toUpperCase()}</div>
            <h2 style={{ fontSize: "1.6rem", color: "#171717" }}>
              Hub Supervisor <em>Control Center</em>
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Depot: <span style={{ color: "var(--accent-indigo)", fontWeight: 600 }}>{dataset?.metadata?.depot_name || "Electronic City Main Logistics Hub"}</span> | 
              Stops: <span style={{ color: "#059669", fontWeight: 600 }}>{Object.keys(stops).length}</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-outline" onClick={() => setShowConfigModal(true)}>
              <Shield size={15} /> Edit India Rules
            </button>
            <button className="btn-outline" onClick={() => setShowAddModal(true)}>
              <Plus size={15} /> Add Delivery Address
            </button>
            <button className="btn-indigo" onClick={onPlanRoute}>
              <Play size={15} /> Run OR-Tools Solve
            </button>
          </div>
        </div>

        {/* 1. OPERATIONS VIEWS */}
        {activeTab === "overview" && (
          <OperationsOverviewView
            dataset={dataset}
            activeRoute={activeRoute}
            pendingDiff={pendingDiff}
            onApproveReplan={onApproveReplan}
            onRejectReplan={onRejectReplan}
            onSelectTab={setActiveTab}
          />
        )}
        {activeTab === "live_ops" && (
          <OperationsLiveOpsView
            dataset={dataset}
            activeRoute={activeRoute}
            onTriggerReplan={onTriggerReplan}
            onApproveReplan={onApproveReplan}
          />
        )}
        {activeTab === "map_view" && (
          <OperationsMapView dataset={dataset} activeRoute={activeRoute} />
        )}

        {/* 2. ROUTES VIEWS */}
        {activeTab === "route_planning" && (
          <RoutePlanningView dataset={dataset} onPlanRoute={onPlanRoute} activeRoute={activeRoute} />
        )}
        {activeTab === "replanning" && (
          <RoutesRePlanningView
            onTriggerReplan={onTriggerReplan}
            pendingDiff={pendingDiff}
            onApproveReplan={onApproveReplan}
            onRejectReplan={onRejectReplan}
          />
        )}
        {activeTab === "approvals" && (
          <RoutesApprovalsView
            pendingDiff={pendingDiff}
            onApproveReplan={onApproveReplan}
            onRejectReplan={onRejectReplan}
          />
        )}
        {activeTab === "history" && <RoutesHistoryView />}

        {/* 3. LOGISTICS VIEWS */}
        {activeTab === "shipments" && <LogisticsShipmentsView dataset={dataset} />}
        {activeTab === "stops" && (
          <LogisticsStopsView
            dataset={dataset}
            onAddStop={onAddStop}
            onEditStop={onEditStop}
            onDeleteStop={onDeleteStop}
            onOpenAddModal={() => setShowAddModal(true)}
          />
        )}
        {activeTab === "fleet" && <LogisticsFleetView dataset={dataset} />}
        {activeTab === "workers" && <LogisticsWorkersView dataset={dataset} />}
        {activeTab === "depots" && <LogisticsDepotsView dataset={dataset} />}

        {/* 4. INTELLIGENCE VIEWS */}
        {activeTab === "optimization" && <IntelligenceOptimizationView activeRoute={activeRoute} />}
        {activeTab === "ai_ops" && <IntelligenceAIOpsView costs={costs} />}
        {activeTab === "benchmarks" && (
          <IntelligenceBenchmarksView
            benchmarkData={benchmarkData}
            selfCheckPassed={activeRoute?.self_check_passed}
            qualityPct={activeRoute?.quality_vs_greedy_pct}
            onRunBenchmark={onRunBenchmark}
          />
        )}
        {activeTab === "exceptions" && <IntelligenceExceptionsView />}

        {/* 5. ANALYTICS VIEWS */}
        {activeTab === "performance" && <AnalyticsPerformanceView activeRoute={activeRoute} />}
        {activeTab === "cost" && <AnalyticsCostView costs={costs} />}

        {/* 6. SYSTEM VIEWS */}
        {activeTab === "data" && <SystemDataView dataset={dataset} />}
        {activeTab === "integrations" && <SystemIntegrationsView />}
        {activeTab === "notifications" && <SystemNotificationsView pendingDiff={pendingDiff} />}
        {activeTab === "audit_logs" && <SystemAuditLogsView />}
        {activeTab === "settings" && (
          <SystemSettingsView constraints={constraints} onUpdateConstraints={onUpdateConstraints} />
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="organic-card" style={{ width: "450px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Add Delivery Address</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", fontSize: "0.85rem" }}>
              <label style={{ fontWeight: 600 }}>
                CUSTOMER NAME
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", background: "#fcfbf9", border: "1px solid var(--border-color)", borderRadius: "8px", marginTop: "4px" }}
                />
              </label>

              <label style={{ fontWeight: 600 }}>
                DELIVERY LOCATION NAME & ADDRESS
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px" }}>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    style={{ flex: 1, padding: "0.6rem", background: "#fcfbf9", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                  />
                  <button type="button" className="btn-outline" onClick={() => handleTestGeocode(newAddress)}>
                    <Search size={14} /> Resolve
                  </button>
                </div>
              </label>

              {geocodingStatus && (
                <div style={{ fontSize: "0.78rem", color: "var(--accent-indigo)", background: "#f4f3ef", padding: "0.5rem", borderRadius: "6px" }}>
                  {geocodingStatus}
                </div>
              )}

              <label style={{ fontWeight: 600 }}>
                COD AMOUNT (INR ₹)
                <input
                  type="number"
                  value={newCodAmount}
                  onChange={(e) => setNewCodAmount(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", background: "#fcfbf9", border: "1px solid var(--border-color)", borderRadius: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-indigo" onClick={handleCreatePickup} style={{ flex: 1 }}>Add Location & Optimize</button>
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Config Constraints Modal */}
      {showConfigModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="organic-card" style={{ width: "420px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Configure India Rules</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", fontSize: "0.85rem" }}>
              <label style={{ fontWeight: 600 }}>
                COD CASH LIMIT (INR ₹)
                <input
                  type="number"
                  value={codLimit}
                  onChange={(e) => setCodLimit(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", background: "#fcfbf9", border: "1px solid var(--border-color)", borderRadius: "8px", marginTop: "4px" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={oddEvenActive}
                  onChange={(e) => setOddEvenActive(e.target.checked)}
                />
                Odd-Even Plate Restriction (ZONE_SOUTH)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={zoneTimingActive}
                  onChange={(e) => setZoneTimingActive(e.target.checked)}
                />
                Zone Timing Window (ZONE_NORTH: 09:00 - 11:30)
              </label>

              <label style={{ fontWeight: 600 }}>
                DATE PARITY
                <select
                  value={dateParity}
                  onChange={(e) => setDateParity(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", background: "#fcfbf9", border: "1px solid var(--border-color)", borderRadius: "8px", marginTop: "4px" }}
                >
                  <option value="EVEN">EVEN (e.g. 8th Aug)</option>
                  <option value="ODD">ODD (e.g. 9th Aug)</option>
                </select>
              </label>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-indigo" onClick={handleSaveConstraints} style={{ flex: 1 }}>Save Rules</button>
              <button className="btn-outline" onClick={() => setShowConfigModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
