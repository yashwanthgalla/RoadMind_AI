import React from "react";
import {
  Activity, Map, Play, RefreshCw, Sparkles, History,
  Package, MapPin, Truck, Users, Warehouse,
  Cpu, Zap, Award, AlertTriangle, TrendingUp, DollarSign,
  Database, Link2, Bell, FileText, Settings, ChevronRight
} from "lucide-react";

export default function AdminSidebar({ activeTab, onSelectTab }) {
  const menuCategories = [
    {
      category: "OPERATIONS",
      items: [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "live_ops", label: "Live Operations", icon: Activity },
        { id: "map_view", label: "Map", icon: Map }
      ]
    },
    {
      category: "ROUTES",
      items: [
        { id: "route_planning", label: "Route Planning", icon: Play },
        { id: "replanning", label: "Re-Planning", icon: RefreshCw },
        { id: "approvals", label: "Approvals", icon: Sparkles },
        { id: "history", label: "Route History", icon: History }
      ]
    },
    {
      category: "LOGISTICS",
      items: [
        { id: "shipments", label: "Shipments", icon: Package },
        { id: "stops", label: "Stops", icon: MapPin },
        { id: "fleet", label: "Fleet", icon: Truck },
        { id: "workers", label: "Workers", icon: Users },
        { id: "depots", label: "Depots", icon: Warehouse }
      ]
    },
    {
      category: "INTELLIGENCE",
      items: [
        { id: "optimization", label: "Optimization", icon: Cpu },
        { id: "ai_ops", label: "AI Operations", icon: Zap },
        { id: "benchmarks", label: "Benchmarks", icon: Award },
        { id: "exceptions", label: "Exceptions", icon: AlertTriangle }
      ]
    },
    {
      category: "ANALYTICS",
      items: [
        { id: "performance", label: "Performance", icon: TrendingUp },
        { id: "cost", label: "Cost", icon: DollarSign }
      ]
    },
    {
      category: "SYSTEM",
      items: [
        { id: "data", label: "Data", icon: Database },
        { id: "integrations", label: "Integrations", icon: Link2 },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "audit_logs", label: "Audit Logs", icon: FileText },
        { id: "settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  return (
    <aside
      style={{
        width: "250px",
        background: "#ffffff",
        borderRight: "1px solid var(--border-color)",
        borderRadius: "1rem",
        padding: "1.25rem 0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        maxHeight: "calc(100vh - 120px)",
        position: "sticky",
        top: "100px",
        flexShrink: 0,
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ padding: "0 0.5rem 0.5rem 0.5rem", borderBottom: "1px solid var(--border-color)" }}>
        <div className="mono-label" style={{ fontSize: "0.65rem", color: "var(--accent-indigo)" }}>ADMIN CONTROL CENTER</div>
        <div style={{ fontSize: "1.15rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "#171717", marginTop: "2px" }}>
          Navigation <em>Menu</em>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", overflowY: "auto", paddingRight: "0.25rem" }}>
        {menuCategories.map((group, idx) => (
          <div key={idx}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: "0.35rem",
                padding: "0 0.5rem",
                fontWeight: 600
              }}
            >
              {group.category}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.45rem 0.7rem",
                      borderRadius: "8px",
                      border: "none",
                      background: isActive ? "rgba(67, 56, 202, 0.08)" : "transparent",
                      color: isActive ? "var(--accent-indigo)" : "#525252",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s var(--ease-premium)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <IconComponent size={15} style={{ color: isActive ? "var(--accent-indigo)" : "#737373" }} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={13} style={{ color: "var(--accent-indigo)" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
