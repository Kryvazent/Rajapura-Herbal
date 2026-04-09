import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { login } from "./adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid username or password. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0E1A08 0%, #1A3009 50%, #243D10 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Lato', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      {[
        { size: 500, top: "-200px", right: "-200px", opacity: 0.05 },
        { size: 350, bottom: "-150px", left: "-150px", opacity: 0.04 },
        { size: 200, top: "20%", left: "10%", opacity: 0.03 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            border: "1px solid rgba(139,195,74,0.3)",
            background: `rgba(139,195,74,${c.opacity})`,
            top: (c as any).top,
            right: (c as any).right,
            bottom: (c as any).bottom,
            left: (c as any).left,
            pointerEvents: "none",
          }}
        />
      ))}

      <div style={{ width: "100%", maxWidth: "440px", position: "relative" }}>
        {/* Card */}
        <div
          style={{
            backgroundColor: "rgba(250,246,238,0.97)",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,195,74,0.2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #2D5016, #3D6B1C)",
              padding: "36px 40px 32px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(139,195,74,0.2)",
                border: "2px solid rgba(139,195,74,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Leaf size={28} style={{ color: "#8BC34A" }} />
            </div>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                color: "#FAF6EE",
                fontSize: "1.1rem",
                margin: "0 0 2px",
                letterSpacing: "0.1em",
              }}
            >
              RAJAPURA
            </p>
            <p
              style={{
                color: "#8BC34A",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                margin: "0 0 16px",
              }}
            >
              HERBAL COMPANY
            </p>
            <p
              style={{
                color: "rgba(250,246,238,0.7)",
                fontSize: "0.82rem",
                margin: 0,
                letterSpacing: "0.1em",
              }}
            >
              ADMIN PORTAL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "36px 40px 40px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                fontSize: "1.4rem",
                margin: "0 0 6px",
                textAlign: "center",
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                color: "#8B5E3C",
                fontSize: "0.85rem",
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              Sign in to manage your herbal products & stores
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  backgroundColor: "rgba(212,24,61,0.08)",
                  border: "1px solid rgba(212,24,61,0.25)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={16} style={{ color: "#D4183D", flexShrink: 0 }} />
                <p style={{ color: "#D4183D", fontSize: "0.85rem", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#2D5016",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                  letterSpacing: "0.03em",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8B5E3C",
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(45,80,22,0.2)",
                    backgroundColor: "#FAF6EE",
                    color: "#2D5016",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2D5016")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(45,80,22,0.2)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#2D5016",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                  letterSpacing: "0.03em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8B5E3C",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 42px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(45,80,22,0.2)",
                    backgroundColor: "#FAF6EE",
                    color: "#2D5016",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2D5016")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(45,80,22,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8B5E3C",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: loading ? "#A8C580" : "linear-gradient(135deg, #2D5016, #4A7C23)",
                color: "#FAF6EE",
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={16} /> Sign In to Admin
                </>
              )}
            </button>

            {/* Hint */}
            <div
              style={{
                marginTop: "20px",
                backgroundColor: "rgba(45,80,22,0.06)",
                border: "1px solid rgba(45,80,22,0.12)",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <p style={{ color: "#6B4423", fontSize: "0.78rem", margin: 0 }}>
                <strong>Demo credentials:</strong> admin / rajapura2026
              </p>
            </div>
          </form>
        </div>

        {/* Back link */}
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <a
            href="/"
            style={{
              color: "rgba(168,197,128,0.8)",
              fontSize: "0.82rem",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            ← Back to Rajapura Website
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
