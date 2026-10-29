import { API_BASE_URL } from "../lib/api";
import { Link } from "react-router";
import { Leaf, Shield, Heart, Star, ChevronRight, Flower, Droplets, Package, ShoppingCart, CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../interfaces/productInterface";
import { localized, useLanguage } from "../i18n/LanguageContext";
import Logo from "../components/Logo";
import { homeCopy, homeEstablished } from "../i18n/translations/home";
import { formatUSDPrice } from "../lib/price";

const statValues = ["200+", "48", "9", "100%"];
const valueIcons = [Leaf, Shield, Heart, Flower];

export default function Home() {
  const { language, t } = useLanguage();
  const c = homeCopy[language];
  const stats = statValues.map((value, index) => ({ value, label: c.stats[index] }));
  const values = valueIcons.map((icon, index) => ({ icon, ...c.values[index] }));
  const priceLabel = (price?: string) => price?.trim() ? price : t("contactPrice");
  const [country, setCountry] = useState<string | null>(null);
  const productPriceLabel = (product: Product) => country === "LK"
    ? t("contactPrice")
    : priceLabel(formatUSDPrice(product.priceUSD || (product.price?.startsWith("USD ") ? product.price : "")));
  const badgeLabel = (badge?: string) => badge ? c.badges[badge as keyof typeof c.badges] ?? badge : "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartNotice, setCartNotice] = useState<{ success: boolean; message: string; loginRequired?: boolean } | null>(null);

  useEffect(() => {
    if (!cartNotice) return;
    const timeout = window.setTimeout(() => setCartNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [cartNotice]);

  const addToCart = async (product: Product) => {
    try {
      if ((product.stock ?? 0) < 1) throw new Error(language === "si" ? "තොග අවසන්" : "Out of stock");
      await axios.post(`${API_BASE_URL}/user/cart/items`, { productId: product._id, qty: 1 }, { withCredentials: true });
      window.dispatchEvent(new Event("rajapura:cart-updated"));
      setCartNotice({ success: true, message: language === "si" ? "ඔබේ කරත්තයට එක් කළා" : "Added to your cart" });
    } catch (error) {
      const requestError = error as any;
      console.error("Add-to-cart request failed", {
        method: requestError.config?.method?.toUpperCase(),
        url: requestError.config?.url,
        status: requestError.response?.status,
        statusText: requestError.response?.statusText,
        response: requestError.response?.data,
        message: requestError.message,
      });
      setCartNotice({
        success: false,
        message: requestError.response?.data?.message ?? (error instanceof Error ? error.message : "Could not add this product to your cart."),
        loginRequired: requestError.response?.status === 401,
      });
    }
  };

  useEffect(() => {
    loadData();
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        setCountry(data.country_code ?? null)
        // setCountry('USA')
      })
      .catch(() => setCountry(null));
  }, [language]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await axios.get(
        API_BASE_URL + `/user/product-count/3?lang=${language}`
      );

      console.log("API response:", res.data);

      const data = res.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data?.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data?.data)) {
        setProducts(data.data);
      } else if (Array.isArray(data?.items)) {
        setProducts(data.items);
      } else {
        console.error("Unexpected response shape:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {cartNotice && <div role="status" aria-live="polite" style={{ position: "fixed", right: 22, bottom: 22, zIndex: 120, display: "flex", alignItems: "center", gap: 10, maxWidth: "min(420px, calc(100vw - 32px))", padding: "13px 18px", borderRadius: 14, color: cartNotice.success ? "#FAF6EE" : "#7D241D", background: cartNotice.success ? "#244516" : "#FFF3F0", border: cartNotice.success ? "1px solid #8BC34A" : "1px solid #E6B6AE", boxShadow: "0 10px 30px rgba(20,35,10,.2)", fontWeight: 700 }}>
        {cartNotice.success ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}{cartNotice.message}
        {cartNotice.loginRequired && <Link to="/account" style={{ color: "inherit", textDecoration: "underline", fontWeight: 800 }}>Sign in</Link>}
        <button type="button" onClick={() => setCartNotice(null)} aria-label="Dismiss message" style={{ marginLeft: 4, display: "grid", placeItems: "center", padding: 2, border: 0, background: "transparent", color: "inherit", cursor: "pointer" }}><X size={16} /></button>
      </div>}

      <section
        style={{
          background:
            "linear-gradient(135deg, #1A3009 0%, #2D5016 40%, #3D6B1C 100%)",
          position: "relative",
          overflow: "hidden",
        }}
        className="min-h-screen flex items-center"
      >

        <div
          className="hidden sm:block"
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(139,195,74,0.07)",
            border: "1px solid rgba(139,195,74,0.12)",
          }}
        />
        <div
          className="hidden sm:block"
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(212,160,23,0.06)",
            border: "1px solid rgba(212,160,23,0.1)",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(212,160,23,0.15)",
                border: "1px solid rgba(212,160,23,0.3)",
                borderRadius: "50px",
                padding: "6px 16px",
                marginBottom: "20px",
              }}
            >
              <Leaf size={14} style={{ color: "#D4A017" }} />
              <span
                style={{
                  color: "#D4A017",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                }}
              >
                {t("heroEyebrow").toUpperCase()}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#FAF6EE",
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                lineHeight: 1.15,
                marginBottom: "18px",
              }}
            >
              {t("heroTitle")}
            </h1>

            <p
              style={{
                color: "#A8C580",
                fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                lineHeight: 1.8,
                marginBottom: "32px",
                maxWidth: "480px",
              }}
            >
              {t("heroDescription")}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/products"
                style={{
                  backgroundColor: "#D4A017",
                  color: "#1A3009",
                  padding: "13px 28px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "0.92rem",
                  letterSpacing: "0.05em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {t("exploreProducts")} <ChevronRight size={16} />
              </Link>
              <Link
                to="/store-locator"
                style={{
                  backgroundColor: "transparent",
                  color: "#FAF6EE",
                  padding: "13px 28px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "0.92rem",
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(250,246,238,0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {t("stores")} <ChevronRight size={16} />
              </Link>
            </div>
          </div>


          <div className="relative hidden lg:block">
            <div
              style={{
                width: "480px",
                height: "520px",
                borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                overflow: "hidden",
                border: "3px solid rgba(139,195,74,0.3)",
                boxShadow: "0 0 60px rgba(45,80,22,0.5)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBtZWRpY2luZSUyMGdyZWVuJTIwbGVhdmVzJTIwb3JnYW5pY3xlbnwxfHx8fDE3NzIwMzUxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={c.imageAlt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>


            <div
              style={{
                position: "absolute",
                bottom: "30px",
                left: "-30px",
                backgroundColor: "#FAF6EE",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Droplets size={20} style={{ color: "#FAF6EE" }} />
              </div>
              <div>
                <p style={{ color: "#2D5016", margin: 0, lineHeight: 1.3 }}>
                  <strong>{c.pure}</strong>
                </p>
                <p style={{ color: "#8B5E3C", fontSize: "0.8rem", margin: 0 }}>
                  {c.noAdditives}
                </p>
              </div>
            </div>


            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "-20px",
                backgroundColor: "#D4A017",
                borderRadius: "12px",
                padding: "10px 16px",
                boxShadow: "0 4px 20px rgba(212,160,23,0.4)",
              }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    style={{ color: "#1A3009", fill: "#1A3009" }}
                  />
                ))}
              </div>
              <p
                style={{
                  color: "#1A3009",
                  fontSize: "0.75rem",
                  margin: "2px 0 0",
                  textAlign: "center",
                }}
              >
                {c.trusted}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section style={{ backgroundColor: "#2D5016" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#D4A017",
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  color: "#A8C580",
                  fontSize: "0.75rem",
                  margin: "4px 0 0",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="relative">
              <img
                src="/rajapura-product-collection.jpg"
                alt={c.collectionAlt}
                style={{
                  width: "100%",
                  height: "clamp(280px, 40vw, 420px)",
                  objectFit: "cover",
                  borderRadius: "20px",
                  boxShadow: "0 20px 60px rgba(45,80,22,0.15)",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: "-14px",
                  right: "12px",
                  backgroundColor: "#FAF6EE",
                  border: "3px solid #8BC34A",
                  borderRadius: "16px",
                  padding: "12px 18px",
                  boxShadow: "0 8px 30px rgba(45,80,22,0.15)",
                }}
              > 
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#2D5016",
                    fontSize: "1.2rem",
                    margin: 0,
                  }}
                >
                  {homeEstablished[language]}
                </p>
                <p style={{ color: "#8B5E3C", fontSize: "0.75rem", margin: 0 }}>
                  {c.trust}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            <span
              style={{
                color: "#8B5E3C",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {c.heritage}
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
                marginTop: "8px",
                marginBottom: "18px",
                lineHeight: 1.2,
              }}
            >
              {c.legacy}
            </h2>
            <p
              style={{
                color: "#5C4033",
                lineHeight: 1.8,
                marginBottom: "14px",
                fontSize: "0.95rem",
              }}
            >
              {c.heritageOne}
            </p>
            <p
              style={{
                color: "#5C4033",
                lineHeight: 1.8,
                marginBottom: "28px",
                fontSize: "0.95rem",
              }}
            >
              {c.heritageTwo}
            </p>
            <Link
              to="/about"
              style={{
                backgroundColor: "#2D5016",
                color: "#FAF6EE",
                padding: "12px 28px",
                borderRadius: "50px",
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {c.story} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>


      <section style={{ backgroundColor: "#F0EAD6" }} className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="text-center mb-10 sm:mb-12">
            <span
              style={{
                color: "#8B5E3C",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {c.why}
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                marginTop: "8px",
              }}
            >
              {c.difference}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "16px",
                  padding: "24px 20px",
                  border: "1px solid rgba(139,195,74,0.3)",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    backgroundColor: "#2D5016",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Icon size={22} style={{ color: "#8BC34A" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#2D5016",
                    marginBottom: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "#6B4423",
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span
              style={{
                color: "#8B5E3C",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {c.collection}
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                marginTop: "8px",
              }}
            >
              {c.featured}
            </h2>
          </div>
          <Link
            to="/products"
            style={{
              color: "#2D5016",
              textDecoration: "none",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #2D5016",
              padding: "8px 18px",
              borderRadius: "50px",
              whiteSpace: "nowrap",
            }}
          >
            {c.viewAll} <ChevronRight size={16} />
          </Link>
        </div>


        {loading && (
          <div className="flex justify-center items-center py-16">
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid rgba(45,80,22,0.15)",
                borderTop: "4px solid #2D5016",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}


        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <Leaf
              size={48}
              style={{ color: "#A8C580", margin: "0 auto 16px", display: "block" }}
            />
            <p
              style={{
                color: "#5C4033",
                fontSize: "1rem",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {c.none}
            </p>
            <p style={{ color: "#8B5E3C", fontSize: "0.85rem", marginTop: "6px" }}>
              {c.checkBack}
            </p>
          </div>
        )}


        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid rgba(139,195,74,0.25)",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="group hover:shadow-xl"
              >
                <div
                  style={{ position: "relative", height: "220px", flexShrink: 0, overflow: "hidden" }}
                >
                  <img
                    src={product.image}
                    alt={localized(product.translations?.name, language, product.name)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    className="group-hover:scale-105"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,48,9,.5) 0%, transparent 50%)" }} />
                  {product.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        backgroundColor: "#D4A017",
                        color: "#1A3009",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "50px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {badgeLabel(product.badge)}
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                    <p style={{ color: "#D4A017", fontSize: ".7rem", letterSpacing: ".1em", margin: 0 }}>
                      {localized(product.translations?.category, language, product.category).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#2D5016",
                      fontSize: "1.05rem",
                      marginBottom: "2px",
                      marginTop: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {localized(product.translations?.name, language, product.name)}
                  </h3>
                  <p style={{ color: "#8B5E3C", fontSize: ".75rem", fontStyle: "italic", margin: "0 0 8px" }}>
                    {language === "si" ? product.sinhalaName : language === "ta" ? product.tamilName || product.name : product.name}
                  </p>
                  <p
                    style={{
                      color: "#5C4033",
                      fontSize: ".82rem",
                      lineHeight: 1.55,
                      marginBottom: 12,
                      marginTop: 0,
                      flex: 1,
                    }}
                  >
                    {localized(product.translations?.description, language, product.description).substring(0, 90)}...
                  </p>
                  <div className="flex items-center justify-between gap-2" style={{ marginTop: "auto" }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        color: "#2D5016",
                        fontSize: ".82rem",
                        fontWeight: 700,
                        ...(country !== "LK" && product.priceUSD ? { padding: "5px 8px", borderRadius: 999, background: "#EEF2DF", border: "1px solid rgba(45,80,22,.18)", whiteSpace: "nowrap" as const } : {}),
                      }}
                    >
                      {productPriceLabel(product)}
                    </span>
                    <div className="flex items-center gap-2">
                      {country !== "LK" && (product.stock ?? 0) > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#2D5016", padding: "6px 10px", borderRadius: 50, background: "rgba(139,195,74,.2)", border: "1px solid rgba(45,80,22,.2)", fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap" }}><Package size={14} aria-hidden="true" />{language === "si" ? "තොග ඇත" : "In stock"}</span>}
                      {country !== "LK" && (product.stock ?? 0) === 0 ? (
                        <button type="button" disabled style={{ backgroundColor: "#F0EDE6", color: "#6B4423", padding: "6px 12px", borderRadius: 50, border: "1px solid rgba(107,68,35,.28)", fontSize: ".76rem", fontWeight: 700, cursor: "not-allowed", whiteSpace: "nowrap" }}>{language === "si" ? "තොග අවසන්" : "Out of stock"}</button>
                      ) : country !== "LK" ? (
                        <button type="button" aria-label={`Add ${product.name} to cart`} title="Add to cart" onClick={async () => addToCart(product)} style={{ backgroundColor: "#2D5016", color: "#FAF6EE", width: 40, height: 40, borderRadius: 50, border: "1px solid #2D5016", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ShoppingCart size={17} aria-hidden="true" /></button>
                      ) : (
                        <Link to="/store-locator" style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "7px 12px", borderRadius: 50, textDecoration: "none", fontSize: ".76rem", whiteSpace: "nowrap" }}>{c.findStore}</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      <section
        style={{
          background: "linear-gradient(135deg, #2D5016, #4A7C23)",
          padding: "clamp(48px, 8vw, 80px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.07) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(139,195,74,0.07) 0%, transparent 60%)",
          }}
        />
        <div className="flex flex-col items-center" style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>


          <img
            src="/logo2.png"
            alt="Rajapura"
            style={{
              objectFit: 'contain',
              display: 'block',
              width: '300px',
              aspectRatio: '1 / 1',
            }}
          />
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
              marginBottom: "14px",
            }}
          >
            {c.findProducts}
          </h2>
          <p
            style={{
              color: "#A8C580",
              lineHeight: 1.8,
              marginBottom: "28px",
              fontSize: "0.95rem",
            }}
          >
            {c.available}
          </p>
          <Link
            to="/store-locator"
            style={{
              backgroundColor: "#D4A017",
              color: "#1A3009",
              padding: "14px 32px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {c.locator} <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
