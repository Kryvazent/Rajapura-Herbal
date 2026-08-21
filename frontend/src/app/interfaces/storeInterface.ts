import type { LocalizedText } from "../i18n/LanguageContext";
export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: "Pharmacy" | "Ayurvedic Store" | "Health Center" | "Supermarket";
  translations?: { name?: LocalizedText; address?: LocalizedText; hours?: LocalizedText };
}

export interface Town {
  name: string;
  shops: Shop[];
  translations?: { name?: LocalizedText };
}

export interface District {
  name: string;
  towns: Town[];
  translations?: { name?: LocalizedText };
}

export interface Province {
  name: string;
  icon: string;
  districts: District[];
  translations?: { name?: LocalizedText };
}

export interface PanelProps {
  active: boolean;
  color: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}
