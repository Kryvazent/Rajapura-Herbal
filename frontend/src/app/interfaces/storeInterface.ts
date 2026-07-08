export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: "Pharmacy" | "Ayurvedic Store" | "Health Center" | "Supermarket";
}

export interface Town {
  name: string;
  shops: Shop[];
}

export interface District {
  name: string;
  towns: Town[];
}

export interface Province {
  name: string;
  icon: string;
  districts: District[];
}

export interface PanelProps {
  active: boolean;
  color: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}