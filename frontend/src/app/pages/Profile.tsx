import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { CircleUserRound, ClipboardList, CreditCard, LogOut, Package, Leaf, MapPin, CalendarDays, ChevronDown, Search, X } from "lucide-react";
import axios from "axios";
import { useLanguage } from "../i18n/LanguageContext";

const api = import.meta.env.VITE_BACKEND_URL;
type CustomerProfile = { firstName: string; lastName: string; email: string; phone?: string; createdAt?: string };
type Order = { _id: string; createdAt: string; country: string; currency?: "USD" | "LKR"; customer: { name: string; contactNumber: string }; address: string; additionalNote?: string; paymentSlipUrl?: string; orderStatus: string; paymentStatus: string; paymentMethod: string; products: { name: string; qty: number; price: number; product?: { name?: string; sinhalaName?: string; price?: string; priceUSD?: string; priceLKR?: string; translations?: { name?: { en?: string; si?: string } } } | null }[] };
type PageId = "profile" | "orders" | "payments";
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
const statusTranslations: Record<string, string> = { Pending: "අපේක්ෂිත", Processing: "සැකසෙමින්", Shipped: "යවා ඇත", Delivered: "බෙදා හැර ඇත", Cancelled: "අවලංගු කළා", Returned: "ආපසු ලබා දුන්නා", Unpaid: "නොගෙවූ", Paid: "ගෙවා ඇත", Refunded: "ආපසු ගෙවූ" };

const cardStyle: CSSProperties = { padding: 24, borderRadius: 16, background: "#FFFEFA", border: "1px solid rgba(45,80,22,.1)", boxShadow: "0 5px 20px rgba(31,48,17,.045)" };
const sideLinkStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", margin: "2px 0", borderRadius: 9, color: "#E9EEDF", textDecoration: "none", fontSize: ".88rem" };
const tableHeadStyle: CSSProperties = { padding: "11px 12px", color: "#8B5E3C", background: "rgba(45,80,22,.04)", borderBottom: "1px solid rgba(45,80,22,.12)", fontSize: ".72rem", letterSpacing: ".08em", textTransform: "uppercase" };
const tableCellStyle: CSSProperties = { padding: "13px 12px", borderBottom: "1px solid rgba(45,80,22,.08)" };

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const si = language === "si";
  const [activePage, setActivePage] = useState<PageId>(() => location.state?.section === "orders" ? "orders" : "profile");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All orders");

  const orderStatusCounts = useMemo(() => orders.reduce<Record<string, number>>((counts, order) => {
    counts[order.orderStatus] = (counts[order.orderStatus] ?? 0) + 1;
    return counts;
  }, {}), [orders]);
  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLocaleLowerCase(si ? "si-LK" : undefined);
    return orders.filter((order) => {
      if (orderStatusFilter !== "All orders" && order.orderStatus !== orderStatusFilter) return false;
      const createdAt = new Date(order.createdAt);
      if (orderDate && (Number.isNaN(createdAt.getTime()) || [
        createdAt.getFullYear(),
        String(createdAt.getMonth() + 1).padStart(2, "0"),
        String(createdAt.getDate()).padStart(2, "0"),
      ].join("-") !== orderDate)) return false;
      if (!query) return true;
      const dateSearchTerms = Number.isNaN(createdAt.getTime()) ? [] : [
        createdAt.toISOString().slice(0, 10),
        createdAt.toLocaleDateString(),
        createdAt.toLocaleDateString(si ? "si-LK" : undefined, { year: "numeric", month: "short", day: "numeric" }),
        createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        createdAt.toLocaleDateString("en-GB"),
      ];
      const searchable = [
        order._id,
        order._id.slice(-7),
        order.orderStatus,
        si ? statusTranslations[order.orderStatus] : "",
        ...dateSearchTerms,
      ].filter(Boolean).join(" ").toLocaleLowerCase(si ? "si-LK" : undefined);
      return searchable.includes(query);
    });
  }, [orders, orderDate, orderSearch, orderStatusFilter, si]);

  useEffect(() => {
    Promise.all([
      axios.get(`${api}/auth/customer/me`, { withCredentials: true }),
      axios.get(`${api}/user/orders`, { withCredentials: true }),
    ]).then(([profileResponse, ordersResponse]) => {
      setProfile(profileResponse.data.data);
      setOrders(ordersResponse.data.data ?? []);
    }).catch((requestError) => {
      if (requestError.response?.status !== 401) setError("We couldn't load your profile right now. Please refresh to try again.");
    }).finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await axios.post(`${api}/auth/customer/logout`, {}, { withCredentials: true }).catch(() => undefined);
    window.dispatchEvent(new Event("rajapura:auth-updated"));
    navigate("/account", { replace: true });
  };

  if (loading) return <main style={{ minHeight: 440, display: "grid", placeItems: "center", color: "#2D5016", background: "#F0EDE6" }}>{language === "si" ? "ඔබගේ පැතිකඩ පූරණය වෙමින් පවතී..." : "Loading your profile..."}</main>;
  if (!profile) return <Navigate to="/account" replace />;

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const date = (value: string) => new Date(value).toLocaleDateString(si ? "si-LK" : undefined, { year: "numeric", month: "short", day: "numeric" });
  const productName = (item: Order["products"][number]) => si
    ? item.product?.translations?.name?.si?.trim() || item.product?.sinhalaName?.trim() || item.name
    : item.product?.translations?.name?.en?.trim() || item.product?.name?.trim() || item.name;
  const translateStatus = (value: string) => {
    return si ? statusTranslations[value] ?? value : value;
  };
  const translatePaymentMethod = (value: string) => {
    const translations: Record<string, string> = { "Payment slip": "ගෙවීම් රිසිට්පත", "Online payment": "මාර්ගගත ගෙවීම", "Not selected": "තෝරා නැත" };
    return si ? translations[value] ?? value : value;
  };
  const displayCountry = (country: string) => si && /^(LK|Sri Lanka)$/i.test(country) ? "ශ්‍රී ලංකාව" : country;
  const parseStoredPrice = (value?: string) => {
    if (!value?.trim()) return null;
    const amount = Number(value.replace(/^(USD|LKR)\s*/i, "").replace(/,/g, "").trim());
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  };
  const orderCurrency = (order: Order): "USD" | "LKR" => {
    const recoverableLegacyUSDOrder = order.products.length > 0 && order.products.every((item) => item.price <= 0 && !parseStoredPrice(item.product?.priceLKR) && parseStoredPrice(item.product?.priceUSD));
    if (recoverableLegacyUSDOrder) return "USD";
    if (order.currency) return order.currency;
    return /^(LK|Sri Lanka)$/i.test(order.country) ? "LKR" : "USD";
  };
  const formatOrderAmount = (amount: number, order: Order) => new Intl.NumberFormat("en-US", { style: "currency", currency: orderCurrency(order), currencyDisplay: "code" }).format(amount);
  const contactPriceLabel = si ? "මිල සඳහා විමසන්න" : "Contact for price";
  const orderProductPrice = (item: Order["products"][number], order: Order) => {
    if (item.price > 0) return { amount: item.price, currency: orderCurrency(order) };
    const currency = orderCurrency(order);
    const productPrice = currency === "LKR" ? item.product?.priceLKR : item.product?.priceUSD;
    const legacyPrice = item.product?.price?.startsWith(`${currency} `) ? item.product.price : undefined;
    const amount = parseStoredPrice(productPrice || legacyPrice);
    return amount === null ? null : { amount, currency };
  };
  const formatOrderProductPrice = (item: Order["products"][number], order: Order, quantity = 1) => {
    const price = orderProductPrice(item, order);
    return price ? formatOrderAmount(price.amount * quantity, { ...order, currency: price.currency }) : contactPriceLabel;
  };
  const formatOrderTotal = (order: Order) => {
    const prices = order.products.map((item) => orderProductPrice(item, order));
    return prices.some((price) => price === null)
      ? contactPriceLabel
      : formatOrderAmount(order.products.reduce((total, item, index) => total + (prices[index]?.amount ?? 0) * item.qty, 0), order);
  };
  const pages: { id: PageId; label: string; icon: ReactNode }[] = [
    { id: "profile", label: si ? "පැතිකඩ විස්තර" : "Profile details", icon: <CircleUserRound size={17} /> },
    { id: "orders", label: si ? "ඇණවුම්" : "Orders", icon: <ClipboardList size={17} /> },
    { id: "payments", label: si ? "ගෙවීම් ඉතිහාසය" : "Payment history", icon: <CreditCard size={17} /> },
  ];
  const pageTitle = activePage === "profile" ? (si ? `ආයුබෝවන්, ${profile.firstName}` : `Welcome, ${profile.firstName}`) : activePage === "orders" ? (si ? "ඔබගේ ඇණවුම්" : "Your orders") : (si ? "ගෙවීම් ඉතිහාසය" : "Payment history");
  const clearOrderFilters = () => {
    setOrderSearch("");
    setOrderDate("");
    setOrderStatusFilter("All orders");
  };

  const navButton = (page: typeof pages[number], compact = false) => <button key={page.id} type="button" onClick={() => setActivePage(page.id)} aria-current={activePage === page.id ? "page" : undefined} className={`customer-profile-nav${activePage === page.id ? " active" : ""}`} style={{ ...sideLinkStyle, ...(compact ? { width: "auto", whiteSpace: "nowrap" as const, color: "#31591C", background: "rgba(139,195,74,.12)" } : { background: "transparent" }) }}>{page.icon}{page.label}</button>;

  return <div className="customer-profile-shell" style={{ display: "flex", overflow: "hidden", fontFamily: "'Lato',sans-serif", background: "#F0EDE6", color: "#2D5016" }}>
    <style>{`.customer-profile-shell{height:calc(100vh - 105px);height:calc(100dvh - 105px)}.customer-profile-content{min-height:0;overflow-y:auto;overscroll-behavior:contain}.customer-profile-nav{border:0;cursor:pointer;text-align:left}.customer-profile-nav:hover{background:rgba(139,195,74,.11)!important}.customer-profile-nav.active{color:#F8F4E8!important;background:rgba(139,195,74,.19)!important;box-shadow:inset 3px 0 #8BC34A}@media(max-width:639px){.customer-profile-shell{height:calc(100vh - 72px);height:calc(100dvh - 72px)}.customer-profile-nav.active{color:#244516!important;background:#EAF0DA!important;box-shadow:inset 0 -3px #8BC34A}}`}</style>
    <aside className="hidden lg:flex" style={{ width: 248, flexShrink: 0, flexDirection: "column", padding: "26px 16px", background: "linear-gradient(180deg, #0E1A08 0%, #1A3009 100%)", color: "#FAF6EE" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 10px 25px", color: "inherit", textDecoration: "none", borderBottom: "1px solid rgba(139,195,74,.17)" }}>
        <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", color: "#8BC34A", border: "1px solid rgba(139,195,74,.35)", background: "rgba(139,195,74,.1)" }}><Leaf size={19} /></span>
        <span><strong style={{ display: "block", fontFamily: "'Cinzel',serif", letterSpacing: ".08em", fontSize: ".85rem" }}>RAJAPURA</strong><small style={{ color: "#B9C4A9", letterSpacing: ".14em", fontSize: ".58rem" }}>{si ? "පාරිභෝගික ද්වාරය" : "CUSTOMER PORTAL"}</small></span>
      </Link>
        <p style={{ margin: "26px 10px 10px", color: "#AFC292", fontSize: ".66rem", fontWeight: 700, letterSpacing: ".14em" }}>{si ? "ඔබගේ ගිණුම" : "YOUR ACCOUNT"}</p>
      {pages.map(page => navButton(page))}
      <div style={{ flex: 1 }} />
      <button onClick={signOut} style={{ ...sideLinkStyle, width: "100%", border: 0, background: "transparent", color: "#E6D7C7", cursor: "pointer", textAlign: "left" }}><LogOut size={17} /> {si ? "පිටවන්න" : "Sign out"}</button>
    </aside>

    <main className="customer-profile-content" style={{ flex: 1, minWidth: 0 }}>
      <nav className="flex lg:hidden" aria-label="Profile sections" style={{ position: "sticky", top: 0, zIndex: 2, gap: 8, overflowX: "auto", padding: "10px 14px", background: "#FFFEFA", borderBottom: "1px solid rgba(45,80,22,.1)" }}>
        {pages.map(page => navButton(page, true))}
      </nav>
      <div style={{ width: "min(100%, 1120px)", margin: "0 auto", padding: "clamp(22px, 4vw, 42px)" }}>
        <div style={{ marginBottom: 25 }}><p style={{ margin: "0 0 5px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em" }}>{si ? "පාරිභෝගික ගිණුම" : "CUSTOMER ACCOUNT"}</p><h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", color: "#244516", fontSize: "clamp(1.8rem, 4vw, 2.35rem)", fontWeight: 500 }}>{pageTitle}</h1></div>
        {error && <p role="alert" style={{ padding: 13, borderRadius: 10, color: "#9D3029", background: "#FBEDEA" }}>{si ? "ඔබගේ පැතිකඩ පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න." : error}</p>}

        {activePage === "profile" && <section style={cardStyle}>
          <SectionHeading icon={<CircleUserRound size={18} />} title={si ? "පැතිකඩ විස්තර" : "Profile details"} subtitle={si ? "ඔබගේ පාරිභෝගික ගිණුම් තොරතුරු" : "Your customer account information"} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 15 }}>
            <Info label={si ? "සම්පූර්ණ නම" : "Full name"} value={fullName} /><Info label={si ? "විද්‍යුත් තැපැල් ලිපිනය" : "Email address"} value={profile.email} /><Info label={si ? "දුරකථන අංකය" : "Contact number"} value={profile.phone || (si ? "සපයා නැත" : "Not provided")} />
            {profile.createdAt && <Info label={si ? "සාමාජිකත්වය ආරම්භ කළ දිනය" : "Member since"} value={date(profile.createdAt)} />}
          </div>
        </section>}

        {activePage === "orders" && <section style={cardStyle}>
          <SectionHeading icon={<Package size={18} />} title={si ? "ඇණවුම් විස්තර" : "Order details"} subtitle={si ? "භාණ්ඩ, බෙදාහැරීමේ තොරතුරු සහ ඇණවුම් තත්ත්වය" : "Products, delivery information, and order progress"} />
          {orders.length === 0 ? <EmptyMessage text={si ? "ඔබ ඇණවුමක් කළ විට එය මෙහි පෙන්වනු ඇත." : "Your orders will appear here when you place one."} /> : <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "11px 14px", border: "1px solid rgba(45,80,22,.14)", borderRadius: 12, background: "#FAF8F2" }}>
              <Search size={17} aria-hidden="true" style={{ flexShrink: 0, color: "#71695E" }} />
              <input
                type="search"
                aria-label={si ? "ඇණවුම් අංකය, දිනය හෝ තත්ත්වය අනුව සොයන්න" : "Search orders by order ID, date, or status"}
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder={si ? "ඇණවුම් අංකය, දිනය හෝ තත්ත්වය සොයන්න" : "Search by order ID, date, or status"}
                style={{ width: "100%", minWidth: 0, padding: "5px 0", border: 0, outline: 0, color: "#2D5016", background: "transparent", font: "inherit" }}
              />
              {orderSearch && <button type="button" aria-label={si ? "සෙවුම හිස් කරන්න" : "Clear search"} onClick={() => setOrderSearch("")} style={{ display: "grid", placeItems: "center", padding: 5, border: 0, borderRadius: 7, color: "#526746", background: "#EEF1E7", cursor: "pointer" }}><X size={15} /></button>}
            </div>
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 15 }}>
              <label style={{ display: "grid", gap: 5, color: "#71695E", fontSize: ".76rem", fontWeight: 700 }}>
                {si ? "දිනය අනුව පෙරහන් කරන්න" : "Filter by date"}
                <input type="date" aria-label={si ? "ඇණවුම් දිනය අනුව පෙරහන් කරන්න" : "Filter orders by date"} value={orderDate} onChange={(event) => setOrderDate(event.target.value)} style={{ padding: "9px 10px", border: "1px solid rgba(45,80,22,.16)", borderRadius: 9, color: "#2D5016", background: "#FFFEFA", font: "inherit" }} />
              </label>
              {(orderSearch || orderDate || orderStatusFilter !== "All orders") && <button type="button" onClick={clearOrderFilters} style={{ padding: "8px 11px", border: "1px solid rgba(45,80,22,.15)", borderRadius: 9, color: "#526746", background: "#FFFEFA", font: "inherit", fontSize: ".8rem", cursor: "pointer" }}>{si ? "පෙරහන් හිස් කරන්න" : "Clear filters"}</button>}
            </div>
            <div role="group" aria-label={si ? "ඇණවුම් තත්ත්වය අනුව පෙරහන් කරන්න" : "Filter orders by status"} style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 1px 12px", marginBottom: 5 }}>
              {["All orders", ...orderStatuses].map((status) => {
                const active = orderStatusFilter === status;
                const count = status === "All orders" ? orders.length : orderStatusCounts[status] ?? 0;
                const label = status === "All orders" ? (si ? "සියලුම ඇණවුම්" : status) : translateStatus(status);
                return <button key={status} type="button" aria-pressed={active} onClick={() => setOrderStatusFilter(status)} style={{ display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0, padding: "8px 10px", border: `1px solid ${active ? "#31551F" : "rgba(45,80,22,.14)"}`, borderRadius: 999, color: active ? "#FFFEFA" : "#526746", background: active ? "#31551F" : "#FFFEFA", fontSize: ".78rem", fontWeight: 700, cursor: "pointer" }}>
                  {label}<span style={{ minWidth: 18, padding: "1px 4px", borderRadius: 999, color: active ? "#244516" : "#526746", background: active ? "#E3EBD5" : "#EEF1E7", fontSize: ".68rem", textAlign: "center" }}>{count}</span>
                </button>;
              })}
            </div>
            {filteredOrders.length === 0 ? <EmptyMessage text={si ? "සෙවුමට ගැළපෙන ඇණවුම් හමු නොවීය." : "No orders match your search or filters."} /> : <div style={{ display: "grid", gap: 15 }}>
            {filteredOrders.map(order => <details key={order._id} style={{ overflow: "hidden", borderRadius: 13, background: "#FAF8F2", border: "1px solid rgba(45,80,22,.12)" }}>
              <summary style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "18px", color: "#244516", cursor: "pointer", listStyle: "none" }}>
                <strong>{si ? "ඇණවුම" : "Order"} #{order._id.slice(-7).toUpperCase()}</strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#71695E", fontSize: ".84rem" }}><CalendarDays size={14} /> {date(order.createdAt)}<ChevronDown size={16} aria-hidden="true" />
                </span>
              </summary>
              <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(45,80,22,.12)" }}>
                <div style={{ display: "grid", gap: 8, padding: "15px 0" }}>{order.products.map((item, index) => <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, fontSize: ".9rem" }}><span>{productName(item)} <span style={{ color: "#71695E" }}>× {item.qty} · {formatOrderProductPrice(item, order)}{(item.price > 0 || orderProductPrice(item, order)) && (si ? " බැගින්" : " each")}</span></span><strong>{formatOrderProductPrice(item, order, item.qty)}</strong></div>)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, paddingTop: 13, borderTop: "1px solid rgba(45,80,22,.12)" }}>
                  <div><MetaLabel>{si ? "ඇණවුම් තත්ත්වය" : "Order status"}</MetaLabel><Status value={translateStatus(order.orderStatus)} /></div><div><MetaLabel>{si ? "බෙදාහැරීමේ රට" : "Delivery country"}</MetaLabel><span>{displayCountry(order.country)}</span></div><div><MetaLabel>{si ? "දුරකථන අංකය" : "Contact number"}</MetaLabel><span>{order.customer.contactNumber}</span></div>
                  <div style={{ gridColumn: "1 / -1" }}><MetaLabel>{si ? "බෙදාහැරීමේ ලිපිනය" : "Delivery address"}</MetaLabel><span style={{ display: "inline-flex", gap: 6, alignItems: "flex-start" }}><MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />{order.address}</span></div>
                  {order.additionalNote && <div style={{ gridColumn: "1 / -1" }}><MetaLabel>{si ? "අමතර සටහන" : "Additional note"}</MetaLabel><span>{order.additionalNote}</span></div>}
                  {order.paymentSlipUrl && <div><MetaLabel>{si ? "ගෙවීම් රිසිට්පත" : "Payment slip"}</MetaLabel><a href={order.paymentSlipUrl} target="_blank" rel="noreferrer" style={{ color: "#2D5016", fontWeight: 700 }}>{si ? "උඩුගත කළ රිසිට්පත බලන්න" : "View uploaded slip"}</a></div>}
                </div>
              </div>
            </details>)}
          </div>}
          </>}
        </section>}

        {activePage === "payments" && <section style={cardStyle}>
          <SectionHeading icon={<CreditCard size={18} />} title={si ? "ගෙවීම් ඉතිහාසය" : "Payment history"} subtitle={si ? "එක් එක් ඇණවුමේ මුදල, තත්ත්වය සහ ගෙවීමේ ක්‍රමය" : "Payment amount, status, and method for each order"} />
          {orders.length === 0 ? <EmptyMessage text={si ? "ඔබගේ ඇණවුම් සමඟ ගෙවීම් තොරතුරු මෙහි පෙන්වනු ඇත." : "Payment details will appear here with your orders."} /> : <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: ".88rem" }}>
              <thead><tr>{(si ? ["ඇණවුම", "දිනය", "මුදල", "ගෙවීමේ ක්‍රමය", "ගෙවීමේ තත්ත්වය"] : ["Order", "Date", "Amount", "Payment method", "Payment status"]).map(item => <th key={item} style={tableHeadStyle}>{item}</th>)}</tr></thead>
              <tbody>{orders.map(order => <tr key={order._id}><td style={tableCellStyle}>#{order._id.slice(-7).toUpperCase()}</td><td style={tableCellStyle}>{date(order.createdAt)}</td><td style={tableCellStyle}>{formatOrderTotal(order)}</td><td style={tableCellStyle}>{translatePaymentMethod(order.paymentMethod || "Not selected")}</td><td style={tableCellStyle}><Status value={translateStatus(order.paymentStatus)} /></td></tr>)}</tbody>
            </table>
          </div>}
        </section>}
      </div>
    </main>
  </div>;
}

function SectionHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 11, color: "#4A7C23", background: "rgba(139,195,74,.14)" }}>{icon}</span><div><h2 style={{ margin: 0, color: "#244516", fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: "1.25rem" }}>{title}</h2><p style={{ margin: "3px 0 0", color: "#71695E", fontSize: ".82rem" }}>{subtitle}</p></div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div style={{ padding: "13px 15px", borderRadius: 10, background: "rgba(45,80,22,.04)" }}><MetaLabel>{label}</MetaLabel><strong style={{ overflowWrap: "anywhere", fontSize: ".92rem" }}>{value}</strong></div>;
}

function MetaLabel({ children }: { children: ReactNode }) {
  return <span style={{ display: "block", marginBottom: 5, color: "#8B5E3C", fontSize: ".67rem", letterSpacing: ".1em", fontWeight: 700, textTransform: "uppercase" }}>{children}</span>;
}

function Status({ value }: { value: string }) {
  const good = ["paid", "delivered", "processing", "shipped"].includes(value.toLowerCase());
  return <span style={{ display: "inline-flex", padding: "4px 9px", borderRadius: 30, color: good ? "#31591C" : "#765033", background: good ? "rgba(139,195,74,.18)" : "rgba(139,94,60,.1)", fontWeight: 700, fontSize: ".77rem" }}>{value}</span>;
}

function EmptyMessage({ text }: { text: string }) {
  return <div style={{ padding: "25px 16px", textAlign: "center", color: "#71695E", borderRadius: 12, background: "rgba(45,80,22,.035)" }}>{text}</div>;
}
