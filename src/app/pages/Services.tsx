import { Phone, MapPin, Leaf, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Service } from "../interfaces/serviceInterface";
// import { getServiceLocations } from "../admin/adminData";
import axios from "axios";

export default function Services() {
  // const serviceLocations = getServiceLocations();

  const [service, setService] = useState<Service[]>([]);
  
    useEffect(() => {
  
      loadData()
  
    }, []);
  
    async function loadData(){
      await axios.get("http://localhost:3000/user/services")
        .then(res => {
          setService(res.data);
        })
        .catch(err => {
          console.error("Error fetching featured products:", err);
        })
    }

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
            <span style={{ color: "#D4A017", fontSize: "0.72rem", letterSpacing: "0.2em" }}>AYURVEDIC WELLNESS SERVICES</span>
            <Leaf size={14} style={{ color: "#D4A017" }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.8rem, 5vw, 3rem)", margin: 0 }}>
            Healing Therapies & Treatments
          </h1>
          <p style={{ color: "#A8C580", marginTop: "12px", maxWidth: "560px", margin: "12px auto 0", lineHeight: 1.7, fontSize: "0.9rem" }}>
            Experience authentic Ayurvedic healing at our dedicated wellness centres. All treatments are performed by certified therapists using our own natural herbal preparations.
          </p>
        </div>
      </div>

      {/* Decorative band */}
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      {/* Booking note banner */}
      <div style={{ backgroundColor: "rgba(212,160,23,0.1)", borderBottom: "1px solid rgba(212,160,23,0.25)", padding: "12px 20px", textAlign: "center" }}>
        <p style={{ color: "#6B4A00", fontSize: "0.85rem", margin: 0 }}>
          <strong>📞 Appointments are required.</strong> Please call your preferred centre directly to book a session. Walk-ins are subject to availability.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10 sm:py-14">

        {/* Location Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {service.map((location) => (
            <div
              key={location.id}
              style={{
                backgroundColor: "#FAF6EE",
                borderRadius: "24px",
                overflow: "hidden",
                border: `1px solid ${location.borderColor}`,
                boxShadow: "0 6px 28px rgba(45,80,22,0.08)",
              }}
            >
              {/* Location header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${location.color}, ${location.color}CC)`,
                  padding: "clamp(20px, 4vw, 28px) clamp(20px, 4vw, 32px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "5rem", opacity: 0.12, lineHeight: 1 }}>
                  {location.icon}
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", fontSize: "0.65rem", letterSpacing: "0.15em", padding: "3px 10px", borderRadius: "50px", display: "inline-block", marginBottom: "10px" }}>
                    {location.mapLabel}
                  </span>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.1rem, 3vw, 1.4rem)", margin: "0 0 12px", lineHeight: 1.3 }}>
                    {location.name}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} style={{ color: "rgba(255,255,255,0.75)", flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>{location.address}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Phone size={13} style={{ color: "rgba(255,255,255,0.75)", flexShrink: 0 }} />
                      <a href={`tel:${location.mobile}`} style={{ color: "#FAF6EE", fontSize: "0.95rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>
                        {location.mobile}
                      </a>
                      {location.altMobile && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>· {location.altMobile}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`tel:${location.mobile}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      marginTop: "16px",
                      backgroundColor: "#D4A017",
                      color: "#1A3009",
                      padding: "9px 22px",
                      borderRadius: "50px",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <Phone size={14} /> Call to Book
                  </a>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: "16px 22px", borderBottom: `1px solid ${location.borderColor}`, backgroundColor: location.lightColor }}>
                <p style={{ color: "#5C4033", fontSize: "0.87rem", lineHeight: 1.7, margin: 0 }}>{location.description}</p>
              </div>

              {/* Services header */}
              <div style={{ padding: "14px 20px 4px" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={13} style={{ color: "#D4A017" }} />
                  <p style={{ color: "#2D5016", fontSize: "0.75rem", letterSpacing: "0.1em", margin: 0 }}>AVAILABLE SERVICES</p>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(45,80,22,0.12)" }} />
                  <span style={{ backgroundColor: "rgba(212,160,23,0.12)", color: "#7A5C00", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "50px", whiteSpace: "nowrap" }}>
                    Prices on enquiry
                  </span>
                </div>
              </div>

              {/* Service list */}
              <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {location.services.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      border: `1px solid ${location.borderColor}`,
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "11px",
                        backgroundColor: location.lightColor,
                        border: `1px solid ${location.borderColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                      }}
                    >
                      {service.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 style={{ fontFamily: "'Playfair Display', serif", color: location.color, fontSize: "0.92rem", margin: "0 0 4px", lineHeight: 1.3 }}>
                          {service.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: location.lightColor, padding: "2px 8px", borderRadius: "50px", flexShrink: 0 }}>
                          <Clock size={10} style={{ color: location.color }} />
                          <span style={{ color: location.color, fontSize: "0.66rem", whiteSpace: "nowrap" }}>{service.duration}</span>
                        </div>
                      </div>
                      <p style={{ color: "#5C4033", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom info strip */}
        {service.length > 0 && (
          <div
            style={{
              marginTop: "40px",
              backgroundColor: "rgba(45,80,22,0.06)",
              border: "1px solid rgba(45,80,22,0.15)",
              borderRadius: "20px",
              padding: "clamp(20px, 4vw, 28px) clamp(20px, 4vw, 36px)",
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.05rem", margin: "0 0 6px" }}>
                What to Expect
              </h3>
              <p style={{ color: "#5C4033", fontSize: "0.84rem", lineHeight: 1.7, margin: 0 }}>
                All sessions begin with a short Ayurvedic constitution (dosha) assessment. Please arrive 10 minutes early and avoid heavy meals for at least one hour before your session.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "180px" }}>
              {service.map((loc) => (
                <div key={loc.id}>
                  <p style={{ color: "#8B5E3C", fontSize: "0.68rem", margin: "0 0 2px", letterSpacing: "0.08em" }}>
                    {loc.area.toUpperCase()} CENTRE
                  </p>
                  <a href={`tel:${loc.mobile}`} style={{ color: "#2D5016", fontSize: "1rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={13} /> {loc.mobile}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
