import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Leaf,
  LayoutDashboard,
  Package,
  Store,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  User,
} from "lucide-react";
import axios from "axios";
import ChangePasswordModal from "./ChangePasswordModal";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/stores", label: "Stores", icon: Store },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/users", label: "Users", icon: User },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const localFlag = localStorage.getItem("mustChangePassword") === "true";
    if (localFlag) {
      setMustChangePassword(true);
      setIsLoading(false); // ✅ FIX: Allow UI to render with modal
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/auth/status",
          { withCredentials: true }
        );

        console.log("Auth status response:", res.data);

        if (res.data?.mustChangePassword) {
          setMustChangePassword(true);
          localStorage.setItem("mustChangePassword", "true");
          setIsLoading(false); // ✅ FIX: Allow UI to render with modal
          navigate("/admin");
        } else if (res.data.authenticated) {
          setIsLoading(false);
          // Fetch current user profile
          try {
            const profileRes = await axios.get(
              import.meta.env.VITE_BACKEND_URL + "/auth/me",
              { withCredentials: true }
            );
            if (profileRes.data?.data) {
              setCurrentUser(profileRes.data.data);
            }
          } catch (err) {
            console.error("Failed to fetch user profile:", err);
          }
        } else {
          setIsLoading(false); // ✅ FIX: Handle unauthenticated case
          localStorage.removeItem("adminAuth");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false); // ✅ FIX: Always stop loading
        localStorage.removeItem("adminAuth");
        navigate("/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
    localStorage.removeItem("mustChangePassword");
  };

  // ✅ PRIORITY 1: Show password modal FIRST (blocks everything else)
  if (mustChangePassword) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F0EDE6",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <ChangePasswordModal onSuccess={handlePasswordChanged} />
      </div>
    );
  }

  // ✅ PRIORITY 2: Show loading spinner
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F0EDE6",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(139,195,74,0.2)",
              borderTop: "3px solid #8BC34A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#2D5016", margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("adminAuth");
      navigate("/admin");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("adminAuth");
      navigate("/admin");
    }
  };

  const isActive = (to: string) => location.pathname === to;
  const currentPage =
    location.pathname === "/admin/profile"
      ? "My Profile"
      : navItems.find((n) => isActive(n.to))?.label ?? "Admin";

  const displayInitial =
    currentUser.firstName?.[0]?.toUpperCase() ??
    currentUser.email?.[0]?.toUpperCase() ??
    "A";

  const displayName =
    currentUser.firstName && currentUser.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : "Administrator";

  const displayRole = currentUser.role ?? "ADMIN";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Lato', sans-serif",
        backgroundColor: "#F0EDE6",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "linear-gradient(180deg, #0E1A08 0%, #1A3009 100%)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-260px",
          height: "100vh",
          zIndex: 50,
          transition: "left 0.3s ease",
          boxShadow: "4px 0 30px rgba(0,0,0,0.3)",
        }}
        className="lg:!left-0"
      >
        {/* Logo */}
        <div
          style={{
            padding: "28px 24px",
            borderBottom: "1px solid rgba(139,195,74,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(139,195,74,0.15)",
              border: "2px solid rgba(139,195,74,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Leaf size={20} style={{ color: "#8BC34A" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                color: "#FAF6EE",
                fontSize: "0.9rem",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "0.08em",
              }}
            >
              RAJAPURA
            </p>
            <p
              style={{
                color: "#8BC34A",
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                margin: 0,
              }}
            >
              ADMIN PANEL
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          <p
            style={{
              color: "rgba(168,197,128,0.4)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              padding: "0 12px",
              marginBottom: "8px",
            }}
          >
            NAVIGATION
          </p>
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  marginBottom: "4px",
                  backgroundColor: active
                    ? "rgba(139,195,74,0.15)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(139,195,74,0.25)"
                    : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? "#8BC34A" : "rgba(168,197,128,0.6)",
                  }}
                />
                <span
                  style={{
                    color: active ? "#FAF6EE" : "rgba(168,197,128,0.7)",
                    fontSize: "0.9rem",
                    flex: 1,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <ChevronRight size={14} style={{ color: "#8BC34A" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar bottom — profile + logout */}
        <div
          style={{
            padding: "16px 12px 24px",
            borderTop: "1px solid rgba(139,195,74,0.1)",
          }}
        >
          {/* Clickable profile card */}
          <button
            onClick={() => {
              navigate("/admin/profile");
              setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              backgroundColor:
                location.pathname === "/admin/profile"
                  ? "rgba(139,195,74,0.15)"
                  : "rgba(139,195,74,0.07)",
              border:
                location.pathname === "/admin/profile"
                  ? "1px solid rgba(139,195,74,0.3)"
                  : "1px solid transparent",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#2D5016",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                color: "#8BC34A",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              {displayInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: "#FAF6EE",
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </p>
              <p style={{ color: "#618C3A", margin: 0, fontSize: "0.72rem" }}>
                {displayRole}
              </p>
            </div>
            <ChevronRight
              size={14}
              style={{ color: "rgba(168,197,128,0.5)", flexShrink: 0 }}
            />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(212,24,61,0.2)",
              backgroundColor: "rgba(212,24,61,0.07)",
              color: "rgba(255,120,130,0.85)",
              cursor: "pointer",
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "0",
          minWidth: 0,
        }}
        className="lg:!ml-[260px]"
      >
        {/* Top bar */}
        <header
          style={{
            backgroundColor: "#FAF6EE",
            borderBottom: "1px solid rgba(45,80,22,0.12)",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 2px 8px rgba(45,80,22,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#2D5016",
                cursor: "pointer",
                display: "flex",
              }}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#2D5016",
                  margin: 0,
                  fontSize: "1.2rem",
                  lineHeight: 1,
                }}
              >
                {currentPage}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(45,80,22,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Bell size={16} style={{ color: "#2D5016" }} />
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#8B5E3C",
                fontSize: "0.8rem",
                textDecoration: "none",
                border: "1px solid rgba(139,99,60,0.3)",
                padding: "6px 14px",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Leaf size={12} />
              View Site
            </a>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: "28px 24px",
            maxWidth: "1200px",
            width: "100%",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style> */}
    </div>
  );
}