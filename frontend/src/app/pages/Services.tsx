import axios from "axios";
import { ArrowRight, Check, Clock3, Leaf, MapPin, Phone, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Service } from "../interfaces/serviceInterface";
import "./Services.css";
import { localized, useLanguage } from "../i18n/LanguageContext";
import { servicesCopy } from "../i18n/translations/services";

const sampleImages = [
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=1200&q=85",
];
const sampleHeroImage = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2200&q=90";
// Public CC0 sample video. Replace with the final Rajapura treatment video later.
const experienceVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";


export default function Services() {
  const { language, t } = useLanguage();
  const c = servicesCopy[language];
  const [locations, setLocations] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL + `/user/services?lang=${language}`);
        const data = response.data;
        const list = Array.isArray(data) ? data : data?.services ?? data?.data ?? data?.items ?? [];
        setLocations(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [language]);

  const featuredServices = useMemo(() => {
    const allServices = locations.flatMap((location) =>
      location.services.map((service) => ({ ...service, location })));
    const selectedServices = allServices.filter((service) => service.showInShowcase);
    return (selectedServices.length > 0 ? selectedServices : allServices).slice(0, 6);
  }, [locations]);
  const uploadedCentreImage = locations.find((location) => location.imageUrl)?.imageUrl;
  const uploadedExperienceVideo = locations.find((location) => location.videoUrl)?.videoUrl;
  const scrollToLocations = () => document.getElementById("wellness-centres")?.scrollIntoView({ behavior: "smooth" });

  return <main className="services-page">
    <section className="services-hero" style={{ backgroundImage: `url("${uploadedCentreImage || sampleHeroImage}")` }}>
      <div className="services-hero__shade" />
      <div className="services-hero__content">
        <span className="services-eyebrow"><Leaf size={15} /> {c.eyebrow}</span>
        <h1>{t("servicesTitle")}</h1>
        <p>{t("servicesDescription")}</p>
        <div className="services-hero__actions">
          <button className="service-button service-button--gold" onClick={scrollToLocations}>{t("viewTreatments")} <ArrowRight size={17} /></button>
          <button className="service-button service-button--glass" onClick={scrollToLocations}><Phone size={16} /> {t("bookVisit")}</button>
        </div>
      </div>
      <div className="services-hero__trust">
        <span><ShieldCheck size={18} /> {c.certified}</span><span><Leaf size={18} /> {c.natural}</span><span><Sparkles size={18} /> {c.personal}</span>
      </div>
    </section>

    <section className="services-intro">
      <div><span className="services-kicker">{c.approach}</span><h2>{c.whole}</h2></div>
      <p>{c.intro}</p>
    </section>

    {!loading && featuredServices.length > 0 && <section className="treatment-showcase" aria-label={c.featured}>
      <div className="treatment-grid">{featuredServices.map((service, index) => <article className="treatment-card" key={`${service.location.id}-${service.id}`}>
        <img src={service.imageUrl || sampleImages[index % sampleImages.length]} alt={`${localized(service.translations?.name, language, service.name)} ${c.treatmentAlt}`} />
        <div className="treatment-card__overlay" /><div className="treatment-card__content"><span className="treatment-card__icon">{service.icon || "✦"}</span><div><h3>{localized(service.translations?.name, language, service.name)}</h3><p>{localized(service.translations?.description, language, service.description)}</p><span className="treatment-card__meta"><Clock3 size={13} /> {localized(service.translations?.duration, language, service.duration)}</span></div></div>
      </article>)}</div>
    </section>}

    <section className="experience-section">
      <div className="experience-video"><video key={uploadedExperienceVideo || experienceVideo} controls playsInline preload="metadata" poster={uploadedCentreImage || sampleImages[3]}><source src={uploadedExperienceVideo || experienceVideo} /></video><div className="experience-video__label"><Play size={14} fill="currentColor" /> {c.glimpse}</div></div>
      <div className="experience-copy"><span className="services-kicker services-kicker--light">{c.experience}</span><h2>{c.restore}</h2><p>{c.aroma}</p><ul><li><Check size={16} /> {c.assessment}</li><li><Check size={16} /> {c.tailored}</li><li><Check size={16} /> {c.aftercare}</li></ul></div>
    </section>

    <section className="locations-section" id="wellness-centres">
      <div className="section-heading"><span className="services-kicker">{c.visit}</span><h2>{c.choose}</h2><p>{c.appointment}</p></div>
      {loading && <div className="services-loader" aria-label={c.loading} />}
      {!loading && locations.length === 0 && <div className="services-empty"><Leaf size={42} /><h3>{c.emptyTitle}</h3><p>{c.emptyText}</p></div>}
      {!loading && locations.length > 0 && <div className="location-grid">{locations.map((location, locationIndex) => <article className="location-card" key={location.id}>
        <div className="location-card__image"><img src={location.imageUrl || sampleImages[(locationIndex + 2) % sampleImages.length]} alt={`${localized(location.translations?.area, language, location.area)} ${c.centreAlt}`} /><span>{localized(location.translations?.mapLabel, language, location.mapLabel || `${location.area} centre`)}</span></div>
        <div className="location-card__body">
          <div className="location-card__title"><span>{location.icon}</span><div><small>{c.centre}</small><h3>{localized(location.translations?.name, language, location.name)}</h3></div></div>
          <p className="location-description">{localized(location.translations?.description, language, location.description)}</p><div className="location-address"><MapPin size={17} /><span>{localized(location.translations?.address, language, location.address)}</span></div>
          <div className="location-services"><span>{c.available}</span>{location.services.map((service) => <div key={service.id}><p>{localized(service.translations?.name, language, service.name)}</p><small><Clock3 size={12} /> {localized(service.translations?.duration, language, service.duration)}</small></div>)}</div>
          <div className="location-card__actions"><a className="service-button service-button--green" href={`tel:${location.mobile}`}><Phone size={16} /> {c.call} {location.mobile}</a>{location.altMobile?.trim() && <a href={`tel:${location.altMobile}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#66746b", fontSize: ".73rem", textDecoration: "none", padding: "8px 0" }}><Phone size={14} /> {c.alternate} {location.altMobile}</a>}</div>
        </div>
      </article>)}</div>}
    </section>

    {!loading && locations.length > 0 && <section className="booking-banner"><div><span className="services-kicker services-kicker--light">{c.begin}</span><h2>{c.unsure}</h2><p>{c.guidance}</p></div><a className="service-button service-button--gold" href={`tel:${locations[0].mobile}`}><Phone size={17} /> {c.talk}</a></section>}
  </main>;
}
