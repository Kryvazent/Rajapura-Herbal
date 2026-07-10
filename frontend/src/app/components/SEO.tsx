import { useEffect } from "react";
import { useLocation } from "react-router";

const SITE_NAME = "Rajapura Herbal Company";
const DEFAULT_TITLE =
  "Rajapura Herbal Company | Authentic Sri Lankan Ayurvedic Remedies";
const DEFAULT_DESCRIPTION =
  "Discover Rajapura Herbal Company, offering authentic Sri Lankan Ayurvedic remedies, herbal products, services, and authorized store locations.";
const DEFAULT_IMAGE = "/rajapura-product-collection.jpg";
const SITE_URL =
  (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "") || "";

const pages: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Explore authentic Sri Lankan herbal products crafted with Ayurvedic tradition, natural ingredients, and Rajapura family heritage.",
  },
  "/products": {
    title: "Herbal Products | Rajapura Herbal Company",
    description:
      "Browse Rajapura Herbal products including Ayurvedic oils, tonics, teas, powders, and natural wellness remedies.",
  },
  "/services": {
    title: "Ayurvedic Services | Rajapura Herbal Company",
    description:
      "Find Rajapura Herbal wellness services and Ayurvedic care locations for traditional herbal support.",
  },
  "/store-locator": {
    title: "Store Locator | Find Rajapura Herbal Products",
    description:
      "Find authorized Rajapura Herbal stores across Sri Lanka and locate herbal products near you.",
  },
  "/about": {
    title: "About Rajapura Herbal | Ayurvedic Heritage Since 1973",
    description:
      "Learn about Rajapura Herbal Company, its Sri Lankan Ayurvedic heritage, founder story, certifications, and commitment to natural wellness.",
  },
};

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

  useEffect(() => {
    const metadata = pages[location.pathname] ?? {
      title: "Page Not Found | Rajapura Herbal Company",
      description:
        "The requested Rajapura Herbal page could not be found. Return to the homepage to explore products, services, and store locations.",
    };
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
  }, [location.pathname]);

  return null;
}
