import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Leaf, ChevronRight, X } from "lucide-react";
import { Product } from "../interfaces/productInterface";
import { localized, localizedList, useLanguage } from "../i18n/LanguageContext";
import { productsCopy } from "../i18n/translations/products";
import axios from "axios";

export default function Products() {
  const { language, t } = useLanguage();
  const c = productsCopy[language];
  const categoryLabel = (category: string) =>
    category === "All"
      ? c.all
      : (c.categories[category as keyof typeof c.categories] ?? category);
  const badgeLabel = (badge?: string) =>
    badge ? (c.badges[badge as keyof typeof c.badges] ?? badge) : "";
  const priceLabel = (price?: string) =>
    price?.trim() ? price : t("contactPrice");
  const productList = (
    product: Product,
    field: "benefits" | "ingredients" | "howToUse",
  ) => {
    const translated = localizedList(product.translations?.[field], language);
    if (translated.length > 0) {
      return translated;
    }

    const baseValues = product[field];
    return Array.isArray(baseValues) ? baseValues : [];
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadData();
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        // setCountry(d.country_code ?? null);
        setCountry("USA");
      })
      .catch(() => setCountry(null));
    setCartCount(
      JSON.parse(localStorage.getItem("rajapuraCart") || "[]").reduce(
        (n: number, i: any) => n + i.qty,
        0,
      ),
    );
  }, [language]);

  const international = country !== null && country !== "LK";
  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("rajapuraCart") || "[]");
    const current = cart.find((i: any) => i.product._id === product._id);
    if (current) current.qty = Math.min(product.stock ?? 0, current.qty + qty);
    else cart.push({ product, qty });
    localStorage.setItem("rajapuraCart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rajapura:cart-updated"));
    setCartCount(cart.reduce((n: number, i: any) => n + i.qty, 0));
    setSelectedProduct(null);
    setQty(1);
  };

  async function loadData() {
    setLoading(true);
    setSelectedProduct(null);
    try {
      const res = await axios.get(
        import.meta.env.VITE_BACKEND_URL +
          `/user/products-all?lang=${language}`,
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
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {international && (
        <Link
          to="/cart"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 20,
            padding: "12px 18px",
            borderRadius: 30,
            background: "#2D5016",
            color: "#FAF6EE",
            textDecoration: "none",
          }}
        >
          Cart ({cartCount})
        </Link>
      )}
      <div
        style={{
          background: "linear-gradient(135deg, #1A3009, #2D5016)",
          padding: "clamp(40px, 8vw, 60px) 24px",
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
              "radial-gradient(circle at 20% 50%, rgba(139,195,74,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,160,23,0.06) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf size={14} style={{ color: "#D4A017" }} />
            <span
              style={{
                color: "#D4A017",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
              }}
            >
              {c.eyebrow.toUpperCase()}
            </span>
            <Leaf size={14} style={{ color: "#D4A017" }} />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              margin: 0,
            }}
          >
            {t("products")}
          </h1>
          <p
            style={{
              color: "#A8C580",
              marginTop: "12px",
              maxWidth: "500px",
              margin: "12px auto 0",
              lineHeight: 1.7,
              fontSize: "0.9rem",
            }}
          >
            {t("productsIntro")}
          </p>
        </div>
      </div>

      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12">
        <div className="flex flex-col gap-4 mb-8 sm:mb-10">
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8B5E3C",
              }}
            />
            <input
              type="text"
              placeholder={c.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "50px",
                border: "1px solid rgba(45,80,22,0.25)",
                backgroundColor: "#FAF6EE",
                color: "#2D5016",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor:
                    activeCategory === cat ? "#2D5016" : "#FAF6EE",
                  color: activeCategory === cat ? "#FAF6EE" : "#6B4423",
                  border: `1px solid ${
                    activeCategory === cat ? "#2D5016" : "rgba(45,80,22,0.25)"
                  }`,
                  padding: "7px 16px",
                  borderRadius: "50px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
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

        {!loading && (
          <p
            style={{
              color: "#8B5E3C",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {c.showing} {filtered.length}{" "}
            {filtered.length === 1 ? c.product : c.products}
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {filtered.map((product) => (
              <div
                key={product._id}
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid rgba(139,195,74,0.25)",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="group hover:shadow-lg"
                onClick={() => setSelectedProduct(product)}
              >
                <div
                  style={{
                    position: "relative",
                    height: "220px",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={product.image}
                    alt={localized(
                      product.translations?.name,
                      language,
                      product.name,
                    )}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    className="group-hover:scale-105"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(26,48,9,0.5) 0%, transparent 50%)",
                    }}
                  />
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
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "16px",
                    }}
                  >
                    <p
                      style={{
                        color: "#D4A017",
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        margin: 0,
                      }}
                    >
                      {localized(
                        product.translations?.category,
                        language,
                        product.category,
                      ).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 18px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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
                    {localized(
                      product.translations?.name,
                      language,
                      product.name,
                    )}
                  </h3>
                  <p
                    style={{
                      color: "#8B5E3C",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      marginBottom: "8px",
                      marginTop: 0,
                    }}
                  >
                    {language === "si"
                      ? localized(
                          product.translations?.name,
                          language,
                          product.sinhalaName,
                        )
                      : language === "ta"
                        ? localized(
                            product.translations?.name,
                            language,
                            product.tamilName || product.name,
                          )
                        : localized(
                            product.translations?.name,
                            language,
                            product.name,
                          )}
                  </p>
                  <p
                    style={{
                      color: "#5C4033",
                      fontSize: "0.82rem",
                      lineHeight: 1.55,
                      marginBottom: "10px",
                      marginTop: 0,
                      flex: 1,
                    }}
                  >
                    {localized(
                      product.translations?.description,
                      language,
                      product.description,
                    ).substring(0, 90)}
                    ...
                  </p>

                  <div
                    className="flex flex-wrap gap-1"
                    style={{ marginBottom: "12px" }}
                  >
                    {productList(product, "ingredients").length
                      ? productList(product, "ingredients")
                          .slice(0, 3)
                          .map((ing) => (
                            <span
                              key={ing}
                              style={{
                                backgroundColor: "rgba(45,80,22,0.08)",
                                color: "#2D5016",
                                fontSize: "0.65rem",
                                padding: "3px 7px",
                                borderRadius: "50px",
                                border: "1px solid rgba(45,80,22,0.15)",
                              }}
                            >
                              {ing}
                            </span>
                          ))
                      : product.ingredients
                          .slice(0, 3)
                          .map((ing) => <span key={ing}>{ing}</span>)}
                    {(productList(product, "ingredients").length ||
                      product.ingredients.length) > 3 && (
                      <span
                        style={{
                          color: "#8B5E3C",
                          fontSize: "0.65rem",
                          padding: "3px 5px",
                        }}
                      >
                        +
                        {(productList(product, "ingredients").length ||
                          product.ingredients.length) - 3}{" "}
                        {c.more}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-between"
                    style={{ marginTop: "auto" }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#2D5016",
                        fontSize: "1.05rem",
                      }}
                    >
                      {language === "si"
                        ? "මිල සඳහා විමසන්න"
                        : language === "ta"
                          ? "விலை விவரங்களுக்கு விசாரிக்கவும்"
                          : priceLabel(product.price)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "#2D5016",
                          padding: "6px 12px",
                          borderRadius: "50px",
                          border: "1px solid #2D5016",
                          fontSize: "0.76rem",
                          cursor: "pointer",
                        }}
                      >
                        {c.details}
                      </button>
                      {international && (product.stock ?? 0) === 0 ? (
                        <button
                          type="button"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: "#F0EDE6",
                            color: "#6B4423",
                            padding: "6px 12px",
                            borderRadius: "50px",
                            border: "1px solid rgba(107,68,35,0.28)",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            cursor: "not-allowed",
                            opacity: 1,
                          }}
                        >
                          Out of stock
                        </button>
                      ) : (
                        <Link
                          to="/store-locator"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: "#2D5016",
                            color: "#FAF6EE",
                            padding: "6px 12px",
                            borderRadius: "50px",
                            textDecoration: "none",
                            fontSize: "0.76rem",
                          }}
                        >
                          {c.buy}
                        </Link>
                      )}
                    </div>
                  </div>
                  {international && (product.stock ?? 0) > 0 && (
                    <div style={{ color: "#6B4423", fontSize: "0.75rem", marginTop: 8 }}>
                      {product.stock} available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Leaf
              size={40}
              style={{
                color: "#A8C580",
                margin: "0 auto 16px",
                display: "block",
              }}
            />
            <p style={{ color: "#8B5E3C", fontSize: "1rem" }}>
              {products.length === 0 ? c.none : c.noMatch}
            </p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(26,48,9,0.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: "#FAF6EE",
              borderRadius: "20px",
              maxWidth: "820px",
              width: "100%",
              maxHeight: "92vh",
              boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex sm:hidden items-center justify-between px-4 py-3"
              style={{ backgroundColor: "#2D5016", flexShrink: 0 }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#FAF6EE",
                  margin: 0,
                  fontSize: "0.95rem",
                  lineHeight: 1.2,
                }}
              >
                {localized(
                  selectedProduct.translations?.name,
                  language,
                  selectedProduct.name,
                )}
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(250,246,238,0.8)",
                  cursor: "pointer",
                  display: "flex",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="flex flex-col sm:flex-row"
              style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              <div
                className="w-full sm:w-[42%] flex-shrink-0 relative"
                style={{ height: "200px" }}
              >
                <div className="hidden sm:block absolute inset-0">
                  <img
                    src={selectedProduct.image}
                    alt={localized(
                      selectedProduct.translations?.name,
                      language,
                      selectedProduct.name,
                    )}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(26,48,9,0.6) 0%, transparent 40%)",
                    }}
                  />
                  {selectedProduct.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        backgroundColor: "#D4A017",
                        color: "#1A3009",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: "50px",
                      }}
                    >
                      {badgeLabel(selectedProduct.badge)}
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "16px",
                    }}
                  >
                    <p
                      style={{
                        color: "#D4A017",
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        margin: 0,
                      }}
                    >
                      {localized(
                        selectedProduct.translations?.category,
                        language,
                        selectedProduct.category,
                      ).toUpperCase()}
                    </p>
                    <p
                      style={{
                        color: "#FAF6EE",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                        margin: "2px 0 0",
                      }}
                    >
                      {localized(
                        selectedProduct.translations?.name,
                        language,
                        selectedProduct.name,
                      )}
                    </p>
                  </div>
                </div>
                <img
                  className="block sm:hidden"
                  src={selectedProduct.image}
                  alt={localized(
                    selectedProduct.translations?.name,
                    language,
                    selectedProduct.name,
                  )}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                className="flex-1 flex flex-col overflow-hidden sm:h-auto"
                style={{ minHeight: 0 }}
              >
                <div
                  className="hidden sm:block"
                  style={{
                    padding: "22px 26px 14px",
                    borderBottom: "1px solid rgba(45,80,22,0.1)",
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#FAF6EE",
                    zIndex: 1,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#2D5016",
                      margin: "0 0 6px",
                      fontSize: "1.3rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {localized(
                      selectedProduct.translations?.name,
                      language,
                      selectedProduct.name,
                    )}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#2D5016",
                        fontSize: "1.15rem",
                      }}
                    >
                      {priceLabel(selectedProduct.price)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        style={{
                          backgroundColor: "transparent",
                          color: "#6B4423",
                          padding: "7px 14px",
                          borderRadius: "50px",
                          border: "1px solid #6B4423",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        {c.close}
                      </button>
                      <Link
                        to="/store-locator"
                        style={{
                          backgroundColor: "#2D5016",
                          color: "#FAF6EE",
                          padding: "7px 14px",
                          borderRadius: "50px",
                          textDecoration: "none",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {c.find} <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div style={{ overflowY: "auto", flex: 1 }}>
                  <div
                    className="px-5 sm:px-7 py-4 sm:py-5"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <p
                      style={{
                        color: "#5C4033",
                        fontSize: "0.87rem",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {localized(
                        selectedProduct.translations?.description,
                        language,
                        selectedProduct.description,
                      )}
                    </p>

                    {international && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 0",
                        }}
                      >
                        {(selectedProduct.stock ?? 0) === 0 ? (
                          <span
                            role="status"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "9px 15px",
                              borderRadius: 8,
                              border: "1px solid #b42318",
                              backgroundColor: "#fde8e7",
                              color: "#8f1d17",
                              fontSize: "0.9rem",
                              fontWeight: 800,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Out of stock
                          </span>
                        ) : (
                          <span style={{ color: "#2D5016", fontSize: "0.82rem" }}>
                            Available: {selectedProduct.stock} · {priceLabel(selectedProduct.price)}
                          </span>
                        )}
                        {(selectedProduct.stock ?? 0) > 0 && <input
                          aria-label="Quantity"
                          type="number"
                          min="1"
                          max={selectedProduct.stock ?? 0}
                          value={qty}
                          onChange={(e) =>
                            setQty(Math.max(1, Number(e.target.value) || 1))
                          }
                          style={{
                            width: 64,
                            padding: 7,
                            borderRadius: 8,
                            border: "1px solid #ccc",
                          }}
                        />}
                        {(selectedProduct.stock ?? 0) > 0 && <button
                          onClick={() => addToCart(selectedProduct)}
                          style={{
                            padding: "9px 14px",
                            borderRadius: 24,
                            border: 0,
                            background:
                              (selectedProduct.stock ?? 0) === 0
                                ? "#aaa"
                                : "#2D5016",
                            color: "#FAF6EE",
                            cursor:
                              (selectedProduct.stock ?? 0) === 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >Add to cart</button>}
                      </div>
                    )}

                    <div>
                      <p
                        style={{
                          color: "#2D5016",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          marginBottom: "8px",
                          marginTop: 0,
                        }}
                      >
                        {c.benefits}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {productList(selectedProduct, "benefits").map((b) => (
                          <span
                            key={b}
                            style={{
                              backgroundColor: "rgba(45,80,22,0.1)",
                              color: "#2D5016",
                              fontSize: "0.74rem",
                              padding: "4px 10px",
                              borderRadius: "50px",
                            }}
                          >
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p
                        style={{
                          color: "#2D5016",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          marginBottom: "6px",
                          marginTop: 0,
                        }}
                      >
                        {productList(selectedProduct, "ingredients").length > 0
                          ? c.ingredients
                          : ""}
                      </p>
                      <p
                        style={{
                          color: "#5C4033",
                          fontSize: "0.82rem",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {productList(selectedProduct, "ingredients").join(
                          " · ",
                        )}
                      </p>
                    </div>

                    {productList(selectedProduct, "howToUse").length > 0 && (
                      <div>
                        <p
                          style={{
                            color: "#2D5016",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            marginBottom: "10px",
                            marginTop: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>📖</span> {c.how}
                        </p>
                        <ol
                          style={{
                            margin: 0,
                            padding: 0,
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {productList(selectedProduct, "howToUse").map(
                            (step, i) => (
                              <li
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "flex-start",
                                }}
                              >
                                <span
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    minWidth: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: "#D4A017",
                                    color: "#1A3009",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: "1px",
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span
                                  style={{
                                    color: "#5C4033",
                                    fontSize: "0.82rem",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {step}
                                </span>
                              </li>
                            ),
                          )}
                        </ol>
                      </div>
                    )}

                    <div className="flex sm:hidden gap-3 pt-2">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "50px",
                          border: "1px solid rgba(45,80,22,0.3)",
                          backgroundColor: "transparent",
                          color: "#6B4423",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        {c.close}
                      </button>
                      <Link
                        to="/store-locator"
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "50px",
                          backgroundColor: "#2D5016",
                          color: "#FAF6EE",
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                        }}
                      >
                        {c.find} <ChevronRight size={13} />
                      </Link>
                    </div>

                    <div style={{ height: "8px" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
