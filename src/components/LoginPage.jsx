import React, { useState } from "react";
import { Shield, Smartphone, Navigation, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("admin@routemind.ai");
  const [password, setPassword] = useState("admin123");

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setEmail("admin@routemind.ai");
      setPassword("admin123");
    } else {
      setEmail("driver.ramesh@routemind.ai");
      setPassword("worker123");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      email,
      role,
      name: role === "admin" ? "Hub Supervisor (Admin)" : "Ramesh Kumar (Delivery Partner)"
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--bg-cream)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Mesh Gradient Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "20%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "20%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "1.5rem",
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 40px rgba(67, 56, 202, 0.08)",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <div
            style={{
              background: "var(--accent-indigo)",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 1.25rem",
              boxShadow: "0 10px 25px rgba(67, 56, 202, 0.3)"
            }}
          >
            <Navigation size={28} />
          </div>

          <div className="mono-label" style={{ marginBottom: "0.5rem" }}>TRACK 03 · ROUTE OPTIMIZATION</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#171717", marginBottom: "0.4rem" }}>
            RouteMind <em>AI</em>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Sign in to access adaptive logistics portals
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.4rem",
            background: "#f4f3ef",
            padding: "0.35rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: "1px solid var(--border-color)"
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect("admin")}
            style={{
              background: role === "admin" ? "var(--accent-indigo)" : "transparent",
              color: role === "admin" ? "#ffffff" : "#6b7280",
              border: "none",
              padding: "0.65rem",
              borderRadius: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.3s var(--ease-premium)"
            }}
          >
            <Shield size={16} /> Admin
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("worker")}
            style={{
              background: role === "worker" ? "#059669" : "transparent",
              color: role === "worker" ? "#ffffff" : "#6b7280",
              border: "none",
              padding: "0.65rem",
              borderRadius: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.3s var(--ease-premium)"
            }}
          >
            <Smartphone size={16} /> Worker
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#171717", marginBottom: "0.4rem", display: "block" }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.8rem",
                  background: "#fcfbf9",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  fontSize: "0.92rem",
                  outline: "none",
                  color: "#171717"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#171717", marginBottom: "0.4rem", display: "block" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.8rem",
                  background: "#fcfbf9",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  fontSize: "0.92rem",
                  outline: "none",
                  color: "#171717"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className={role === "admin" ? "btn-indigo" : "btn-emerald"}
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.85rem", marginTop: "0.5rem" }}
          >
            Sign In to {role === "admin" ? "Admin Control" : "Worker Portal"} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Account Credentials */}
        <div
          style={{
            marginTop: "1.75rem",
            padding: "0.85rem",
            background: "#f8f7f4",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textAlign: "center"
          }}
        >
          <span style={{ color: "var(--accent-indigo)", fontWeight: 600 }}>Demo Account Credentials:</span><br />
          {role === "admin" ? "admin@routemind.ai / admin123" : "driver.ramesh@routemind.ai / worker123"}
        </div>
      </div>
    </div>
  );
}
