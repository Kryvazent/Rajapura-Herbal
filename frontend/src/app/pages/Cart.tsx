import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { Product } from "../interfaces/productInterface";
import { ShoppingBag, ArrowRight } from "lucide-react";

type Item = { product: Product; qty: number };
export default function Cart() {
  const [items, setItems] = useState<Item[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("rajapuraCart") || "[]"));
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        // setCountry(d.country_code ?? null);
        setCountry("USA");
      })
      .catch(() => setCountry(null));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/status`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((s) => setSignedIn(Boolean(s.authenticated && s.role === "USER")))
      .catch(() => setSignedIn(false));
  }, []);
  const save = (next: Item[]) => {
    setItems(next);
    localStorage.setItem("rajapuraCart", JSON.stringify(next));
    window.dispatchEvent(new Event("rajapura:cart-updated"));
  };
  if (country === "LK") return <Navigate to="/products" replace />;
  if (country === null)
    return (
      <main
        style={{
          maxWidth: 900,
          margin: "48px auto",
          padding: 20,
          color: "#2D5016",
        }}
      >
        Checking your location…
      </main>
    );
  if (items.length === 0)
    return (
      <main
        style={{
          minHeight: 420,
          display: "grid",
          placeItems: "center",
          padding: "48px 20px",
          color: "#2D5016",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <section
          style={{
            width: "min(100%, 560px)",
            padding: "44px 28px",
            textAlign: "center",
            background: "#FAF6EE",
            border: "1px solid rgba(45,80,22,0.12)",
            borderRadius: 24,
            boxShadow: "0 16px 44px rgba(45,80,22,0.08)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 20px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              color: "#2D5016",
              background: "rgba(139,195,74,0.16)",
              border: "1px solid rgba(45,80,22,0.12)",
            }}
          >
            <ShoppingBag size={32} strokeWidth={1.6} />
          </div>
          <p
            style={{
              margin: "0 0 8px",
              color: "#8B5E3C",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Your cart
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              color: "#2D5016",
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 4vw, 2rem)",
            }}
          >
            Your cart is waiting for something good
          </h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 390, color: "#6B6257", lineHeight: 1.7 }}>
            Explore our herbal collection and add your favourites here.
          </p>
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: "12px 22px",
              borderRadius: 50,
              background: "#2D5016",
              color: "#FAF6EE",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 700,
            }}
          >
            Explore products <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "48px auto",
        padding: 20,
        color: "#2D5016",
        fontFamily: "'Lato',sans-serif",
      }}
    >
      <h1 style={{ fontFamily: "'Playfair Display',serif" }}>Your cart</h1>
      {items.map((item) => (
        <article
          key={String(item.product._id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            margin: "12px 0",
            background: "#FAF6EE",
            borderRadius: 12,
          }}
        >
          <img
            src={item.product.image}
            alt=""
            style={{
              width: 72,
              height: 72,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />
          <strong style={{ flex: 1 }}>{item.product.name}</strong>
          <span>{item.product.price}</span>
          <input
            aria-label={`Quantity for ${item.product.name}`}
            type="number"
            min="1"
            max={item.product.stock}
            value={item.qty}
            onChange={(e) =>
              save(
                items.map((i) =>
                  i.product._id === item.product._id
                    ? {
                        ...i,
                        qty: Math.max(
                          1,
                          Math.min(
                            item.product.stock,
                            Number(e.target.value) || 1,
                          ),
                        ),
                      }
                    : i,
                ),
              )
            }
            style={{ width: 64, padding: 8 }}
          />
          <button
            onClick={() =>
              save(items.filter((i) => i.product._id !== item.product._id))
            }
          >
            Remove
          </button>
        </article>
      ))}
      {items.length > 0 && (
        <section
          style={{
            marginTop: 28,
            padding: 20,
            background: "#FAF6EE",
            borderRadius: 12,
          }}
        >
          <h2>Continue to payment</h2>
          {signedIn ? (
            <p>
              Checkout is not available yet. Please contact Rajapura Herbal to
              complete your order.
            </p>
          ) : (
            <p>
              Customer account sign-in is not available yet. Please contact
              Rajapura Herbal to place your order.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
