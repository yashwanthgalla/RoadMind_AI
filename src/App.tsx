import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import SupervisorDashboard from "./components/SupervisorDashboard";
import PartnerMobileView from "./components/PartnerMobileView";
import {
  fetchDataset,
  planRoute,
  triggerReplan,
  approveReplan,
  rejectReplan,
  fetchBenchmark,
  fetchCosts,
  updateConstraints,
  addStopWithGeocoding,
  updateStopAddress
} from "./services/api";
import { Shield, Smartphone, Navigation, RefreshCw, LogOut, Lock, AlertTriangle } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null when logged out
  const [activePortal, setActivePortal] = useState("admin"); // "admin" or "worker"
  const [dataset, setDataset] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [pendingDiff, setPendingDiff] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [costs, setCosts] = useState(null);
  const [constraints, setConstraints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const ds = await fetchDataset();
      setDataset(ds);
      setConstraints(ds.constraints);

      const route = await planRoute();
      setActiveRoute(route);

      const bm = await fetchBenchmark();
      setBenchmarkData(bm);

      const c = await fetchCosts();
      setCosts(c);
    } catch (err) {
      console.error("Error initializing RouteMind:", err);
      setStatusMessage("Failed to connect to backend server. Make sure FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActivePortal(user.role); // Automatically routes admin -> admin, worker -> worker
    setStatusMessage(`Authenticated as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handlePortalSwitch = (portal) => {
    if (portal === "admin" && currentUser?.role !== "admin") {
      setStatusMessage("SECURITY ACCESS DENIED: Admin Portal requires Hub Supervisor privileges.");
      return;
    }
    setActivePortal(portal);
  };

  const handlePlanRoute = async () => {
    try {
      setLoading(true);
      const route = await planRoute();
      setActiveRoute(route);
      const c = await fetchCosts();
      setCosts(c);
      setStatusMessage("OR-Tools solver optimized new route successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReplan = async (triggerType, stopId = null) => {
    try {
      const res = await triggerReplan(triggerType, stopId);
      setPendingDiff(res.diff);
      const c = await fetchCosts();
      setCosts(c);
      setStatusMessage(`Re-plan heuristic executed in under 30s. LLM generated explanation for supervisor review.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveReplan = async () => {
    try {
      const res = await approveReplan();
      setPendingDiff(null);
      await handlePlanRoute();
      setStatusMessage("Supervisor approved re-plan! Updated route dispatched to Delivery Worker.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectReplan = async () => {
    try {
      await rejectReplan();
      setPendingDiff(null);
      setStatusMessage("Supervisor rejected re-plan. Original route preserved.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunBenchmark = async () => {
    try {
      const bm = await fetchBenchmark();
      setBenchmarkData(bm);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConstraints = async (config) => {
    try {
      const res = await updateConstraints(config);
      setConstraints(res.constraints);
      await handlePlanRoute();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStop = async (newStopData) => {
    try {
      setLoading(true);
      const res = await addStopWithGeocoding(
        newStopData.customerName,
        newStopData.address,
        newStopData.codAmount
      );
      const ds = await fetchDataset();
      setDataset(ds);
      setActiveRoute(res.updated_route);
      setStatusMessage(`Real-time geocoded location & re-designed route.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to geocode and add stop.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStop = async (stopId, updateData) => {
    try {
      setLoading(true);
      const res = await updateStopAddress(
        stopId,
        updateData.address,
        updateData.codAmount,
        updateData.customerName
      );
      const ds = await fetchDataset();
      setDataset(ds);
      setActiveRoute(res.updated_route);
      setStatusMessage(`Real-time re-geocoded location for stop ${stopId}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStop = (stopId) => {
    handleTriggerReplan("failed_delivery", stopId);
  };

  const handleMarkStopComplete = (stopId) => {
    if (!activeRoute) return;
    const updatedTimeline = activeRoute.timeline.map((item) =>
      item.stop_id === stopId ? { ...item, status: "COMPLETED" } : item
    );
    setActiveRoute({ ...activeRoute, timeline: updatedTimeline });
    setStatusMessage(`Worker completed delivery for ${stopId}. Cash collected.`);
  };

  const handleMarkStopFailed = (stopId) => {
    if (!activeRoute) return;
    const updatedTimeline = activeRoute.timeline.map((item) =>
      item.stop_id === stopId ? { ...item, status: "FAILED" } : item
    );
    setActiveRoute({ ...activeRoute, timeline: updatedTimeline });
    handleTriggerReplan("failed_delivery", stopId);
    setStatusMessage(`Worker reported delivery failure for ${stopId}. Notification sent to Admin Portal!`);
  };

  // Render Login Page if unauthenticated
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === "admin";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Organic Intelligence Premium Header Navbar */}
      <header
        style={{
          background: "rgba(252, 251, 249, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          height: "76px",
          padding: "0 2.5rem",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
        }}
      >
        {/* Left Section: Logo & System Online Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <a
            href="/landing.html"
            style={{
              textDecoration: "none",
              fontSize: "1.75rem",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              color: "#171717",
              letterSpacing: "-0.02em"
            }}
          >
            RouteMind <span style={{ fontStyle: "normal", color: "var(--accent-indigo)", fontSize: "1.1rem" }}>AI</span>
          </a>
          
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.85rem",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#059669",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              fontWeight: 600
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            SYSTEM ONLINE
          </div>
        </div>

        {/* Center Section: Dual Portal Switcher Pill */}
        <div
          style={{
            background: "#f4f3ef",
            padding: "0.3rem",
            borderRadius: "9999px",
            border: "1px solid var(--border-color)",
            display: "flex",
            gap: "0.3rem",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)"
          }}
        >
          {isAdmin ? (
            <button
              onClick={() => handlePortalSwitch("admin")}
              style={{
                background: activePortal === "admin" ? "var(--accent-indigo)" : "transparent",
                color: activePortal === "admin" ? "#ffffff" : "var(--text-muted)",
                border: "none",
                padding: "0.5rem 1.3rem",
                borderRadius: "9999px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                transition: "all 0.3s var(--ease-premium)"
              }}
            >
              <Shield size={14} /> Admin Portal
            </button>
          ) : (
            <button
              onClick={() => handlePortalSwitch("admin")}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                padding: "0.5rem 1.3rem",
                borderRadius: "9999px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                opacity: 0.6
              }}
              title="Admin Portal Restricted to Hub Supervisors"
            >
              <Lock size={13} /> Admin Locked
            </button>
          )}

          <button
            onClick={() => handlePortalSwitch("worker")}
            style={{
              background: activePortal === "worker" ? "#059669" : "transparent",
              color: activePortal === "worker" ? "#ffffff" : "var(--text-muted)",
              border: "none",
              padding: "0.5rem 1.3rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              transition: "all 0.3s var(--ease-premium)"
            }}
          >
            <Smartphone size={14} /> Worker Portal
          </button>
        </div>

        {/* Right Section: User Profile Badge & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, color: "#171717", fontSize: "0.85rem" }}>{currentUser.name}</div>
            <div style={{ color: isAdmin ? "var(--accent-indigo)" : "#059669", fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.15em" }}>
              {isAdmin ? "ROLE: HUB SUPERVISOR" : "ROLE: DELIVERY PARTNER"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#e11d48",
              border: "1px solid rgba(225, 29, 72, 0.3)",
              padding: "0.45rem 1.1rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.3s var(--ease-premium)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e11d48";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#e11d48";
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* System Alert Status Bar */}
      {statusMessage && (
        <div
          style={{
            background: statusMessage.includes("ACCESS DENIED") ? "rgba(225, 29, 72, 0.1)" : "rgba(67, 56, 202, 0.08)",
            borderBottom: `1px solid ${statusMessage.includes("ACCESS DENIED") ? "rgba(225, 29, 72, 0.25)" : "rgba(67, 56, 202, 0.15)"}`,
            color: statusMessage.includes("ACCESS DENIED") ? "#e11d48" : "var(--accent-indigo)",
            padding: "0.5rem 2.5rem",
            fontSize: "0.82rem",
            fontFamily: "var(--font-mono)",
            display: "flex",
            justifySpace: "between",
            alignItems: "center"
          }}
        >
          <span>⚡ {statusMessage}</span>
          <button onClick={() => setStatusMessage("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "2rem 2.5rem", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {loading && !dataset ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-muted)" }}>
            <RefreshCw size={36} className="pulsing" style={{ margin: "0 auto 1rem", color: "var(--accent-indigo)" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#171717" }}>
              Initializing <em>RouteMind AI</em>...
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.2em", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              LOADING SOLVER ENGINE & ALMRRC DATASET
            </div>
          </div>
        ) : activePortal === "admin" && isAdmin ? (
          <SupervisorDashboard
            dataset={dataset}
            activeRoute={activeRoute}
            pendingDiff={pendingDiff}
            benchmarkData={benchmarkData}
            costs={costs}
            constraints={constraints}
            onPlanRoute={handlePlanRoute}
            onTriggerReplan={handleTriggerReplan}
            onApproveReplan={handleApproveReplan}
            onRejectReplan={handleRejectReplan}
            onRunBenchmark={handleRunBenchmark}
            onUpdateConstraints={handleUpdateConstraints}
            onAddStop={handleAddStop}
            onEditStop={handleEditStop}
            onDeleteStop={handleDeleteStop}
          />
        ) : activePortal === "admin" && !isAdmin ? (
          <div className="organic-card" style={{ padding: "4rem", textAlign: "center", maxWidth: "600px", margin: "3rem auto" }}>
            <AlertTriangle size={48} style={{ color: "#e11d48", margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.6rem", color: "#171717", marginBottom: "0.5rem" }}>Access Denied</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              The Admin Control Portal is strictly restricted to Hub Supervisors. Delivery Partners are authorized to access the Worker Portal only.
            </p>
            <button className="btn-emerald" onClick={() => setActivePortal("worker")}>
              Go to Worker Portal
            </button>
          </div>
        ) : (
          <PartnerMobileView
            activeRoute={activeRoute}
            dataset={dataset}
            onMarkStopComplete={handleMarkStopComplete}
            onMarkStopFailed={handleMarkStopFailed}
          />
        )}
      </main>
    </div>
  );
}
