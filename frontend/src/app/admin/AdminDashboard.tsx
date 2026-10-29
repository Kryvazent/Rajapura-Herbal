import { API_BASE_URL } from "../lib/api";
import { Link } from "react-router";
import { Package, Store, MapPin, ChevronRight, TrendingUp, Leaf, ClipboardList, Clock3, Truck, BadgeCheck, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../interfaces/productInterface";
import axios from "axios";
import { adminPath } from "./adminPaths";
import { useLanguage } from "../i18n/LanguageContext";

type DashboardOrder = { orderStatus?: string; paymentStatus?: string };

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);

  useEffect(() => {
    loadProducts();
    loadProvinces();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        API_BASE_URL + "/user/products-all"
      );
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const loadProvinces = async () => {
    try {
      const res = await axios.get(
        API_BASE_URL + "/user/shops"
      );
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProvinces(data);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setProvinces([]);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(API_BASE_URL + "/admin/orders", { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setOrders(Array.isArray(data) ? data : []);
      setOrdersError(false);
    } catch (err) {
      console.error("Error fetching order summary:", err);
      setOrders([]);
      setOrdersError(true);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalDistricts = provinces.reduce(
    (acc, p) => acc + (p.districts?.length ?? 0),
    0
  );

  const totalTowns = provinces.reduce(
    (acc, p) =>
      acc +
      (p.districts ?? []).reduce(
        (da: number, d: any) => da + (d.towns?.length ?? 0),
        0
      ),
    0
  );

  const totalShops = provinces.reduce(
    (acc, p) =>
      acc +
      (p.districts ?? []).reduce(
        (da: number, d: any) =>
          da +
          (d.towns ?? []).reduce(
            (ta: number, t: any) => ta + (t.shops?.length ?? 0),
            0
          ),
        0
      ),
    0
  );

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const getProductPriceLabel = (price?: string) =>
    price?.trim() ? price : t("contactPrice");

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      sub: `${categories.length} categories`,
      icon: Package,
      color: "#2D5016",
      bg: "rgba(45,80,22,0.08)",
      link: adminPath("products"),
    },
    {
      label: "Provinces",
      value: provinces.length,
      sub: "All Sri Lanka",
      icon: MapPin,
      color: "#4A7C23",
      bg: "rgba(74,124,35,0.08)",
      link: adminPath("stores"),
    },
    {
      label: "Districts",
      value: totalDistricts,
      sub: "Across all provinces",
      icon: TrendingUp,
      color: "#8B5E3C",
      bg: "rgba(139,94,60,0.08)",
      link: adminPath("stores"),
    },
    {
      label: "Authorized Stores",
      value: totalShops,
      sub: "Nationwide",
      icon: Store,
      color: "#D4A017",
      bg: "rgba(212,160,23,0.1)",
      link: adminPath("stores"),
    },
  ];

  const orderSummary = [
    { label: "Total orders", value: orders.length, icon: ClipboardList, color: "#31551F", bg: "#EAF0DA" },
    { label: "Pending", value: orders.filter((order) => order.orderStatus === "Pending").length, icon: Clock3, color: "#8B5E3C", bg: "#F6EFDF" },
    { label: "Processing", value: orders.filter((order) => order.orderStatus === "Processing").length, icon: Package, color: "#4A7C23", bg: "rgba(74,124,35,.1)" },
    { label: "Shipped", value: orders.filter((order) => order.orderStatus === "Shipped").length, icon: Truck, color: "#8B6C18", bg: "rgba(212,160,23,.12)" },
    { label: "Delivered", value: orders.filter((order) => order.orderStatus === "Delivered").length, icon: BadgeCheck, color: "#2E6B42", bg: "#E6F1E5" },
    { label: "Payments paid", value: orders.filter((order) => order.paymentStatus === "Paid").length, icon: CreditCard, color: "#38647A", bg: "#E7F0F3" },
  ];

  return (
    <div>

      <div
        style={{
          background: "linear-gradient(135deg, #2D5016, #4A7C23)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
        <div>
          <p
            style={{
              color: "rgba(168,197,128,0.8)",
              fontSize: "0.82rem",
              margin: "0 0 4px",
              letterSpacing: "0.1em",
            }}
          >
            WELCOME BACK
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              margin: 0,
              fontSize: "1.5rem",
            }}
          >
            Administrator Dashboard
          </h2>
          <p style={{ color: "#A8C580", fontSize: "0.85rem", margin: "6px 0 0" }}>
            Manage your products and authorized stores from here.
          </p>
        </div>
        <Leaf size={48} style={{ color: "rgba(139,195,74,0.3)" }} />
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, link }) => (
          <Link
            key={label}
            to={link}
            style={{
              backgroundColor: "#FAF6EE",
              border: "1px solid rgba(45,80,22,0.1)",
              borderRadius: "16px",
              padding: "22px 20px",
              textDecoration: "none",
              display: "block",
              boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            className="hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <ChevronRight size={16} style={{ color: "#C8D8B0" }} />
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                fontSize: "2rem",
                margin: "12px 0 2px",
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p style={{ color: "#3B2314", fontSize: "0.85rem", margin: "0 0 2px" }}>
              {label}
            </p>
            <p style={{ color: "#A8C580", fontSize: "0.75rem", margin: 0 }}>
              {sub}
            </p>
          </Link>
        ))}
      </div>

      <section style={{ marginBottom: 28, padding: "20px 22px", border: "1px solid rgba(45,80,22,.1)", borderRadius: 20, background: "#FAF6EE", boxShadow: "0 2px 10px rgba(45,80,22,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "#9A7048", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Sales overview</p>
            <h3 style={{ margin: 0, color: "#244516", fontFamily: "'Playfair Display',serif", fontSize: "1.25rem" }}>Order summary</h3>
          </div>
          <Link to={adminPath("orders")} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#4A7C23", fontSize: ".82rem", fontWeight: 700, textDecoration: "none" }}>View all orders <ChevronRight size={15} /></Link>
        </div>
        {ordersError ? <p role="status" style={{ margin: 0, padding: "12px 14px", border: "1px solid #E8C4BE", borderRadius: 11, color: "#8B2E25", background: "#FFF0ED", fontSize: ".85rem" }}>Order summary could not be loaded. You can still review orders from the Orders page.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {orderSummary.map(({ label, value, icon: Icon, color, bg }) => <Link key={label} to={adminPath("orders")} style={{ minWidth: 0, padding: "14px 13px", border: "1px solid rgba(45,80,22,.09)", borderRadius: 13, background: "#FFFEFA", textDecoration: "none", transition: "transform .18s, box-shadow .18s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 10, color, background: bg }}><Icon size={17} /></span>
              {ordersLoading && <span aria-label="Loading" style={{ width: 12, height: 12, border: "2px solid rgba(45,80,22,.16)", borderTopColor: "#31551F", borderRadius: "50%", animation: "dashboard-order-spin .8s linear infinite" }} />}
            </div>
            <strong style={{ display: "block", marginTop: 10, color: "#244516", fontFamily: "'Playfair Display',serif", fontSize: "1.65rem", lineHeight: 1 }}>{ordersLoading ? "-" : value}</strong>
            <span style={{ display: "block", marginTop: 6, color: "#65715B", fontSize: ".76rem", lineHeight: 1.3 }}>{label}</span>
          </Link>)}
        </div>}
        <style>{"@keyframes dashboard-order-spin{to{transform:rotate(360deg)}}"}</style>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
  
        <div
          style={{
            backgroundColor: "#FAF6EE",
            border: "1px solid rgba(45,80,22,0.1)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(45,80,22,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                margin: 0,
                fontSize: "1rem",
              }}
            >
              Products
            </h3>
            <Link
              to={adminPath("products")}
              style={{
                color: "#4A7C23",
                fontSize: "0.8rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Manage All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ padding: "8px 12px" }}>
            {products.length === 0 ? (
              <p
                style={{
                  color: "#A8C580",
                  fontSize: "0.83rem",
                  textAlign: "center",
                  padding: "20px",
                  margin: 0,
                }}
              >
                No products yet.
              </p>
            ) : (
              products.slice(0, 5).map((p) => (
                <div
                  key={p._id.toString()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 10px",
                    borderRadius: "10px",
                    marginBottom: "2px",
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: "#2D5016",
                        margin: 0,
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.75rem" }}>
                      {p.category}
                    </p>
                  </div>
                  <span
                    style={{
                      color: "#2D5016",
                      fontSize: "0.85rem",
                      fontFamily: "'Playfair Display', serif",
                      flexShrink: 0,
                    }}
                  >
                    {getProductPriceLabel(p.priceLKR || p.price)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

  
        <div
          style={{
            backgroundColor: "#FAF6EE",
            border: "1px solid rgba(45,80,22,0.1)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(45,80,22,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                margin: 0,
                fontSize: "1rem",
              }}
            >
              Store Coverage
            </h3>
            <Link
              to={adminPath("stores")}
              style={{
                color: "#4A7C23",
                fontSize: "0.8rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Manage All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ padding: "8px 12px" }}>
            {provinces.length === 0 ? (
              <p
                style={{
                  color: "#A8C580",
                  fontSize: "0.83rem",
                  textAlign: "center",
                  padding: "20px",
                  margin: 0,
                }}
              >
                No provinces yet.
              </p>
            ) : (
              provinces.map((prov) => {
                const shopCount = (prov.districts ?? []).reduce(
                  (a: number, d: any) =>
                    a +
                    (d.towns ?? []).reduce(
                      (ta: number, t: any) => ta + (t.shops?.length ?? 0),
                      0
                    ),
                  0
                );
                return (
                  <div
                    key={prov._id?.toString() ?? prov.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "9px 10px",
                      borderRadius: "10px",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{prov.icon}</span>
                    <p
                      style={{
                        color: "#2D5016",
                        margin: 0,
                        fontSize: "0.85rem",
                        flex: 1,
                      }}
                    >
                      {prov.name}
                    </p>
                    <span
                      style={{
                        backgroundColor: "rgba(45,80,22,0.08)",
                        color: "#2D5016",
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "50px",
                      }}
                    >
                      {prov.districts?.length ?? 0} districts
                    </span>
                    <span
                      style={{
                        backgroundColor: "rgba(212,160,23,0.1)",
                        color: "#7A5C00",
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "50px",
                      }}
                    >
                      {shopCount} stores
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
