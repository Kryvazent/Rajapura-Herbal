import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { Product } from "../interfaces/productInterface";
import { ShoppingBag, ArrowRight } from "lucide-react";
import axios from "axios";
import { formatUSDPrice } from "../lib/price";

type Item = { product: Product; qty: number };
const itemUnitPrice = (product: Product): number | null => {
  const rawPrice = product.priceUSD || (product.price?.startsWith("USD ") ? product.price : "");
  if (!rawPrice) return null;
  const amount = Number(rawPrice.replace(/USD\s*/i, "").replace(/,/g, "").trim());
  return Number.isFinite(amount) ? amount : null;
};
const formatDollarAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export default function Cart() {
  const [items, setItems] = useState<Item[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [cartError, setCartError] = useState("");
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setCountry(d.country_code ?? null);
        // setCountry("USA");
      })
      .catch(() => setCountry(null));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/customer/status`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (status) => {
        const customer = Boolean(status.authenticated && status.role === "USER");
        setSignedIn(customer);
        if (!customer) return;

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/cart`, { withCredentials: true });
        let cartItems = response.data.data?.items ?? [];
        let canClearLegacyCart = true;
        if (cartItems.length === 0) {
          try {
            const legacyItems = JSON.parse(localStorage.getItem("rajapuraCart") || "[]");
            if (Array.isArray(legacyItems) && legacyItems.length) {
              const migrated = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/user/cart`, {
                items: legacyItems.map((item: Item) => ({ productId: item.product._id, qty: item.qty })),
              }, { withCredentials: true });
              cartItems = migrated.data.data?.items ?? [];
            }
          } catch (error: any) {
            canClearLegacyCart = false;
            setCartError(error.response?.data?.message ?? "We couldn't migrate your saved cart. Please try again.");
          }
        }
        setItems(cartItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, qty: item.qty })));
        if (canClearLegacyCart) localStorage.removeItem("rajapuraCart");
      })
      .catch((error) => {
        setCartError(error.response?.data?.message ?? "Unable to load your saved cart. Please refresh to try again.");
      })
      .finally(() => setAuthChecked(true));
  }, []);
  const save = async (next: Item[]) => {
    const previous = items;
    setItems(next);
    setCartError("");
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/user/cart`, {
        items: next.map((item) => ({ productId: item.product._id, qty: item.qty })),
      }, { withCredentials: true });
      const savedItems = response.data.data?.items ?? [];
      setItems(savedItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, qty: item.qty })));
      localStorage.removeItem("rajapuraCart");
      window.dispatchEvent(new Event("rajapura:cart-updated"));
    } catch (error: any) {
      setItems(previous);
      setCartError(error.response?.data?.message ?? "Your cart changes could not be saved.");
    }
  };
  const updateQuantity = (productId: Product["_id"], quantity: number) => {
    save(items.map((item) => item.product._id === productId ? { ...item, qty: quantity } : item));
  };
  const pricedItems = items.map((item) => ({ ...item, unitPrice: itemUnitPrice(item.product) }));
  const estimatedTotal = pricedItems.every((item) => item.unitPrice !== null)
    ? pricedItems.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.qty, 0)
    : null;
  useEffect(() => {
    const pending = Object.entries(quantityDrafts)
      .map(([productId, rawQty]) => [productId, Number(rawQty)] as const)
      .filter(([, qty]) => Number.isSafeInteger(qty) && qty >= 1);
    if (pending.length === 0) return;

    const timeout = window.setTimeout(() => {
      const pendingQuantities = new Map(pending);
      const next = items.map((item) => ({
        ...item,
        qty: pendingQuantities.get(item.product._id) ?? item.qty,
      }));
      setQuantityDrafts({});
      void save(next);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [quantityDrafts, items]);
  if (country === "LK") return <Navigate to="/products" replace />;
  if (country === null)
    return (
      <main style={{ minHeight: 460, display: "grid", placeItems: "center", padding: "44px 20px", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <div aria-label="Loading" role="status" style={{ width: 34, height: 34, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#2D5016", borderRadius: "50%", animation: "cart-spin .8s linear infinite" }} />
        <style>{"@keyframes cart-spin{to{transform:rotate(360deg)}}"}</style>
      </main>
    );
  if (!authChecked)
    return (
      <main style={{ minHeight: 460, display: "grid", placeItems: "center", padding: "44px 20px", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <div aria-label="Loading cart" style={{ width: 34, height: 34, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#2D5016", borderRadius: "50%", animation: "cart-spin .8s linear infinite" }} />
        <style>{"@keyframes cart-spin{to{transform:rotate(360deg)}}"}</style>
      </main>
    );
  if (!signedIn)
    return (
      <main style={{ minHeight: 480, display: "grid", placeItems: "center", padding: "48px 20px", color: "#2D5016", fontFamily: "'Lato',sans-serif", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <section style={{ width: "min(100%, 560px)", boxSizing: "border-box", padding: "clamp(32px, 6vw, 54px) 28px", textAlign: "center", background: "linear-gradient(145deg, #FFFEFA, #FAF6EE)", border: "1px solid rgba(45,80,22,.12)", borderRadius: 24, boxShadow: "0 18px 48px rgba(45,80,22,.08)" }}>
          <div aria-hidden="true" style={{ width: 76, height: 76, margin: "0 auto 22px", display: "grid", placeItems: "center", borderRadius: "50%", color: "#2D5016", background: "rgba(139,195,74,.16)", border: "1px solid rgba(45,80,22,.1)" }}><ShoppingBag size={31} strokeWidth={1.6} /></div>
          <p style={{ margin: "0 0 9px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em" }}>CUSTOMER ACCOUNT</p>
          <h1 style={{ margin: "0 auto 12px", maxWidth: 450, color: "#2D5016", fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.65rem, 4vw, 2.15rem)", fontWeight: 500 }}>Sign in to your cart</h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 360, color: "#6B6257", lineHeight: 1.65 }}>Your herbal favourites are just a step away.</p>
          <Link to="/account" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "12px 24px", borderRadius: 50, color: "#FAF6EE", background: "#2D5016", textDecoration: "none", fontSize: ".9rem", fontWeight: 700 }}>Sign in <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  if (cartError && signedIn && items.length === 0)
    return <main style={{ minHeight: 420, display: "grid", placeItems: "center", padding: 24, color: "#8F2D26", fontFamily: "'Lato',sans-serif" }}>
      <section role="alert" style={{ width: "min(100%, 480px)", padding: 28, textAlign: "center", borderRadius: 18, background: "#FFFEFA", border: "1px solid #E6B6AE", boxShadow: "0 12px 30px rgba(45,80,22,.08)" }}>
        <p style={{ margin: "0 0 16px" }}>{cartError}</p>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: "10px 18px", border: 0, borderRadius: 24, color: "#FAF6EE", background: "#2D5016", fontWeight: 700, cursor: "pointer" }}>Try again</button>
      </section>
    </main>;
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
            Your cart is empty
          </h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 390, color: "#6B6257", lineHeight: 1.7 }}>
            Find something good for you.
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
        maxWidth: 1320,
        margin: "48px auto",
        padding: 20,
        color: "#2D5016",
        fontFamily: "'Lato',sans-serif",
      }}
    >
      {cartError && <p role="alert" style={{ margin: "0 0 16px", padding: "12px 15px", borderRadius: 10, color: "#8F2D26", background: "#FFF3F0", border: "1px solid #E6B6AE" }}>{cartError}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
      <section>
      <h1 style={{ fontFamily: "'Playfair Display',serif", marginTop: 0, marginBottom: 24 }}>Your cart</h1>
      {items.map((item) => (
        <article
          key={String(item.product._id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            margin: "12px 0",
            background: "#FFFEFA",
            border: "1px solid rgba(45,80,22,.1)",
            borderRadius: 16,
            boxShadow: "0 5px 18px rgba(45,80,22,.045)",
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
          <span>{formatUSDPrice(item.product.priceUSD || (item.product.price?.startsWith("USD ") ? item.product.price : "")) || "Contact for price"}</span>
          <div aria-label={`Quantity for ${item.product.name}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: 4, border: "1px solid rgba(45,80,22,.2)", borderRadius: 12, background: "#F5F3E9" }}>
            <button type="button" aria-label={`Decrease ${item.product.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQuantity(item.product._id, item.qty - 1)} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 9, color: "#2D5016", background: item.qty <= 1 ? "#E8E6DD" : "#E4EBD8", fontSize: "1.2rem", fontWeight: 700, cursor: item.qty <= 1 ? "not-allowed" : "pointer" }}>−</button>
            <input
              type="number"
              aria-label={`Quantity for ${item.product.name}`}
              min={1}
              value={quantityDrafts[item.product._id] ?? String(item.qty)}
              onChange={(event) => {
                const value = event.target.value;
                if (/^\d*$/.test(value)) {
                  setQuantityDrafts((drafts) => ({ ...drafts, [item.product._id]: value }));
                }
              }}
              onBlur={(event) => {
                const value = Number(event.target.value);
                setQuantityDrafts((drafts) => {
                  const next = { ...drafts };
                  delete next[item.product._id];
                  return next;
                });
                if (Number.isSafeInteger(value) && value >= 1 && value !== item.qty) {
                  updateQuantity(item.product._id, value);
                }
              }}
              style={{ width: 140, height: 34, boxSizing: "border-box", padding: "0 12px", border: "1px solid rgba(45,80,22,.2)", borderRadius: 7, background: "#fffdf8", color: "#243D17", textAlign: "center", fontWeight: 800 }}
            />
            <button type="button" aria-label={`Increase ${item.product.name} quantity`} onClick={() => updateQuantity(item.product._id, item.qty + 1)} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 9, color: "#FAF6EE", background: "#2D5016", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.product.name} from cart`}
            onClick={() =>
              save(items.filter((i) => i.product._id !== item.product._id))
            }
            style={{ padding: "9px 14px", border: "1px solid rgba(157,48,41,.3)", borderRadius: 22, color: "#8F2D26", background: "#FFF3F0", fontSize: ".86rem", fontWeight: 700, cursor: "pointer", transition: "background .2s, transform .2s" }}
          >
            Remove
          </button>
        </article>
      ))}
      </section>
      <aside style={{ position: "sticky", top: 24, padding: 24, background: "#FFFEFA", border: "1px solid rgba(45,80,22,.12)", borderRadius: 18, boxShadow: "0 12px 32px rgba(45,80,22,.08)" }}>
        <p style={{ margin: "0 0 7px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em" }}>ORDER SUMMARY</p>
        <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 500 }}>Payment details</h2>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(45,80,22,.12)", color: "#6B6257", fontSize: ".92rem" }}>
          <span>Items</span><strong style={{ color: "#2D5016" }}>{items.reduce((total, item) => total + item.qty, 0)}</strong>
        </div>
        <div style={{ display: "grid", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(45,80,22,.12)" }}>
          {pricedItems.map((item) => (
            <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, color: "#6B6257", fontSize: ".86rem" }}>
              <div>
                <div style={{ color: "#334A28", fontWeight: 700 }}>{item.product.name}</div>
                <div style={{ marginTop: 3 }}>{item.qty} × {item.unitPrice === null ? "Contact for price" : formatDollarAmount(item.unitPrice)}</div>
              </div>
              <strong style={{ flexShrink: 0, color: "#2D5016" }}>{item.unitPrice === null ? "—" : formatDollarAmount(item.unitPrice * item.qty)}</strong>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, padding: "16px 0 18px", borderBottom: "1px solid rgba(45,80,22,.12)", color: "#243D17", fontSize: "1rem" }}>
          <strong>Estimated total</strong>
          <strong>{estimatedTotal === null ? "Contact for price" : formatDollarAmount(estimatedTotal)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0 18px", color: "#6B6257", fontSize: ".92rem" }}>
          <span>Payment</span><strong style={{ color: "#2D5016" }}>On order confirmation</strong>
        </div>
        <button type="button" disabled style={{ width: "100%", padding: "12px 18px", border: 0, borderRadius: 28, color: "#FAF6EE", background: "#2D5016", fontWeight: 700, opacity: .75, cursor: "not-allowed" }}>Continue to payment</button>
        <p style={{ margin: "14px 0 0", color: "#71695E", fontSize: ".84rem", lineHeight: 1.6 }}>Checkout is not available yet. Contact Rajapura Herbal to complete your order.</p>
      </aside>
      </div>
    </main>
  );
}
