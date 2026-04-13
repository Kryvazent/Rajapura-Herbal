import { Link } from "react-router";
import { Leaf, Shield, Heart, Star, ChevronRight, Flower, Droplets } from "lucide-react";
// import { getProducts } from "../admin/adminData";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/index.css";
import { Product } from "../interfaces/productInterface";

const stats = [
  { value: "200+", label: "Years of Heritage" },
  { value: "48", label: "Herbal Ingredients" },
  { value: "9", label: "Provinces Served" },
  { value: "100%", label: "Natural & Pure" },
];

const values = [
  {
    icon: Leaf,
    title: "Sustainably Sourced",
    desc: "Every herb is ethically harvested from certified organic farms and pristine Sri Lankan wilderness.",
  },
  {
    icon: Shield,
    title: "Ayurvedic Certified",
    desc: "All formulations are approved by Sri Lanka's Department of Ayurveda and traditional physicians.",
  },
  {
    icon: Heart,
    title: "Holistic Wellness",
    desc: "Our products nurture body, mind and spirit following the tridosha principles of Ayurveda.",
  },
  {
    icon: Flower,
    title: "Zero Chemicals",
    desc: "No artificial preservatives, colours, or additives — just pure nature in every product.",
  },
];

export default function Home() {
  const [products,setProducts] = useState<Product[]>([]);

  useEffect(()=>{

    loadData()

  },[]);

  async function loadData(){
    await axios.get(import.meta.env.VITE_BACKEND_URL + "/user/product-count/3")
    .then(res=>{
      console.log(res)
      setProducts(res.data);
    })
    .catch(err=>{
      console.error("Error fetching featured products:", err);
    });
  }

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1A3009 0%, #2D5016 40%, #3D6B1C 100%)",
          position: "relative",
          overflow: "hidden",
        }}
        className="min-h-screen flex items-center"
      >
        {/* Decorative circles – hidden on mobile so they don't cause overflow */}
        <div className="hidden sm:block" style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(139,195,74,0.07)", border: "1px solid rgba(139,195,74,0.12)" }} />
        <div className="hidden sm:block" style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.1)" }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Text */}
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
              <span style={{ color: "#D4A017", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
                AUTHENTIC AYURVEDIC HERITAGE
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
              Nature's Wisdom,
              <br />
              <span style={{ color: "#8BC34A", fontStyle: "italic" }}>Rajapura</span>'s
              <br />
              Pure Heritage
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
              Discover the healing power of authentic Sri Lankan herbs, crafted with two
              centuries of Ayurvedic wisdom. Pure, potent, and prepared with reverence for
              ancient traditions.
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
                Explore Products <ChevronRight size={16} />
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
                Find a Store <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero image – desktop only */}
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
                alt="Herbal medicine"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Floating badge */}
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
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#2D5016", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Droplets size={20} style={{ color: "#FAF6EE" }} />
              </div>
              <div>
                <p style={{ color: "#2D5016", margin: 0, lineHeight: 1.3 }}><strong>100% Pure</strong></p>
                <p style={{ color: "#8B5E3C", fontSize: "0.8rem", margin: 0 }}>No additives or preservatives</p>
              </div>
            </div>
            {/* Stars badge */}
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
                  <Star key={i} size={12} style={{ color: "#1A3009", fill: "#1A3009" }} />
                ))}
              </div>
              <p style={{ color: "#1A3009", fontSize: "0.75rem", margin: "2px 0 0", textAlign: "center" }}>Trusted Since 1826</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ backgroundColor: "#2D5016" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p style={{ fontFamily: "'Playfair Display', serif", color: "#D4A017", fontSize: "clamp(1.5rem, 4vw, 2rem)", margin: 0, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ color: "#A8C580", fontSize: "0.75rem", margin: "4px 0 0", letterSpacing: "0.05em" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1771576774943-3433ed2239f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBoZXJiYWwlMjBwcm9kdWN0cyUyMGJvdHRsZXMlMjBuYXR1cmFsfGVufDF8fHx8MTc3MjAzNTE2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Herbal products"
                style={{
                  width: "100%",
                  height: "clamp(280px, 40vw, 420px)",
                  objectFit: "cover",
                  borderRadius: "20px",
                  boxShadow: "0 20px 60px rgba(45,80,22,0.15)",
                  display: "block",
                }}
              />
              {/* Floating Est. badge — stays inside relative container on all screens */}
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
                <p style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.2rem", margin: 0 }}>
                  Est. 1826
                </p>
                <p style={{ color: "#8B5E3C", fontSize: "0.75rem", margin: 0 }}>Rajapura, Nuwara Eliya</p>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Our Heritage
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
              Two Centuries of
              <br />
              <span style={{ fontStyle: "italic", color: "#8B5E3C" }}>Ayurvedic Wisdom</span>
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Founded in the highlands of Nuwara Eliya in 1826, Rajapura Herbal Company has been the
              guardian of traditional Sri Lankan herbal medicine for nearly two centuries.
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "28px", fontSize: "0.95rem" }}>
              Today, we blend this ancient wisdom with modern quality standards, bringing the healing
              gifts of nature to households across Sri Lanka — always pure, always authentic.
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
              Learn Our Story <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section style={{ backgroundColor: "#F0EAD6" }} className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Why Choose Us
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              The Rajapura Difference
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
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#2D5016", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon size={22} style={{ color: "#8BC34A" }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "10px", fontSize: "1rem" }}>{title}</h3>
                <p style={{ color: "#6B4423", fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Our Collection
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              Featured Products
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
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                backgroundColor: "#FAF6EE",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid rgba(139,195,74,0.25)",
                boxShadow: "0 4px 20px rgba(45,80,22,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              className="group hover:shadow-xl"
            >
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  className="group-hover:scale-105"
                />
                {product.badge && (
                  <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "#D4A017", color: "#1A3009", fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: "50px", letterSpacing: "0.05em" }}>
                    {product.badge}
                  </div>
                )}
              </div>
              <div style={{ padding: "18px 20px" }}>
                <p style={{ color: "#8B5E3C", fontSize: "0.72rem", letterSpacing: "0.1em", marginBottom: "4px" }}>{product.category.toUpperCase()}</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.05rem", marginBottom: "8px" }}>{product.name}</h3>
                <p style={{ color: "#5C4033", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "16px" }}>
                  {product.description.substring(0, 90)}...
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.05rem" }}>{product.price}</span>
                  <Link
                    to="/store-locator"
                    style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "8px 16px", borderRadius: "50px", textDecoration: "none", fontSize: "0.8rem" }}
                  >
                    Find Store
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #2D5016, #4A7C23)",
          padding: "clamp(48px, 8vw, 80px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.07) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(139,195,74,0.07) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>
          <Leaf size={36} style={{ color: "#D4A017", margin: "0 auto 16px", display: "block" }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.5rem, 3vw, 2.4rem)", marginBottom: "14px" }}>
            Find Rajapura Products
            <br />
            <span style={{ fontStyle: "italic", color: "#D4A017" }}>Near You</span>
          </h2>
          <p style={{ color: "#A8C580", lineHeight: 1.8, marginBottom: "28px", fontSize: "0.95rem" }}>
            Available at pharmacies, Ayurvedic stores, and health centres across all 9 provinces of Sri Lanka.
          </p>
          <Link
            to="/store-locator"
            style={{ backgroundColor: "#D4A017", color: "#1A3009", padding: "14px 32px", borderRadius: "50px", textDecoration: "none", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            Use Store Locator <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
