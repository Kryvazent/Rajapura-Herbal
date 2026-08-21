import { useEffect } from "react";
import { useLocation } from "react-router";
import { useLanguage } from "../i18n/LanguageContext";
import { localizedPages, pages, seoNotFound, SITE_NAME } from "../i18n/translations/seo";

const DEFAULT_IMAGE = "/rajapura-product-collection.jpg";
const SITE_URL =
  (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "") || "";

const setMeta = (selector: string, attribute: "content" | "href", value: string) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

const ensureLink = (rel: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  return link;
};

export default function SEO() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const translated = language === "en" ? pages : localizedPages[language] as Record<string, { title: string; description: string }>;
    const metadata = translated[location.pathname] ?? seoNotFound[language];
    const canonicalUrl = SITE_URL
      ? `${SITE_URL}${location.pathname === "/" ? "" : location.pathname}`
      : window.location.href.split("#")[0].split("?")[0];
    const imageUrl = SITE_URL ? `${SITE_URL}${DEFAULT_IMAGE}` : DEFAULT_IMAGE;
    const robots = pages[location.pathname] ? "index, follow" : "noindex, follow";

    document.title = metadata.title;
    setMeta('meta[name="description"]', "content", metadata.description);
    setMeta('meta[name="robots"]', "content", robots);
    setMeta('meta[property="og:site_name"]', "content", SITE_NAME);
    setMeta('meta[property="og:title"]', "content", metadata.title);
    setMeta('meta[property="og:description"]', "content", metadata.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", imageUrl);
    setMeta('meta[name="twitter:title"]', "content", metadata.title);
    setMeta('meta[name="twitter:description"]', "content", metadata.description);
    setMeta('meta[name="twitter:image"]', "content", imageUrl);

    ensureLink("canonical").href = canonicalUrl;
  }, [location.pathname, language]);

  return null;
}
