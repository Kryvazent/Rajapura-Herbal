export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  duration: string;
  icon: string;
  imageUrl?: string;
  showInShowcase?: boolean;
}

export interface Service {
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
  imageUrl?: string;
  videoUrl?: string;
  services: ServiceItem[];
}
