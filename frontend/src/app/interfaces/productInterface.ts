import { Schema } from "mongoose";
import type { LocalizedList, LocalizedText } from "../i18n/LanguageContext";

export interface Product {
  _id: Schema.Types.ObjectId | string;
  name: string;
  sinhalaName: string;
  tamilName?: string;
  category: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse?: string[];
  price: string;
  image: string;
  badge?: string;
  translations?: {
    name?: LocalizedText; category?: LocalizedText; description?: LocalizedText;
    benefits?: LocalizedList; ingredients?: LocalizedList; howToUse?: LocalizedList;
  };
}
