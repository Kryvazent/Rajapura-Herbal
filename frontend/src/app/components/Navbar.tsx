import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Leaf, ChevronRight, ChevronDown, Check, Languages } from "lucide-react";
import Logo from "./Logo";
import { LANGUAGES, LANGUAGE_LABELS, useLanguage } from "../i18n/LanguageContext";
import { navAccessibility } from "../i18n/translations/navigation";

type LanguageCode = (typeof LANGUAGES)[number];

function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const chooseLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  if (mobile) {
    return (
      <div>
        <p className="rajapura-language-label">{t("language")}</p>
        <div className="rajapura-language-grid" role="group" aria-label={t("language")}>
          {LANGUAGES.map((code) => {
            const selected = language === code;
            return (
              <button
                key={code}
                type="button"
                className={`rajapura-language-option rajapura-language-option--mobile${selected ? " is-selected" : ""}`}
                onClick={() => chooseLanguage(code)}
                aria-pressed={selected}
              >
                <span>{LANGUAGE_LABELS[code]}</span>
                {selected && <Check size={14} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={switcherRef} className="rajapura-language-switcher">
      <button
        type="button"
        className="rajapura-language-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages size={16} aria-hidden="true" />
        <span>{LANGUAGE_LABELS[language]}</span>
        <ChevronDown size={15} className={open ? "is-open" : ""} aria-hidden="true" />
      </button>

      {open && (
        <div className="rajapura-language-menu" role="listbox" aria-label={t("language")}>
          <p className="rajapura-language-menu__title">{t("language")}</p>
          {LANGUAGES.map((code) => {
            const selected = language === code;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={selected}
                className={`rajapura-language-option${selected ? " is-selected" : ""}`}
                onClick={() => chooseLanguage(code)}
              >
                <span className="rajapura-language-option__code">{code.toUpperCase()}</span>
                <span>{LANGUAGE_LABELS[code]}</span>
                {selected && <Check size={15} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { language, t } = useLanguage();
  const a11y = navAccessibility[language];

  const links = [
    { to: "/", label: t("home") },
    { to: "/products", label: t("products") },
    { to: "/services", label: t("services") },
    { to: "/store-locator", label: t("stores") },
    { to: "/about", label: t("about") },
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav style={{ fontFamily: "'Lato', sans-serif" }} className="sticky top-0 z-50 w-full">
        
        <div
          style={{ backgroundColor: "#2D5016" }}
          className="text-white text-center py-1.5 text-xs tracking-widest uppercase hidden sm:block"
        >
          {t("tagline")}
        </div>

        
        <div
          style={{ backgroundColor: "#FAF6EE", borderBottom: "2px solid #8BC34A" }}
          className="px-4 sm:px-6 lg:px-16 py-3 sm:py-4 flex items-center justify-between shadow-sm"
        >
          
          <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline" onClick={close}>
            <div
              style={{ backgroundColor: "#2D5016" }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Logo width={50} height={50} alt={a11y.logo} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", color: "#2D5016", fontSize: "clamp(0.9rem, 2vw, 1.1rem)", margin: 0, lineHeight: 1.1 }}>
                RAJAPURA
              </p>
              <p style={{ color: "#8B5E3C", fontSize: "0.6rem", letterSpacing: "0.18em", margin: 0 }}>
                {t("companyLabel").toUpperCase()}
              </p>
            </div>
          </Link>

          
          <div className="rajapura-desktop-nav hidden md:flex items-center gap-6 lg:gap-8">
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

          
          <div className="rajapura-desktop-cta hidden md:flex items-center gap-3">
            <LanguageSwitcher />
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
              {t("nearest")}
            </Link>
          </div>

          
          <button
            className="rajapura-mobile-toggle md:hidden flex items-center justify-center"
            style={{ color: "#2D5016", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={a11y.menu}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      
      {menuOpen && (
        <div
          className="rajapura-mobile-overlay"
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(14,26,8,0.55)", zIndex: 40 }}
          onClick={close}
        />
      )}

      
      <div
        className="rajapura-mobile-drawer"
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
              <p style={{ color: "#8BC34A", fontSize: "0.55rem", letterSpacing: "0.15em", margin: 0 }}>{t("companyLabel").toUpperCase()}</p>
            </div>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", color: "rgba(250,246,238,0.7)", cursor: "pointer", display: "flex", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <p style={{ color: "#A8C580", fontSize: "0.62rem", letterSpacing: "0.15em", padding: "0 10px", marginBottom: "8px", marginTop: 0 }}>{t("navigation").toUpperCase()}</p>
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

        
        <div style={{ padding: "16px 16px 28px", borderTop: "1px solid rgba(45,80,22,0.1)" }}>
          <LanguageSwitcher mobile />
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
            {t("nearest")}
          </Link>
        </div>
      </div>
      <style>{`
        .rajapura-language-switcher {
          position: relative;
          flex-shrink: 0;
        }

        .rajapura-language-trigger {
          min-width: 126px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 9px;
          padding: 0 13px;
          border: 1px solid rgba(45, 80, 22, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          color: #2D5016;
          font: 600 0.82rem/1 'Lato', sans-serif;
          box-shadow: 0 2px 8px rgba(45, 80, 22, 0.06);
          cursor: pointer;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        .rajapura-language-trigger:hover,
        .rajapura-language-trigger:focus-visible {
          border-color: rgba(45, 80, 22, 0.5);
          background: #fff;
          box-shadow: 0 4px 14px rgba(45, 80, 22, 0.12);
          outline: none;
        }

        .rajapura-language-trigger .lucide-chevron-down {
          transition: transform 160ms ease;
        }

        .rajapura-language-trigger .lucide-chevron-down.is-open {
          transform: rotate(180deg);
        }

        .rajapura-language-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 70;
          width: 210px;
          padding: 8px;
          border: 1px solid rgba(45, 80, 22, 0.14);
          border-radius: 16px;
          background: #fffdf8;
          box-shadow: 0 18px 45px rgba(25, 48, 14, 0.18);
          animation: rajapura-language-in 150ms ease-out;
        }

        .rajapura-language-menu::before {
          content: "";
          position: absolute;
          top: -5px;
          right: 22px;
          width: 10px;
          height: 10px;
          border-left: 1px solid rgba(45, 80, 22, 0.14);
          border-top: 1px solid rgba(45, 80, 22, 0.14);
          background: #fffdf8;
          transform: rotate(45deg);
        }

        .rajapura-language-menu__title,
        .rajapura-language-label {
          margin: 0;
          color: #78915f;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .rajapura-language-menu__title {
          padding: 7px 10px 8px;
        }

        .rajapura-language-option {
          width: 100%;
          min-height: 42px;
          display: grid;
          grid-template-columns: 32px 1fr 16px;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #4f3b2f;
          font: 500 0.88rem/1.2 'Lato', sans-serif;
          text-align: left;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
        }

        .rajapura-language-option:hover,
        .rajapura-language-option:focus-visible {
          background: rgba(139, 195, 74, 0.11);
          color: #2D5016;
          outline: none;
        }

        .rajapura-language-option.is-selected {
          background: #edf4e7;
          color: #2D5016;
          font-weight: 700;
        }

        .rajapura-language-option__code {
          color: #8b9d78;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .rajapura-language-label {
          margin-bottom: 9px;
        }

        .rajapura-language-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
          margin-bottom: 16px;
        }

        .rajapura-language-option--mobile {
          grid-template-columns: 1fr 16px;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid rgba(45, 80, 22, 0.12);
          background: rgba(255, 255, 255, 0.66);
        }

        @keyframes rajapura-language-in {
          from { opacity: 0; transform: translateY(-5px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (min-width: 768px) {
          .rajapura-desktop-nav {
            display: flex !important;
          }

          .rajapura-desktop-cta {
            display: flex !important;
          }

          .rajapura-mobile-toggle,
          .rajapura-mobile-overlay,
          .rajapura-mobile-drawer {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .rajapura-desktop-nav,
          .rajapura-desktop-cta {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
