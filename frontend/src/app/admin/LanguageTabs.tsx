import { LANGUAGES, LANGUAGE_LABELS, Language } from "../i18n/LanguageContext";

export default function LanguageTabs({ value, onChange }: { value: Language; onChange: (language: Language) => void }) {
  return <div role="tablist" aria-label="Content language" style={{ display: "flex", gap: 5, padding: 5, background: "#edf2e7", borderRadius: 11, marginBottom: 16 }}>
    {LANGUAGES.map((language) => <button key={language} type="button" role="tab" aria-selected={value === language} onClick={() => onChange(language)} style={{ flex: 1, border: 0, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontWeight: 700, color: value === language ? "white" : "#45623a", background: value === language ? "#2D5016" : "transparent" }}>{LANGUAGE_LABELS[language]}</button>)}
  </div>;
}
