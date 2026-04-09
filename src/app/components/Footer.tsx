import { Link } from "react-router";
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#1A3009", fontFamily: "'Lato', sans-serif" }}
      className="text-white"
    >
      {/* Decorative border */}
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div
                style={{ backgroundColor: "#8BC34A" }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
              >
                <Leaf className="text-white w-5 h-5" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: "#FAF6EE",
                    fontSize: "1rem",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  RAJAPURA
                </p>
                <p
                  style={{
                    color: "#8BC34A",
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    margin: 0,
                  }}
                >
                  HERBAL COMPANY
                </p>
              </div>
            </div>
            <p style={{ color: "#A8C580", fontSize: "0.9rem", lineHeight: 1.8 }}>
              Rooted in ancient Ayurvedic wisdom, we craft pure herbal remedies
              using traditional recipes passed down through generations.
            </p>
            <div className="flex gap-4 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    backgroundColor: "rgba(139,195,74,0.15)",
                    border: "1px solid rgba(139,195,74,0.3)",
                    color: "#8BC34A",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Our Products" },
                { to: "/store-locator", label: "Store Locator" },
                { to: "/about", label: "About Us" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      color: "#A8C580",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#D4A017" }}>›</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              Our Products
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-3">
              {[
                "Herbal Teas",
                "Ayurvedic Oils",
                "Herbal Capsules",
                "Botanical Creams",
                "Wellness Powders",
                "Herbal Tonics",
              ].map((item) => (
                <li key={item}>
                  <span
                    style={{
                      color: "#A8C580",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#D4A017" }}>›</span> {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              Contact Us
            </h3>
            <div className="space-y-4">
              {[
                { Icon: MapPin, text: "No. 7, Rajapura Road,\nNuwara Eliya, Sri Lanka" },
                { Icon: Phone, text: "+94 52 222 0001" },
                { Icon: Mail, text: "info@rajapuraherbal.lk" },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex gap-3">
                  <Icon size={16} style={{ color: "#8BC34A", marginTop: "2px", flexShrink: 0 }} />
                  <span style={{ color: "#A8C580", fontSize: "0.85rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{ borderTop: "1px solid rgba(139,195,74,0.2)" }}
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p style={{ color: "#618C3A", fontSize: "0.8rem", margin: 0 }}>
            © 2026 Rajapura Herbal Company. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Use", "Quality Guarantee"].map((item) => (
              <span
                key={item}
                style={{ color: "#618C3A", fontSize: "0.8rem", cursor: "pointer" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
