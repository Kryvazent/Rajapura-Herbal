import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, MapPin, Phone, Clock, Store, ChevronRight, Search } from "lucide-react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: string;
}
interface Town { name: string; shops: Shop[] }
interface District { name: string; towns: Town[] }
interface Province { name: string; icon: string; districts: District[] }

// ─── Constants ─────────────────────────────────────────────────────────────────
const STORE_TYPES = [
  "Ayurvedic Store",
  "Herbal Pharmacy",
  "Wellness Centre",
  "Spa & Treatment",
  "Ayurvedic Clinic",
];

const EMPTY_FORM: Omit<Shop, "id"> = {
  name: "", address: "", phone: "", hours: "", type: "Ayurvedic Store",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeColor: Record<string, string> = {
  "Ayurvedic Store": "#2D5016",
  "Herbal Pharmacy": "#4A7C23",
  "Wellness Centre": "#7A9E50",
  "Spa & Treatment": "#8B5E3C",
  "Ayurvedic Clinic": "#5C7A30",
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function ShopBadge({ type }: { type: string }) {
  const color = typeColor[type] ?? "#2D5016";
  return (
    <span style={{
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
      color,
      background: `${color}14`,
      border: `1px solid ${color}30`,
      borderRadius: "50px",
      padding: "2px 8px",
    }}>{type}</span>
  );
}

function FieldRow({ icon, value, placeholder }: { icon: React.ReactNode; value?: string; placeholder: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
      <span style={{ color: "#8B8B80", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "0.78rem", color: "#6B6B5C" }}>{value || placeholder}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminStores() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedProvinces, setExpandedProvinces] = useState<Set<number>>(new Set([0]));
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [shopForm, setShopForm] = useState<Omit<Shop, "id">>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/store-all`);
      setProvinces(res.data);
      if (res.data.length > 0) setExpandedProvinces(new Set([0]));
    } finally {
      setLoading(false);
    }
  };

  const toggleProvince = (i: number) =>
    setExpandedProvinces(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });

  const toggleDistrict = (key: string) =>
    setExpandedDistricts(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });

  const validate = (): boolean => {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!shopForm.name.trim()) errs.name = "Name is required";
    if (!shopForm.address.trim()) errs.address = "Address is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = (p: number, d: number, t: number) => {
    setShopForm(EMPTY_FORM);
    setFormErrors({});
    setModal({ type: "add", p, d, t });
  };

  const openEdit = (p: number, d: number, t: number, s: number) => {
    setShopForm({ ...provinces[p].districts[d].towns[t].shops[s] });
    setFormErrors({});
    setModal({ type: "edit", p, d, t, s });
  };

  const addStoreAPI = async (
    province: string,
    icon: string,
    district: string,
    town: string,
    shop: Omit<Shop, "id">
  ) => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/add-store`, {
      province,
      provinceIcon: icon,
      district,
      town,
      shop,
    });
    await fetchStores();
  };

  const updateStoreAPI = async (shopId: number, updatedShop: any) => {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/update-store`, {
      shopId,
      updatedShop,
    });

    console.log(response)

    await fetchStores();
  };

  const deleteStoreAPI = async (shopId: number) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/delete-store`, {
      data: { shopId },
    });
    await fetchStores();
  };

  const saveShop = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal.type === "add") {
        const { p, d, t } = modal;
        await addStoreAPI(
          provinces[p].name, provinces[p].icon,
          provinces[p].districts[d].name,
          provinces[p].districts[d].towns[t].name,
          shopForm
        );
      } else {
        const shop = provinces[modal.p].districts[modal.d].towns[modal.t].shops[modal.s];
        await updateStoreAPI(shop.id, shopForm);
      }
      await fetchStores();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p: number, d: number, t: number, s: number) => {
    const shop = provinces[p].districts[d].towns[t].shops[s];
    setDeleteTarget({
      name: shop.name,
      action: async () => {
        await deleteStoreAPI(shop.id);
        await fetchStores();
        setDeleteTarget(null);
      },
    });
  };

  // ── Filtered view ─────────────────────────────────────────────────────────
  const searchLower = search.toLowerCase();
  const filtered = search
    ? provinces.map(prov => ({
      ...prov,
      districts: prov.districts
        .map(d => ({
          ...d,
          towns: d.towns
            .map(t => ({ ...t, shops: t.shops.filter(s => s.name.toLowerCase().includes(searchLower) || s.address.toLowerCase().includes(searchLower)) }))
            .filter(t => t.shops.length > 0),
        }))
        .filter(d => d.towns.length > 0),
    })).filter(p => p.districts.length > 0)
    : provinces;

  const totalShops = provinces.reduce((acc, p) => acc + p.districts.reduce((a, d) => a + d.towns.reduce((b, t) => b + t.shops.length, 0), 0), 0);

  // ── Styles ───────────────────────────────────────────────────────────────
  const s = {
    card: {
      background: "#FEFCF7",
      border: "1px solid rgba(45,80,22,0.08)",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "12px",
    },
    provinceHeader: (open: boolean) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      cursor: "pointer",
      background: open ? "rgba(45,80,22,0.04)" : "transparent",
      transition: "background 0.15s",
      userSelect: "none" as const,
    }),
    districtBar: (open: boolean) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      cursor: "pointer",
      background: open ? "rgba(74,124,35,0.05)" : "rgba(45,80,22,0.02)",
      borderTop: "1px solid rgba(45,80,22,0.06)",
      userSelect: "none" as const,
    }),
    townSection: {
      padding: "12px 16px 16px 32px",
      borderTop: "1px solid rgba(45,80,22,0.05)",
    },
    shopCard: {
      background: "#fff",
      border: "1px solid rgba(45,80,22,0.08)",
      borderRadius: "12px",
      padding: "12px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "10px",
      marginBottom: "8px",
      transition: "box-shadow 0.15s",
    },
    iconBtn: (danger?: boolean) => ({
      width: "30px",
      height: "30px",
      borderRadius: "8px",
      border: `1px solid ${danger ? "rgba(212,24,61,0.2)" : "rgba(45,80,22,0.15)"}`,
      background: danger ? "rgba(212,24,61,0.05)" : "rgba(45,80,22,0.04)",
      color: danger ? "#D4183D" : "#2D5016",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "background 0.12s",
    }),
    addBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "10px",
      padding: "6px 14px",
      borderRadius: "50px",
      border: "1px dashed rgba(74,124,35,0.5)",
      background: "transparent",
      color: "#4A7C23",
      fontSize: "0.82rem",
      cursor: "pointer",
      fontWeight: 500,
    },
    input: (error?: boolean) => ({
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
      background: error ? "rgba(212,24,61,0.02)" : "#fff",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "border-color 0.15s",
    }),
    select: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1.5px solid rgba(45,80,22,0.2)",
      background: "#fff",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box" as const,
      cursor: "pointer",
    },
    label: {
      fontSize: "0.78rem",
      fontWeight: 600,
      color: "#4A7C23",
      letterSpacing: "0.03em",
      display: "block",
      marginBottom: "4px",
    },
    errText: { fontSize: "0.73rem", color: "#D4183D", marginTop: "3px" },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: "20px",
    },
    modalBox: {
      background: "#FAF7F0",
      borderRadius: "20px",
      width: "100%",
      maxWidth: "380px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "18px 20px 14px",
      borderBottom: "1px solid rgba(45,80,22,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalBody: { padding: "16px 20px 20px" },
    btnRow: { display: "flex", gap: "10px", marginTop: "18px" },
    cancelBtn: {
      flex: 1,
      padding: "10px",
      borderRadius: "50px",
      border: "1px solid rgba(45,80,22,0.2)",
      background: "transparent",
      color: "#4A7C23",
      cursor: "pointer",
      fontWeight: 500,
    },
    saveBtn: (disabled?: boolean) => ({
      flex: 1,
      padding: "10px",
      borderRadius: "50px",
      background: disabled ? "#9BB87A" : "#2D5016",
      color: "#fff",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "background 0.15s",
    }),
    deleteBtn: {
      flex: 1,
      padding: "10px",
      borderRadius: "50px",
      background: "#D4183D",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
    },
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", margin: 0, fontSize: "1.6rem" }}>
              Store Management
            </h2>
            <p style={{ color: "#8B5E3C", fontSize: "0.85rem", margin: "4px 0 0" }}>
              {totalShops} store{totalShops !== 1 ? "s" : ""} across {provinces.length} province{provinces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginTop: "16px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8B8B80" }} />
          <input
            placeholder="Search stores by name or address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...s.input(), paddingLeft: "36px", fontSize: "0.88rem" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8B8B80" }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#8B8B80" }}>
          Loading stores…
        </div>
      )}

      {/* ── Empty search ── */}
      {!loading && search && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#8B8B80" }}>
          No stores match "<strong>{search}</strong>"
        </div>
      )}

      {/* ── Province tree ── */}
      {!loading && filtered.map((prov, pIndex) => {
        const isProvOpen = search ? true : expandedProvinces.has(pIndex);
        const shopCount = prov.districts.reduce((a, d) => a + d.towns.reduce((b, t) => b + t.shops.length, 0), 0);

        return (
          <div key={prov.name} style={s.card}>

            {/* Province header */}
            <div style={s.provinceHeader(isProvOpen)} onClick={() => !search && toggleProvince(pIndex)}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>{prov.icon}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#2D5016", fontSize: "1rem" }}>{prov.name}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#8B5E3C" }}>
                    {prov.districts.length} districts · {shopCount} stores
                  </p>
                </div>
              </div>
              {!search && (
                <ChevronRight size={16} style={{ color: "#4A7C23", transform: isProvOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              )}
            </div>

            {/* Districts */}
            {isProvOpen && prov.districts.map((dist, dIndex) => {
              const distKey = `${pIndex}-${dIndex}`;
              const isDistOpen = search ? true : expandedDistricts.has(distKey);
              const distShops = dist.towns.reduce((a, t) => a + t.shops.length, 0);

              return (
                <div key={dist.name}>
                  <div style={s.districtBar(isDistOpen)} onClick={() => !search && toggleDistrict(distKey)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={13} style={{ color: "#4A7C23" }} />
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#4A7C23" }}>{dist.name}</span>
                      <span style={{ fontSize: "0.73rem", color: "#8B8B80", marginLeft: "4px" }}>{distShops} stores</span>
                    </div>
                    {!search && <ChevronRight size={14} style={{ color: "#8B8B80", transform: isDistOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
                  </div>

                  {/* Towns */}
                  {isDistOpen && dist.towns.map((town, tIndex) => (
                    <div key={town.name} style={s.townSection}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7A9E50", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B4423", letterSpacing: "0.02em" }}>{town.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "#8B8B80" }}>({town.shops.length})</span>
                      </div>

                      {/* Shop cards */}
                      {town.shops.length === 0 && (
                        <p style={{ fontSize: "0.8rem", color: "#ABABAB", margin: "0 0 8px 12px", fontStyle: "italic" }}>No stores yet</p>
                      )}
                      {town.shops.map((shop, sIndex) => (
                        <div key={shop.id} style={s.shopCard}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <p style={{ margin: 0, fontWeight: 600, color: "#2D5016", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {shop.name}
                              </p>
                              <ShopBadge type={shop.type} />
                            </div>
                            <FieldRow icon={<MapPin size={11} />} value={shop.address} placeholder="" />
                            <FieldRow icon={<Phone size={11} />} value={shop.phone} placeholder="" />
                            <FieldRow icon={<Clock size={11} />} value={shop.hours} placeholder="" />
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexShrink: 0, paddingTop: "2px" }}>
                            <button style={s.iconBtn()} onClick={() => openEdit(pIndex, dIndex, tIndex, sIndex)} title="Edit">
                              <Pencil size={13} />
                            </button>
                            <button style={s.iconBtn(true)} onClick={() => confirmDelete(pIndex, dIndex, tIndex, sIndex)} title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add shop */}
                      <button style={s.addBtn} onClick={() => openAdd(pIndex, dIndex, tIndex)}>
                        <Plus size={13} /> Add Store
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={s.modalBox}>
            <div style={s.modalHeader}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#2D5016", fontSize: "1rem" }}>
                  {modal.type === "add" ? "Add New Store" : "Edit Store"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8B5E3C" }}>
                  {provinces[modal.p]?.districts[modal.d]?.towns[modal.t]?.name}
                </p>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#8B8B80", padding: "4px" }} onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={s.modalBody}>
              {/* Name */}
              <div style={{ marginBottom: "12px" }}>
                <label style={s.label}>Store Name *</label>
                <input
                  placeholder="e.g. Namal Ayurveda"
                  value={shopForm.name}
                  onChange={e => { setShopForm({ ...shopForm, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }}
                  style={s.input(!!formErrors.name)}
                />
                {formErrors.name && <p style={s.errText}>{formErrors.name}</p>}
              </div>

              {/* Type */}
              <div style={{ marginBottom: "12px" }}>
                <label style={s.label}>Store Type</label>
                <select
                  value={shopForm.type}
                  onChange={e => setShopForm({ ...shopForm, type: e.target.value })}
                  style={s.select}
                >
                  {STORE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Address */}
              <div style={{ marginBottom: "12px" }}>
                <label style={s.label}>Address *</label>
                <input
                  placeholder="Street, city"
                  value={shopForm.address}
                  onChange={e => { setShopForm({ ...shopForm, address: e.target.value }); setFormErrors({ ...formErrors, address: "" }); }}
                  style={s.input(!!formErrors.address)}
                />
                {formErrors.address && <p style={s.errText}>{formErrors.address}</p>}
              </div>

              {/* Phone + Hours row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={s.label}>Phone</label>
                  <input
                    placeholder="+94 77 000 0000"
                    value={shopForm.phone}
                    onChange={e => setShopForm({ ...shopForm, phone: e.target.value })}
                    style={s.input()}
                  />
                </div>
                <div>
                  <label style={s.label}>Hours</label>
                  <input
                    placeholder="8am – 6pm"
                    value={shopForm.hours}
                    onChange={e => setShopForm({ ...shopForm, hours: e.target.value })}
                    style={s.input()}
                  />
                </div>
              </div>

              <div style={s.btnRow}>
                <button style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                <button style={s.saveBtn(saving)} onClick={saveShop} disabled={saving}>
                  <Save size={14} />
                  {saving ? "Saving…" : "Save Store"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div style={{ ...s.modalBox, maxWidth: "320px" }}>
            <div style={{ ...s.modalBody, textAlign: "center" as const, padding: "28px 24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(212,24,61,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <AlertTriangle size={22} style={{ color: "#D4183D" }} />
              </div>
              <p style={{ fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px", fontSize: "1rem" }}>Delete Store?</p>
              <p style={{ color: "#6B6B5C", fontSize: "0.85rem", margin: "0 0 20px" }}>
                <strong>{deleteTarget.name}</strong> will be permanently removed. This cannot be undone.
              </p>
              <div style={s.btnRow}>
                <button style={s.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button style={s.deleteBtn} onClick={deleteTarget.action}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
