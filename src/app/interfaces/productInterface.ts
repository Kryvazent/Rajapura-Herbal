import { Schema } from "mongoose";

export interface Product {
  _id: Schema.Types.ObjectId | string;
  name: string;
  sinhalaName: string;
  category: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse?: string[];
  price: string;
  image: string;
  badge?: string;
}