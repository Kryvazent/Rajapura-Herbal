import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Leaf, ChevronRight, X } from "lucide-react";
import { Product } from "../interfaces/productInterface";
import axios from "axios";

export default function Products() {

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {

    loadData()

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

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Page Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A3009, #2D5016)",
          padding: "clamp(40px, 8vw, 60px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,195,74,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,160,23,0.06) 0%, transparent 50%)" }} />
        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf size={14} style={{ color: "#D4A017" }} />
            <span style={{ color: "#D4A017", fontSize: "0.72rem", letterSpacing: "0.2em" }}>PURE · NATURAL · POTENT</span>
            <Leaf size={14} style={{ color: "#D4A017" }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.8rem, 5vw, 3rem)", margin: 0 }}>
            Our Herbal Products
          </h1>
          <p style={{ color: "#A8C580", marginTop: "12px", maxWidth: "500px", margin: "12px auto 0", lineHeight: 1.7, fontSize: "0.9rem" }}>
            Each product is crafted with reverence for ancient Ayurvedic traditions, using only the finest sustainably sourced herbs.
          </p>
        </div>
      </div>

      {/* Decorative band */}
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12">
        {/* Search & Filter */}
        <div className="flex flex-col gap-4 mb-8 sm:mb-10">
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#8B5E3C" }} />
            <input
              type="text"
              placeholder="Search products..."
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
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: activeCategory === cat ? "#2D5016" : "#FAF6EE",
                  color: activeCategory === cat ? "#FAF6EE" : "#6B4423",
                  border: `1px solid ${activeCategory === cat ? "#2D5016" : "rgba(45,80,22,0.25)"}`,
                  padding: "7px 16px",
                  borderRadius: "50px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: "#8B5E3C", fontSize: "0.85rem", marginBottom: "20px" }}>
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Product Grid */}
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
              {/* Image */}
              <div style={{ position: "relative", height: "220px", flexShrink: 0, overflow: "hidden" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  className="group-hover:scale-105"
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,48,9,0.5) 0%, transparent 50%)" }} />
                {product.badge && (
                  <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "#D4A017", color: "#1A3009", fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: "50px", letterSpacing: "0.05em" }}>
                    {product.badge}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: "12px", left: "16px" }}>
                  <p style={{ color: "#D4A017", fontSize: "0.7rem", letterSpacing: "0.1em", margin: 0 }}>{product.category.toUpperCase()}</p>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.05rem", marginBottom: "2px", marginTop: 0, lineHeight: 1.3 }}>
                  {product.name}
                </h3>
                <p style={{ color: "#8B5E3C", fontSize: "0.75rem", fontStyle: "italic", marginBottom: "8px", marginTop: 0 }}>{product.sinhalaName}</p>
                <p style={{ color: "#5C4033", fontSize: "0.82rem", lineHeight: 1.55, marginBottom: "10px", marginTop: 0, flex: 1 }}>
                  {product.description.substring(0, 90)}...
                </p>

                {/* Ingredients */}
                <div className="flex flex-wrap gap-1" style={{ marginBottom: "12px" }}>
                  {product.ingredients.slice(0, 3).map((ing) => (
                    <span key={ing} style={{ backgroundColor: "rgba(45,80,22,0.08)", color: "#2D5016", fontSize: "0.65rem", padding: "3px 7px", borderRadius: "50px", border: "1px solid rgba(45,80,22,0.15)" }}>
                      {ing}
                    </span>
                  ))}
                  {product.ingredients.length > 3 && (
                    <span style={{ color: "#8B5E3C", fontSize: "0.65rem", padding: "3px 5px" }}>+{product.ingredients.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: "auto" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.05rem" }}>{product.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      style={{ backgroundColor: "transparent", color: "#2D5016", padding: "6px 12px", borderRadius: "50px", border: "1px solid #2D5016", fontSize: "0.76rem", cursor: "pointer" }}
                    >
                      Details
                    </button>
                    <Link
                      to="/store-locator"
                      onClick={(e) => e.stopPropagation()}
                      style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "6px 12px", borderRadius: "50px", textDecoration: "none", fontSize: "0.76rem" }}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Leaf size={40} style={{ color: "#A8C580", margin: "0 auto 16px", display: "block" }} />
            <p style={{ color: "#8B5E3C", fontSize: "1rem" }}>No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal — responsive */}
      {selectedProduct && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,48,9,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}
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
            {/* Mobile close bar */}
            <div
              className="flex sm:hidden items-center justify-between px-4 py-3"
              style={{ backgroundColor: "#2D5016", flexShrink: 0 }}
            >
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", margin: 0, fontSize: "0.95rem", lineHeight: 1.2 }}>
                {selectedProduct.name}
              </h2>
              <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", color: "rgba(250,246,238,0.8)", cursor: "pointer", display: "flex", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            {/* Body: side-by-side on sm+, stacked on mobile */}
            <div className="flex flex-col sm:flex-row" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {/* Image panel */}
              <div className="w-full sm:w-[42%] flex-shrink-0 relative" style={{ height: "200px" }} >
                <div className="hidden sm:block absolute inset-0">
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,48,9,0.6) 0%, transparent 40%)" }} />
                  {selectedProduct.badge && (
                    <span style={{ position: "absolute", top: "16px", left: "16px", backgroundColor: "#D4A017", color: "#1A3009", fontSize: "0.7rem", fontWeight: 700, padding: "4px 12px", borderRadius: "50px" }}>
                      {selectedProduct.badge}
                    </span>
                  )}
                  <div style={{ position: "absolute", bottom: "16px", left: "16px" }}>
                    <p style={{ color: "#D4A017", fontSize: "0.7rem", letterSpacing: "0.12em", margin: 0 }}>{selectedProduct.category.toUpperCase()}</p>
                    <p style={{ color: "#FAF6EE", fontStyle: "italic", fontSize: "0.85rem", margin: "2px 0 0" }}>{selectedProduct.sinhalaName}</p>
                  </div>
                </div>
                {/* Mobile image: visible, normal flow */}
                <img
                  className="block sm:hidden"
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", flexShrink: 0 }}
                />
              </div>

              {/* Content panel */}
              <div className="flex-1 flex flex-col overflow-hidden sm:h-auto" style={{ minHeight: 0 }}>
                {/* Sticky header (desktop only) */}
                <div
                  className="hidden sm:block"
                  style={{ padding: "22px 26px 14px", borderBottom: "1px solid rgba(45,80,22,0.1)", position: "sticky", top: 0, backgroundColor: "#FAF6EE", zIndex: 1 }}
                >
                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", margin: "0 0 6px", fontSize: "1.3rem", lineHeight: 1.2 }}>
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.15rem" }}>{selectedProduct.price}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProduct(null)} style={{ backgroundColor: "transparent", color: "#6B4423", padding: "7px 14px", borderRadius: "50px", border: "1px solid #6B4423", fontSize: "0.8rem", cursor: "pointer" }}>
                        Close
                      </button>
                      <Link to="/store-locator" style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "7px 14px", borderRadius: "50px", textDecoration: "none", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
                        Find Store <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  <div style={{ padding: "16px 20px sm:padding-20px-28px", display: "flex", flexDirection: "column", gap: "16px" }}
                    className="px-5 sm:px-7 py-4 sm:py-5"
                  >
                    <p style={{ color: "#5C4033", fontSize: "0.87rem", lineHeight: 1.7, margin: 0 }}>{selectedProduct.description}</p>

                    <div>
                      <p style={{ color: "#2D5016", fontWeight: 600, fontSize: "0.8rem", marginBottom: "8px", marginTop: 0 }}>Key Benefits</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.benefits.map((b) => (
                          <span key={b} style={{ backgroundColor: "rgba(45,80,22,0.1)", color: "#2D5016", fontSize: "0.74rem", padding: "4px 10px", borderRadius: "50px" }}>
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ color: "#2D5016", fontWeight: 600, fontSize: "0.8rem", marginBottom: "6px", marginTop: 0 }}>Ingredients</p>
                      <p style={{ color: "#5C4033", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{selectedProduct.ingredients.join(" · ")}</p>
                    </div>

                    {selectedProduct.howToUse && selectedProduct.howToUse.length > 0 && (
                      <div>
                        <p style={{ color: "#2D5016", fontWeight: 600, fontSize: "0.8rem", marginBottom: "10px", marginTop: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>📖</span> How to Use
                        </p>
                        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {selectedProduct.howToUse.map((step, i) => (
                            <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <span style={{ width: "20px", height: "20px", minWidth: "20px", borderRadius: "50%", backgroundColor: "#D4A017", color: "#1A3009", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
                                {i + 1}
                              </span>
                              <span style={{ color: "#5C4033", fontSize: "0.82rem", lineHeight: 1.55 }}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Mobile action buttons */}
                    <div className="flex sm:hidden gap-3 pt-2">
                      <button onClick={() => setSelectedProduct(null)} style={{ flex: 1, padding: "10px", borderRadius: "50px", border: "1px solid rgba(45,80,22,0.3)", backgroundColor: "transparent", color: "#6B4423", fontSize: "0.85rem", cursor: "pointer" }}>
                        Close
                      </button>
                      <Link to="/store-locator" style={{ flex: 1, padding: "10px", borderRadius: "50px", backgroundColor: "#2D5016", color: "#FAF6EE", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                        Find Store <ChevronRight size={13} />
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
