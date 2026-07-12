import { useRef, useState, type PointerEvent } from "react";
import { Leaf, Award, Globe, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "react-router";
import CompanyLogo from "/CompanyLogo.jpg";

const milestones = [
  { year: "1826", title: "Founded in Nuwara Eliya", desc: "Vaidya Rajapura Senanayake establishes the first herbal preparation centre in the highlands of Sri Lanka." },
  { year: "1912", title: "Royal Recognition", desc: "Awarded the Ceylon Governor's Certificate of Excellence for outstanding contributions to traditional medicine." },
  { year: "1965", title: "National Expansion", desc: "Rajapura products become available across all provinces of Sri Lanka through authorized distributors." },
  { year: "2001", title: "Ayurveda Board Certification", desc: "Certified by the Department of Ayurveda, Government of Sri Lanka, for GMP-compliant manufacturing." },
  { year: "2015", title: "Organic Certification", desc: "Achieved ISO organic certification for all product lines, confirming zero artificial additives." },
  { year: "2024", title: "Digital Reach", desc: "Launching our digital presence to connect more Sri Lankans with authentic Ayurvedic heritage." },
];

const productCertifications = [
  {
    name: "Industrial Technology Institute",
    issuer: "Certification of Industrial Technology Institute",
    image: "/certifications/industrial-technology-institute.jpg",
  },
  {
    name: "ISO 9001 Certified",
    issuer: "Quality management certification",
    image: "/certifications/iso-9001.jpg",
  },
  {
    name: "Department of Ayurveda",
    issuer: "Department of Ayurveda, Sri Lanka",
    image: "/certifications/department-ayurveda.jpg",
  },
  {
    name: "GMP Certified",
    issuer: "Good Manufacturing Practice",
    image: "/certifications/gmp.jpg",
  },
  {
    name: "Halalan Taiyiban",
    issuer: "The Halal Chain",
    image: "/certifications/halalan-taiyiban.jpg",
  },
  {
    name: "Halal Certified",
    issuer: "Halal food certification",
    image: "/certifications/halal-certified.jpg",
  },
  {
    name: "Ministry of Health Malaysia",
    issuer: "Malaysia health authority recognition",
    image: "/certifications/ministry-health-malaysia.jpg",
  },
  {
    name: "Ministry of Health Indonesia",
    issuer: "Kementerian Kesehatan Republik Indonesia",
    image: "/certifications/ministry-health-indonesia.jpg",
  },
];

const team = [
  { name: "Dr. Arjuna Rajapura", title: "Chief Ayurvedic Physician", desc: "7th generation heir to the Rajapura lineage, with a PhD in Ayurvedic Medicine from Kelaniya University." },
  { name: "Ms. Nilmini Perera", title: "Head of Formulations", desc: "25 years experience in botanical extraction and standardization of herbal active compounds." },
  { name: "Mr. Chaminda Silva", title: "Quality Assurance Director", desc: "Ensures every batch meets the highest standards of purity, potency, and safety." },
];

const branches = [
  {
    country: "Sri Lanka",
    company: "Rajapura Herbal Drugs co.(Pvt) ltd",
    status: "Mother Company",
    lat: 7.8731,
    lon: 80.7718,
    type: "active",
  },
  {
    country: "Malaysia",
    company: "Rajapura Herbal Malaya Sdn. Bhd.",
    status: "Branch",
    lat: 4.2105,
    lon: 101.9758,
    type: "active",
  },
  {
    country: "Indonesia",
    company: "Rajapura Herbal",
    status: "Branch",
    lat: -0.7893,
    lon: 113.9213,
    type: "active",
  },
  {
    country: "Germany",
    company: "Rajapura Herbal",
    status: "Ongoing",
    lat: 51.1657,
    lon: 10.4515,
    type: "ongoing",
  },
  {
    country: "Russia",
    company: "Rajapura Herbal",
    status: "Ongoing",
    lat: 61.524,
    lon: 105.3188,
    type: "ongoing",
  },
  {
    country: "Singapore",
    company: "Rajapura Herbal",
    status: "Ongoing",
    lat: 1.3521,
    lon: 103.8198,
    type: "ongoing",
  },
];

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
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const dragStartRef = useRef({ pointerId: 0, x: 0, y: 0, panX: 0, panY: 0 });

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
            <span style={{ color: "#D4A017", fontSize: "0.72rem", letterSpacing: "0.2em" }}>OUR HERITAGE</span>
            <Leaf size={14} style={{ color: "#D4A017" }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.8rem, 5vw, 3rem)", margin: 0 }}>
            About Rajapura
          </h1>
          <p style={{ color: "#A8C580", marginTop: "12px", maxWidth: "480px", margin: "12px auto 0", lineHeight: 1.7, fontSize: "0.9rem" }}>
            Rajapura Herbal Drugs Co. (Pvt) Ltd is one of Sri Lanka’s leading manufacturers and distributors of high-quality herbal medical products. The company operates as a legally registered limited liability company under the laws and regulations of the Government of Sri Lanka.          </p>
        </div>
      </div>
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-20">


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 mb-14 sm:mb-16">
          {[
            { icon: Leaf, title: "Our Mission", text: "To preserve and share the authentic healing traditions of Sri Lankan Ayurveda, making pure herbal wellness accessible to all." },
            { icon: Award, title: "Our Vision", text: "To be the most trusted guardian of traditional herbal medicine, bridging ancient wisdom with modern wellness needs." },
            { icon: Globe, title: "Our Values", text: "Purity, sustainability, authenticity, and deep respect for nature and the traditional knowledge of our ancestors." },
          ].map(({ icon: Icon, title, text }) => (
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
            {/* <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>About The Company</span> */}
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "8px", marginBottom: "18px" }}>
              About The
              <span style={{ fontStyle: "italic", color: "#8B5E3C" }}> Company</span>
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              RajapuraHerbal  Drugs co.(pvt)  ltd, is the  leading
              manufacturing   and   distributing   of   herbal   medical
              products  in  the  huge  of the  Sri Lankan market  and  the
              registered  as  the   legal   limited  company  under  the  law of
              government of Sri Lanka.
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Dr. SumithRajapura is The founder of RajapuraHerbal Drugs co.(pvt) ltd,
              and  also this  is the traditional  herbal  treatments  system develop  with
              experiences, knowledge, graduated as Ayurveda treatments and practice from
              his  family  history of  more  than 100 years  ago, many of  patients  of Sri Lanka.
              Asthma, Gastritis and Arthritis use these treatments and 100% undergone only by
              RajapuraHerbal Medical treatments.
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, fontSize: "0.95rem" }}>
              Sri Lanka is a country rich of heritage, one of which is its indigenous system of Medicine,
              which has been practiced by the people since time immemorial. The Ayurveda system of
              medicine from North India, the Siddha system of medicine from South India and the Unani
              system of medicine of Arabs enriched with contributions from the traditional system of
              medicine called DESHEEYA CHIKITHSA is popularly known as the Indigenous system of
              medicine in Sri Lanka.
            </p>
          </div>
          <div className="order-1 lg:order-1">
            <img
              // src="https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBtZWRpY2luZSUyMGdyZWVuJTIwbGVhdmVzJTIwb3JnYW5pY3xlbnwxfHx8fDE3NzIwMzUxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              src={CompanyLogo}
              alt="Herbal leaves"
              style={{ width: "100%", height: "clamp(280px, 40vw, 460px)", objectFit: "cover", borderRadius: "20px", boxShadow: "0 20px 60px rgba(45,80,22,0.15)", display: "block" }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-20">
          <div className="order-2 lg:order-1">
            {/* <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Founder's Story</span> */}
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "8px", marginBottom: "18px" }}>
              Founder's Story<br />
              <span style={{ fontStyle: "italic", color: "#8B5E3C" }}>The Story of Dr. Rajapura</span>
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Dr. Sumith Rajapura is The founder of Rajapura Herbel Drugs co.(pvt) Itd, and also this is
              the traditional herbal treatments system develop with experiences, knowledge,
              graduated as Ayurveda treatments and practice from his family history of more than
              100 years ago, many of the patients of Sri Lanka Asthma, Gastritis, and Arthritis use
              these treatments and 100% undergone only Rajapura Herbal Medical treatments.            </p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              He watched his grandfather heal villagers using nothing but nature and deep empathy. This sparked a lifelong calling to preserve Sri Lanka's authentic herbal heritage.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>The Vision</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              To provide the quality treatments to
              our esteemed customers with the
              herb.
            </p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Determined to offer a holistic alternative, he founded Rajapura Herbal. His mission was simple: make time-tested, premium Ayurvedic remedies accessible to the modern world without compromising on purity.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>The Mission</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              By produce and introduce best herbal
              medicine product and keep long-term
              relationship with our customers.
            </p>
            {/* <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              He ensures that plants are harvested at their peak potency according to traditional lunar cycles. Every formulation blends ancient palm-leaf manuscript recipes with rigorous modern quality standards.
            </p> */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "1.1rem", marginTop: "22px", marginBottom: "8px" }}>Our Goals</h3>
            <p style={{ color: "#5C4033", lineHeight: 1.8, fontSize: "0.95rem" }}>
              Be a leader of the herbal medicine product
              manufacturing and distributing.
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
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Our Journey</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              Key Milestones
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {milestones.map((m) => (
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
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Product Assurance</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              Product Certifications
            </h2>
            <p style={{ color: "#5C4033", maxWidth: "620px", margin: "12px auto 0", lineHeight: 1.8, fontSize: "0.92rem" }}>
              Recognitions and product quality marks that support our commitment to trusted herbal wellness.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productCertifications.map((cert) => (
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
                  <img src={cert.image} alt={cert.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
                </div>
                <div className="flex items-center justify-center gap-1.5" style={{ color: "#2D5016", marginBottom: "6px" }}>
                  <ShieldCheck size={15} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.98rem", margin: 0 }}>{cert.name}</h3>
                </div>
                <p style={{ color: "#5C4033", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>


        <div>
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Our People</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              Meet the Team
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                style={{
                  backgroundColor: "#FAF6EE",
                  border: "1px solid rgba(139,195,74,0.25)",
                  borderRadius: "20px",
                  padding: "28px 22px",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
                }}
              >
                <div style={{ width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#2D5016", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "1.8rem", color: "#8BC34A" }}>
                  {member.name.charAt(member.name.indexOf(" ") + 1)}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "4px", fontSize: "1rem" }}>{member.name}</h3>
                <p style={{ color: "#D4A017", fontSize: "0.78rem", marginBottom: "10px", letterSpacing: "0.05em" }}>{member.title}</p>
                <p style={{ color: "#5C4033", fontSize: "0.84rem", lineHeight: 1.7, margin: 0 }}>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 sm:mt-20">
          <div className="text-center mb-10 sm:mb-12">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Global Network</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginTop: "8px" }}>
              Company Branches
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
                aria-label="Interactive company branches map"
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
                              {branch.status}
                            </span>
                            <strong style={{ display: "block", color: "#2D5016", fontFamily: "'Playfair Display', serif", fontSize: "0.98rem", marginTop: "3px", marginBottom: "2px" }}>
                              {branch.country}
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
                          aria-label={`${branch.company}, ${branch.country}`}
                          title={`${branch.company} - ${branch.country}`}
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
          Experience the Rajapura Difference
        </h2>
        <p style={{ color: "#5C4033", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.8, fontSize: "0.95rem" }}>
          Explore our full range of authentic Ayurvedic products and find a store near you.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link to="/products" style={{ backgroundColor: "#2D5016", color: "#FAF6EE", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "0.9rem" }}>
            View Our Products
          </Link>
          <Link to="/store-locator" style={{ backgroundColor: "transparent", color: "#2D5016", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "0.9rem", border: "1px solid #2D5016" }}>
            Find a Store
          </Link>
        </div>
      </section>
    </div>
  );
}
