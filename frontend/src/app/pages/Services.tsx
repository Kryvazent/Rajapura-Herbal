import axios from "axios";
import { ArrowRight, Check, Clock3, Leaf, MapPin, Phone, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Service } from "../interfaces/serviceInterface";
import "./Services.css";

const sampleImages = [
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=1200&q=85",
];
// Public CC0 sample video. Replace with the final Rajapura treatment video later.
const experienceVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const sampleLocations: Service[] = [
  {
    id: -1, name: "Rajapura Ayurvedic Wellness Centre", area: "Colombo",
    address: "Colombo, Sri Lanka", mobile: "+94 77 000 0000", altMobile: "",
    mapLabel: "Colombo centre", icon: "🌿", color: "#173b2a",
    lightColor: "#eef4ed", borderColor: "#d7e2d5",
    description: "A peaceful setting for personalised Ayurvedic therapies, restorative treatments and practical wellness guidance.",
    services: [
      { id: -11, name: "Abhyanga Herbal Oil Massage", description: "A rhythmic full-body treatment using warm herbal oils to encourage deep relaxation.", duration: "60 minutes", icon: "🪷" },
      { id: -12, name: "Shirodhara", description: "A gentle stream of warm herbal oil traditionally used to calm and settle the mind.", duration: "45 minutes", icon: "💧" },
      { id: -13, name: "Herbal Steam Therapy", description: "A soothing herbal steam ritual designed to complement your personalised treatment.", duration: "30 minutes", icon: "🌱" },
    ],
  },
  {
    id: -2, name: "Rajapura Ayurveda Retreat", area: "Wellness Retreat",
    address: "Sri Lanka", mobile: "+94 77 000 0000", altMobile: "",
    mapLabel: "Retreat centre", icon: "✨", color: "#315a3d",
    lightColor: "#f1f5ed", borderColor: "#dce5d8",
    description: "An unhurried Ayurvedic experience combining traditional care, natural preparations and attentive consultation.",
    services: [
      { id: -21, name: "Ayurvedic Consultation", description: "A thoughtful conversation about your constitution, routines and current wellness needs.", duration: "30 minutes", icon: "🌿" },
      { id: -22, name: "Herbal Facial Ritual", description: "A gentle botanical facial treatment prepared with traditional herbal ingredients.", duration: "45 minutes", icon: "🌼" },
      { id: -23, name: "Foot & Head Therapy", description: "A calming focused therapy created to help release everyday tension and fatigue.", duration: "40 minutes", icon: "🫶" },
    ],
  },
];

export default function Services() {
  const [locations, setLocations] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/user/services");
        const data = response.data;
        const list = Array.isArray(data) ? data : data?.services ?? data?.data ?? data?.items ?? [];
        setLocations(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Keep the page useful during local development when the API is offline.
        setLocations(sampleLocations);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredServices = useMemo(() => locations.flatMap((location) =>
    location.services.map((service) => ({ ...service, location }))).slice(0, 6), [locations]);
  const scrollToLocations = () => document.getElementById("wellness-centres")?.scrollIntoView({ behavior: "smooth" });

  return <main className="services-page">
    <section className="services-hero">
      <div className="services-hero__shade" />
      <div className="services-hero__content">
        <span className="services-eyebrow"><Leaf size={15} /> Authentic Ayurvedic care</span>
        <h1>Return to balance,<br /><em>naturally.</em></h1>
        <p>Personalised therapies rooted in generations of Ayurvedic knowledge, delivered by experienced practitioners in a calm, restorative setting.</p>
        <div className="services-hero__actions">
          <button className="service-button service-button--gold" onClick={scrollToLocations}>Explore treatments <ArrowRight size={17} /></button>
          <button className="service-button service-button--glass" onClick={scrollToLocations}><Phone size={16} /> Book a consultation</button>
        </div>
      </div>
      <div className="services-hero__trust">
        <span><ShieldCheck size={18} /> Certified therapists</span><span><Leaf size={18} /> Natural preparations</span><span><Sparkles size={18} /> Personalised care</span>
      </div>
    </section>

    <section className="services-intro">
      <div><span className="services-kicker">Our approach</span><h2>Wellness that treats the whole person</h2></div>
      <p>Every visit begins with understanding you. We combine time-honoured therapies, herbal preparations and attentive guidance to create an experience that feels deeply personal—not one-size-fits-all.</p>
    </section>

    {!loading && featuredServices.length > 0 && <section className="treatment-showcase" aria-label="Featured treatments">
      <div className="treatment-grid">{featuredServices.map((service, index) => <article className="treatment-card" key={`${service.location.id}-${service.id}`}>
        <img src={sampleImages[index % sampleImages.length]} alt={`${service.name} Ayurvedic treatment`} />
        <div className="treatment-card__overlay" /><div className="treatment-card__content"><span className="treatment-card__icon">{service.icon || "✦"}</span><div><h3>{service.name}</h3><p>{service.description}</p><span className="treatment-card__meta"><Clock3 size={13} /> {service.duration}</span></div></div>
      </article>)}</div>
    </section>}

    <section className="experience-section">
      <div className="experience-video"><video controls playsInline preload="metadata" poster={sampleImages[3]}><source src={experienceVideo} type="video/mp4" /></video><div className="experience-video__label"><Play size={14} fill="currentColor" /> A glimpse inside our wellness experience</div></div>
      <div className="experience-copy"><span className="services-kicker services-kicker--light">The Rajapura experience</span><h2>Slow down. Breathe deeply. Let nature restore you.</h2><p>From the aroma of freshly prepared herbal oils to the calm attention of your therapist, every detail is designed to help you feel at ease.</p><ul><li><Check size={16} /> Short dosha and wellness assessment</li><li><Check size={16} /> Treatment tailored to your present needs</li><li><Check size={16} /> Simple aftercare guidance to take home</li></ul></div>
    </section>

    <section className="locations-section" id="wellness-centres">
      <div className="section-heading"><span className="services-kicker">Visit us</span><h2>Choose your wellness centre</h2><p>Appointments are recommended. Call your preferred centre and our team will help you select the right therapy.</p></div>
      {loading && <div className="services-loader" aria-label="Loading services" />}
      {!loading && locations.length === 0 && <div className="services-empty"><Leaf size={42} /><h3>Our treatment menu is being refreshed</h3><p>Please check back soon or contact us for current availability.</p></div>}
      {!loading && locations.length > 0 && <div className="location-grid">{locations.map((location, locationIndex) => <article className="location-card" key={location.id}>
        <div className="location-card__image"><img src={sampleImages[(locationIndex + 2) % sampleImages.length]} alt={`${location.area} Ayurvedic wellness centre`} /><span>{location.mapLabel || `${location.area} centre`}</span></div>
        <div className="location-card__body">
          <div className="location-card__title"><span>{location.icon}</span><div><small>Rajapura wellness centre</small><h3>{location.name}</h3></div></div>
          <p className="location-description">{location.description}</p><div className="location-address"><MapPin size={17} /><span>{location.address}</span></div>
          <div className="location-services"><span>Available here</span>{location.services.slice(0, 4).map((service) => <div key={service.id}><p>{service.name}</p><small><Clock3 size={12} /> {service.duration}</small></div>)}{location.services.length > 4 && <em>+{location.services.length - 4} more treatments</em>}</div>
          <div className="location-card__actions"><a className="service-button service-button--green" href={`tel:${location.mobile}`}><Phone size={16} /> Call {location.mobile}</a>{location.altMobile && <a className="alternate-phone" href={`tel:${location.altMobile}`}>Alternate: {location.altMobile}</a>}</div>
        </div>
      </article>)}</div>}
    </section>

    {!loading && locations.length > 0 && <section className="booking-banner"><div><span className="services-kicker services-kicker--light">Begin your journey</span><h2>Not sure which treatment is right for you?</h2><p>Speak with our team for friendly guidance before you book.</p></div><a className="service-button service-button--gold" href={`tel:${locations[0].mobile}`}><Phone size={17} /> Talk to our team</a></section>}
  </main>;
}
