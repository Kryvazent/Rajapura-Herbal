import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGE_LABELS, messages } from "./translations/common";

export { LANGUAGE_LABELS };

export const LANGUAGES = ["en", "si", "ta"] as const;
export type Language = (typeof LANGUAGES)[number];
export type LocalizedText = Partial<Record<Language, string>>;
export type LocalizedList = Partial<Record<Language, string[]>>;

type MessageKey = keyof typeof messages.en;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("rajapura-language");
    return LANGUAGES.includes(saved as Language) ? (saved as Language) : "en";
  });
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("rajapura-language", next); };
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: MessageKey) => messages[language][key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function localized(value: unknown, language: Language, fallback = ""): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;
  const text = value as LocalizedText;
  return text[language]?.trim() || text.en?.trim() || text.si?.trim() || text.ta?.trim() || fallback;
}

export function localizedList(value: unknown, language: Language): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (!value || typeof value !== "object") return [];
  const list = value as LocalizedList;
  return list[language] ?? list.en ?? list.si ?? list.ta ?? [];
}
