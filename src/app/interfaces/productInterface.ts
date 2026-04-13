export interface Product {
  _id: string;
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