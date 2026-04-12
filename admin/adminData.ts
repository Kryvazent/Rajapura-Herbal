/**
 * Admin data layer — reads/writes products and stores to localStorage so that
 * changes made in the admin panel persist across page refreshes.
 * Falls back to the default seed data on first load.
 */
import { products as defaultProducts, type Product } from "../data/products";
import { provinces as defaultProvinces, type Province } from "../data/stores";
import { serviceLocations as defaultServiceLocations, type ServiceLocation, type ServiceItem } from "../data/services";

export type { ServiceLocation, ServiceItem };

const PRODUCTS_KEY = "rajapura_admin_products";
const STORES_KEY = "rajapura_admin_stores";
const SERVICES_KEY = "rajapura_admin_services";

// ─── Products ─────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {}
  return defaultProducts.map((p) => ({ ...p }));
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id">): Product {
  const all = getProducts();
  const newId = all.length > 0 ? Math.max(...all.map((p) => p.id)) + 1 : 1;
  const newProduct: Product = { ...product, id: newId };
  saveProducts([...all, newProduct]);
  return newProduct;
}

export function updateProduct(updated: Product): void {
  const all = getProducts().map((p) => (p.id === updated.id ? updated : p));
  saveProducts(all);
}

export function deleteProduct(id: number): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export function getProvinces(): Province[] {
  try {
    const raw = localStorage.getItem(STORES_KEY);
    if (raw) return JSON.parse(raw) as Province[];
  } catch {}
  return defaultProvinces.map((p) => ({
    ...p,
    districts: p.districts.map((d) => ({
      ...d,
      towns: d.towns.map((t) => ({
        ...t,
        shops: t.shops.map((s) => ({ ...s })),
      })),
    })),
  }));
}

export function saveProvinces(provinces: Province[]): void {
  localStorage.setItem(STORES_KEY, JSON.stringify(provinces));
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function getServiceLocations(): ServiceLocation[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (raw) return JSON.parse(raw) as ServiceLocation[];
  } catch {}
  return defaultServiceLocations.map((l) => ({
    ...l,
    services: l.services.map((s) => ({ ...s })),
  }));
}

export function saveServiceLocations(locations: ServiceLocation[]): void {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(locations));
}

export function addServiceLocation(loc: Omit<ServiceLocation, "id">): ServiceLocation {
  const all = getServiceLocations();
  const newId = all.length > 0 ? Math.max(...all.map((l) => l.id)) + 1 : 1;
  const newLoc: ServiceLocation = { ...loc, id: newId };
  saveServiceLocations([...all, newLoc]);
  return newLoc;
}

export function updateServiceLocation(updated: ServiceLocation): void {
  const all = getServiceLocations().map((l) => (l.id === updated.id ? updated : l));
  saveServiceLocations(all);
}

export function deleteServiceLocation(id: number): void {
  saveServiceLocations(getServiceLocations().filter((l) => l.id !== id));
}