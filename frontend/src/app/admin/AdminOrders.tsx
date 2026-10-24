import { useEffect, useState } from "react";
import axios from "axios";

type Order = { _id: string; country: string; customerName: string; contactNumber: string; address: string; products: { name: string; qty: number; price: number }[]; orderStatus: string; paymentStatus: string; paymentMethod: string; createdAt: string };
const api = import.meta.env.VITE_BACKEND_URL;
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]); const [error, setError] = useState("");
  const load = () => axios.get(`${api}/admin/orders`, { withCredentials: true }).then(r => setOrders(r.data.data));
  useEffect(() => { load().catch(() => setError("Could not load orders.")); }, []);
  const update = async (id: string, field: "orderStatus" | "paymentStatus", value: string) => { try { await axios.patch(`${api}/admin/orders/${id}`, { [field]: value }, { withCredentials: true }); await load(); } catch { setError("Could not update this order."); } };
  const select = (label: string, value: string, values: string[], onChange: (v: string) => void) => <label style={{ display: "grid", gap: 4, fontSize: 12 }}>{label}<select value={value} onChange={e => onChange(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", background: "#FAF6EE" }}>{values.map(v => <option key={v}>{v}</option>)}</select></label>;
  return <section style={{ color: "#2D5016" }}><h2 style={{ fontFamily: "'Playfair Display',serif" }}>Orders</h2><p>Review customer orders and payment status.</p>{error && <p role="alert">{error}</p>}<div style={{ display: "grid", gap: 14 }}>{orders.map(o => <article key={o._id} style={{ background: "#FAF6EE", border: "1px solid rgba(45,80,22,.15)", borderRadius: 14, padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{o.customerName} · {o.country}</strong><time>{new Date(o.createdAt).toLocaleDateString()}</time></div><p>{o.contactNumber} · {o.address}</p><ul>{o.products.map((p,i) => <li key={`${p.name}-${i}`}>{p.name} × {p.qty} · {p.price}</li>)}</ul><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{select("Order status", o.orderStatus, ["Pending","Processing","Shipped","Delivered","Cancelled"], v => update(o._id,"orderStatus",v))}{select("Payment status",o.paymentStatus,["Unpaid","Paid","Refunded"],v => update(o._id,"paymentStatus",v))}<span>Payment method: {o.paymentMethod}</span></div></article>)}</div>{orders.length === 0 && !error && <p>No orders yet.</p>}</section>;
}
