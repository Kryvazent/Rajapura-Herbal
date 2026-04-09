import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Leaf, ChevronRight } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Our Products" },
    { to: "/services", label: "Services" },
    { to: "/store-locator", label: "Find a Store" },
    { to: "/about", label: "About Us" },
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav style={{ fontFamily: "'Lato', sans-serif" }} className="sticky top-0 z-50 w-full">
        {/* Top bar */}
        <div
          style={{ backgroundColor: "#2D5016" }}
          className="text-white text-center py-1.5 text-xs tracking-widest uppercase hidden sm:block"
        >
          Pure · Natural · Authentic Ayurvedic Heritage
        </div>

        {/* Main nav */}
        <div
          style={{ backgroundColor: "#FAF6EE", borderBottom: "2px solid #8BC34A" }}
          className="px-4 sm:px-6 lg:px-16 py-3 sm:py-4 flex items-center justify-between shadow-sm"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline" onClick={close}>
            <div
              style={{ backgroundColor: "#2D5016" }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Leaf style={{ color: "#FAF6EE", width: "18px", height: "18px" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", color: "#2D5016", fontSize: "clamp(0.9rem, 2vw, 1.1rem)", margin: 0, lineHeight: 1.1 }}>
                RAJAPURA
              </p>
              <p style={{ color: "#8B5E3C", fontSize: "0.6rem", letterSpacing: "0.18em", margin: 0 }}>
                HERBAL COMPANY
              </p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: "'Lato', sans-serif",
                  color: isActive(link.to) ? "#2D5016" : "#6B4423",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  letterSpacing: "0.04em",
                  borderBottom: isActive(link.to) ? "2px solid #2D5016" : "2px solid transparent",
                  paddingBottom: "2px",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button – desktop */}
          <div className="hidden md:block">
            <Link
              to="/store-locator"
              style={{
                backgroundColor: "#2D5016",
                color: "#FAF6EE",
                fontFamily: "'Lato', sans-serif",
                fontSize: "0.82rem",
                padding: "8px 18px",
                borderRadius: "50px",
                textDecoration: "none",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              Find Nearest Store
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center"
            style={{ color: "#2D5016", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(14,26,8,0.55)", zIndex: 40 }}
          onClick={close}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(80vw, 300px)",
          backgroundColor: "#FAF6EE",
          zIndex: 50,
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            backgroundColor: "#2D5016",
            padding: "20px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(139,195,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={16} style={{ color: "#8BC34A" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", color: "#FAF6EE", fontSize: "0.85rem", margin: 0, lineHeight: 1.1 }}>RAJAPURA</p>
              <p style={{ color: "#8BC34A", fontSize: "0.55rem", letterSpacing: "0.15em", margin: 0 }}>HERBAL COMPANY</p>
            </div>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", color: "rgba(250,246,238,0.7)", cursor: "pointer", display: "flex", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <p style={{ color: "#A8C580", fontSize: "0.62rem", letterSpacing: "0.15em", padding: "0 10px", marginBottom: "8px", marginTop: 0 }}>NAVIGATION</p>
          {links.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={close}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 14px",
                  borderRadius: "12px",
                  marginBottom: "4px",
                  textDecoration: "none",
                  backgroundColor: active ? "rgba(45,80,22,0.1)" : "transparent",
                  border: active ? "1px solid rgba(45,80,22,0.2)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ color: active ? "#2D5016" : "#5C4033", fontSize: "0.95rem", fontWeight: active ? 700 : 400 }}>
                  {link.label}
                </span>
                {active && <ChevronRight size={14} style={{ color: "#2D5016" }} />}
              </Link>
            );
          })}
        </nav>

        {/* CTA at bottom of drawer */}
        <div style={{ padding: "16px 16px 28px", borderTop: "1px solid rgba(45,80,22,0.1)" }}>
          <Link
            to="/store-locator"
            onClick={close}
            style={{
              display: "block",
              backgroundColor: "#2D5016",
              color: "#FAF6EE",
              textAlign: "center",
              padding: "13px 20px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "0.9rem",
              letterSpacing: "0.04em",
            }}
          >
            Find Nearest Store
          </Link>
        </div>
      </div>
    </>
  );
}
