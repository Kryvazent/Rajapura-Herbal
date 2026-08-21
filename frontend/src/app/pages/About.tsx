import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Leaf, Award, Globe, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "react-router";
import CompanyLogo from "/CompanyLogo.jpg";
import axios from "axios";
import { LocalizedText, localized, useLanguage } from "../i18n/LanguageContext";
import { aboutCopy, branches, certificationNames, productCertifications } from "../i18n/translations/about";

interface TeamMember { _id: string; name: string; title: string; description: string; imageUrl?: string; translations?: { name?: LocalizedText; title?: LocalizedText; description?: LocalizedText } }

const mapZoom = 2;
const mapTiles = Array.from({ length: 4 }, (_, y) =>
  Array.from({ length: 4 }, (_, x) => ({ x, y }))
).flat();

function mercatorY(lat: number) {
  const radians = (Math.min(Math.max(lat, -85), 85) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function getMapPosition(lat: number, lon: number) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((1 - mercatorY(lat) / Math.PI) / 2) * 100;

  return { x, y };
}

export default function About() {
  const { language, t } = useLanguage();
  const c = aboutCopy[language];
  const cards = [Leaf, Award, Globe].map((icon, index) => ({ icon, ...c.cards[index] }));
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const dragStartRef = useRef({ pointerId: 0, x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    setTeam([]);
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/team?lang=${language}`)
      .then((response) => setTeam(Array.isArray(response.data?.data) ? response.data.data : []))
      .catch(() => setTeam([]));
  }, [language]);

  function handleMapPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: mapPan.x,
      panY: mapPan.y,
    };
    setIsMapDragging(true);
  }

  function handleMapPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isMapDragging || dragStartRef.current.pointerId !== event.pointerId) {
      return;
    }

    setMapPan({
      x: dragStartRef.current.panX + event.clientX - dragStartRef.current.x,
      y: dragStartRef.current.panY + event.clientY - dragStartRef.current.y,
    });
  }

  function handleMapPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current.pointerId === event.pointerId) {
      setIsMapDragging(false);
    }
  }

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>

      <div
        style={{
          background: "linear-gradient(135deg, #1A3009, #2D5016)",
          padding: "clamp(40px, 8vw, 60px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,195,74,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf size={14} style={{ color: "#D4A017" }} />
            <span style={{ color: "#D4A017", fontSize: "0.72rem", letterSpacing: "0.2em" }}>{c.eyebrow.toUpperCase()}</span>
            <Leaf size={14} style={{ color: "#D4A017" }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.8rem, 5vw, 3rem)", margin: 0 }}>
            {t("aboutTitle")}
          </h1>
          <p style={{ color: "#A8C580", marginTop: "12px", maxWidth: "480px", margin: "12px auto 0", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {t("aboutDescription")}</p>
        </div>
      </div>
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-20">


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 mb-14 sm:mb-16">
          {cards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              style={{
                backgroundColor: "#FAF6EE",
                border: "1px solid rgba(45,80,22,0.2)",
                borderRadius: "20px",
                padding: "28px 24px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
              }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#2D5016", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <Icon size={24} style={{ color: "#8BC34A" }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "10px" }}>{title}</h3>
              <p style={{ color: "#5C4033", fontSize: "0.88rem", lineHeight: 1.8, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>


        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-20">
          <div className="order-2 lg:order-2">
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "8px", marginBottom: "18px" }}>
              {c.companyTitle}
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              {c.company[0]}
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              {c.company[1]}
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, fontSize: "0.95rem" }}>
              {c.company[2]}
            </p>
          </div>
          <div className="order-1 lg:order-1">
            <img
              // src="https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBtZWRpY2luZSUyMGdyZWVuJTIwbGVhdmVzJTIwb3JnYW5pY3xlbnwxfHx8fDE3NzIwMzUxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              src={CompanyLogo}
              alt={c.leavesAlt}
              style={{ width: "100%", height: "clamp(280px, 40vw, 460px)", objectFit: "cover", borderRadius: "20px", boxShadow: "0 20px 60px rgba(45,80,22,0.15)", display: "block" }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-20">
          <div className="order-2 lg:order-1">
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "8px", marginBottom: "18px" }}>
              {c.founderTitle}<br />
              <span style={{ fontStyle: "italic", color: "#8B5E3C" }}>{c.founderSubtitle}</span>
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              {c.founder}</p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              He watched his grandfather heal villagers using nothing but nature and deep empathy. This sparked a lifelong calling to preserve Sri Lanka's authentic herbal heritage.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>{c.vision}</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              {c.visionText}
            </p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Determined to offer a holistic alternative, he founded Rajapura Herbal. His mission was simple: make time-tested, premium Ayurvedic remedies accessible to the modern world without compromising on purity.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>{c.mission}</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              {c.missionText}
            </p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              He ensures that plants are harvested at their peak potency according to traditional lunar cycles. Every formulation blends ancient palm-leaf manuscript recipes with rigorous modern quality standards.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>{c.goals}</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, fontSize: "0.95rem" }}>
              {c.goalsText}
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="/dr-rajapura.png"
              alt="Dr. Rajapura"
              style={{ width: "100%", height: "clamp(360px, 52vw, 640px)", objectFit: "cover", objectPosition: "center", borderRadius: "20px", boxShadow: "0 20px 60px rgba(45,80,22,0.15)", display: "block" }}
            />
          </div>
        </div>


        <div className="mb-14 sm:mb-20">
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>{c.journey}</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              {c.milestonesTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {c.milestones.map((m) => (
              <div
                key={m.year}
                style={{
                  backgroundColor: "#FAF6EE",
                  border: "1px solid rgba(139,195,74,0.25)",
                  borderRadius: "16px",
                  padding: "22px 20px",
                  boxShadow: "0 4px 16px rgba(45,80,22,0.06)",
                }}
              >
                <div style={{ display: "inline-block", backgroundColor: "#2D5016", color: "#D4A017", fontFamily: "'Cinzel', serif", fontSize: "0.95rem", padding: "4px 16px", borderRadius: "50px", marginBottom: "10px" }}>
                  {m.year}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "0.98rem", marginBottom: "8px" }}>{m.title}</h3>
                <p style={{ color: "#5C4033", fontSize: "0.84rem", lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14 sm:mb-20">
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>{c.assurance}</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              {c.certifications}
            </h2>
            <p style={{ color: "#5C4033", maxWidth: "620px", margin: "12px auto 0", lineHeight: 1.8, fontSize: "0.92rem" }}>
              {c.certificationText}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productCertifications.map((cert, index) => (
              <div
                key={cert.name}
                style={{
                  backgroundColor: "#FAF6EE",
                  border: "1px solid rgba(139,195,74,0.25)",
                  borderRadius: "16px",
                  padding: "18px 14px",
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(45,80,22,0.06)",
                  minHeight: "210px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "104px", height: "104px", borderRadius: "14px", backgroundColor: "#FFFFFF", border: "1px solid rgba(45,80,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", marginBottom: "14px" }}>
                  <img src={cert.image} alt={certificationNames[language][index]} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
                </div>
                <div className="flex items-center justify-center gap-1.5" style={{ color: "#2D5016", marginBottom: "6px" }}>
                  <ShieldCheck size={15} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.98rem", margin: 0 }}>{certificationNames[language][index]}</h3>
                </div>
                <p style={{ color: "#5C4033", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>{c.issuers[index]}</p>
              </div>
            ))}
          </div>
        </div>


        {team.length > 0 && <div>
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>{c.people}</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              {c.team}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {team.map((member) => (
              <div
                key={member._id}
                style={{
                  backgroundColor: "#FAF6EE",
                  border: "1px solid rgba(139,195,74,0.25)",
                  borderRadius: "20px",
                  padding: "28px 22px",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                }}
              >
                {member.imageUrl ? <img src={member.imageUrl} alt={localized(member.translations?.name, language, member.name)} style={{ width: "86px", height: "86px", borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 14px" }} /> : <div style={{ width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#2D5016", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "1.8rem", color: "#8BC34A" }}>{localized(member.translations?.name, language, member.name).charAt(0)}</div>}
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "4px", fontSize: "1rem" }}>{localized(member.translations?.name, language, member.name)}</h3>
                <p style={{ color: "#D4A017", fontSize: "0.78rem", marginBottom: "10px", letterSpacing: "0.05em" }}>{localized(member.translations?.title, language, member.title)}</p>
                <p style={{ color: "#5C4033", fontSize: "0.84rem", lineHeight: 1.7, margin: 0 }}>{localized(member.translations?.description, language, member.description)}</p>
              </div>
            ))}
          </div>
        </div>}

        <div className="mt-14 sm:mt-20">
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>{c.network}</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              {c.branches}
            </h2>
          </div>

          <div>
            <div
              style={{
                backgroundColor: "#FAF6EE",
                border: "1px solid rgba(139,195,74,0.25)",
                borderRadius: "20px",
                padding: "clamp(18px, 3vw, 28px)",
                boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                aria-label={c.map}
                onPointerDown={handleMapPointerDown}
                onPointerMove={handleMapPointerMove}
                onPointerUp={handleMapPointerUp}
                onPointerCancel={handleMapPointerUp}
                style={{
                  position: "relative",
                  minHeight: "clamp(340px, 48vw, 520px)",
                  borderRadius: "16px",
                  backgroundColor: "#DDE9ED",
                  border: "1px solid rgba(45,80,22,0.12)",
                  overflow: "hidden",
                  cursor: isMapDragging ? "grabbing" : "grab",
                  touchAction: "none",
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "min(980px, 128%)",
                    aspectRatio: "1 / 1",
                    transform: `translate(calc(-50% + ${mapPan.x}px), calc(-50% + ${mapPan.y}px))`,
                    transformOrigin: "center",
                    filter: "saturate(0.9) contrast(0.95)",
                    transition: isMapDragging ? "none" : "transform 120ms ease",
                  }}
                >
                  {mapTiles.map((tile) => (
                    <img
                      key={`${tile.x}-${tile.y}`}
                      src={`https://tile.openstreetmap.org/${mapZoom}/${tile.x}/${tile.y}.png`}
                      alt=""
                      draggable={false}
                      style={{
                        position: "absolute",
                        left: `${tile.x * 25}%`,
                        top: `${tile.y * 25}%`,
                        width: "25%",
                        height: "25%",
                        display: "block",
                      }}
                    />
                  ))}

                  {branches.map((branch) => {
                    const isSelected = selectedBranch.country === branch.country;
                    const isActive = branch.type === "active";
                    const position = getMapPosition(branch.lat, branch.lon);

                    return (
                      <div
                        key={branch.country}
                        style={{
                          position: "absolute",
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: "36px",
                              transform: "translateX(-50%)",
                              width: "max-content",
                              maxWidth: "220px",
                              backgroundColor: "rgba(250,246,238,0.96)",
                              border: "1px solid rgba(45,80,22,0.18)",
                              borderRadius: "12px",
                              padding: "10px 12px",
                              boxShadow: "0 10px 26px rgba(45,80,22,0.18)",
                              pointerEvents: "none",
                              textAlign: "center",
                            }}
                          >
                            <span style={{ color: isActive ? "#D82920" : "#D4A017", fontSize: "0.64rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                              {c.statuses[branch.status as keyof typeof c.statuses]}
                            </span>
                            <strong style={{ display: "block", color: "#2D5016", fontFamily: "'Playfair Display', serif", fontSize: "0.98rem", marginTop: "3px", marginBottom: "2px" }}>
                              {c.countries[branch.country as keyof typeof c.countries]}
                            </strong>
                            <span style={{ display: "block", color: "#5C4033", fontSize: "0.74rem", lineHeight: 1.35 }}>
                              {branch.company}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedBranch(branch)}
                          onMouseEnter={() => setSelectedBranch(branch)}
                          onFocus={() => setSelectedBranch(branch)}
                          onPointerDown={(event) => event.stopPropagation()}
                          aria-pressed={isSelected}
                          aria-label={`${branch.company}, ${c.countries[branch.country as keyof typeof c.countries]}`}
                          title={`${branch.company} - ${c.countries[branch.country as keyof typeof c.countries]}`}
                          style={{
                            width: isSelected ? "34px" : "28px",
                            height: isSelected ? "34px" : "28px",
                            borderRadius: "50%",
                            border: `3px solid ${isSelected ? "#2D5016" : "#FAF6EE"}`,
                            backgroundColor: isActive ? "#D82920" : "#D4A017",
                            boxShadow: isSelected ? "0 0 0 8px rgba(139,195,74,0.18)" : "0 5px 14px rgba(45,80,22,0.2)",
                            cursor: "pointer",
                            transition: "width 180ms ease, height 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                            display: "block",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(250,246,238,0.08), rgba(45,80,22,0.06))", pointerEvents: "none" }} />

                <div style={{ position: "absolute", left: "24px", bottom: "24px", display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(250,246,238,0.92)", border: "1px solid rgba(45,80,22,0.12)", borderRadius: "14px", padding: "12px 14px", zIndex: 2 }}>
                  <MapPin size={34} style={{ color: "#D82920" }} />
                  <img src="/logo.png" alt="Rajapura" style={{ width: "116px", height: "auto", display: "block" }} />
                </div>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    position: "absolute",
                    right: "12px",
                    bottom: "10px",
                    backgroundColor: "rgba(250,246,238,0.9)",
                    color: "#5C4033",
                    fontSize: "0.68rem",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    zIndex: 2,
                  }}
                >
                  OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section style={{ backgroundColor: "#F0EAD6", padding: "clamp(40px, 8vw, 60px) 24px", textAlign: "center" }}>
        <Leaf size={32} style={{ color: "#2D5016", margin: "0 auto 16px", display: "block" }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginBottom: "14px" }}>
          {c.cta}
        </h2>
        <p style={{ color: "#5C4033", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.8, fontSize: "0.95rem" }}>
          {c.ctaText}
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link to="/products" style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "0.9rem" }}>
            {c.viewProducts}
          </Link>
          <Link to="/store-locator" style={{ backgroundColor: "transparent", color: "#2D5016", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "0.9rem", border: "1px solid #2D5016" }}>
            {c.findStore}
          </Link>
        </div>
      </section>
    </div>
  );
}
