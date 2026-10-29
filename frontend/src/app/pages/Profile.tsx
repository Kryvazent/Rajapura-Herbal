import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { CircleUserRound, ClipboardList, CreditCard, LogOut, Package, Leaf, MapPin, CalendarDays } from "lucide-react";
import axios from "axios";

const api = import.meta.env.VITE_BACKEND_URL;
type CustomerProfile = { firstName: string; lastName: string; email: string; phone?: string; createdAt?: string };
type Order = { _id: string; createdAt: string; country: string; contactNumber: string; address: string; additionalNote?: string; paymentSlipUrl?: string; orderStatus: string; paymentStatus: string; paymentMethod: string; products: { name: string; qty: number; price: number }[] };
type PageId = "profile" | "orders" | "payments";

const cardStyle: CSSProperties = { padding: 24, borderRadius: 16, background: "#FFFEFA", border: "1px solid rgba(45,80,22,.1)", boxShadow: "0 5px 20px rgba(31,48,17,.045)" };
const sideLinkStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", margin: "2px 0", borderRadius: 9, color: "#E9EEDF", textDecoration: "none", fontSize: ".88rem" };
const tableHeadStyle: CSSProperties = { padding: "11px 12px", color: "#8B5E3C", background: "rgba(45,80,22,.04)", borderBottom: "1px solid rgba(45,80,22,.12)", fontSize: ".72rem", letterSpacing: ".08em", textTransform: "uppercase" };
const tableCellStyle: CSSProperties = { padding: "13px 12px", borderBottom: "1px solid rgba(45,80,22,.08)" };

export default function Profile() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<PageId>("profile");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <main style={{ minHeight: 440, display: "grid", placeItems: "center", color: "#2D5016", background: "#F0EDE6" }}>Loading your profile...</main>;
  if (!profile) return <Navigate to="/account" replace />;

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const date = (value: string) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const pages: { id: PageId; label: string; icon: ReactNode }[] = [
    { id: "profile", label: "Profile details", icon: <CircleUserRound size={17} /> },
    { id: "orders", label: "Orders", icon: <ClipboardList size={17} /> },
    { id: "payments", label: "Payment history", icon: <CreditCard size={17} /> },
  ];
  const pageTitle = activePage === "profile" ? `Welcome, ${profile.firstName}` : activePage === "orders" ? "Your orders" : "Payment history";

  const navButton = (page: typeof pages[number], compact = false) => <button key={page.id} type="button" onClick={() => setActivePage(page.id)} aria-current={activePage === page.id ? "page" : undefined} className={`customer-profile-nav${activePage === page.id ? " active" : ""}`} style={{ ...sideLinkStyle, ...(compact ? { width: "auto", whiteSpace: "nowrap" as const, color: "#31591C", background: "rgba(139,195,74,.12)" } : { background: "transparent" }) }}>{page.icon}{page.label}</button>;

  return <div className="customer-profile-shell" style={{ display: "flex", overflow: "hidden", fontFamily: "'Lato',sans-serif", background: "#F0EDE6", color: "#2D5016" }}>
    <style>{`.customer-profile-shell{height:calc(100vh - 105px);height:calc(100dvh - 105px)}.customer-profile-content{min-height:0;overflow-y:auto;overscroll-behavior:contain}.customer-profile-nav{border:0;cursor:pointer;text-align:left}.customer-profile-nav:hover{background:rgba(139,195,74,.11)!important}.customer-profile-nav.active{color:#F8F4E8!important;background:rgba(139,195,74,.19)!important;box-shadow:inset 3px 0 #8BC34A}@media(max-width:639px){.customer-profile-shell{height:calc(100vh - 72px);height:calc(100dvh - 72px)}}`}</style>
    <aside className="hidden lg:flex" style={{ width: 248, flexShrink: 0, flexDirection: "column", padding: "26px 16px", background: "linear-gradient(180deg, #0E1A08 0%, #1A3009 100%)", color: "#FAF6EE" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 10px 25px", color: "inherit", textDecoration: "none", borderBottom: "1px solid rgba(139,195,74,.17)" }}>
        <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", color: "#8BC34A", border: "1px solid rgba(139,195,74,.35)", background: "rgba(139,195,74,.1)" }}><Leaf size={19} /></span>
        <span><strong style={{ display: "block", fontFamily: "'Cinzel',serif", letterSpacing: ".08em", fontSize: ".85rem" }}>RAJAPURA</strong><small style={{ color: "#B9C4A9", letterSpacing: ".14em", fontSize: ".58rem" }}>CUSTOMER PORTAL</small></span>
      </Link>
      <p style={{ margin: "26px 10px 10px", color: "#AFC292", fontSize: ".66rem", fontWeight: 700, letterSpacing: ".14em" }}>YOUR ACCOUNT</p>
      {pages.map(page => navButton(page))}
      <div style={{ flex: 1 }} />
      <button onClick={signOut} style={{ ...sideLinkStyle, width: "100%", border: 0, background: "transparent", color: "#E6D7C7", cursor: "pointer", textAlign: "left" }}><LogOut size={17} /> Sign out</button>
    </aside>

    <main className="customer-profile-content" style={{ flex: 1, minWidth: 0 }}>
      <nav className="flex lg:hidden" aria-label="Profile sections" style={{ position: "sticky", top: 0, zIndex: 2, gap: 8, overflowX: "auto", padding: "10px 14px", background: "#FFFEFA", borderBottom: "1px solid rgba(45,80,22,.1)" }}>
        {pages.map(page => navButton(page, true))}
      </nav>
      <div style={{ width: "min(100%, 1120px)", margin: "0 auto", padding: "clamp(22px, 4vw, 42px)" }}>
        <div style={{ marginBottom: 25 }}><p style={{ margin: "0 0 5px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em" }}>CUSTOMER ACCOUNT</p><h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", color: "#244516", fontSize: "clamp(1.8rem, 4vw, 2.35rem)", fontWeight: 500 }}>{pageTitle}</h1></div>
        {error && <p role="alert" style={{ padding: 13, borderRadius: 10, color: "#9D3029", background: "#FBEDEA" }}>{error}</p>}

        {activePage === "profile" && <section style={cardStyle}>
          <SectionHeading icon={<CircleUserRound size={18} />} title="Profile details" subtitle="Your customer account information" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 15 }}>
            <Info label="Full name" value={fullName} /><Info label="Email address" value={profile.email} /><Info label="Contact number" value={profile.phone || "Not provided"} />
            {profile.createdAt && <Info label="Member since" value={date(profile.createdAt)} />}
          </div>
        </section>}

        {activePage === "orders" && <section style={cardStyle}>
          <SectionHeading icon={<Package size={18} />} title="Order details" subtitle="Products, delivery information, and order progress" />
          {orders.length === 0 ? <EmptyMessage text="Your orders will appear here when you place one." /> : <div style={{ display: "grid", gap: 15 }}>
            {orders.map(order => <article key={order._id} style={{ padding: 18, borderRadius: 13, background: "#FAF8F2", border: "1px solid rgba(45,80,22,.09)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 13, borderBottom: "1px solid rgba(45,80,22,.12)" }}><strong>Order #{order._id.slice(-7).toUpperCase()}</strong><span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#71695E", fontSize: ".84rem" }}><CalendarDays size={14} /> {date(order.createdAt)}</span></div>
              <div style={{ display: "grid", gap: 8, padding: "15px 0" }}>{order.products.map((item, index) => <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, fontSize: ".9rem" }}><span>{item.name} <span style={{ color: "#71695E" }}>x {item.qty} · {item.price.toFixed(2)} each</span></span><strong>{(item.price * item.qty).toFixed(2)}</strong></div>)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, paddingTop: 13, borderTop: "1px solid rgba(45,80,22,.12)" }}>
                <div><MetaLabel>Order status</MetaLabel><Status value={order.orderStatus} /></div><div><MetaLabel>Delivery country</MetaLabel><span>{order.country}</span></div><div><MetaLabel>Contact number</MetaLabel><span>{order.contactNumber}</span></div>
                <div style={{ gridColumn: "1 / -1" }}><MetaLabel>Delivery address</MetaLabel><span style={{ display: "inline-flex", gap: 6, alignItems: "flex-start" }}><MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />{order.address}</span></div>
                {order.additionalNote && <div style={{ gridColumn: "1 / -1" }}><MetaLabel>Additional note</MetaLabel><span>{order.additionalNote}</span></div>}
                {order.paymentSlipUrl && <div><MetaLabel>Payment slip</MetaLabel><a href={order.paymentSlipUrl} target="_blank" rel="noreferrer" style={{ color: "#2D5016", fontWeight: 700 }}>View uploaded slip</a></div>}
              </div>
            </article>)}
          </div>}
        </section>}

        {activePage === "payments" && <section style={cardStyle}>
          <SectionHeading icon={<CreditCard size={18} />} title="Payment history" subtitle="Payment amount, status, and method for each order" />
          {orders.length === 0 ? <EmptyMessage text="Payment details will appear here with your orders." /> : <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: ".88rem" }}>
              <thead><tr>{["Order", "Date", "Amount", "Payment method", "Payment status"].map(item => <th key={item} style={tableHeadStyle}>{item}</th>)}</tr></thead>
              <tbody>{orders.map(order => <tr key={order._id}><td style={tableCellStyle}>#{order._id.slice(-7).toUpperCase()}</td><td style={tableCellStyle}>{date(order.createdAt)}</td><td style={tableCellStyle}>{order.products.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)}</td><td style={tableCellStyle}>{order.paymentMethod || "Not selected"}</td><td style={tableCellStyle}><Status value={order.paymentStatus} /></td></tr>)}</tbody>
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
