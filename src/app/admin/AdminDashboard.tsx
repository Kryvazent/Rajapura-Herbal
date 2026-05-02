import { Link } from "react-router";
import { Package, Store, MapPin, ChevronRight, TrendingUp, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../interfaces/productInterface";
import axios from "axios";

export default function AdminDashboard() {

  const [products, setProducts] = useState<Product[]>([]);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    loadData()
    loadData2()
  }, []);

  async function loadData() {
    await axios.get(import.meta.env.VITE_BACKEND_URL + "/user/products-all")
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error("Error fetching featured products:", err);
      })
  }

  const loadData2 = async () => {

    await axios.get(import.meta.env.VITE_BACKEND_URL + "/user/shops")
      .then(res => {
        setProvinces(res.data ?? []);
      })
      .catch(err => {
        console.error("Error fetching featured products:", err);
      })
  }

  const totalDistricts = provinces.reduce((acc, p) => acc + (p.districts?.length ?? 0), 0);

  const totalTowns = provinces.reduce(
    (acc, p) => acc + (p.districts ?? []).reduce((da, d) => da + (d.towns?.length ?? 0), 0),
    0
  );
  const totalShops = provinces.reduce(
    (acc, p) =>
      acc +
      (p.districts ?? []).reduce(
        (da, d) =>
          da +
          (d.towns ?? []).reduce((ta, t) => ta + (t.shops?.length ?? 0), 0),
        0
      ),
    0
  );

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      sub: `${categories.length} categories`,
      icon: Package,
      color: "#2D5016",
      bg: "rgba(45,80,22,0.08)",
      link: "/admin/products",
    },
    {
      label: "Provinces",
      value: provinces.length,
      sub: "All Sri Lanka",
      icon: MapPin,
      color: "#4A7C23",
      bg: "rgba(74,124,35,0.08)",
      link: "/admin/stores",
    },
    {
      label: "Districts",
      value: totalDistricts,
      sub: "Across all provinces",
      icon: TrendingUp,
      color: "#8B5E3C",
      bg: "rgba(139,94,60,0.08)",
      link: "/admin/stores",
    },
    {
      label: "Authorized Stores",
      value: totalShops,
      sub: "Nationwide",
      icon: Store,
      color: "#D4A017",
      bg: "rgba(212,160,23,0.1)",
      link: "/admin/stores",
    },
  ];

  return (
    <div>
      {/* Welcome */}
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
          <p style={{ color: "rgba(168,197,128,0.8)", fontSize: "0.82rem", margin: "0 0 4px", letterSpacing: "0.1em" }}>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
            <p style={{ color: "#A8C580", fontSize: "0.75rem", margin: 0 }}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Products */}
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
              to="/admin/products"
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
            {products.slice(0, 5).map((p) => (
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
                  {p.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Provinces overview */}
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
              to="/admin/stores"
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
            {provinces.map((prov) => {
              const shopCount = (prov.districts ?? []).reduce(
                (a, d) => a + (d.towns ?? []).reduce((ta, t) => ta + (t.shops?.length ?? 0), 0),
                0
              );
              return (
                <div
                  key={prov._id.toString()}
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
                    {prov.districts.length} districts
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}