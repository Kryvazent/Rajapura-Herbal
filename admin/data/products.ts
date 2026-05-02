export interface Product {
  id: number;
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

export const products: Product[] = [
  {
    id: 1,
    name: "Rajapura Herbal Tea",
    sinhalaName: "රාජපුර ඖෂධ තේ",
    category: "Teas & Infusions",
    description:
      "A sacred blend of Ceylon herbs carefully hand-picked from mountain highlands. Crafted with ancient Ayurvedic wisdom to restore balance, promote digestion, and calm the mind.",
    benefits: ["Improves digestion", "Reduces stress", "Boosts immunity", "Detoxifies body"],
    ingredients: ["Gotukola", "Venival", "Coriander", "Cardamom", "Ginger"],
    howToUse: [
      "Add 1 teaspoon of the herbal blend to a cup of hot water (not boiling, around 85°C).",
      "Steep for 5–7 minutes, then strain into your cup.",
      "Sip slowly and mindfully, ideally before meals or at bedtime.",
      "You may sweeten with a little raw honey if desired — do not add sugar.",
      "For best results, drink 2 cups daily consistently for at least 4 weeks.",
    ],
    price: "LKR 850",
    image:
      "https://images.unsplash.com/photo-1762920738963-002dbf2b4501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjB0ZWElMjBuYXR1cmFsJTIwd2VsbG5lc3MlMjBpbmdyZWRpZW50c3xlbnwxfHx8fDE3NzIwMzUxNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Ayurvedic Wellness Oil",
    sinhalaName: "ආයුර්වේද සෞඛ්‍ය තෙල්",
    category: "Oils & Serums",
    description:
      "Cold-pressed from rare medicinal plants, this sacred oil is infused with 32 traditional herbs. Used for abhyanga massage to nourish tissues and revitalize vital energy.",
    benefits: ["Relieves joint pain", "Nourishes skin", "Promotes sleep", "Balances doshas"],
    ingredients: ["Sesame Oil", "Ashwagandha", "Brahmi", "Neem", "Turmeric"],
    howToUse: [
      "Gently warm the oil by placing the sealed bottle in warm water for 3–5 minutes.",
      "Apply a generous amount to the skin using long, circular massage strokes.",
      "Begin at the extremities and work towards the heart — this is the traditional abhyanga method.",
      "Leave the oil on for at least 20–30 minutes to allow deep absorption.",
      "Rinse off with warm water. Use 3–4 times a week for best results.",
      "For joint pain relief, apply directly to the affected area and massage firmly.",
    ],
    price: "LKR 1,450",
    image:
      "https://images.unsplash.com/photo-1608347762536-b80dd8f622b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkYSUyMGVzc2VudGlhbCUyMG9pbCUyMG5hdHVyYWwlMjByZW1lZHl8ZW58MXx8fHwxNzcyMDM1MTcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Premium",
  },
  {
    id: 3,
    name: "Herbal Immunity Capsules",
    sinhalaName: "ඖෂධ ප්‍රතිශක්ති කැප්සියුල",
    category: "Supplements",
    description:
      "A powerful formula combining adaptogenic herbs to strengthen your body's natural defenses. Each capsule contains concentrated plant extracts standardized for maximum potency.",
    benefits: ["Boosts immunity", "Reduces fatigue", "Anti-inflammatory", "Antioxidant rich"],
    ingredients: ["Ashwagandha", "Amla", "Giloy", "Tulsi", "Black Pepper"],
    howToUse: [
      "Take 1–2 capsules twice daily, once in the morning and once in the evening.",
      "Always take capsules after meals to avoid gastric discomfort.",
      "Swallow with a glass of warm water or warm milk for better absorption.",
      "Use consistently for at least 6–8 weeks to experience full benefits.",
      "Not recommended for pregnant or breastfeeding women without medical advice.",
      "Keep out of reach of children. Store in a cool, dry place.",
    ],
    price: "LKR 1,200",
    image:
      "https://images.unsplash.com/photo-1606940743881-b33f4b04d661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBjYXBzdWxlcyUyMHN1cHBsZW1lbnRzJTIwbmF0dXJhbCUyMHdlbGxuZXNzfGVufDF8fHx8MTc3MjAzNTE3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "New",
  },
  {
    id: 4,
    name: "Botanical Skin Cream",
    sinhalaName: "ශාකමය සම් ක්‍රීම්",
    category: "Skincare",
    description:
      "Formulated with rare botanical extracts and traditional Sri Lankan herbs. This luxurious cream restores radiance, deeply moisturizes, and protects skin from environmental damage.",
    benefits: ["Deep moisturizing", "Anti-aging", "Brightening", "Soothes irritation"],
    ingredients: ["Coconut Oil", "Aloe Vera", "Sandalwood", "Rose", "Saffron"],
    howToUse: [
      "Cleanse your face with a mild, natural cleanser and gently pat dry.",
      "Take a small, pea-sized amount of cream on your fingertips.",
      "Apply evenly to face and neck, avoiding the immediate eye area.",
      "Gently massage in upward circular motions until fully absorbed.",
      "Use every morning and night for optimal results.",
      "For extra nourishment, apply a slightly thicker layer at night as a sleeping mask.",
    ],
    price: "LKR 980",
    image:
      "https://images.unsplash.com/photo-1768548658056-f5cbb2d3d795?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwY3JlYW0lMjBsb3Rpb24lMjBib3RhbmljYWwlMjBza2luY2FyZXxlbnwxfHx8fDE3NzIwMzUxNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 5,
    name: "Turmeric Wellness Powder",
    sinhalaName: "කහ සෞඛ්‍ය කුඩු",
    category: "Powders & Blends",
    description:
      "Pure organic turmeric blended with synergistic herbs to maximize curcumin absorption. This golden powder has been used for millennia to reduce inflammation and support overall vitality.",
    benefits: ["Anti-inflammatory", "Liver support", "Joint health", "Skin glow"],
    ingredients: ["Organic Turmeric", "Black Pepper", "Ginger", "Cinnamon", "Cardamom"],
    howToUse: [
      "Golden Milk: Mix ½ teaspoon into a warm glass of milk (dairy or plant-based) with a pinch of black pepper and honey.",
      "Smoothies: Blend ½ teaspoon into your morning fruit or vegetable smoothie.",
      "Cooking: Stir into curries, soups, rice dishes, or scrambled eggs.",
      "Start with ¼ teaspoon daily and gradually increase to 1 teaspoon as your body adjusts.",
      "The black pepper in the blend significantly enhances curcumin absorption — do not remove it.",
      "Best consumed daily in the morning for sustained anti-inflammatory benefit.",
    ],
    price: "LKR 680",
    image:
      "https://images.unsplash.com/photo-1634114627043-9a2abf455494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXJtZXJpYyUyMGdpbmdlciUyMHNwaWNlcyUyMGhlcmJhbCUyMHBvd2RlcnxlbnwxfHx8fDE3NzIwMzUxNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Organic",
  },
  {
    id: 6,
    name: "Rajapura Herbal Tonic",
    sinhalaName: "රාජපුර ඖෂධ ටොනික්",
    category: "Tonics & Syrups",
    description:
      "A revered liquid tonic prepared by master herbalists using a 200-year-old Rajapura family recipe. This powerful formulation supports energy, digestion, and whole-body wellness.",
    benefits: ["Energy boost", "Digestive health", "Stress relief", "Blood purification"],
    ingredients: ["Triphala", "Shatavari", "Licorice", "Honey", "Holy Basil"],
    howToUse: [
      "Shake the bottle gently before each use to ensure the herbs are evenly blended.",
      "Measure 2 tablespoons (30 ml) of tonic into a glass.",
      "Dilute with half a glass of lukewarm water — do not use cold water.",
      "Drink on an empty stomach, 30 minutes before breakfast, for maximum absorption.",
      "You may also take a second dose in the evening before dinner if needed.",
      "Do not exceed 60 ml (4 tablespoons) per day. Consult a physician before use if on medication.",
    ],
    price: "LKR 1,100",
    image:
      "https://images.unsplash.com/photo-1771576774943-3433ed2239f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBoZXJiYWwlMjBwcm9kdWN0cyUyMGJvdHRsZXMlMjBuYXR1cmFsfGVufDF8fHx8MTc3MjAzNTE2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];