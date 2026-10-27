import { API_BASE_URL } from "../lib/api";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { Product } from "../interfaces/productInterface";

const api = API_BASE_URL;
type Prices = { lkr: string; usd: string };

const editAmount = (value?: string) => {
  const amount = (value ?? "").replace(/^(LKR|USD)\s*/i, "").replace(/,/g, "").trim();
  return /^\d+(\.\d+)?$/.test(amount) ? amount : "";
};
const formatAmount = (value: string, currency: "LKR" | "USD") => {
  const amount = Number(value.replace(/,/g, ""));
  return `${currency} ${new Intl.NumberFormat("en-US", currency === "USD" ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }).format(amount)}`;
};

export default function AdminStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [priceValues, setPriceValues] = useState<Record<string, Prices>>({});
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const response = await axios.get(`${api}/user/products-all`);
    const items: Product[] = response.data.data ?? [];
    setProducts(items);
    setStockValues(Object.fromEntries(items.map((product) => [String(product._id), String(product.stock ?? 0)])));
    setPriceValues(Object.fromEntries(items.map((product) => [String(product._id), {
      lkr: editAmount(product.priceLKR || product.price),
      usd: editAmount(product.priceUSD),
    }])));
  };

  useEffect(() => {
    load().catch(() => setError("Could not load product stock and prices."));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)
    );
  }, [products, search]);

  const saveChanges = async (product: Product) => {
    const id = String(product._id);
    const rawStock = stockValues[id]?.trim();
    const stock = Number(rawStock);
    if (!rawStock || !Number.isInteger(stock) || stock < 0) {
      setError("Enter a whole stock number that is zero or greater.");
      setMessage("");
      return;
    }
    const prices = priceValues[id] ?? { lkr: "", usd: "" };
    const lkrValue = prices.lkr.trim().replace(/,/g, "");
    const usdValue = prices.usd.trim().replace(/,/g, "");
    const validAmount = (value: string) => !value || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0);
    if (!validAmount(lkrValue) || !validAmount(usdValue)) {
      setError("Enter valid non-negative LKR and USD prices (up to 2 decimal places).");
      setMessage("");
      return;
    }

    const priceLKR = lkrValue ? formatAmount(lkrValue, "LKR") : "";
    const priceUSD = usdValue ? formatAmount(usdValue, "USD") : "";
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const response = await axios.patch(`${api}/admin/products/${id}/stock`, { stock, priceLKR, priceUSD }, { withCredentials: true });
      const saved = response.data?.data;
      if (Number(saved?.stock) !== stock || saved?.priceLKR !== priceLKR || saved?.priceUSD !== priceUSD) {
        throw new Error("The server did not confirm all stock and price changes.");
      }
      setProducts((current) => current.map((item) => String(item._id) === id
        ? { ...item, stock, price: priceLKR, priceLKR, priceUSD }
        : item));
      setStockValues((current) => ({ ...current, [id]: String(stock) }));
      setPriceValues((current) => ({ ...current, [id]: { lkr: lkrValue, usd: usdValue } }));
      setMessage(`${product.name}: stock and prices updated successfully.`);
    } catch (saveError: any) {
      setError(saveError.response?.data?.message ?? saveError.message ?? "Stock and price update failed.");
    } finally {
      setBusy("");
    }
  };

  const inputStyle = { width: "100%", minWidth: 0, boxSizing: "border-box" as const, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(45,80,22,.2)", background: "#FBF9F3", color: "#244516", outlineColor: "#7EA64A" };
  const labelStyle = { display: "grid", gap: 7, color: "#55723B", fontSize: ".76rem", fontWeight: 700 as const, letterSpacing: ".02em" };

  return (
    <section style={{ color: "#2D5016", maxWidth: 1280, margin: "0 auto", paddingBottom: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 6px", color: "#9A7048", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>Inventory</p>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#244516" }}>Stock management</h2>
        <p style={{ margin: "7px 0 0", color: "#776957" }}>Update available stock and regional prices for your products.</p>
      </div>
      {message && <p role="status" style={{ color: "#2D5016", background: "#EAF2DF", border: "1px solid #C9D9B3", borderRadius: 12, padding: "12px 16px", boxShadow: "0 4px 14px rgba(45,80,22,.05)" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#8B2E25", background: "#FFF0ED", border: "1px solid #E8C4BE", borderRadius: 12, padding: "12px 16px" }}>{error}</p>}
      <label style={{ display: "flex", alignItems: "center", gap: 11, maxWidth: 500, margin: "20px 0 24px", padding: "12px 15px", border: "1px solid rgba(45,80,22,.16)", borderRadius: 14, background: "#FBF9F3", boxShadow: "0 5px 18px rgba(39,54,22,.04)" }}>
        <Search size={19} color="#55723B" aria-hidden="true" />
        <input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product or category..." style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "#2D5016", fontSize: ".92rem" }} />
      </label>
      <div style={{ display: "grid", gap: 14 }}>
        {filteredProducts.map((product) => {
          const id = String(product._id);
          const prices = priceValues[id] ?? { lkr: "", usd: "" };
          return (
            <div key={id} style={{ background: "linear-gradient(110deg, #FFFEFA 0%, #FAF6EE 100%)", border: "1px solid rgba(45,80,22,.13)", borderRadius: 16, padding: "17px 20px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", boxShadow: "0 6px 20px rgba(39,54,22,.045)" }}>
            <div style={{ flex: "1 1 260px", minWidth: 220, display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(45,80,22,.12)", background: "#F0EDE6" }}
              />
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: "block", color: "#244516", fontSize: ".98rem", lineHeight: 1.4 }}>{product.name}</strong>
                <span style={{ display: "block", color: "#9A7048", marginTop: 4, fontSize: ".78rem" }}>{product.category}</span>
              </div>
            </div>
              <span style={{ color: (product.stock ?? 0) > 0 ? "#365C20" : "#875A32", background: (product.stock ?? 0) > 0 ? "#EEF2DF" : "#F3EBDD", border: "1px solid rgba(45,80,22,.12)", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: ".82rem", whiteSpace: "nowrap" }}>{product.stock ?? 0} available</span>
              <label style={labelStyle}>LKR price
                <input aria-label={`LKR price for ${product.name}`} inputMode="decimal" value={prices.lkr} onChange={(event) => setPriceValues((current) => ({ ...current, [id]: { ...prices, lkr: event.target.value } }))} placeholder="e.g. 5000" style={inputStyle} />
              </label>
              <label style={labelStyle}>USD price
                <input aria-label={`USD price for ${product.name}`} inputMode="decimal" value={prices.usd} onChange={(event) => setPriceValues((current) => ({ ...current, [id]: { ...prices, usd: event.target.value } }))} placeholder="e.g. 12.50" style={inputStyle} />
              </label>
              <label style={labelStyle}>Set stock
                <input aria-label={`Stock for ${product.name}`} type="number" min="0" step="1" value={stockValues[id] ?? "0"} onChange={(event) => setStockValues((current) => ({ ...current, [id]: event.target.value }))} style={{ ...inputStyle, width: 90 }} />
              </label>
              <button type="button" disabled={busy === id} onClick={() => saveChanges(product)} style={{ alignSelf: "end", padding: "11px 18px", border: 0, borderRadius: 24, background: busy === id ? "#789064" : "linear-gradient(135deg, #31591B, #244516)", color: "#FAF6EE", cursor: busy === id ? "wait" : "pointer", boxShadow: "0 5px 12px rgba(36,69,22,.18)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {busy === id ? "Saving..." : "Save changes"}
              </button>
            </div>
          );
        })}
      </div>
      {products.length === 0 && !error && <p>No products found.</p>}
      {products.length > 0 && filteredProducts.length === 0 && <p>No products match that search.</p>}
    </section>
  );
}
