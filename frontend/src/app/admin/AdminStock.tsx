import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../interfaces/productInterface";

const api = import.meta.env.VITE_BACKEND_URL;
export default function AdminStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState<string>("");
  const [message, setMessage] = useState("");
  const load = async () => { const r = await axios.get(`${api}/user/products-all`); setProducts(r.data.data ?? []); };
  useEffect(() => { load().catch(() => setMessage("Could not load product stock.")); }, []);
  const change = async (p: Product, stock: number) => {
    if (!Number.isInteger(stock) || stock < 0) return;
    setBusy(String(p._id)); setMessage("");
    try { await axios.patch(`${api}/admin/products/${p._id}/stock`, { stock }, { withCredentials: true }); setProducts((xs) => xs.map((x) => String(x._id) === String(p._id) ? { ...x, stock } : x)); setMessage("Stock updated."); }
    catch { setMessage("Stock update failed."); }
    finally { setBusy(""); }
  };
  return <section style={{ color: "#2D5016" }}><h2 style={{ fontFamily: "'Playfair Display',serif" }}>Stock management</h2><p>Update available quantities for each product.</p>{message && <p role="status">{message}</p>}<div style={{ display: "grid", gap: 12 }}>{products.map((p) => <div key={String(p._id)} style={{ background: "#FAF6EE", border: "1px solid rgba(45,80,22,.15)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}><strong style={{ flex: 1 }}>{p.name}</strong><span>{p.stock ?? 0} available</span><label>Set stock <input aria-label={`Stock for ${p.name}`} type="number" min="0" step="1" defaultValue={p.stock ?? 0} onBlur={(e) => Number(e.target.value) !== (p.stock ?? 0) && change(p, Number(e.target.value))} style={{ width: 90, marginLeft: 8, padding: 8, borderRadius: 8, border: "1px solid #ccc" }} /></label>{busy === String(p._id) && <span>Saving…</span>}</div>)}</div></section>;
}
