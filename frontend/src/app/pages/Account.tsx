import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const api = import.meta.env.VITE_BACKEND_URL;

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  border: "1px solid #D9DCCB",
  borderRadius: 10,
  background: "#FFFEFB",
  color: "#283C1C",
  font: "inherit",
  outlineColor: "#8BC34A",
};
const eyebrowStyle = { color: "#8B5E3C", letterSpacing: ".16em", fontSize: ".7rem", fontWeight: 700, margin: "19px 0 8px" };
const headingStyle = { fontFamily: "'Playfair Display',serif", color: "#244516", fontSize: "clamp(1.8rem, 5vw, 2.15rem)", lineHeight: 1.2, margin: "0 0 9px", fontWeight: 500 };
const descriptionStyle = { color: "#71695E", lineHeight: 1.65, margin: 0, fontSize: ".98rem" };
const labelStyle = { display: "grid", gap: 8, color: "#344A27", fontWeight: 700, fontSize: ".94rem" };
const primaryButtonStyle = { marginTop: 2, padding: "14px 18px", border: "1px solid #2D5016", borderRadius: 28, color: "#FFFEF7", background: "linear-gradient(135deg, #31591C, #244516)", boxShadow: "0 6px 15px rgba(45,80,22,.17)", fontWeight: 700, fontSize: "1rem", cursor: "pointer" };

function AccountMark() {
  return <div aria-hidden="true" style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", color: "#F8F4E8", background: "#145B43", boxShadow: "inset 0 0 0 3px rgba(212,160,23,.42)" }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-7 8-16Z"/><path d="M5 20c3-5 6-7 11-10"/></svg>
  </div>;
}

export default function Account() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        // setCountry(data.country_code ?? null)
        setCountry('USA')
      })
      .catch(() => setCountry(null))
      .finally(() => setLocationChecked(true));
  }, []);

  useEffect(() => {
    if (!locationChecked || country === "LK") return;
    axios.get(`${api}/auth/customer/status`, { withCredentials: true })
      .then(async ({ data }) => {
        if (data.authenticated && data.role === "USER") {
          navigate("/profile", { replace: true });
        }
      })
      .catch(() => undefined);
  }, [locationChecked, country, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (registering) {
        await axios.post(`${api}/auth/customer/register`, { name, email, password }, { withCredentials: true });
      } else {
        await axios.post(`${api}/auth/customer/login`, { username: email, password }, { withCredentials: true });
        const { data } = await axios.get(`${api}/auth/customer/me`, { withCredentials: true });
        if (data.data.role !== "USER") {
          await axios.post(`${api}/auth/customer/logout`, {}, { withCredentials: true });
          throw new Error("Please sign in with a customer account.");
        }
      }
      window.dispatchEvent(new Event("rajapura:auth-updated"));
      navigate("/profile", { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? "Unable to complete your request.");
    } finally {
      setBusy(false);
    }
  };

  if (!locationChecked) {
    return <main style={{ minHeight: 520, display: "grid", placeItems: "center", background: "radial-gradient(ellipse at 50% 0%, rgba(139,195,74,.09), transparent 52%)" }}>
      <div role="status" aria-label="Loading" style={{ width: 36, height: 36, border: "3px solid rgba(45,80,22,.15)", borderTopColor: "#2D5016", borderRadius: "50%", animation: "account-spin .8s linear infinite" }} />
      <style>{"@keyframes account-spin{to{transform:rotate(360deg)}}"}</style>
    </main>;
  }

  if (country === "LK") return <Navigate to="/products" replace />;

  return (
    <main style={{ minHeight: 520, display: "grid", placeItems: "center", padding: "clamp(32px, 7vw, 76px) 20px", color: "#2D5016", fontFamily: "'Lato',sans-serif", background: "radial-gradient(ellipse at 50% 0%, rgba(139,195,74,.09), transparent 52%)" }}>
      <section style={{ position: "relative", overflow: "hidden", width: "min(100%, 480px)", boxSizing: "border-box", padding: "clamp(26px, 5vw, 40px)", background: "linear-gradient(145deg, #FFFEFA 0%, #FAF6EE 72%)", border: "1px solid rgba(45,80,22,.16)", borderRadius: 22, boxShadow: "0 20px 55px rgba(45,80,22,.11), 0 2px 8px rgba(45,80,22,.04)" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #2D5016, #8BC34A 52%, #D4A017)" }} />
        <>
            <AccountMark />
            <p style={eyebrowStyle}>CUSTOMER ACCOUNT</p>
            <h1 style={headingStyle}>{registering ? "Create your account" : "Sign in"}</h1>
            <p style={descriptionStyle}>{registering ? "Join Rajapura to shop and manage your account." : "Sign in to continue with your international order."}</p>
            <form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 27 }}>
              {registering && <label style={labelStyle}>Name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} style={fieldStyle} /></label>}
              <label style={labelStyle}>Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} /></label>
              <label style={labelStyle}>Password<div style={{ position: "relative" }}><input required minLength={registering ? 8 : 1} maxLength={128} type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} style={{ ...fieldStyle, paddingRight: 48 }} /><button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", display: "grid", placeItems: "center", width: 30, height: 30, padding: 0, border: 0, borderRadius: 7, color: "#526746", background: "transparent", cursor: "pointer" }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{registering && <small style={{ color: "#777064", fontWeight: 400 }}>Use at least 8 characters.</small>}</label>
              {error && <p role="alert" style={{ color: "#9D3029", background: "#FBEDEA", border: "1px solid #EBCBC5", borderRadius: 9, padding: "10px 12px", margin: 0, fontSize: ".92rem" }}>{error}</p>}
              <button disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? .75 : 1, cursor: busy ? "wait" : "pointer" }}>{busy ? "Please wait…" : registering ? "Create account" : "Sign in"}</button>
            </form>
            <p style={{ margin: "22px 0 0", color: "#6B6257", fontSize: ".92rem", textAlign: "center" }}>
              {registering ? "Already have an account? " : "New to Rajapura? "}
              <button type="button" onClick={() => { setRegistering(current => !current); setError(""); }} style={{ padding: 0, border: 0, borderBottom: "1px solid #8BC34A", background: "none", color: "#2D5016", fontWeight: 700, cursor: "pointer", font: "inherit" }}>{registering ? "Sign in" : "Create an account"}</button>
            </p>
            <Link to="/products" style={{ display: "flex", width: "fit-content", alignItems: "center", gap: 7, margin: "22px auto 0", padding: "8px 13px", border: 0, borderRadius: 999, color: "#765033", background: "transparent", textDecoration: "none", fontSize: ".88rem", fontWeight: 700 }}><span aria-hidden="true">←</span> Continue browsing products</Link>
        </>
      </section>
    </main>
  );
}
