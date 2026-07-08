import { Home, Leaf, SearchX } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - 180px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(48px, 9vw, 96px) 24px",
        background:
          "linear-gradient(180deg, rgba(240,234,214,0.55), rgba(250,246,238,1))",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            backgroundColor: "#2D5016",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 18px 44px rgba(45,80,22,0.2)",
          }}
        >
          <SearchX size={36} style={{ color: "#D4A017" }} />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Leaf size={14} style={{ color: "#8B5E3C" }} />
          <span
            style={{
              color: "#8B5E3C",
              fontSize: "0.75rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Page Not Found
          </span>
          <Leaf size={14} style={{ color: "#8B5E3C" }} />
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2D5016",
            fontSize: "clamp(4rem, 13vw, 8rem)",
            lineHeight: 0.95,
            margin: "0 0 16px",
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2D5016",
            fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
            margin: "0 0 14px",
          }}
        >
          This path has not been prepared yet
        </h2>

        <p
          style={{
            color: "#5C4033",
            maxWidth: "540px",
            margin: "0 auto 30px",
            lineHeight: 1.8,
            fontSize: "0.98rem",
          }}
        >
          The page you are looking for may have moved, or the address may be
          incorrect. Return home and continue exploring Rajapura Herbal.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#2D5016",
              color: "#FAF6EE",
              padding: "12px 24px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "transparent",
              color: "#2D5016",
              padding: "12px 24px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
              border: "1px solid rgba(45,80,22,0.35)",
            }}
          >
            View Products
          </Link>
        </div>
      </div>
    </section>
  );
}
