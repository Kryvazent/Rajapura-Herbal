export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  duration: string;
  icon: string;
}

export interface ServiceLocation {
  id: number;
  name: string;
  area: string;
  address: string;
  mobile: string;
  altMobile: string;
  mapLabel: string;
  icon: string;
  color: string;
  lightColor: string;
  borderColor: string;
  description: string;
  services: ServiceItem[];
}

export const serviceLocations: ServiceLocation[] = [
  {
    id: 1,
    name: "Rajapura Wellness Centre – Paliyagoda",
    area: "Paliyagoda",
    address: "No. 18, Paliyagoda Road, Peliyagoda, Colombo",
    mobile: "+94 77 234 5678",
    altMobile: "+94 11 491 2300",
    mapLabel: "Western Province · Colombo District",
    icon: "🌆",
    color: "#2D5016",
    lightColor: "rgba(45,80,22,0.08)",
    borderColor: "rgba(45,80,22,0.2)",
    description:
      "Our flagship wellness centre in the heart of the Western Province, offering a full range of traditional Ayurvedic healing therapies. Each session is conducted by certified Ayurvedic therapists using 100% natural herbal oils from our own Rajapura range.",
    services: [
      { id: 1, name: "Full Body Ayurvedic Massage", description: "A head-to-toe traditional Abhyanga massage using warm medicated herbal oil. Deeply relaxing and detoxifying.", duration: "60 – 90 min", icon: "🫧" },
      { id: 2, name: "Foot Reflexology Massage", description: "Targeted pressure-point therapy on the feet, stimulating internal organs and improving circulation.", duration: "30 – 45 min", icon: "🦶" },
      { id: 3, name: "Head & Scalp Massage", description: "Brahmi-oil infused scalp massage to relieve tension, promote hair growth and calm the mind.", duration: "30 min", icon: "🧖" },
      { id: 4, name: "Back & Neck Relief Massage", description: "Deep-tissue targeted massage for chronic back pain, stiff neck and shoulder tension.", duration: "45 min", icon: "💆" },
      { id: 5, name: "Shirodhara – Oil Pouring Therapy", description: "Continuous warm herbal oil poured in a slow rhythmic stream over the forehead — the ultimate stress and anxiety treatment.", duration: "45 – 60 min", icon: "🫗" },
      { id: 6, name: "Herbal Steam Bath", description: "A medicated steam chamber infused with healing herbs to open pores, purify the skin and ease muscle aches.", duration: "20 – 30 min", icon: "♨️" },
    ],
  },
  {
    id: 2,
    name: "Rajapura Wellness Centre – Monaragala",
    area: "Monaragala",
    address: "No. 7, Wellawaya Road, Monaragala Town, Monaragala",
    mobile: "+94 76 891 2345",
    altMobile: "+94 55 227 6100",
    mapLabel: "Uva Province · Monaragala District",
    icon: "☕",
    color: "#8B5E3C",
    lightColor: "rgba(139,94,60,0.07)",
    borderColor: "rgba(139,94,60,0.2)",
    description:
      "Nestled in the peaceful Uva highlands, our Monaragala centre offers a truly serene Ayurvedic healing experience. Surrounded by nature, it is the ideal retreat for those seeking rest, rejuvenation and traditional herbal therapies away from the bustle of city life.",
    services: [
      { id: 1, name: "Full Body Ayurvedic Massage", description: "Traditional whole-body Abhyanga massage with warm Rajapura herbal oils, following ancient Ayurvedic technique.", duration: "60 – 90 min", icon: "🫧" },
      { id: 2, name: "Foot Reflexology Massage", description: "Soothing foot massage targeting pressure points to restore energy balance and relieve fatigue.", duration: "30 – 45 min", icon: "🦶" },
      { id: 3, name: "Relaxation Massage", description: "A gentle, flowing full-body massage designed to melt away stress and induce deep calm.", duration: "60 min", icon: "🌿" },
      { id: 4, name: "Head & Scalp Massage", description: "Medicated oil scalp massage known to improve sleep quality and reduce anxiety.", duration: "30 min", icon: "🧖" },
      { id: 5, name: "Herbal Steam Bath", description: "Cleansing herbal steam treatment that relaxes muscles, improves skin tone and promotes detoxification.", duration: "20 – 30 min", icon: "♨️" },
      { id: 6, name: "Back & Neck Relief Massage", description: "Therapeutic massage targeting the back, shoulders and neck to relieve pain and improve posture.", duration: "45 min", icon: "💆" },
    ],
  },
];