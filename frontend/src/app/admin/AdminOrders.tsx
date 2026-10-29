import { API_BASE_URL } from "../lib/api";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, ChevronDown, ClipboardList, CreditCard, MapPin, Package, RefreshCw, Search } from "lucide-react";

type Order = {
  _id: string;
  country: string;
  currency?: "USD" | "LKR";
  customer: { name: string; email: string; contactNumber: string } | null;
  address: string;
  additionalNote?: string;
  paymentSlipUrl?: string;
  products: { name: string; qty: number; price: number }[];
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};

const api = API_BASE_URL;
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
const paymentStatuses = ["Processing", "Unpaid", "Paid", "Refunded"];
const statusFilterOptions = ["All orders", ...orderStatuses];
const ordersPerPage = 10;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const orderTotal = (order: Order) =>
  order.products.reduce((total, product) => total + product.price * product.qty, 0);
const orderCurrency = (order: Order): "USD" | "LKR" => order.currency ?? (/^(LK|Sri Lanka)$/i.test(order.country) ? "LKR" : "USD");
const formatOrderAmount = (amount: number, order: Order) => new Intl.NumberFormat("en-US", { style: "currency", currency: orderCurrency(order), currencyDisplay: "code" }).format(amount);

const fieldStyle = {
  padding: "10px 12px",
  border: "1px solid rgba(45,80,22,.18)",
  borderRadius: 9,
  background: "#FFFEFA",
  color: "#2D5016",
  font: "inherit",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<"orderStatus" | "paymentStatus" | null>(null);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${api}/admin/orders`, { withCredentials: true });
      setOrders(response.data.data ?? []);
    } catch {
      setError("Orders couldn’t be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const update = async (id: string, field: "orderStatus" | "paymentStatus", value: string) => {
    setUpdatingOrderId(id);
    setUpdatingField(field);
    setError("");
    try {
      await axios.patch(`${api}/admin/orders/${id}`, { [field]: value }, { withCredentials: true });
      await load(false);
    } catch {
      setError("This order couldn’t be updated. Please try again.");
    } finally {
      setUpdatingOrderId(null);
      setUpdatingField(null);
    }
  };

  const statusCounts = useMemo(() => orders.reduce<Record<string, number>>((counts, order) => {
    counts[order.orderStatus] = (counts[order.orderStatus] ?? 0) + 1;
    return counts;
  }, {}), [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "All orders" && order.orderStatus !== statusFilter) return false;
      if (!query) return true;
      const date = new Date(order.createdAt);
      const searchable = [
        order._id,
        order._id.slice(-7),
        order.customer?.name,
        order.customer?.email,
        order.country,
        order.createdAt,
        formatDate(order.createdAt),
        date.toLocaleDateString(),
        date.toLocaleDateString(undefined, { month: "long" }),
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      return searchable.includes(query);
    });
  }, [orders, search, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const select = (
    label: string,
    value: string,
    values: string[],
    onChange: (value: string) => void,
    disabled: boolean,
  ) => (
    <label style={{ display: "grid", gap: 6, color: "#62724D", fontSize: ".76rem", fontWeight: 700 }}>
      {label}
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} style={{ ...fieldStyle, minWidth: 142, opacity: disabled ? .65 : 1 }}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 32, color: "#2D5016" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <p style={{ margin: "0 0 6px", color: "#9A7048", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>Customer care</p>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", color: "#244516" }}>Orders</h2>
          <p style={{ margin: "7px 0 0", color: "#776957" }}>Search orders, review delivery details, and update order progress.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 15px", border: "1px solid rgba(45,80,22,.18)", borderRadius: 999, color: "#31551F", background: "#FFFEFA", fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? .65 : 1 }}>
          <RefreshCw size={15} aria-hidden="true" /> Refresh
        </button>
      </header>

      {error && orders.length > 0 && <p role="alert" style={{ margin: "0 0 16px", padding: "12px 15px", border: "1px solid #E8C4BE", borderRadius: 11, color: "#8B2E25", background: "#FFF0ED" }}>{error}</p>}

      {!loading && orders.length > 0 && <>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "13px 15px", border: "1px solid rgba(45,80,22,.11)", borderRadius: 15, background: "#FFFEFA", boxShadow: "0 5px 18px rgba(39,54,22,.035)" }}>
          <Search size={18} aria-hidden="true" style={{ flexShrink: 0, color: "#758367" }} />
          <input
            type="search"
            aria-label="Search orders by customer, date, country, or order ID"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
            placeholder="Search customer, date, country, or order ID"
            style={{ width: "100%", minWidth: 0, padding: "5px 0", border: 0, outline: 0, color: "#2D5016", background: "transparent", font: "inherit" }}
          />
          {search && <button type="button" onClick={() => { setSearch(""); setCurrentPage(1); }} style={{ flexShrink: 0, padding: "5px 8px", border: 0, borderRadius: 7, color: "#526746", background: "#EEF1E7", fontSize: ".76rem", fontWeight: 700, cursor: "pointer" }}>Clear</button>}
        </div>

        <div role="group" aria-label="Filter orders by status" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 1px 12px", marginBottom: 8 }}>
          {statusFilterOptions.map((status) => {
            const count = status === "All orders" ? orders.length : statusCounts[status] ?? 0;
            const active = statusFilter === status;
            return <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0, padding: "9px 12px", border: `1px solid ${active ? "#31551F" : "rgba(45,80,22,.14)"}`, borderRadius: 999, color: active ? "#FFFEFA" : "#526746", background: active ? "#31551F" : "#FFFEFA", fontSize: ".8rem", fontWeight: 700, cursor: "pointer" }}
            >{status}<span style={{ minWidth: 20, padding: "2px 5px", borderRadius: 999, color: active ? "#244516" : "#526746", background: active ? "#E3EBD5" : "#EEF1E7", fontSize: ".7rem", textAlign: "center" }}>{count}</span></button>;
          })}
        </div>
      </>}

      {loading ? <div role="status" style={{ display: "grid", justifyItems: "center", gap: 12, padding: 60, color: "#68775B" }}>
        <span aria-hidden="true" style={{ width: 30, height: 30, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#31551F", borderRadius: "50%", animation: "admin-orders-spin .8s linear infinite" }} />
        <span>Loading orders…</span>
        <style>{"@keyframes admin-orders-spin{to{transform:rotate(360deg)}}"}</style>
      </div> : orders.length === 0 && error ? <div role="alert" style={{ display: "grid", justifyItems: "center", gap: 10, padding: "56px 24px", border: "1px solid #E8C4BE", borderRadius: 18, color: "#8B2E25", background: "#FFF0ED", textAlign: "center" }}>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 500 }}>Orders couldn’t be loaded</h3>
        <p style={{ maxWidth: 420, margin: 0, lineHeight: 1.6 }}>{error}</p>
        <button type="button" onClick={() => void load()} style={{ marginTop: 8, padding: "10px 16px", border: 0, borderRadius: 999, color: "#FFFEFA", background: "#31551F", fontWeight: 700, cursor: "pointer" }}>Try again</button>
      </div> : orders.length === 0 ? <div style={{ display: "grid", justifyItems: "center", gap: 10, padding: "56px 24px", border: "1px solid rgba(45,80,22,.12)", borderRadius: 18, background: "#FFFEFA", textAlign: "center" }}>
        <span style={{ width: 60, height: 60, display: "grid", placeItems: "center", borderRadius: 19, color: "#31551F", background: "#EAF0DA" }}><ClipboardList size={28} /></span>
        <h3 style={{ margin: "4px 0 0", fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 500 }}>No orders yet</h3>
        <p style={{ maxWidth: 420, margin: 0, color: "#776957", lineHeight: 1.6 }}>New customer orders will appear here when they’re placed.</p>
      </div> : filteredOrders.length === 0 ? <div style={{ display: "grid", justifyItems: "center", gap: 8, padding: "48px 20px", border: "1px dashed rgba(45,80,22,.22)", borderRadius: 16, color: "#68775B", background: "rgba(255,254,250,.65)", textAlign: "center" }}>
        <Search size={25} aria-hidden="true" />
        <strong style={{ color: "#31551F" }}>No matching orders</strong>
        <span>Try another search or choose a different status.</span>
        <button type="button" onClick={() => { setSearch(""); setStatusFilter("All orders"); setCurrentPage(1); }} style={{ marginTop: 5, padding: "8px 13px", border: 0, borderRadius: 999, color: "#31551F", background: "#EAF0DA", fontWeight: 700, cursor: "pointer" }}>Clear filters</button>
      </div> : <div style={{ display: "grid", gap: 11 }}>
        <p style={{ margin: "0 0 2px", color: "#68775B", fontSize: ".82rem" }}>Showing <strong style={{ color: "#31551F" }}>{(currentPage - 1) * ordersPerPage + 1}-{Math.min(currentPage * ordersPerPage, filteredOrders.length)}</strong> of {filteredOrders.length} matching orders</p>
        {paginatedOrders.map((order) => {
          const customerName = order.customer?.name || "Customer";
          const shortId = order._id.slice(-7).toUpperCase();
          const total = orderTotal(order);
          const updating = updatingOrderId === order._id;
          return <details key={order._id} style={{ overflow: "hidden", border: "1px solid rgba(45,80,22,.13)", borderRadius: 15, background: "#FFFEFA", boxShadow: "0 5px 18px rgba(39,54,22,.035)" }}>
            <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer", listStyle: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                <span aria-hidden="true" style={{ width: 40, height: 40, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 13, color: "#31551F", background: "#EAF0DA" }}><Package size={19} /></span>
                <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
                  <strong style={{ overflow: "hidden", color: "#244516", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerName} <span style={{ color: "#8A8A78", fontWeight: 400 }}>·</span> {order.country}</strong>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: "#75806D", fontSize: ".78rem" }}>
                    <span>Order #{shortId}</span><span aria-hidden="true">·</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={13} />{formatDate(order.createdAt)}</span>
                  </span>
                </span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                <span style={{ padding: "5px 9px", borderRadius: 999, color: order.orderStatus === "Delivered" ? "#2E6B42" : order.orderStatus === "Cancelled" || order.orderStatus === "Returned" ? "#8B2E25" : "#76572A", background: order.orderStatus === "Delivered" ? "#E6F1E5" : order.orderStatus === "Cancelled" || order.orderStatus === "Returned" ? "#FBEDEA" : "#F6EFDF", fontSize: ".72rem", fontWeight: 800 }}>{order.orderStatus}</span>
                <strong style={{ color: "#31551F", fontSize: ".92rem" }}>{formatOrderAmount(total, order)}</strong>
                <ChevronDown size={17} aria-hidden="true" style={{ color: "#75806D" }} />
              </span>
            </summary>

            <div style={{ display: "grid", gap: 18, padding: "0 18px 18px", borderTop: "1px solid rgba(45,80,22,.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18, paddingTop: 17 }}>
                <div>
                  <p style={{ margin: "0 0 8px", color: "#9A7048", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Customer</p>
                  <strong style={{ display: "block", color: "#31551F" }}>{customerName}</strong>
                  {order.customer?.email && <span style={{ display: "block", marginTop: 3, color: "#75806D", fontSize: ".8rem" }}>{order.customer.email}</span>}
                  <span style={{ display: "block", marginTop: 3, color: "#526746", fontSize: ".85rem" }}>{order.customer?.contactNumber || "No phone number"}</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", color: "#9A7048", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Delivery</p>
                  <span style={{ display: "flex", alignItems: "flex-start", gap: 6, color: "#526746", fontSize: ".85rem", lineHeight: 1.55 }}><MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} />{order.address}, {order.country}</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", color: "#9A7048", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Payment</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#526746", fontSize: ".85rem" }}><CreditCard size={15} />{order.paymentMethod || "Not selected"} · {order.paymentStatus}</span>
                  {order.paymentSlipUrl && <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, color: "#31551F", fontSize: ".83rem", fontWeight: 700 }}>View payment slip</a>}
                </div>
              </div>

              <div style={{ padding: 14, border: "1px solid rgba(45,80,22,.1)", borderRadius: 12, background: "#FAF8F2" }}>
                <h3 style={{ margin: "0 0 11px", color: "#31551F", fontSize: ".87rem" }}>Items ordered</h3>
                <div style={{ display: "grid", gap: 9 }}>
                  {order.products.map((product, index) => <div key={`${product.name}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#526746", fontSize: ".84rem" }}>
                    <span>{product.name} <span style={{ color: "#75806D" }}>× {product.qty} · {formatOrderAmount(product.price, order)} each</span></span>
                    <strong style={{ flexShrink: 0, color: "#31551F" }}>{formatOrderAmount(product.price * product.qty, order)}</strong>
                  </div>)}
                </div>
                {order.additionalNote && <p style={{ margin: "12px 0 0", paddingTop: 10, borderTop: "1px solid rgba(45,80,22,.1)", color: "#68775B", fontSize: ".82rem", lineHeight: 1.5 }}><strong>Customer note:</strong> {order.additionalNote}</p>}
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
                {select("Order status", order.orderStatus, orderStatuses, (value) => void update(order._id, "orderStatus", value), updating)}
                {select("Payment status", order.paymentStatus, paymentStatuses, (value) => void update(order._id, "paymentStatus", value), updating)}
                {updating && <span role="status" aria-live="polite" style={{ display: "inline-flex", alignItems: "center", gap: 9, minHeight: 42, padding: "8px 13px", border: "1px solid #C9D9B3", borderRadius: 11, color: "#31551F", background: "#EEF3E4", boxShadow: "0 3px 10px rgba(45,80,22,.08)", fontSize: ".84rem", fontWeight: 800 }}><RefreshCw size={16} aria-hidden="true" /><span>Saving {updatingField === "orderStatus" ? "order" : "payment"} status...</span></span>}
              </div>
            </div>
          </details>;
        })}
        {pageCount > 1 && <nav aria-label="Orders pages" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 10, padding: "14px 16px", border: "1px solid rgba(45,80,22,.11)", borderRadius: 13, background: "#FFFEFA" }}>
          <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} style={{ padding: "9px 14px", border: "1px solid rgba(45,80,22,.18)", borderRadius: 999, color: "#31551F", background: "#FFFEFA", fontWeight: 700, cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? .45 : 1 }}>Previous</button>
          <span aria-live="polite" style={{ minWidth: 86, color: "#526746", fontSize: ".84rem", fontWeight: 700, textAlign: "center" }}>Page {currentPage} of {pageCount}</span>
          <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} style={{ padding: "9px 14px", border: 0, borderRadius: 999, color: "#FFFEFA", background: "#31551F", fontWeight: 700, cursor: currentPage === pageCount ? "not-allowed" : "pointer", opacity: currentPage === pageCount ? .45 : 1 }}>Next</button>
        </nav>}
      </div>}
    </section>
  );
}
