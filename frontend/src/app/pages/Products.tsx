import { API_BASE_URL } from "../lib/api";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Leaf, ChevronRight, X, Package, CheckCircle2, CircleAlert, ShoppingCart, Share2, Check, LoaderCircle } from "lucide-react";
import { Product } from "../interfaces/productInterface";
import { localized, localizedList, useLanguage } from "../i18n/LanguageContext";
import { productsCopy } from "../i18n/translations/products";
import axios from "axios";
import { formatUSDPrice } from "../lib/price";

const slugifyProductName = (name: string) =>
  name.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";

export default function Products() {
  const { language, t } = useLanguage();
  const c = productsCopy[language];
  const shareLabel = language === "si" ? "බෙදාගන්න" : "Share";
  const copiedLabel = language === "si" ? "පිටපත් කළා" : "Copied";
  const addToCartLabel = language === "si" ? "කරත්තයට එක් කරන්න" : "Add to cart";
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const outOfStockLabel = language === "si" ? "තොග අවසන්" : "Out of stock";
  const categoryLabel = (category: string) =>
    category === "All"
      ? c.all
      : (c.categories[category as keyof typeof c.categories] ?? category);
  const badgeLabel = (badge?: string) =>
    badge ? (c.badges[badge as keyof typeof c.badges] ?? badge) : "";
  const priceLabel = (price?: string) =>
    price?.trim() ? price : t("contactPrice");
  const productPriceLabel = (product: Product) => international
    ? priceLabel(formatUSDPrice(product.priceUSD || (product.price?.startsWith("USD ") ? product.price : "")))
    : t("contactPrice");
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareCopied, setShareCopied] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartNotice, setCartNotice] = useState<{ success: boolean; message: string; loginRequired?: boolean } | null>(null);
  const productSlug = (product: Product) => {
    const base = slugifyProductName(product.translations?.name?.en || product.name);
    const sameSlug = products.filter((item) => slugifyProductName(item.translations?.name?.en || item.name) === base);
    const duplicateIndex = sameSlug.findIndex((item) => String(item._id) === String(product._id));
    return duplicateIndex > 0 ? `${base}-${duplicateIndex + 1}` : base;
  };

  useEffect(() => {
    const sharedSlug = searchParams.get("product");
    if (!sharedSlug) {
      setSelectedProduct(null);
      return;
    }
    const normalizedSlug = sharedSlug.toLowerCase();
    const product = products.find(
      (item) => String(item._id) === sharedSlug || productSlug(item) === normalizedSlug,
    );
    if (product) setSelectedProduct(product);
  }, [products, searchParams]);

  const openProduct = (product: Product) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("product", productSlug(product));
    setSearchParams(nextParams);
  };

  const closeProduct = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("product");
    setSearchParams(nextParams);
    setShareCopied(false);
  };

  const copyProductLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    } catch {
      setCartNotice({ success: false, message: "Could not copy the link. Copy it from your browser address bar." });
    }
  };

  useEffect(() => {
    loadData();
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        setCountry(data.country_code ?? null)
        // setCountry("USA")
      })
      .catch(() => setCountry(null));
  }, [language]);

  useEffect(() => {
    if (!cartNotice) return;
    const timeout = window.setTimeout(() => setCartNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [cartNotice]);

  const international = country !== null && country !== "LK";
  const addToCart = async (product: Product, quantity = qty) => {
    const productId = String(product._id);
    setAddingProductId(productId);
    try {
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Enter a valid quantity.");
      await axios.post(`${API_BASE_URL}/user/cart/items`, { productId: product._id, qty: quantity }, { withCredentials: true });
      window.dispatchEvent(new Event("rajapura:cart-updated"));
      setCartNotice({ success: true, message: language === "si" ? "කරත්තයට එක් කරන ලදී" : "Added to your cart" });
      closeProduct();
      setQty(1);
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
      const loginRequired = requestError.response?.status === 401;
      setCartNotice({
        success: false,
        message: language === "si" ? (loginRequired ? "කරත්තයට එක් කිරීමට පුරනය වන්න" : "කරත්තයට එක් කළ නොහැක. නැවත උත්සාහ කරන්න.") : requestError.response?.data?.message ?? (error instanceof Error ? error.message : "Could not add this product to your cart."),
        loginRequired,
      });
    } finally {
      setAddingProductId((current) => current === productId ? null : current);
    }
  };

  async function loadData() {
    setLoading(true);
    try {
      const res = await axios.get(
        API_BASE_URL +
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
      <style>{"@keyframes product-cart-spin{to{transform:rotate(360deg)}}.product-card--sinhala .product-card__footer{align-items:stretch!important;flex-direction:column;gap:8px}.product-card--sinhala .product-card__actions{display:grid!important;grid-template-columns:1fr;gap:8px!important;width:100%;margin:0!important}.product-card--sinhala .product-card__actions>button,.product-card--sinhala .product-card__actions>a{width:100%;min-height:42px;box-sizing:border-box;justify-content:center;white-space:normal;line-height:1.35;text-align:center}.product-card--sinhala .product-card__actions>span{justify-self:start}"}</style>
      {cartNotice && <div role="status" aria-live="polite" style={{ position: "fixed", right: 22, bottom: 22, zIndex: 120, display: "flex", alignItems: "center", gap: 10, maxWidth: "min(420px, calc(100vw - 32px))", padding: "13px 18px", borderRadius: 14, color: cartNotice.success ? "#FAF6EE" : "#7D241D", background: cartNotice.success ? "#244516" : "#FFF3F0", border: cartNotice.success ? "1px solid #8BC34A" : "1px solid #E6B6AE", boxShadow: "0 10px 30px rgba(20,35,10,.2)", fontWeight: 700 }}>
        {cartNotice.success ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}{cartNotice.message}
        {cartNotice.loginRequired && <Link to="/account" style={{ color: "inherit", textDecoration: "underline", fontWeight: 800 }}>{language === "si" ? "පුරනය වන්න" : "Sign in"}</Link>}
        <button type="button" onClick={() => setCartNotice(null)} aria-label={language === "si" ? "දැනුම්දීම වසන්න" : "Dismiss message"} style={{ marginLeft: 4, display: "grid", placeItems: "center", padding: 2, border: 0, background: "transparent", color: "inherit", cursor: "pointer" }}><X size={16} /></button>
      </div>}
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
                className={`product-card${language === "si" ? " product-card--sinhala" : ""} group hover:shadow-lg`}
                onClick={() => openProduct(product)}
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
                    className="product-card__footer flex items-center justify-between"
                    style={{ marginTop: "auto" }}
                  >
                    <span
                      style={{
                        fontFamily: international ? "'Lato', sans-serif" : "'Playfair Display', serif",
                        color: "#2D5016",
                        fontSize: international ? "0.82rem" : "1.05rem",
                        fontWeight: international ? 700 : 400,
                        ...(international && product.priceUSD ? {
                          padding: "5px 8px",
                          borderRadius: 999,
                          background: "#EEF2DF",
                          border: "1px solid rgba(45,80,22,.18)",
                          whiteSpace: "nowrap" as const,
                        } : {}),
                      }}
                    >
                      {productPriceLabel(product)}
                    </span>
                    <div className="product-card__actions flex gap-2" style={{ margin: "6px 0 10px" }}>
                      {international ? (
                        (product.stock ?? 0) > 0 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#2D5016", padding: "6px 10px", borderRadius: 50, background: "rgba(139,195,74,.2)", border: "1px solid rgba(45,80,22,.2)", fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                            <Package size={14} aria-hidden="true" /> {language === "si" ? "තොග ඇත" : "In stock"}
                          </span>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProduct(product);
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
                      )}
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
                          {outOfStockLabel}
                        </button>
                      ) : international ? (
                        <button
                          type="button"
                          aria-label={language === "si" ? `${product.name} කරත්තයට එක් කරන්න` : `Add ${product.name} to cart`}
                          title={addingProductId === String(product._id) ? (language === "si" ? "කරත්තයට එක් කරමින්" : "Adding to cart") : addToCartLabel}
                          disabled={addingProductId !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          style={{
                            backgroundColor: "#2D5016",
                            color: "#FAF6EE",
                            padding: "7px 10px",
                            borderRadius: "50px",
                            border: "1px solid #2D5016",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            cursor: addingProductId !== null ? "wait" : "pointer",
                            opacity: addingProductId !== null ? .78 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {addingProductId === String(product._id) ? <LoaderCircle size={17} strokeWidth={2} aria-hidden="true" style={{ animation: "product-cart-spin .8s linear infinite" }} /> : <ShoppingCart size={17} strokeWidth={2} aria-hidden="true" />}
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
          onClick={closeProduct}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button type="button" onClick={copyProductLink} aria-label={language === "si" ? "නිෂ්පාදන සබැඳිය පිටපත් කරන්න" : "Copy product link"} title={language === "si" ? "නිෂ්පාදන සබැඳිය පිටපත් කරන්න" : "Copy product link"} style={{ background: "none", border: "none", color: "#FAF6EE", cursor: "pointer", display: "flex", padding: 4 }}>
                  {shareCopied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
                <button
                  onClick={closeProduct}
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
            </div>

            <div
              className="flex flex-col sm:flex-row"
              style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              <div
                className="w-full sm:w-[42%] flex-shrink-0 flex flex-col"
              >
                <div className="hidden sm:block relative flex-shrink-0" style={{ height: 200 }}>
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
                    height: 200,
                    objectFit: "cover",
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
                  <div className="flex flex-col items-start gap-3">
                    <span
                      style={{
                        fontFamily: international ? "'Lato', sans-serif" : "'Playfair Display', serif",
                        color: "#2D5016",
                        fontSize: international ? "0.95rem" : "1.15rem",
                        fontWeight: 700,
                        ...(international && selectedProduct.priceUSD ? {
                          padding: "5px 9px",
                          borderRadius: 999,
                          background: "#EEF2DF",
                          border: "1px solid rgba(45,80,22,.18)",
                        } : {}),
                      }}
                    >
                      {productPriceLabel(selectedProduct)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copyProductLink}
                        aria-label={shareCopied ? copiedLabel : (language === "si" ? "නිෂ්පාදන සබැඳිය පිටපත් කරන්න" : "Copy product link")}
                        title={shareCopied ? copiedLabel : (language === "si" ? "නිෂ්පාදන සබැඳිය පිටපත් කරන්න" : "Copy product link")}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#EEF2DF", color: "#2D5016", padding: "7px 12px", borderRadius: 50, border: "1px solid rgba(45,80,22,.2)", fontSize: ".8rem", cursor: "pointer" }}
                      >
                        {shareCopied ? <Check size={15} /> : <Share2 size={15} />}
                        {shareCopied ? copiedLabel : shareLabel}
                      </button>
                      <Link to="/store-locator" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#2D5016", color: "#FAF6EE", padding: "7px 14px", borderRadius: 50, textDecoration: "none", fontSize: ".8rem" }}>
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
                            {outOfStockLabel}
                          </span>
                        ) : (
                          <span style={{ color: "#2D5016", fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {language === "si" ? "තොග ඇත" : "In stock"}
                          </span>
                        )}
                        {(selectedProduct.stock ?? 0) > 0 && <input
                          aria-label="Quantity"
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => setQty(e.target.value === "" ? 1 : Number(e.target.value))}
                          style={{
                            width: 104,
                            boxSizing: "border-box",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                          }}
                        />}
                        {(selectedProduct.stock ?? 0) > 0 && <button
                          disabled={addingProductId !== null}
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
                        >{addingProductId === String(selectedProduct._id) ? (language === "si" ? "කරත්තයට එක් කරමින්…" : "Adding to cart…") : addToCartLabel}</button>}
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
                        onClick={closeProduct}
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
