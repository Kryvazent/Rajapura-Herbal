import { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, RefreshCw } from "lucide-react";

type Order = {
  _id: string;
  country: string;
  customerName: string;
  contactNumber: string;
  address: string;
  additionalNote?: string;
  paymentSlipUrl?: string;
  products: { name: string; qty: number; price: number }[];
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};

const api = import.meta.env.VITE_BACKEND_URL;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${api}/admin/orders`, { withCredentials: true });
      setOrders(response.data.data ?? []);
    } catch {
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const update = async (id: string, field: "orderStatus" | "paymentStatus", value: string) => {
    try {
      await axios.patch(`${api}/admin/orders/${id}`, { [field]: value }, { withCredentials: true });
      await load();
    } catch {
      setError("Could not update this order.");
    }
  };

  const select = (label: string, value: string, values: string[], onChange: (value: string) => void) => (
    <label style={{ display: "grid", gap: 5, color: "#62724D", fontSize: ".76rem", fontWeight: 700 }}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} style={{ padding: "9px 11px", borderRadius: 9, border: "1px solid rgba(45,80,22,.2)", background: "#FBF9F3", color: "#2D5016" }}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );

  const emptyState = error ? {
    eyebrow: "Connection issue",
    title: "Orders couldn’t be loaded",
    description: "We couldn’t retrieve the latest orders. Check the connection and try again.",
    action: "Try again",
  } : {
    eyebrow: "Order inbox",
    title: "No orders to review yet",
    description: "New customer orders will appear here, ready for you to manage their status and payment.",
    action: "Refresh orders",
  };

  return (
    <section style={{ color: "#2D5016", maxWidth: 1280, margin: "0 auto", paddingBottom: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", color: "#9A7048", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>Customer care</p>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#244516" }}>Orders</h2>
        <p style={{ margin: "7px 0 0", color: "#776957" }}>Review customer orders and payment status.</p>
      </div>
      {error && orders.length > 0 && <p role="alert" style={{ margin: "0 0 16px", padding: "11px 14px", borderRadius: 11, color: "#8B2E25", background: "#FFF0ED", border: "1px solid #E8C4BE" }}>{error}</p>}

      {orders.length === 0 ? (
        <div style={{ position: "relative", overflow: "hidden", minHeight: 340, display: "grid", placeItems: "center", padding: "38px 22px", borderRadius: 22, border: "1px solid rgba(45,80,22,.13)", background: "linear-gradient(145deg, #FFFEFA 0%, #F5F1E6 100%)", boxShadow: "0 16px 44px rgba(39,54,22,.07)" }}>
          <div aria-hidden="true" style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", right: -100, top: -140, background: "rgba(139,195,74,.11)" }} />
          <div aria-hidden="true" style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", left: -90, bottom: -115, background: "rgba(201,161,74,.1)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 490, textAlign: "center" }}>
            <div style={{ width: 76, height: 76, margin: "0 auto 20px", display: "grid", placeItems: "center", borderRadius: 24, color: "#31591B", background: "#EAF0DA", border: "1px solid rgba(45,80,22,.12)", boxShadow: "0 8px 20px rgba(45,80,22,.08)" }}>
              <ClipboardList size={34} strokeWidth={1.7} />
            </div>
            <p style={{ margin: "0 0 8px", color: "#A07448", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>{loading ? "Order inbox" : emptyState.eyebrow}</p>
            <h3 style={{ margin: 0, color: "#244516", fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.45rem, 3vw, 2rem)", lineHeight: 1.25 }}>{loading ? "Checking for new orders" : emptyState.title}</h3>
            <p style={{ margin: "12px auto 22px", color: "#776957", fontSize: ".95rem", lineHeight: 1.7 }}>{loading ? "Your order inbox will be ready in a moment." : emptyState.description}</p>
            {!loading && <button type="button" onClick={() => void load()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 18px", border: 0, borderRadius: 999, color: "#FAF6EE", background: "#2D5016", boxShadow: "0 6px 16px rgba(45,80,22,.18)", fontWeight: 700, cursor: "pointer" }}><RefreshCw size={16} />{emptyState.action}</button>}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((order) => (
            <article key={order._id} style={{ background: "#FBF9F3", border: "1px solid rgba(45,80,22,.14)", borderRadius: 16, padding: 20, boxShadow: "0 6px 20px rgba(39,54,22,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{order.customerName} · {order.country}</strong><time>{new Date(order.createdAt).toLocaleDateString()}</time></div>
              <p>{order.contactNumber} · {order.address}</p>
              {order.additionalNote && <p><strong>Customer note:</strong> {order.additionalNote}</p>}
              <ul>{order.products.map((product, index) => <li key={`${product.name}-${index}`}>{product.name} × {product.qty} · {product.price}</li>)}</ul>
              <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
                {select("Order status", order.orderStatus, ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], (value) => void update(order._id, "orderStatus", value))}
                {select("Payment status", order.paymentStatus, ["Unpaid", "Paid", "Refunded"], (value) => void update(order._id, "paymentStatus", value))}
                <span>Payment method: {order.paymentMethod}</span>
                {order.paymentSlipUrl && <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer" style={{ color: "#2D5016", fontWeight: 700 }}>View payment slip</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
