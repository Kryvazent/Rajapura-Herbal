import { API_BASE_URL } from "../lib/api";
import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Product } from "../interfaces/productInterface";
import { ShoppingBag, ArrowRight, X, Upload, CreditCard, Receipt, CheckCircle2, ChevronDown } from "lucide-react";
import axios from "axios";
import { formatUSDPrice } from "../lib/price";
import { useCustomerUploadThing } from "../lib/uploadthing";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/LanguageContext";

type Item = { product: Product; qty: number };
const paymentSlipKind = (file: File): "image" | "pdf" | null => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (file.type.toLowerCase() === "application/pdf" || extension === "pdf") return "pdf";
  if (file.type.toLowerCase().startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"].includes(extension ?? "")) return "image";
  return null;
};
const paymentSlipMimeType = (file: File) => {
  if (paymentSlipKind(file) === "pdf") return "application/pdf";
  if (file.type.toLowerCase().startsWith("image/")) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", avif: "image/avif" } as Record<string, string>)[extension ?? ""] ?? "application/octet-stream";
};
const productDisplayName = (product: Product, language: Language) => language === "si"
  ? product.translations?.name?.si?.trim() || product.sinhalaName?.trim() || product.name
  : product.translations?.name?.en?.trim() || product.name;
const itemUnitPrice = (product: Product): number | null => {
  const rawPrice = product.priceUSD || (product.price?.startsWith("USD ") ? product.price : "");
  if (!rawPrice) return null;
  const amount = Number(rawPrice.replace(/USD\s*/i, "").replace(/,/g, "").trim());
  return Number.isFinite(amount) ? amount : null;
};
const formatDollarAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const getOrderErrorMessage = (error: any) => {
  const message = error.response?.data?.message ?? error.message ?? "";
  const details = `${message} ${error.code ?? ""} ${error.cause?.code ?? ""}`;
  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|MongoNetwork|server selection|database connection is not available/i.test(details)) {
    return "We couldn't connect to the order service, so your order was not placed. Your cart is unchanged. Please try again in a few minutes.";
  }
  if (error.request && !error.response) {
    return "We couldn't reach the order service. Check your internet connection and try again. Your cart is unchanged.";
  }
  if (!message || /network error/i.test(message)) {
    return "Something went wrong while placing your order. Your cart is unchanged; please try again.";
  }
  return message;
};

export default function Cart() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const si = language === "si";
  const [items, setItems] = useState<Item[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [cartError, setCartError] = useState("");
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"delivery" | "payment">("delivery");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [orderProgress, setOrderProgress] = useState("");
  const [paymentSlipUploadProgress, setPaymentSlipUploadProgress] = useState(0);
  const [isUploadingPaymentSlip, setIsUploadingPaymentSlip] = useState(false);
  const [isFinalizingPaymentSlipUpload, setIsFinalizingPaymentSlipUpload] = useState(false);
  const [paymentSlipUploadComplete, setPaymentSlipUploadComplete] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"" | "Payment slip" | "Online payment">("");
  const [paymentSlipOpen, setPaymentSlipOpen] = useState(false);
  const [paymentSlipStep, setPaymentSlipStep] = useState<"bank" | "upload">("bank");
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreviewUrl, setPaymentSlipPreviewUrl] = useState("");
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState<string | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState({ address: "", country: "", contactNumber: "", additionalNote: "" });
  const [countries, setCountries] = useState<string[]>([]);
  const [countryQuery, setCountryQuery] = useState("");
  const [countryListOpen, setCountryListOpen] = useState(false);
  const [countryLoading, setCountryLoading] = useState(true);
  const [countryError, setCountryError] = useState("");
  const [countryRetry, setCountryRetry] = useState(0);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const { startUpload } = useCustomerUploadThing("paymentSlip", {
    uploadProgressGranularity: "fine",
    onUploadProgress: (progress) => {
      setPaymentSlipUploadProgress(Math.min(99, Math.round(progress)));
      setIsFinalizingPaymentSlipUpload(progress >= 100);
    },
  });
  useEffect(() => {
    if (!paymentSlip) {
      setPaymentSlipPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(paymentSlip);
    setPaymentSlipPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [paymentSlip]);
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setCountry(d.country_code ?? null);
        // setCountry("USA");
      })
      .catch(() => setCountry(null));
    fetch(`${API_BASE_URL}/auth/customer/status`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (status) => {
        const customer = Boolean(status.authenticated && status.role === "USER");
        setSignedIn(customer);
        if (!customer) return;

        const response = await axios.get(`${API_BASE_URL}/user/cart`, { withCredentials: true });
        let cartItems = response.data.data?.items ?? [];
        let canClearLegacyCart = true;
        if (cartItems.length === 0) {
          try {
            const legacyItems = JSON.parse(localStorage.getItem("rajapuraCart") || "[]");
            if (Array.isArray(legacyItems) && legacyItems.length) {
              const migrated = await axios.put(`${API_BASE_URL}/user/cart`, {
                items: legacyItems.map((item: Item) => ({ productId: item.product._id, qty: item.qty })),
              }, { withCredentials: true });
              cartItems = migrated.data.data?.items ?? [];
            }
          } catch (error: any) {
            canClearLegacyCart = false;
            setCartError(error.response?.data?.message ?? "We couldn't migrate your saved cart. Please try again.");
          }
        }
        setItems(cartItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, qty: item.qty })));
        if (canClearLegacyCart) localStorage.removeItem("rajapuraCart");
      })
      .catch((error) => {
        setCartError(error.response?.data?.message ?? "Unable to load your saved cart. Please refresh to try again.");
      })
      .finally(() => setAuthChecked(true));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setCountryLoading(true);
    setCountryError("");
    fetch("https://countries.dev/countries", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Country service returned ${response.status}.`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Country service returned an invalid response.");
        const names = data
          .map((entry) => (typeof entry?.name === "string" ? entry.name : null))
          .filter((name): name is string => name !== null)
          .sort((a, b) => a.localeCompare(b));
        if (names.length === 0) throw new Error("Country service returned no countries.");
        setCountries(names);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCountryError(error instanceof Error ? error.message : "Unable to load countries.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCountryLoading(false);
      });
    return () => controller.abort();
  }, [countryRetry]);
  const save = async (next: Item[]) => {
    const previous = items;
    setItems(next);
    setCartError("");
    try {
      const response = await axios.put(`${API_BASE_URL}/user/cart`, {
        items: next.map((item) => ({ productId: item.product._id, qty: item.qty })),
      }, { withCredentials: true });
      const savedItems = response.data.data?.items ?? [];
      setItems(savedItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, qty: item.qty })));
      localStorage.removeItem("rajapuraCart");
      window.dispatchEvent(new Event("rajapura:cart-updated"));
    } catch (error: any) {
      setItems(previous);
      setCartError(error.response?.data?.message ?? "Your cart changes could not be saved.");
    }
  };
  const updateQuantity = (productId: Product["_id"], quantity: number) => {
    save(items.map((item) => item.product._id === productId ? { ...item, qty: quantity } : item));
  };
  const pricedItems = items.map((item) => ({ ...item, unitPrice: itemUnitPrice(item.product) }));
  const selectedItems = items.filter((item) => selectedIds.includes(String(item.product._id)));
  const selectedPricedItems = pricedItems.filter((item) => selectedIds.includes(String(item.product._id)));
  const hasContactPrice = selectedPricedItems.some((item) => item.unitPrice === null);
  const canPayOnline = selectedItems.length > 0 && !hasContactPrice;
  const checkoutPaymentMethod = paymentMethod === "Online payment" && !canPayOnline ? "" : paymentMethod;
  const paymentStepActive = checkoutStep === "payment";
  const selectedEstimatedTotal = selectedPricedItems.every((item) => item.unitPrice !== null)
    ? selectedPricedItems.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.qty, 0)
    : null;
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const matchingCountries = countries.filter((name) => name.toLocaleLowerCase().includes(countryQuery.trim().toLocaleLowerCase()));
  const selectCountry = (name: string) => {
    setCheckoutDetails((current) => ({ ...current, country: name }));
    setCountryQuery(name);
    setCountryListOpen(false);
  };

  const openCheckout = async () => {
    if (selectedItems.length === 0) {
      setCartError("Select at least one item to continue to payment.");
      return;
    }
    setCheckoutOpen(true);
    setCheckoutStep("delivery");
    setCheckoutLoading(true);
    setCheckoutError("");
    setCheckoutMessage("");
    setPaymentMethod("");
    try {
      const response = await axios.get(`${API_BASE_URL}/user/checkout-details`, { withCredentials: true });
      const savedCountry = response.data.data?.country ?? "";
      setCheckoutDetails({
        address: response.data.data?.address ?? "",
        country: savedCountry,
        contactNumber: response.data.data?.contactNumber ?? "",
        additionalNote: "",
      });
      setCountryQuery(savedCountry);
    } catch (error: any) {
      setCheckoutError(error.response?.data?.message ?? "Could not load your saved delivery details.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!countries.includes(checkoutDetails.country)) {
      setCheckoutError("Select a country from the country list.");
      return;
    }
    if (!checkoutPaymentMethod) {
      setCheckoutError("Choose a payment method to continue.");
      return;
    }
    if (checkoutPaymentMethod === "Payment slip" && !paymentSlip) {
      setCheckoutError("Upload your bank transfer receipt before placing the order.");
      setPaymentSlipOpen(true);
      return;
    }
    setCheckoutSubmitting(true);
    setCheckoutError("");
    setPaymentSlipUploadComplete(false);
    setIsFinalizingPaymentSlipUpload(false);
    setOrderProgress(si ? (checkoutPaymentMethod === "Payment slip" ? "ඔබගේ ඇණවුම සූදානම් කරමින්…" : "ඔබගේ ඇණවුම යවමින්…") : (checkoutPaymentMethod === "Payment slip" ? "Preparing your order…" : "Submitting your order…"));
    let checkoutStage = "prepare order";
    try {
      let paymentSlipUrl = "";
      let orderId: string | undefined;
      let paymentSlipFileName = "";
      const selectedProductIds = selectedItems.map((item) => String(item.product._id));
      if (checkoutPaymentMethod === "Payment slip") {
        if (!paymentSlip) throw new Error("Choose a payment slip image or PDF to upload.");
        if (paymentSlip.size > 4 * 1024 * 1024) throw new Error("The payment slip must be 4 MB or smaller.");
        const slipKind = paymentSlipKind(paymentSlip);
        if (!slipKind) throw new Error("Upload the payment slip as an image or PDF.");
        if (!pendingPaymentOrderId) {
          checkoutStage = "prepare payment order";
          const preparation = await axios.post(`${API_BASE_URL}/user/orders/prepare`, {
            address: checkoutDetails.address,
            country: checkoutDetails.country,
            contactNumber: checkoutDetails.contactNumber,
            productIds: selectedProductIds,
          }, { withCredentials: true });
          orderId = preparation.data.data.orderId;
        } else {
          orderId = pendingPaymentOrderId;
        }
        setPendingPaymentOrderId(orderId);
        const originalExtension = paymentSlip.name.match(/\.[a-z0-9]{1,8}$/i)?.[0];
        const mimeType = paymentSlipMimeType(paymentSlip);
        const mimeExtension = mimeType === "application/pdf" ? ".pdf" : mimeType === "image/jpeg" ? ".jpg" : mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : mimeType === "image/gif" ? ".gif" : mimeType === "image/bmp" ? ".bmp" : mimeType === "image/avif" ? ".avif" : ".img";
        paymentSlipFileName = `${orderId}${slipKind === "pdf" ? ".pdf" : originalExtension ?? mimeExtension}`;
        const renamedPaymentSlip = new File([paymentSlip], paymentSlipFileName, { type: mimeType, lastModified: paymentSlip.lastModified });
        setOrderProgress(si ? "ඔබගේ ගෙවීම් රිසිට්පත උඩුගත කරමින්…" : "Uploading your payment slip…");
        checkoutStage = "upload payment slip";
        setPaymentSlipUploadProgress(0);
        setIsUploadingPaymentSlip(true);
        const uploaded = await startUpload([renamedPaymentSlip]);
        paymentSlipUrl = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url ?? uploaded?.[0]?.appUrl ?? uploaded?.[0]?.serverData?.url ?? "";
        if (!paymentSlipUrl) {
          console.error("Payment slip upload returned no file URL", { fileRoute: "paymentSlip", resultCount: uploaded?.length ?? 0 });
          throw new Error("The payment slip could not be uploaded. Please try again.");
        }
        setPaymentSlipUploadProgress(100);
        setPaymentSlipUploadComplete(true);
        setIsFinalizingPaymentSlipUpload(false);
        setIsUploadingPaymentSlip(false);
      }
      setOrderProgress(si ? "ඔබගේ ඇණවුම යවමින්…" : "Submitting your order…");
      checkoutStage = "submit order";
      const response = await axios.post(`${API_BASE_URL}/user/orders`, {
        ...checkoutDetails,
        ...(orderId && { orderId, paymentSlipFileName }),
        paymentMethod: checkoutPaymentMethod,
        currency: country === "LK" ? "LKR" : "USD",
        paymentSlipUrl: checkoutPaymentMethod === "Payment slip" ? paymentSlipUrl : "",
        productIds: selectedProductIds,
      }, { withCredentials: true });
      setPendingPaymentOrderId(null);
      setPaymentSlip(null);
      setSelectedIds([]);
      window.dispatchEvent(new Event("rajapura:cart-updated"));
      setCheckoutOpen(false);
      setPaymentSlipOpen(false);
      setOrderResult({
        success: true,
        message: si
          ? (checkoutPaymentMethod === "Online payment" ? "ඔබගේ ඇණවුම සාර්ථකව යවා ඇත. ගෙවීම් උපදෙස් සඳහා අපි ඔබ හා සම්බන්ධ වන්නෙමු." : "ඔබගේ ඇණවුම සාර්ථකයි. ගෙවීම් රිසිට්පත ලැබී ඇත.")
          : `${response.data.message ?? "Order placed successfully."}${checkoutPaymentMethod === "Online payment" ? " We’ll contact you with payment instructions." : " Your payment slip has been submitted."}`,
      });
      setCartError("");
    } catch (error: any) {
      console.error("Checkout request failed", {
        stage: checkoutStage,
        name: error?.name,
        message: error?.message,
        status: error?.status ?? error?.response?.status,
        data: error?.data ?? error?.response?.data,
        cause: error?.cause?.message ?? error?.cause,
      });
      setCheckoutOpen(false);
      setOrderResult({
        success: false,
        message: si ? "ඔබගේ ඇණවුම සම්පූර්ණ කළ නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න." : getOrderErrorMessage(error),
      });
    } finally {
      setIsUploadingPaymentSlip(false);
      setIsFinalizingPaymentSlipUpload(false);
      setCheckoutSubmitting(false);
      setOrderProgress("");
    }
  };
  useEffect(() => {
    const pending = Object.entries(quantityDrafts)
      .map(([productId, rawQty]) => [productId, Number(rawQty)] as const)
      .filter(([, qty]) => Number.isSafeInteger(qty) && qty >= 1);
    if (pending.length === 0) return;

    const timeout = window.setTimeout(() => {
      const pendingQuantities = new Map(pending);
      const next = items.map((item) => ({
        ...item,
        qty: pendingQuantities.get(item.product._id) ?? item.qty,
      }));
      setQuantityDrafts({});
      void save(next);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [quantityDrafts, items]);
  if (country === "LK") return <Navigate to="/products" replace />;
  if (country === null)
    return (
      <main style={{ minHeight: 460, display: "grid", placeItems: "center", padding: "44px 20px", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <div aria-label="Loading" role="status" style={{ width: 34, height: 34, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#2D5016", borderRadius: "50%", animation: "cart-spin .8s linear infinite" }} />
        <style>{"@keyframes cart-spin{to{transform:rotate(360deg)}}"}</style>
      </main>
    );
  if (!authChecked)
    return (
      <main style={{ minHeight: 460, display: "grid", placeItems: "center", padding: "44px 20px", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <div aria-label="Loading cart" style={{ width: 34, height: 34, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#2D5016", borderRadius: "50%", animation: "cart-spin .8s linear infinite" }} />
        <style>{"@keyframes cart-spin{to{transform:rotate(360deg)}}"}</style>
      </main>
    );
  if (!signedIn)
    return (
      <main style={{ minHeight: 480, display: "grid", placeItems: "center", padding: "48px 20px", color: "#2D5016", fontFamily: "'Lato',sans-serif", background: "radial-gradient(ellipse at 50% 10%, rgba(139,195,74,.11), transparent 55%)" }}>
        <section style={{ width: "min(100%, 560px)", boxSizing: "border-box", padding: "clamp(32px, 6vw, 54px) 28px", textAlign: "center", background: "linear-gradient(145deg, #FFFEFA, #FAF6EE)", border: "1px solid rgba(45,80,22,.12)", borderRadius: 24, boxShadow: "0 18px 48px rgba(45,80,22,.08)" }}>
          <div aria-hidden="true" style={{ width: 76, height: 76, margin: "0 auto 22px", display: "grid", placeItems: "center", borderRadius: "50%", color: "#2D5016", background: "rgba(139,195,74,.16)", border: "1px solid rgba(45,80,22,.1)" }}><ShoppingBag size={31} strokeWidth={1.6} /></div>
          <p style={{ margin: "0 0 9px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em" }}>CUSTOMER ACCOUNT</p>
          <h1 style={{ margin: "0 auto 12px", maxWidth: 450, color: "#2D5016", fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.65rem, 4vw, 2.15rem)", fontWeight: 500 }}>Sign in to your cart</h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 360, color: "#6B6257", lineHeight: 1.65 }}>Your herbal favourites are just a step away.</p>
          <Link to="/account" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "12px 24px", borderRadius: 50, color: "#FAF6EE", background: "#2D5016", textDecoration: "none", fontSize: ".9rem", fontWeight: 700 }}>Sign in <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  if (cartError && signedIn && items.length === 0)
    return <main style={{ minHeight: 420, display: "grid", placeItems: "center", padding: 24, color: "#8F2D26", fontFamily: "'Lato',sans-serif" }}>
      <section role="alert" style={{ width: "min(100%, 480px)", padding: 28, textAlign: "center", borderRadius: 18, background: "#FFFEFA", border: "1px solid #E6B6AE", boxShadow: "0 12px 30px rgba(45,80,22,.08)" }}>
        <p style={{ margin: "0 0 16px" }}>{cartError}</p>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: "10px 18px", border: 0, borderRadius: 24, color: "#FAF6EE", background: "#2D5016", fontWeight: 700, cursor: "pointer" }}>Try again</button>
      </section>
    </main>;
  if (items.length === 0)
    return (
      <main
        style={{
          minHeight: 420,
          display: "grid",
          placeItems: "center",
          padding: "48px 20px",
          color: "#2D5016",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <section
          style={{
            width: "min(100%, 560px)",
            padding: "44px 28px",
            textAlign: "center",
            background: "#FAF6EE",
            border: "1px solid rgba(45,80,22,0.12)",
            borderRadius: 24,
            boxShadow: "0 16px 44px rgba(45,80,22,0.08)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 20px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              color: "#2D5016",
              background: "rgba(139,195,74,0.16)",
              border: "1px solid rgba(45,80,22,0.12)",
            }}
          >
            <ShoppingBag size={32} strokeWidth={1.6} />
          </div>
          <p
            style={{
              margin: "0 0 8px",
              color: "#8B5E3C",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {si ? "ඔබේ කරත්තය" : "Your cart"}
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              color: "#2D5016",
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 4vw, 2rem)",
            }}
          >
            {si ? "ඔබේ කරත්තය හිස්" : "Your cart is empty"}
          </h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 390, color: "#6B6257", lineHeight: 1.7 }}>
            {si ? "ඔබට ගැළපෙන දෙයක් සොයා ගන්න." : "Find something good for you."}
          </p>
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: "12px 22px",
              borderRadius: 50,
              background: "#2D5016",
              color: "#FAF6EE",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 700,
            }}
          >
            {si ? "නිෂ්පාදන බලන්න" : "Explore products"} <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  return (
    <main
      className="customer-cart-page"
      style={{
        maxWidth: 1320,
        margin: "48px auto",
        padding: 20,
        color: "#2D5016",
        fontFamily: "'Lato',sans-serif",
      }}
    >
      <style>{`
        .customer-cart-layout{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:32px;align-items:start}
        .cart-item-info{display:contents}
        @media(max-width:767px){
          .customer-cart-page{margin:20px auto!important;padding:14px!important}
          .customer-cart-layout{grid-template-columns:minmax(0,1fr);gap:20px}
          .cart-item{display:grid!important;grid-template-columns:auto 60px minmax(0,1fr) auto;grid-template-areas:"select image info info" "select quantity quantity remove";gap:10px!important;padding:12px!important}
          .cart-item-select{grid-area:select}
          .cart-item-image{grid-area:image;width:60px!important;height:60px!important}
          .cart-item-info{grid-area:info;display:grid;align-content:center;gap:5px;min-width:0}
          .cart-item-name{min-width:0;overflow-wrap:anywhere;font-size:.92rem}
          .cart-item-price{color:#526746;font-size:.84rem;white-space:nowrap}
          .cart-item-quantity{grid-area:quantity;justify-self:start;max-width:100%;gap:4px!important;padding:3px!important}
          .cart-item-quantity input{width:clamp(48px,16vw,76px)!important;padding:0 4px!important}
          .cart-item-remove{grid-area:remove;justify-self:end;padding:8px 10px!important;font-size:.76rem!important;white-space:nowrap}
          .cart-order-summary{position:static!important;padding:18px!important}
          .cart-order-summary-total{align-items:flex-start!important;flex-wrap:wrap}
          .cart-order-summary-total strong:last-child{max-width:100%;text-align:right}
        }
        @media(max-width:360px){
          .cart-item{grid-template-columns:auto 52px minmax(0,1fr) auto;gap:8px!important;padding:10px!important}
          .cart-item-image{width:52px!important;height:52px!important}
          .cart-item-quantity button{width:30px!important;height:30px!important}
          .cart-item-remove{padding:7px 8px!important}
        }
      `}</style>
      {cartError && <p role="alert" style={{ margin: "0 0 16px", padding: "12px 15px", borderRadius: 10, color: "#8F2D26", background: "#FFF3F0", border: "1px solid #E6B6AE" }}>{cartError}</p>}
      <div className="customer-cart-layout">
      <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", margin: 0 }}>{si ? "ඔබේ කරත්තය" : "Your cart"}</h1>
        {items.length > 0 && <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#526746", fontSize: ".84rem", fontWeight: 700, cursor: "pointer" }}><input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? items.map((item) => String(item.product._id)) : [])} style={{ width: 17, height: 17, accentColor: "#31551F" }} />{si ? "සියල්ල තෝරන්න" : "Select all"}</label>}
      </div>
      {items.map((item) => (
        <article
          key={String(item.product._id)}
          className="cart-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            margin: "12px 0",
            background: "#FFFEFA",
            border: "1px solid rgba(45,80,22,.1)",
            borderRadius: 16,
            boxShadow: "0 5px 18px rgba(45,80,22,.045)",
          }}
        >
          <label className="cart-item-select" aria-label={`Select ${item.product.name} for checkout`} style={{ display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer" }}>
            <input type="checkbox" checked={selectedIds.includes(String(item.product._id))} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, String(item.product._id)] : current.filter((id) => id !== String(item.product._id)))} style={{ width: 19, height: 19, accentColor: "#31551F", cursor: "pointer" }} />
          </label>
          <img
            className="cart-item-image"
            src={item.product.image}
            alt=""
            style={{
              width: 72,
              height: 72,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />
          <div className="cart-item-info">
            <strong className="cart-item-name" style={{ flex: 1 }}>{productDisplayName(item.product, language)}</strong>
            <span className="cart-item-price">{formatUSDPrice(item.product.priceUSD || (item.product.price?.startsWith("USD ") ? item.product.price : "")) || (si ? "මිල සඳහා විමසන්න" : "Contact for price")}</span>
          </div>
          <div className="cart-item-quantity" aria-label={`Quantity for ${item.product.name}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: 4, border: "1px solid rgba(45,80,22,.2)", borderRadius: 12, background: "#F5F3E9" }}>
            <button type="button" aria-label={`Decrease ${item.product.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQuantity(item.product._id, item.qty - 1)} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 9, color: "#2D5016", background: item.qty <= 1 ? "#E8E6DD" : "#E4EBD8", fontSize: "1.2rem", fontWeight: 700, cursor: item.qty <= 1 ? "not-allowed" : "pointer" }}>−</button>
            <input
              type="number"
              aria-label={`Quantity for ${item.product.name}`}
              min={1}
              value={quantityDrafts[item.product._id] ?? String(item.qty)}
              onChange={(event) => {
                const value = event.target.value;
                if (/^\d*$/.test(value)) {
                  setQuantityDrafts((drafts) => ({ ...drafts, [item.product._id]: value }));
                }
              }}
              onBlur={(event) => {
                const value = Number(event.target.value);
                setQuantityDrafts((drafts) => {
                  const next = { ...drafts };
                  delete next[item.product._id];
                  return next;
                });
                if (Number.isSafeInteger(value) && value >= 1 && value !== item.qty) {
                  updateQuantity(item.product._id, value);
                }
              }}
              style={{ width: 140, height: 34, boxSizing: "border-box", padding: "0 12px", border: "1px solid rgba(45,80,22,.2)", borderRadius: 7, background: "#fffdf8", color: "#243D17", textAlign: "center", fontWeight: 800 }}
            />
            <button type="button" aria-label={`Increase ${item.product.name} quantity`} onClick={() => updateQuantity(item.product._id, item.qty + 1)} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 9, color: "#FAF6EE", background: "#2D5016", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
          <button
            className="cart-item-remove"
            type="button"
            aria-label={`Remove ${item.product.name} from cart`}
            onClick={() => {
              setSelectedIds((current) => current.filter((id) => id !== String(item.product._id)));
              void save(items.filter((i) => i.product._id !== item.product._id));
            }}
            style={{ padding: "9px 14px", border: "1px solid rgba(157,48,41,.3)", borderRadius: 22, color: "#8F2D26", background: "#FFF3F0", fontSize: ".86rem", fontWeight: 700, cursor: "pointer", transition: "background .2s, transform .2s" }}
          >
            {si ? "ඉවත් කරන්න" : "Remove"}
          </button>
        </article>
      ))}
      </section>
      <aside className="cart-order-summary" style={{ position: "sticky", top: 24, padding: 24, background: "#FFFEFA", border: "1px solid rgba(45,80,22,.12)", borderRadius: 18, boxShadow: "0 12px 32px rgba(45,80,22,.08)" }}>
        <p style={{ margin: "0 0 7px", color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em" }}>{si ? "ඇණවුම් සාරාංශය" : "ORDER SUMMARY"}</p>
        <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 500 }}>{si ? "ගෙවීම් විස්තර" : "Payment details"}</h2>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(45,80,22,.12)", color: "#6B6257", fontSize: ".92rem" }}>
          <span>{si ? "තෝරාගත් භාණ්ඩ" : "Selected items"}</span><strong style={{ color: "#2D5016" }}>{selectedItems.reduce((total, item) => total + item.qty, 0)}</strong>
        </div>
        <div style={{ display: "grid", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(45,80,22,.12)" }}>
          {selectedPricedItems.map((item) => (
            <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, color: "#6B6257", fontSize: ".86rem" }}>
              <div>
                <div style={{ color: "#334A28", fontWeight: 700 }}>{productDisplayName(item.product, language)}</div>
                <div style={{ marginTop: 3 }}>{item.qty} × {item.unitPrice === null ? (si ? "මිල සඳහා විමසන්න" : "Contact for price") : formatDollarAmount(item.unitPrice)}</div>
              </div>
              <strong style={{ flexShrink: 0, color: "#2D5016" }}>{item.unitPrice === null ? "—" : formatDollarAmount(item.unitPrice * item.qty)}</strong>
            </div>
          ))}
        </div>
        <div className="cart-order-summary-total" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, padding: "16px 0 18px", borderBottom: "1px solid rgba(45,80,22,.12)", color: "#243D17", fontSize: "1rem" }}>
          <strong>{si ? "ඇස්තමේන්තුගත මුළු එකතුව" : "Estimated total"}</strong>
          <strong>{selectedItems.length === 0 ? (si ? "ගෙවීම සඳහා භාණ්ඩ තෝරන්න" : "Select items for checkout") : selectedEstimatedTotal === null ? (si ? "මිල සඳහා විමසන්න" : "Contact for price") : formatDollarAmount(selectedEstimatedTotal)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0 18px", color: "#6B6257", fontSize: ".92rem" }}>
          <span>{si ? "ගෙවීම" : "Payment"}</span><strong style={{ color: "#2D5016" }}>{selectedItems.length === 0 ? (si ? "භාණ්ඩ තෝරන්න" : "Select items") : hasContactPrice ? (si ? "ගෙවීම් රිසිට්පත අවශ්‍යයි" : "Payment slip required") : (si ? "ගෙවීමේදී තෝරන්න" : "Choose at checkout")}</strong>
        </div>
        <button type="button" onClick={() => void openCheckout()} disabled={selectedItems.length === 0} style={{ width: "100%", padding: "12px 18px", border: 0, borderRadius: 28, color: "#FAF6EE", background: selectedItems.length === 0 ? "#87947A" : "#2D5016", fontWeight: 700, cursor: selectedItems.length === 0 ? "not-allowed" : "pointer" }}>{si ? `ගෙවීමට ඉදිරියට (${selectedItems.length})` : `Continue to payment (${selectedItems.length})`}</button>
      </aside>
      </div>
      {orderResult && <div role="presentation" style={{ position: "fixed", inset: 0, zIndex: 1200, display: "grid", placeItems: "center", padding: 16, background: "rgba(20,35,10,.68)" }}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="order-result-title" aria-describedby="order-result-message" style={{ width: "min(100%, 440px)", boxSizing: "border-box", padding: "clamp(26px,5vw,38px)", border: "1px solid rgba(45,80,22,.18)", borderRadius: 22, background: "#FBF8F0", color: "#244516", textAlign: "center", boxShadow: "0 28px 80px rgba(0,0,0,.3)" }}>
          <span aria-hidden="true" style={{ width: 58, height: 58, margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "50%", color: orderResult.success ? "#31551F" : "#9D3029", background: orderResult.success ? "#E5ECD8" : "#FBEDEA" }}>
            {orderResult.success ? <CheckCircle2 size={30} /> : <X size={28} />}
          </span>
          <h2 id="order-result-title" style={{ margin: "0 0 10px", fontFamily: "'Playfair Display',serif", fontSize: "1.65rem", fontWeight: 500 }}>
            {orderResult.success ? (si ? "ඇණවුම සාර්ථකයි" : "Order placed successfully") : (si ? "ඇණවුම සම්පූර්ණ කළ නොහැක" : "Order could not be placed")}
          </h2>
          <p id="order-result-message" style={{ margin: 0, color: "#71695E", lineHeight: 1.65 }}>{orderResult.message}</p>
          {orderResult.success ? <button type="button" onClick={() => navigate("/profile", { replace: true, state: { section: "orders" } })} style={{ width: "100%", marginTop: 24, padding: "13px 18px", border: 0, borderRadius: 28, color: "#FAF6EE", background: "#2D5016", fontWeight: 800, cursor: "pointer" }}>{si ? "මගේ ඇණවුම් බලන්න" : "View my orders"}</button> : <button type="button" onClick={() => setOrderResult(null)} style={{ width: "100%", marginTop: 24, padding: "13px 18px", border: 0, borderRadius: 28, color: "#FAF6EE", background: "#2D5016", fontWeight: 800, cursor: "pointer" }}>{si ? "කරත්තයට ආපසු යන්න" : "Return to cart"}</button>}
        </section>
      </div>}
      {checkoutOpen && <div role="presentation" onClick={() => { if (!checkoutSubmitting) { setCheckoutOpen(false); setPaymentSlipOpen(false); } }} style={{ position: "fixed", inset: 0, zIndex: 1100, display: "grid", placeItems: "center", padding: 16, background: "rgba(20,35,10,.62)" }}>
        <section role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()} style={{ width: "min(100%, 960px)", maxHeight: "min(94vh, 900px)", overflowY: "auto", position: "relative", boxSizing: "border-box", border: "1px solid rgba(45,80,22,.2)", borderRadius: 26, background: "#FBF8F0", boxShadow: "0 32px 90px rgba(0,0,0,.34)", color: "#244516" }}>
          <style>{".checkout-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr)}.checkout-pane{padding:clamp(22px,4vw,38px)}.checkout-payment{padding-bottom:20px;background:linear-gradient(160deg,#F1F3E7,#E9EEDC);border-left:1px solid rgba(45,80,22,.12)}.checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}.checkout-span{grid-column:1/-1}.checkout-control{width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid #D8DCCB;border-radius:11px;background:#FFFEFC;color:#283C1C;font:inherit;outline:none;transition:border-color .18s,box-shadow .18s}.checkout-control:focus{border-color:#65814E;box-shadow:0 0 0 3px rgba(101,129,78,.14)}.checkout-methods{display:grid;grid-template-columns:1fr 1fr;gap:10px}.checkout-method{display:flex;align-items:center;gap:11px;min-height:62px;padding:14px;border:1px solid rgba(45,80,22,.2);border-radius:13px;background:linear-gradient(180deg,#FFFEFC,#F8F6EF);box-shadow:0 3px 8px rgba(36,69,22,.06);color:#2D5016;text-align:left;cursor:pointer;transition:background .18s,border-color .18s,box-shadow .18s,transform .18s}.checkout-method:hover:not(:disabled){transform:translateY(-2px);border-color:#65814E;box-shadow:0 7px 15px rgba(36,69,22,.12)}.checkout-method:focus-visible{outline:3px solid rgba(101,129,78,.35);outline-offset:2px}.checkout-method.selected{border-color:#41652E;background:linear-gradient(135deg,#E3EBD5,#EDF2E4);box-shadow:inset 0 0 0 1px rgba(65,101,46,.2),0 4px 10px rgba(36,69,22,.1)}.checkout-method:disabled{opacity:.52;cursor:not-allowed}.payment-slip-layout{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:22px}.payment-slip-column{min-width:0;padding:clamp(18px,3vw,28px)}@media(max-width:680px){.checkout-layout{grid-template-columns:1fr}.checkout-payment{border-left:0;border-top:1px solid rgba(45,80,22,.12)}.checkout-fields{grid-template-columns:1fr}.checkout-span{grid-column:auto}.payment-slip-layout{grid-template-columns:1fr}}"}</style>
          <style>{".checkout-next,.checkout-back{display:none}@media(max-width:680px){.checkout-layout{grid-template-columns:1fr}.checkout-layout:not(.mobile-payment-step) .checkout-payment{display:none}.checkout-layout.mobile-payment-step .checkout-delivery{display:none}.checkout-payment{border:0!important}.checkout-fields{grid-template-columns:1fr;gap:14px}.checkout-span{grid-column:auto}.checkout-methods{grid-template-columns:1fr 1fr}.checkout-next,.checkout-back{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;padding:14px 18px;border:0;border-radius:28px;color:#FAF6EE;background:linear-gradient(110deg,#31591C,#244516);font:inherit;font-weight:800;cursor:pointer}.checkout-back{margin:0 0 16px;border:1px solid rgba(45,80,22,.2);color:#31551F;background:#FFFEFC}}"}</style>
          <header style={{ position: "sticky", top: 0, zIndex: 2, padding: "25px clamp(22px,4vw,38px) 22px", color: "#F8F5EA", background: "linear-gradient(115deg,#203B14,#31551F 62%,#3B6227)", overflow: "hidden" }}>
            <div aria-hidden="true" style={{ position: "absolute", width: 210, height: 210, right: 38, top: -146, border: "1px solid rgba(226,204,135,.18)", borderRadius: "50%", boxShadow: "0 0 0 22px rgba(226,204,135,.035),0 0 0 46px rgba(226,204,135,.025)" }} />
            <button type="button" aria-label="Close checkout" onClick={() => { setCheckoutOpen(false); setPaymentSlipOpen(false); }} disabled={checkoutSubmitting} style={{ position: "absolute", top: 20, right: 20, zIndex: 1, display: "grid", placeItems: "center", width: 38, height: 38, border: "1px solid rgba(248,245,234,.24)", borderRadius: "50%", background: "rgba(255,255,255,.08)", color: "#F8F5EA", cursor: "pointer" }}><X size={18} /></button>
            <p style={{ position: "relative", margin: "0 0 7px", color: "#DDBD65", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".18em" }}>{si ? "ඔබගේ ඇණවුම" : "YOUR ORDER"}</p>
            <h2 id="checkout-title" style={{ position: "relative", margin: "0 50px 15px 0", fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 500, lineHeight: 1.15 }}>{si ? "බෙදාහැරීම සහ ගෙවීම" : "Delivery and payment"}</h2>
            <div aria-label={si ? "ඇණවුම් පියවර" : "Checkout steps"} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, color: "rgba(248,245,234,.78)", fontSize: ".76rem", fontWeight: 700 }}>
              <span aria-current={!paymentStepActive ? "step" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: paymentStepActive ? "rgba(248,245,234,.78)" : "#F8F5EA" }}>
                <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: "50%", color: "#243D17", background: paymentStepActive ? "rgba(248,245,234,.35)" : "#DDBD65", fontSize: ".68rem" }}>1</span>{si ? "බෙදාහැරීම" : "Delivery"}
              </span>
              <span aria-hidden="true" style={{ width: 32, borderTop: "1px solid rgba(248,245,234,.35)" }} />
              <span aria-current={paymentStepActive ? "step" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: paymentStepActive ? "#F8F5EA" : "rgba(248,245,234,.78)" }}>
                <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, border: paymentStepActive ? 0 : "1px solid rgba(248,245,234,.38)", borderRadius: "50%", color: "#243D17", background: paymentStepActive ? "#DDBD65" : "transparent", fontSize: ".68rem" }}>2</span>{si ? "ගෙවීම" : "Payment"}
              </span>
            </div>
          </header>
          {checkoutLoading ? <div role="status" aria-label="Loading saved delivery details" style={{ minHeight: 300, display: "grid", placeItems: "center" }}><div style={{ width: 36, height: 36, border: "3px solid rgba(45,80,22,.14)", borderTopColor: "#31551F", borderRadius: "50%", animation: "cart-spin .8s linear infinite" }} /><style>{"@keyframes cart-spin{to{transform:rotate(360deg)}}"}</style></div> : checkoutMessage ? <div style={{ minHeight: 330, display: "grid", placeItems: "center", padding: 28, textAlign: "center" }}><div><span style={{ width: 64, height: 64, margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "50%", color: "#31551F", background: "#E4ECD9" }}><CheckCircle2 size={34} /></span><h3 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display',serif", fontSize: "1.55rem" }}>Order received</h3><p style={{ maxWidth: 420, margin: "0 auto", color: "#71695E", lineHeight: 1.65 }}>{checkoutMessage}</p><button type="button" onClick={() => setCheckoutOpen(false)} style={{ marginTop: 22, padding: "11px 28px", border: 0, borderRadius: 30, color: "#FAF6EE", background: "#2D5016", fontWeight: 700, cursor: "pointer" }}>Done</button></div></div> : <form onSubmit={submitOrder} className={`checkout-layout${checkoutStep === "payment" ? " mobile-payment-step" : ""}`}>
            <div className="checkout-pane checkout-delivery">
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}><span style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 12, color: "#31551F", background: "#E8EDD9" }}><ShoppingBag size={18} /></span><div><h3 style={{ margin: 0, fontSize: ".98rem", fontWeight: 800 }}>{si ? "බෙදාහැරීමේ විස්තර" : "Delivery details"}</h3><span style={{ color: "#847A68", fontSize: ".76rem" }}>{si ? "ඔබගේ ඇණවුම යැවිය යුත්තේ කොතැනටද?" : "Where should we send your order?"}</span></div></div>
              <div className="checkout-fields">
                <label className="checkout-span" style={{ display: "grid", gap: 7, color: "#405235", fontSize: ".8rem", fontWeight: 700 }}><span>{si ? "බෙදාහැරීමේ ලිපිනය" : "Delivery address"} <span style={{ color: "#9A7048" }}>*</span></span><textarea className="checkout-control" required autoComplete="street-address" rows={3} value={checkoutDetails.address} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, address: event.target.value })} style={{ resize: "vertical" }} /></label>
                <div style={{ display: "grid", gap: 7, color: "#405235", fontSize: ".8rem", fontWeight: 700 }}>
                  <label htmlFor="checkout-country"><span>{si ? "රට" : "Country"} <span style={{ color: "#9A7048" }}>*</span></span></label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="checkout-country"
                      className="checkout-control"
                      required
                      autoComplete="country-name"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={countryListOpen}
                      aria-controls="checkout-country-options"
                      aria-activedescendant={countryListOpen && matchingCountries[activeCountryIndex] ? `checkout-country-option-${activeCountryIndex}` : undefined}
                      placeholder={countryLoading ? (si ? "රටවල් පූරණය වෙමින්…" : "Loading countries…") : (si ? "රටවල් සොයන්න" : "Search countries")}
                      value={si && checkoutDetails.country === "Sri Lanka" ? "ශ්‍රී ලංකාව" : countryQuery}
                      disabled={countryLoading || Boolean(countryError)}
                      onFocus={() => setCountryListOpen(true)}
                      onBlur={() => setCountryListOpen(false)}
                      onChange={(event) => {
                        setCountryQuery(event.target.value);
                        setCheckoutDetails((current) => ({ ...current, country: "" }));
                        setActiveCountryIndex(0);
                        setCountryListOpen(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown" && matchingCountries.length > 0) {
                          event.preventDefault();
                          setCountryListOpen(true);
                          setActiveCountryIndex((current) => Math.min(current + 1, matchingCountries.length - 1));
                        } else if (event.key === "ArrowUp" && matchingCountries.length > 0) {
                          event.preventDefault();
                          setActiveCountryIndex((current) => Math.max(current - 1, 0));
                        } else if (event.key === "Enter" && countryListOpen && matchingCountries[activeCountryIndex]) {
                          event.preventDefault();
                          selectCountry(matchingCountries[activeCountryIndex]);
                        } else if (event.key === "Escape") {
                          setCountryListOpen(false);
                        }
                      }}
                      style={{ paddingRight: 38 }}
                    />
                    <ChevronDown size={16} aria-hidden="true" style={{ position: "absolute", top: 14, right: 13, color: "#526746", pointerEvents: "none" }} />
                    {countryListOpen && !countryLoading && !countryError && <div id="checkout-country-options" role="listbox" aria-label={si ? "රටවල්" : "Countries"} style={{ position: "absolute", zIndex: 5, top: "calc(100% + 4px)", left: 0, right: 0, maxHeight: 220, overflowY: "auto", padding: 4, border: "1px solid #D8DCCB", borderRadius: 10, background: "#FFFEFC", boxShadow: "0 8px 20px rgba(36,69,22,.14)" }}>
                      {matchingCountries.length > 0 ? matchingCountries.map((name, index) => <div
                        id={`checkout-country-option-${index}`}
                        key={name}
                        role="option"
                        aria-selected={checkoutDetails.country === name}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectCountry(name)}
                        style={{ padding: "9px 10px", borderRadius: 7, background: activeCountryIndex === index ? "#E8EDD9" : "transparent", color: "#283C1C", cursor: "pointer", fontWeight: 500 }}
                      >{si && name === "Sri Lanka" ? "ශ්‍රී ලංකාව" : name}</div>) : <div style={{ padding: "9px 10px", color: "#71695E", fontWeight: 400 }}>{si ? "සෙවුමට ගැළපෙන රටවල් හමු නොවීය." : "No countries match your search."}</div>}
                    </div>}
                  </div>
                  {countryLoading && <span role="status" style={{ color: "#71695E", fontSize: ".74rem", fontWeight: 400 }}>{si ? "රටවල් ලැයිස්තුව පූරණය වෙමින්…" : "Loading country list…"}</span>}
                  {countryError && <div role="alert" style={{ display: "flex", alignItems: "center", gap: 8, color: "#8F2D26", fontSize: ".74rem", fontWeight: 400 }}>
                    <span>{si ? "රටවල් පූරණය කළ නොහැක." : "Could not load countries."} {countryError}</span>
                    <button type="button" onClick={() => setCountryRetry((retry) => retry + 1)} style={{ border: 0, padding: 0, color: "#31551F", background: "transparent", font: "inherit", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>{si ? "නැවත උත්සාහ කරන්න" : "Retry"}</button>
                  </div>}
                </div>
                <label style={{ display: "grid", gap: 7, color: "#405235", fontSize: ".8rem", fontWeight: 700 }}><span>{si ? "දුරකථන අංකය" : "Contact number"} <span style={{ color: "#9A7048" }}>*</span></span><input className="checkout-control" required type="tel" autoComplete="tel" value={checkoutDetails.contactNumber} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, contactNumber: event.target.value })} /></label>
                <label className="checkout-span" style={{ display: "grid", gap: 7, color: "#405235", fontSize: ".8rem", fontWeight: 700 }}>{si ? "බෙදාහැරීමේ සටහන" : "Delivery note"} <span style={{ color: "#847A68", fontWeight: 400 }}>({si ? "විකල්ප" : "optional"})</span><textarea className="checkout-control" rows={2} maxLength={1000} value={checkoutDetails.additionalNote} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, additionalNote: event.target.value })} style={{ resize: "vertical" }} /></label>
              </div>
              <button type="button" className="checkout-next" onClick={(event) => { const form = event.currentTarget.closest("form"); if (!form?.reportValidity()) return; setCheckoutError(""); setCheckoutStep("payment"); }}>{si ? "ඊළඟට" : "Next"}<ArrowRight size={17} aria-hidden="true" /></button>
            </div>
            <div className="checkout-pane checkout-payment">
              <button type="button" className="checkout-back" onClick={() => setCheckoutStep("delivery")}><ArrowRight size={16} aria-hidden="true" style={{ transform: "rotate(180deg)" }} />{si ? "බෙදාහැරීම වෙත ආපසු" : "Back to delivery"}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}><span style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 12, color: "#31551F", background: "rgba(255,255,255,.62)" }}><CreditCard size={18} /></span><div><h3 style={{ margin: 0, fontSize: ".98rem", fontWeight: 800 }}>{si ? "ගෙවීමේ ක්‍රමය" : "Payment method"}</h3><span style={{ color: "#847A68", fontSize: ".76rem" }}>{si ? "එක් ක්‍රමයක් තෝරන්න" : "Choose one option"}</span></div></div>
              <div role="group" aria-label="Payment method" className="checkout-methods">
                <button type="button" aria-pressed={checkoutPaymentMethod === "Payment slip"} onClick={() => { setPaymentMethod("Payment slip"); setCheckoutError(""); setPaymentSlipStep("bank"); setPaymentSlipOpen(true); }} className={`checkout-method${checkoutPaymentMethod === "Payment slip" ? " selected" : ""}`}>
                  <Receipt size={20} aria-hidden="true" />
                  <strong style={{ display: "block", fontSize: ".85rem" }}>{si ? "ගෙවීම් රිසිට්පත" : "Payment slip"}</strong>
                </button>
                <div role="note" aria-label={si ? "මාර්ගගත ගෙවීම ළඟදීම ලබාගත හැක" : "Online payment coming soon"} className="checkout-method" style={{ display: "grid", gridTemplateColumns: "24px 1fr", gridTemplateRows: "auto auto", alignContent: "center", columnGap: 9, rowGap: 4, color: "#7B806E", background: "#F3F2EA", border: "1px dashed rgba(45,80,22,.2)", cursor: "default", boxShadow: "none" }}>
                  <CreditCard size={20} aria-hidden="true" style={{ gridRow: "1 / span 2", alignSelf: "center" }} />
                  <strong style={{ display: "block", fontSize: ".85rem" }}>{si ? "මාර්ගගත ගෙවීම" : "Online payment"}</strong>
                  <small style={{ color: "#8B5E3C", fontSize: ".7rem", fontWeight: 700 }}>{si ? "ළඟදීම ලබාගත හැක" : "Available soon"}</small>
                </div>
              </div>
              {checkoutPaymentMethod === "Payment slip" && !paymentSlipOpen && paymentSlip && paymentSlipPreviewUrl && <div aria-label={`${si ? "රිසිට්පතේ පෙරදසුන" : "Preview of"} ${paymentSlip.name}`} style={{ display: "grid", gap: 8, minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden", marginTop: 13, padding: 10, border: "1px solid rgba(45,80,22,.14)", borderRadius: 13, background: "rgba(255,254,250,.8)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minWidth: 0 }}><strong title={paymentSlip.name} style={{ flex: 1, minWidth: 0, overflow: "hidden", color: "#405235", fontSize: ".76rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{paymentSlip.name}</strong><button type="button" onClick={() => setPaymentSlipOpen(true)} style={{ flexShrink: 0, padding: "5px 9px", border: "1px solid rgba(45,80,22,.18)", borderRadius: 8, color: "#31551F", background: "#FFFEFA", fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}>{si ? "වෙනස් කරන්න" : "Change"}</button></div>
                {paymentSlipKind(paymentSlip) === "image" ? <img src={paymentSlipPreviewUrl} alt={`${si ? "ගෙවීම් රිසිට්පත" : "Payment slip"}: ${paymentSlip.name}`} style={{ display: "block", width: "100%", minWidth: 0, maxWidth: "100%", height: 150, boxSizing: "border-box", objectFit: "contain", borderRadius: 8, background: "#fff" }} /> : <iframe title={`${si ? "ගෙවීම් රිසිට්පතේ පෙරදසුන" : "Payment slip preview"}: ${paymentSlip.name}`} src={paymentSlipPreviewUrl} style={{ display: "block", width: "100%", minWidth: 0, maxWidth: "100%", height: 150, boxSizing: "border-box", border: 0, borderRadius: 8, background: "#fff" }} />}
              </div>}
              <div style={{ display: "grid", gap: 10, marginTop: 20, padding: 16, border: "1px solid rgba(45,80,22,.11)", borderRadius: 15, background: "rgba(255,254,250,.75)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><strong style={{ color: "#405235", fontSize: ".82rem" }}>{si ? "ඇණවුම් සාරාංශය" : "Order summary"}</strong><span style={{ padding: "3px 8px", borderRadius: 20, color: "#526746", background: "#E8EDD9", fontSize: ".7rem", fontWeight: 700 }}>{items.reduce((total, item) => total + item.qty, 0)} {si ? "භාණ්ඩ" : "items"}</span></div>
                <div style={{ display: "grid", gap: 8, maxHeight: 116, overflowY: "auto" }}>{selectedPricedItems.map((item) => <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#71695E", fontSize: ".76rem" }}><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productDisplayName(item.product, language)} × {item.qty}</span><strong style={{ flexShrink: 0, color: "#405235", fontSize: ".76rem" }}>{item.unitPrice === null ? "Contact for price" : formatDollarAmount(item.unitPrice * item.qty)}</strong></div>)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 11, borderTop: "1px solid rgba(45,80,22,.12)", color: "#244516", fontSize: ".95rem" }}><strong>{si ? "ඇස්තමේන්තුගත මුළු එකතුව" : "Estimated total"}</strong><strong>{selectedEstimatedTotal === null ? (si ? "මිල සඳහා විමසන්න" : "Contact for price") : formatDollarAmount(selectedEstimatedTotal)}</strong></div>
              </div>
              {checkoutError && <p role="alert" style={{ margin: "13px 0 0", padding: "10px 12px", borderRadius: 10, color: "#8F2D26", background: "#FFF3F0", border: "1px solid #E6B6AE", fontSize: ".84rem" }}>{checkoutError}</p>}
              <button type="submit" disabled={checkoutSubmitting || selectedItems.length === 0} style={{ width: "100%", marginTop: 15, padding: "14px 18px", border: 0, borderRadius: 30, color: "#FAF6EE", background: "linear-gradient(110deg,#31591C,#244516)", boxShadow: "0 8px 18px rgba(36,69,22,.2)", fontWeight: 800, fontSize: ".91rem", cursor: checkoutSubmitting ? "wait" : "pointer", opacity: checkoutSubmitting || selectedItems.length === 0 ? .68 : 1 }}>{checkoutSubmitting ? checkoutPaymentMethod === "Payment slip" ? (si ? "රිසිට්පත උඩුගත කර ඇණවුම යවමින්…" : "Uploading slip and placing order…") : (si ? "ඇණවුම යවමින්…" : "Placing order…") : (si ? "ඇණවුම තහවුරු කරන්න" : "Place order")}<span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></button>
            </div>
          </form>}
        </section>
      </div>}
      {checkoutOpen && paymentSlipOpen && <div role="presentation" onClick={() => setPaymentSlipOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1120, display: "grid", placeItems: "center", padding: 16, background: "rgba(15,28,9,.68)" }}>
        <section role="dialog" aria-modal="true" aria-labelledby="payment-slip-title" onClick={(event) => event.stopPropagation()} style={{ width: "min(100%, 840px)", maxHeight: "min(92vh, 760px)", overflowY: "auto", border: "1px solid rgba(45,80,22,.2)", borderRadius: 22, background: "#FBF8F0", color: "#244516", boxShadow: "0 30px 80px rgba(0,0,0,.38)" }}>
          <style>{".payment-slip-next,.payment-slip-back{display:none}@media(max-width:680px){.payment-slip-layout{grid-template-columns:1fr}.payment-slip-layout:not(.mobile-upload-step) [aria-labelledby=upload-slip-heading]{display:none}.payment-slip-layout.mobile-upload-step [aria-labelledby=bank-account-heading]{display:none}.payment-slip-layout.mobile-upload-step [aria-labelledby=upload-slip-heading]>span[aria-hidden=true]{display:none!important}.payment-slip-next,.payment-slip-back{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;padding:13px 16px;border:0;border-radius:28px;color:#FAF6EE;background:linear-gradient(110deg,#31591C,#244516);font:inherit;font-weight:800;cursor:pointer}.payment-slip-back{margin:0 0 16px;border:1px solid rgba(45,80,22,.2);color:#31551F;background:#FFFEFC}}"}</style>
          <header style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", borderBottom: "1px solid rgba(45,80,22,.12)", background: "#FBF8F0" }}>
            <div><p style={{ margin: "0 0 4px", color: "#9A7048", fontSize: ".67rem", fontWeight: 800, letterSpacing: ".14em" }}>{si ? "බැංකු මාරු කිරීම" : "BANK TRANSFER"}</p><h2 id="payment-slip-title" style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 500 }}>{si ? "ගෙවීම් රිසිට්පත" : "Payment slip"}</h2></div>
            <button type="button" aria-label={si ? "ගෙවීම් විස්තර වසන්න" : "Close payment slip details"} onClick={() => setPaymentSlipOpen(false)} style={{ width: 38, height: 38, display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid rgba(45,80,22,.16)", borderRadius: "50%", color: "#31551F", background: "#FFFEFA", cursor: "pointer" }}><X size={18} /></button>
          </header>
          <div className={`payment-slip-layout${paymentSlipStep === "upload" ? " mobile-upload-step" : ""}`}>
            <section className="payment-slip-column" aria-labelledby="bank-account-heading">
              <span aria-hidden="true" style={{ width: 42, height: 42, display: "grid", placeItems: "center", marginBottom: 14, borderRadius: 14, color: "#31551F", background: "#E6ECD9" }}><CreditCard size={21} /></span>
              <h3 id="bank-account-heading" style={{ margin: "0 0 7px", fontSize: "1rem" }}>{si ? "මෙම ගිණුමට මුදල් මාරු කරන්න" : "Transfer to this account"}</h3>
              <p style={{ margin: "0 0 18px", color: "#71695E", fontSize: ".82rem", lineHeight: 1.55 }}>{si ? "බැංකු මාරුව සම්පූර්ණ කර, රිසිට්පතේ පැහැදිලි ඡායාරූපයක් හෝ PDF ගොනුවක් උඩුගත කරන්න." : "Complete your bank transfer, then upload a clear photo or PDF of the receipt."}</p>
              <dl style={{ display: "grid", gap: 0, margin: 0, padding: "4px 15px", border: "1px solid rgba(45,80,22,.12)", borderRadius: 14, background: "#FFFEFA" }}>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(45,80,22,.1)" }}><dt style={{ color: "#847A68", fontSize: ".72rem" }}>{si ? "ගිණුමේ නම" : "Account name"}</dt><dd style={{ margin: "4px 0 0", color: "#31551F", fontWeight: 800, lineHeight: 1.4 }}>Rajapura Herbal Drugs Co. (Pvt) Ltd</dd></div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(45,80,22,.1)" }}><dt style={{ color: "#847A68", fontSize: ".72rem" }}>{si ? "ගිණුම් අංකය" : "Account number"}</dt><dd style={{ margin: "5px 0 0", color: "#244516", fontSize: "1.18rem", fontWeight: 800, letterSpacing: ".04em" }}>007410001661</dd></div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(45,80,22,.1)" }}><dt style={{ color: "#847A68", fontSize: ".72rem" }}>{si ? "බැංකුව" : "Bank"}</dt><dd style={{ margin: "4px 0 0", color: "#31551F", fontWeight: 700 }}>Sampath Bank</dd></div>
                <div style={{ padding: "12px 0" }}><dt style={{ color: "#847A68", fontSize: ".72rem" }}>{si ? "ශාඛාව / රට" : "Branch / country"}</dt><dd style={{ margin: "4px 0 0", color: "#31551F", fontWeight: 700 }}>{si ? "මොනරාගල, ශ්‍රී ලංකාව" : "Monaragala, Sri Lanka"}</dd></div>
              </dl>
              <button type="button" className="payment-slip-next" onClick={() => setPaymentSlipStep("upload")}>{si ? "ඊළඟට: රිසිට්පත උඩුගත කරන්න" : "Next: upload receipt"}<ArrowRight size={17} aria-hidden="true" /></button>
            </section>

            <section className="payment-slip-column" aria-labelledby="upload-slip-heading" style={{ borderLeft: "1px solid rgba(45,80,22,.1)", background: "linear-gradient(160deg,#F1F3E7,#E9EEDC)" }}>
              <button type="button" className="payment-slip-back" onClick={() => setPaymentSlipStep("bank")}><ArrowRight size={16} aria-hidden="true" style={{ transform: "rotate(180deg)" }} />{si ? "ආපසු බැංකු විස්තර වෙත" : "Back to bank details"}</button>
              <span aria-hidden="true" style={{ width: 42, height: 42, display: "grid", placeItems: "center", marginBottom: 14, borderRadius: 14, color: "#31551F", background: "rgba(255,255,255,.7)" }}><Upload size={21} /></span>
              <h3 id="upload-slip-heading" style={{ margin: "0 0 7px", fontSize: "1rem" }}>{si ? "ඔබගේ රිසිට්පත උඩුගත කරන්න" : "Upload your receipt"}</h3>
              <p style={{ margin: "0 0 15px", color: "#71695E", fontSize: ".82rem", lineHeight: 1.55 }}>{si ? "පිළිගන්නා ගොනු: රූපයක් හෝ PDF, උපරිමය 4 MB." : "Accepted formats: image or PDF, up to 4 MB."}</p>
              <label style={{ position: "relative", display: "flex", alignItems: "center", gap: 11, minHeight: 68, padding: "12px", overflow: "hidden", border: "1px dashed rgba(45,80,22,.34)", borderRadius: 13, background: "rgba(255,254,250,.8)", color: "#2D5016", cursor: "pointer" }}>
                <span style={{ width: 36, height: 36, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 10, background: "#E5ECD8" }}><Upload size={17} /></span>
                <span style={{ display: "grid", gap: 4, minWidth: 0, flex: 1 }}><strong title={paymentSlip?.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: ".79rem" }}>{paymentSlip?.name ?? (si ? "ගෙවීම් රිසිට්පතක් තෝරන්න" : "Choose a payment slip")}</strong><small style={{ color: "#71695E", fontSize: ".72rem" }}>{paymentSlip ? `${(paymentSlip.size / (1024 * 1024)).toFixed(2)} MB · ${si ? "වෙනත් ගොනුවක් තෝරන්න" : "select to replace"}` : (si ? "ඔබගේ උපාංගයෙන් ගොනුවක් තෝරන්න" : "Browse files on your device")}</small></span>
                <span style={{ flexShrink: 0, padding: "7px 10px", border: "1px solid rgba(45,80,22,.18)", borderRadius: 9, background: "#FFFEFA", fontSize: ".72rem", fontWeight: 700 }}>{paymentSlip ? (si ? "වෙනස් කරන්න" : "Change") : (si ? "තෝරන්න" : "Browse")}</span>
                <input type="file" accept="image/*,application/pdf,.pdf" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 4 * 1024 * 1024) {
                    setCheckoutError(si ? "ගෙවීම් රිසිට්පත 4 MB හෝ ඊට අඩු විය යුතුය." : "The payment slip must be 4 MB or smaller.");
                    event.target.value = "";
                    return;
                  }
                  if (!paymentSlipKind(file)) {
                    setCheckoutError(si ? "ගෙවීම් රිසිට්පත රූපයක් හෝ PDF ගොනුවක් ලෙස උඩුගත කරන්න." : "Upload the payment slip as an image or PDF.");
                    event.target.value = "";
                    return;
                  }
                  setPaymentSlip(file);
                  setCheckoutError("");
                }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
              </label>
              {paymentSlip && paymentSlipPreviewUrl && <div aria-label={`Preview of ${paymentSlip.name}`} style={{ display: "grid", gap: 8, marginTop: 14, padding: 10, border: "1px solid rgba(45,80,22,.16)", borderRadius: 12, background: "rgba(255,254,250,.85)" }}>
                <strong style={{ color: "#405235", fontSize: ".76rem" }}>{si ? "රිසිට්පතේ පෙරදසුන" : "Receipt preview"}</strong>
                {paymentSlipKind(paymentSlip) === "image" ? <img src={paymentSlipPreviewUrl} alt={`Payment slip: ${paymentSlip.name}`} style={{ display: "block", width: "100%", maxHeight: 230, objectFit: "contain", borderRadius: 8, background: "#fff" }} /> : <iframe title={`Payment slip preview: ${paymentSlip.name}`} src={paymentSlipPreviewUrl} style={{ width: "100%", height: 230, border: 0, borderRadius: 8, background: "#fff" }} />}
              </div>}
              {checkoutError && <p role="alert" style={{ margin: "12px 0 0", padding: "9px 11px", border: "1px solid #E6B6AE", borderRadius: 9, color: "#8F2D26", background: "#FFF3F0", fontSize: ".8rem" }}>{checkoutError}</p>}
              <button type="button" onClick={() => setPaymentSlipOpen(false)} style={{ width: "100%", marginTop: 16, padding: "12px 16px", border: 0, borderRadius: 28, color: "#FAF6EE", background: "#2D5016", fontWeight: 800, cursor: "pointer" }}>{paymentSlip ? (si ? "හරි" : "Done") : (si ? "පසුව රිසිට්පත තෝරන්න" : "Choose slip later")}</button>
            </section>
          </div>
        </section>
      </div>}
      {checkoutOpen && checkoutSubmitting && <div role="status" aria-live="polite" aria-label={orderProgress} style={{ position: "fixed", inset: 0, zIndex: 1150, display: "grid", placeItems: "center", padding: 16, boxSizing: "border-box", background: "rgba(13,25,8,.72)" }}>
        <div style={{ width: "min(100%, 960px)", height: "min(94vh, 900px)", boxSizing: "border-box", display: "grid", alignContent: "center", justifyItems: "center", gap: 18, padding: 28, border: "1px solid rgba(45,80,22,.2)", borderRadius: 26, background: "rgba(251,248,240,.97)", color: "#244516", textAlign: "center", boxShadow: "0 32px 90px rgba(0,0,0,.34)" }}>
          {isUploadingPaymentSlip || paymentSlipUploadComplete ? <div role="progressbar" aria-label={si ? "ප්‍රගතිය" : "Payment slip upload progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={paymentSlipUploadProgress} style={{ position: "relative", width: 66, height: 66, display: "grid", placeItems: "center", color: "#31551F" }}>
            <svg aria-hidden="true" viewBox="0 0 66 66" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="33" cy="33" r="28" fill="none" stroke="rgba(49,85,31,.15)" strokeWidth="5" />
              <circle cx="33" cy="33" r="28" fill="none" stroke="#5E8B36" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - paymentSlipUploadProgress / 100)} style={{ transition: "stroke-dashoffset .18s ease" }} />
            </svg>
            <span style={{ fontSize: ".9rem", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{paymentSlipUploadProgress}%</span>
          </div> : <span aria-hidden="true" style={{ width: 54, height: 54, border: "5px solid rgba(49,85,31,.16)", borderTopColor: "#31551F", borderRadius: "50%", animation: "checkout-progress-spin .75s linear infinite" }} />}
          <div style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.25rem,3vw,1.7rem)", fontWeight: 500 }}>{orderProgress}</strong>
            <span style={{ color: "#71695E", fontSize: ".92rem", lineHeight: 1.6 }}>{paymentSlipUploadComplete ? (si ? "ගෙවීම් රිසිට්පත උඩුගත කිරීම සම්පූර්ණයි (100%)" : "Payment slip upload complete (100%)") : isFinalizingPaymentSlipUpload ? (si ? "ගොනුව යවා ඇත. UploadThing තහවුරු කරන තෙක් රැඳී සිටින්න…" : "File sent. Waiting for UploadThing to finish…") : isUploadingPaymentSlip ? (si ? `ගෙවීම් රිසිට්පත ${paymentSlipUploadProgress}% උඩුගත කර ඇත` : `${paymentSlipUploadProgress}% uploaded`) : si ? "ඔබගේ ඇණවුම සැකසීම අවසන් වන තෙක් මෙම කවුළුව විවෘතව තබන්න." : "Please keep this window open while we finish processing your order."}</span>
          </div>
          <div aria-hidden="true" style={{ width: "min(100%, 280px)", height: 5, overflow: "hidden", borderRadius: 5, background: "#E5EAD9" }}>
            <span style={{ display: "block", width: isUploadingPaymentSlip || paymentSlipUploadComplete ? `${paymentSlipUploadProgress}%` : "42%", height: "100%", borderRadius: 5, background: "linear-gradient(90deg,#31551F,#8BC34A)", transition: isUploadingPaymentSlip || paymentSlipUploadComplete ? "width .18s ease" : undefined, animation: isUploadingPaymentSlip || paymentSlipUploadComplete ? undefined : "checkout-progress-bar 1.2s ease-in-out infinite alternate" }} />
          </div>
          <style>{"@keyframes checkout-progress-spin{to{transform:rotate(360deg)}}@keyframes checkout-progress-bar{from{transform:translateX(-15%)}to{transform:translateX(155%)}}"}</style>
        </div>
      </div>}
    </main>
  );
}
