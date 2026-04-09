import { Leaf, Award, Globe } from "lucide-react";
import { Link } from "react-router";

const milestones = [
  { year: "1826", title: "Founded in Nuwara Eliya", desc: "Vaidya Rajapura Senanayake establishes the first herbal preparation centre in the highlands of Sri Lanka." },
  { year: "1912", title: "Royal Recognition", desc: "Awarded the Ceylon Governor's Certificate of Excellence for outstanding contributions to traditional medicine." },
  { year: "1965", title: "National Expansion", desc: "Rajapura products become available across all provinces of Sri Lanka through authorized distributors." },
  { year: "2001", title: "Ayurveda Board Certification", desc: "Certified by the Department of Ayurveda, Government of Sri Lanka, for GMP-compliant manufacturing." },
  { year: "2015", title: "Organic Certification", desc: "Achieved ISO organic certification for all product lines, confirming zero artificial additives." },
  { year: "2024", title: "Digital Reach", desc: "Launching our digital presence to connect more Sri Lankans with authentic Ayurvedic heritage." },
];

const team = [
  { name: "Dr. Arjuna Rajapura", title: "Chief Ayurvedic Physician", desc: "7th generation heir to the Rajapura lineage, with a PhD in Ayurvedic Medicine from Kelaniya University." },
  { name: "Ms. Nilmini Perera", title: "Head of Formulations", desc: "25 years experience in botanical extraction and standardization of herbal active compounds." },
  { name: "Mr. Chaminda Silva", title: "Quality Assurance Director", desc: "Ensures every batch meets the highest standards of purity, potency, and safety." },
];

export default function About() {
  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
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
            Nearly two centuries of healing wisdom, passed down through seven generations of dedicated Ayurvedic physicians.
          </p>
        </div>
      </div>
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-20">

        {/* Mission / Vision / Values */}
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

        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-20">
          <div className="order-2 lg:order-1">
            <span style={{ color: "#8B5E3C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Our Story</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "8px", marginBottom: "18px" }}>
              From the Mountains of<br />
              <span style={{ fontStyle: "italic", color: "#8B5E3C" }}>Nuwara Eliya</span>
            </h2>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Our story begins in 1826, high in the misty highlands of Nuwara Eliya, where Vaidya Rajapura Senanayake — a renowned Ayurvedic physician — began documenting the healing properties of local mountain herbs.
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, marginBottom: "14px", fontSize: "0.95rem" }}>
              Through British colonial rule, independence, and modernization, the Rajapura family kept the flame of traditional Ayurveda alive. Each generation mastered the ancient texts and added their own observations.
            </p>
            <p style={{ color: "#5C4033", lineHeight: 1.8, fontSize: "0.95rem" }}>
              Today, under the guidance of Dr. Arjuna Rajapura — the seventh generation — we combine this timeless wisdom with modern quality standards. Every product is still prepared according to classical methods.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBtZWRpY2luZSUyMGdyZWVuJTIwbGVhdmVzJTIwb3JnYW5pY3xlbnwxfHx8fDE3NzIwMzUxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Herbal leaves"
              style={{ width: "100%", height: "clamp(280px, 40vw, 460px)", objectFit: "cover", borderRadius: "20px", boxShadow: "0 20px 60px rgba(45,80,22,0.15)", display: "block" }}
            />
          </div>
        </div>

        {/* Timeline */}
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

        {/* Team */}
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
      </section>

      {/* CTA */}
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
