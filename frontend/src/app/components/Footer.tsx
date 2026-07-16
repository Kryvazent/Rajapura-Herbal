import { Link } from "react-router";
import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
} from "lucide-react";
import Logo from "./Logo";
import { LocalizedText, localized, useLanguage } from "../i18n/LanguageContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { footerAddress, footerCopy } from "../i18n/translations/footer";

interface FooterCentre { _id?: string; id?: string | number; area: string; address: string; mobile: string; altMobile?: string; translations?: { area?: LocalizedText; address?: LocalizedText } }


export function Footer() {
  const { language, t } = useLanguage();
  const c = footerCopy[language];
  const [centres, setCentres] = useState<FooterCentre[]>([]);

  useEffect(() => {
    setCentres([]);
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/services?lang=${language}`)
      .then((response) => {
        const data = response.data;
        const list = Array.isArray(data) ? data : data?.services ?? data?.data ?? data?.items ?? [];
        setCentres(Array.isArray(list) ? list : []);
      })
      .catch(() => setCentres([]));
  }, [language]);

  const informationText = [
    {
      address: footerAddress[language],
      email: "rajapurawedamedura@yahoo.com",
      copyright: c.copyright
    }
  ];

  return (
    <footer
      style={{ backgroundColor: "#1A3009", fontFamily: "'Lato', sans-serif" }}
      className="text-white"
    >

      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div
                style={{ backgroundColor: "#8BC34A" }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
              >

                <Logo width={38} height={38} alt={c.logo} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: "#FAF6EE",
                    fontSize: "1rem",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  RAJAPURA
                </p>
                <p
                  style={{
                    color: "#8BC34A",
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    margin: 0,
                  }}
                >
                  {t("companyLabel").toUpperCase()}
                </p>
              </div>
            </div>
            <p style={{ color: "#A8C580", fontSize: "0.9rem", lineHeight: 1.8 }}>
              {c.about}
            </p>
            <div className="flex gap-4 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    backgroundColor: "rgba(139,195,74,0.15)",
                    border: "1px solid rgba(139,195,74,0.3)",
                    color: "#8BC34A",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>


          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              {t("quickLinks")}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-3">
              {[
                { to: "/", label: t("home") },
                { to: "/products", label: t("products") },
                { to: "/store-locator", label: t("stores") },
                { to: "/about", label: t("about") },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      color: "#A8C580",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#D4A017" }}>›</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              {t("products")}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-3">
              {c.categories.map((item) => (
                <li key={item}>
                  <span
                    style={{
                      color: "#A8C580",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#D4A017" }}>›</span> {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#D4A017",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              {t("contactUs")}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3"><MapPin size={16} style={{ color: "#8BC34A", marginTop: "2px", flexShrink: 0 }} /><span style={{ color: "#A8C580", fontSize: "0.85rem", lineHeight: 1.6 }}>{informationText[0].address}</span></div>
              {centres.map((centre) => <div key={centre._id ?? centre.id ?? centre.area} className="flex gap-3">
                <Phone size={16} style={{ color: "#8BC34A", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ color: "#A8C580", fontSize: "0.85rem", lineHeight: 1.6 }}><span style={{ display: "block", color: "#D4A017", fontSize: ".7rem" }}>{localized(centre.translations?.area, language, centre.area)}</span><a href={`tel:${centre.mobile}`} style={{ color: "inherit", textDecoration: "none" }}>{centre.mobile}</a>{centre.altMobile?.trim() && <a href={`tel:${centre.altMobile}`} style={{ display: "block", color: "#8EAB72", textDecoration: "none", fontSize: ".78rem" }}>{c.alt}: {centre.altMobile}</a>}</span>
              </div>)}
              <div className="flex gap-3"><Mail size={16} style={{ color: "#8BC34A", marginTop: "2px", flexShrink: 0 }} /><a href={`mailto:${informationText[0].email}`} style={{ color: "#A8C580", fontSize: "0.85rem", lineHeight: 1.6, textDecoration: "none" }}>{informationText[0].email}</a></div>
            </div>
          </div>
        </div>


        <div
          style={{ borderTop: "1px solid rgba(139,195,74,0.2)" }}
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p style={{ color: "#618C3A", fontSize: "0.8rem", margin: 0 }}>
            {informationText[0].copyright}
          </p>
          <a
            href="https://www.kryvazent.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.visitDeveloper}
            style={{
              color: "#FAF6EE",
              backgroundColor: "rgba(212,160,23,0.14)",
              border: "1px solid rgba(212,160,23,0.55)",
              borderRadius: "6px",
              padding: "9px 14px",
              textDecoration: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            {c.developed} <span style={{ color: "#D4A017" }}>Kryvazent</span>
            <ExternalLink size={14} />
          </a>
          <div className="flex gap-6">
            {[c.privacy, c.terms, c.quality].map((item) => (
              <span
                key={item}
                style={{ color: "#618C3A", fontSize: "0.8rem", cursor: "pointer" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
