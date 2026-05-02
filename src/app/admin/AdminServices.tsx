import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  getServiceLocations,
  saveServiceLocations,
  type ServiceLocation,
  type ServiceItem,
} from "../../../admin/adminData";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: "Forest", color: "#2D5016", light: "rgba(45,80,22,0.08)", border: "rgba(45,80,22,0.2)" },
  { label: "Earth", color: "#8B5E3C", light: "rgba(139,94,60,0.07)", border: "rgba(139,94,60,0.2)" },
  { label: "Gold", color: "#D4A017", light: "rgba(212,160,23,0.08)", border: "rgba(212,160,23,0.2)" },
  { label: "Teal", color: "#2A7C6F", light: "rgba(42,124,111,0.08)", border: "rgba(42,124,111,0.2)" },
  { label: "Plum", color: "#6B3A6B", light: "rgba(107,58,107,0.07)", border: "rgba(107,58,107,0.2)" },
];

const SERVICE_ICONS = ["🫧", "🦶", "🧖", "💆", "🫗", "♨️", "🌿", "🌺", "💎", "🍃", "🏺", "✨"];

function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1.5px solid rgba(45,80,22,0.2)",
    backgroundColor: "#FAF6EE",
    color: "#2D5016",
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Lato', sans-serif",
    resize: "vertical",
  };
  return (
    <div>
      <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>
        {label} {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={base}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={base}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  onSave,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(14,26,8,0.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FAF6EE",
          borderRadius: "20px",
          width: "100%",
          maxWidth: wide ? "680px" : "520px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2D5016, #4A7C23)",
            padding: "20px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", margin: 0, fontSize: "1.05rem" }}>
            {title}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(250,246,238,0.7)", cursor: "pointer", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
          {children}
        </div>
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(45,80,22,0.1)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            backgroundColor: "rgba(45,80,22,0.02)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "1px solid rgba(45,80,22,0.2)",
              backgroundColor: "transparent",
              color: "#6B4423",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: "#2D5016",
              color: "#FAF6EE",
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(14,26,8,0.75)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FAF6EE",
          borderRadius: "20px",
          maxWidth: "380px",
          width: "100%",
          padding: "28px",
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "rgba(212,24,61,0.1)",
            border: "2px solid rgba(212,24,61,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <AlertTriangle size={22} style={{ color: "#D4183D" }} />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "8px", fontSize: "1rem" }}>
          Confirm Delete
        </h3>
        <p style={{ color: "#5C4033", fontSize: "0.85rem", marginBottom: "22px", lineHeight: 1.6 }}>
          Delete <strong>"{name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "1px solid rgba(45,80,22,0.2)",
              backgroundColor: "transparent",
              color: "#6B4423",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: "#D4183D",
              color: "#FAF6EE",
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Blank forms ──────────────────────────────────────────────────────────────
const blankLocation = (): Omit<ServiceLocation, "id"> => ({
  name: "",
  area: "",
  address: "",
  mobile: "",
  altMobile: "",
  mapLabel: "",
  icon: "🌿",
  color: "#2D5016",
  lightColor: "rgba(45,80,22,0.08)",
  borderColor: "rgba(45,80,22,0.2)",
  description: "",
  services: [],
});

const blankService = (): Omit<ServiceItem, "id"> => ({
  name: "",
  description: "",
  duration: "",
  icon: "🌿",
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminServices() {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Location modal
  const [locModal, setLocModal] = useState<null | { mode: "add" | "edit"; data: Omit<ServiceLocation, "id">; id?: number }>(null);

  // Service modal
  const [svcModal, setSvcModal] = useState<null | {
    mode: "add" | "edit";
    _id: String;
    data: Omit<ServiceItem, "id">;
    serviceId?: number;
  }>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ name: string; action: () => void } | null>(null);

  const persist = (updated: ServiceLocation[]) => {
    setLocations(updated);
    saveServiceLocations(updated);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fetchServiceLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/services`);
      setLocations(response.data)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchServiceLocations();
  }, [])

  // ── Location CRUD ──────────────────────────────────────────────────────────
  const openAddLocation = () => setLocModal({ mode: "add", data: blankLocation() });
  const openEditLocation = (loc: ServiceLocation) => {
    const { id, ...rest } = loc;
    setLocModal({ mode: "edit", data: { ...rest, services: rest.services }, id });
  };

  const saveLocation = async () => {
    if (!locModal || !locModal.data.name.trim() || !locModal.data.mobile.trim()) return;

    try {
      if (locModal.mode === "add") {
        const response = await axios.post(`${API_URL}/admin/services`, locModal.data, {
          withCredentials: true
        });
        fetchServiceLocations();
      } else {
        const response = await axios.put(`${API_URL}/admin/services`, {
          id: locModal.id,
          ...locModal.data
        }, {
          withCredentials: true
        });
        fetchServiceLocations();
      }
      setLocModal(null);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const deleteLocation = (loc: ServiceLocation) => {
    setDeleteTarget({
      name: loc.name,
      action: async () => {
        try {
          await axios.delete(`${API_URL}/admin/services`, {
            data: { _id: loc._id },
            withCredentials: true
          });
          fetchServiceLocations();
          setDeleteTarget(null);
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      },
    });
  };

  // ── Service CRUD ───────────────────────────────────────────────────────────
  const openAddService = (_id: String) =>
    setSvcModal({ mode: "add", _id, data: blankService() });

  const openEditService = (_id: String, svc: ServiceItem) => {
    const { id, ...rest } = svc;
    setSvcModal({ mode: "edit", _id, data: rest, serviceId: id });
  };

  const saveService = async () => {
    if (!svcModal || !svcModal.data.name.trim()) return;

    try {
      if (svcModal.mode === "add") {
        console.log(svcModal)
        await axios.post(`${API_URL}/admin/services/item`, {
          _id: svcModal._id,
          serviceItem: svcModal.data
        }, {
          withCredentials: true
        });
      } else {
        await axios.put(`${API_URL}/admin/services/item`, {
          locationId: svcModal._id,
          serviceId: svcModal.serviceId,
          serviceItem: svcModal.data
        }, {
          withCredentials: true
        });
      }
      fetchServiceLocations();
      setSvcModal(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const deleteService = (locationId: number, svc: ServiceItem) => {
    setDeleteTarget({
      name: svc.name,
      action: async () => {
        try {
          await axios.delete(`${API_URL}/admin/services/item`, {
            data: { locationId, serviceId: svc.id },
            withCredentials: true
          });
          fetchServiceLocations();
          setDeleteTarget(null);
        } catch (error) {
          console.error('Error deleting service:', error);
        }
      },
    });
  };

  const setLocColor = (preset: (typeof COLOR_PRESETS)[0]) => {
    if (!locModal) return;
    setLocModal({
      ...locModal,
      data: { ...locModal.data, color: preset.color, lightColor: preset.light, borderColor: preset.border },
    });
  };

  const totalServices = locations.reduce((a, l) => a + l.services.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", margin: 0, fontSize: "1.3rem" }}>
            Wellness Services
          </h2>
          <p style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.82rem" }}>
            {locations.length} service centres · {totalServices} services total
          </p>
        </div>
        <button
          onClick={openAddLocation}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#2D5016",
            color: "#FAF6EE",
            border: "none",
            padding: "10px 20px",
            borderRadius: "50px",
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          <Plus size={16} /> Add Service Centre
        </button>
      </div>

      {/* Location list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {locations.length === 0 && (
          <div
            style={{
              backgroundColor: "#FAF6EE",
              border: "1px dashed rgba(45,80,22,0.25)",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#A8C580", fontSize: "0.9rem" }}>
              No service centres yet. Click "Add Service Centre" to get started.
            </p>
          </div>
        )}

        {locations.map((loc) => {
          const isOpen = expandedIds.has(loc.id);
          return (
            <div
              key={loc._id}
              style={{
                backgroundColor: "#FAF6EE",
                border: `1px solid ${loc.borderColor}`,
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
              }}
            >
              {/* Location header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  background: isOpen ? loc.lightColor : "transparent",
                  transition: "background 0.2s",
                }}
                onClick={() => toggleExpand(loc.id)}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    backgroundColor: loc.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  {loc.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#2D5016", margin: 0, fontSize: "0.98rem", fontWeight: 600 }}>
                    {loc.name}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "3px" }}>
                    <span style={{ color: "#5C4033", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={11} /> {loc.address}
                    </span>
                    <span style={{ color: "#5C4033", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={11} /> {loc.mobile}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <span
                  style={{
                    backgroundColor: loc.lightColor,
                    color: loc.color,
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "50px",
                    flexShrink: 0,
                  }}
                >
                  {loc.services.length} services
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openAddService(loc._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#4A7C23",
                      border: "1px solid rgba(74,124,35,0.3)",
                      backgroundColor: "rgba(74,124,35,0.07)",
                      padding: "5px 12px",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Plus size={12} /> Service
                  </button>
                  <button
                    onClick={() => openEditLocation(loc)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      border: "1px solid rgba(45,80,22,0.2)",
                      backgroundColor: "rgba(45,80,22,0.06)",
                      color: "#2D5016",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteLocation(loc)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      border: "1px solid rgba(212,24,61,0.2)",
                      backgroundColor: "rgba(212,24,61,0.06)",
                      color: "#D4183D",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {isOpen ? (
                  <ChevronDown size={16} style={{ color: "#8B5E3C", flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={16} style={{ color: "#8B5E3C", flexShrink: 0 }} />
                )}
              </div>

              {/* Services list (expanded) */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${loc.borderColor}`, padding: "12px 16px 16px" }}>
                  {/* Location description */}
                  {loc.description && (
                    <div
                      style={{
                        backgroundColor: loc.lightColor,
                        borderRadius: "10px",
                        padding: "10px 14px",
                        marginBottom: "12px",
                      }}
                    >
                      <p style={{ color: "#5C4033", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>
                        {loc.description}
                      </p>
                    </div>
                  )}

                  {loc.services.length === 0 && (
                    <p style={{ color: "#A8C580", fontSize: "0.82rem", textAlign: "center", padding: "12px" }}>
                      No services yet. Click "+ Service" to add one.
                    </p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {loc.services.map((svc) => (
                      <div
                        key={svc._id}
                        style={{
                          backgroundColor: "white",
                          border: `1px solid ${loc.borderColor}`,
                          borderRadius: "12px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {/* Service icon */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: loc.lightColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            flexShrink: 0,
                          }}
                        >
                          {svc.icon}
                        </div>

                        {/* Service details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p style={{ color: loc.color, margin: 0, fontSize: "0.88rem", fontWeight: 600 }}>
                              {svc.name}
                            </p>
                            <span
                              style={{
                                backgroundColor: loc.lightColor,
                                color: loc.color,
                                fontSize: "0.68rem",
                                padding: "2px 8px",
                                borderRadius: "50px",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <Clock size={9} /> {svc.duration}
                            </span>
                          </div>
                          <p style={{ color: "#5C4033", margin: "3px 0 0", fontSize: "0.78rem", lineHeight: 1.5 }}>
                            {svc.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                          <button
                            onClick={() => openEditService(loc.id, svc)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: "1px solid rgba(45,80,22,0.2)",
                              backgroundColor: "rgba(45,80,22,0.06)",
                              color: "#2D5016",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteService(loc.id, svc)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: "1px solid rgba(212,24,61,0.2)",
                              backgroundColor: "rgba(212,24,61,0.06)",
                              color: "#D4183D",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Location Modal ── */}
      {locModal && (
        <ModalShell
          title={locModal.mode === "add" ? "Add Service Centre" : "Edit Service Centre"}
          onClose={() => setLocModal(null)}
          onSave={saveLocation}
          wide
        >
          {/* Row: Icon + Name */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>Icon</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {["🌆", "🏔️", "🌊", "🌿", "☕", "🏺", "💎", "🌅", "🏛️"].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setLocModal({ ...locModal, data: { ...locModal.data, icon: ic } })}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: locModal.data.icon === ic ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
                      backgroundColor: locModal.data.icon === ic ? "rgba(45,80,22,0.1)" : "transparent",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <FieldRow
              label="Centre Name"
              value={locModal.data.name}
              onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, name: v } })}
              placeholder="e.g. Rajapura Wellness Centre – Paliyagoda"
              required
            />
          </div>

          {/* Row: Area + Map Label */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FieldRow
              label="Area (short name)"
              value={locModal.data.area}
              onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, area: v } })}
              placeholder="e.g. Paliyagoda"
              required
            />
            <FieldRow
              label="Map Label"
              value={locModal.data.mapLabel}
              onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, mapLabel: v } })}
              placeholder="e.g. Western Province · Colombo District"
            />
          </div>

          <FieldRow
            label="Address"
            value={locModal.data.address}
            onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, address: v } })}
            placeholder="Full address"
            required
          />

          {/* Row: Mobile + Alt Mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FieldRow
              label="Primary Mobile"
              value={locModal.data.mobile}
              onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, mobile: v } })}
              placeholder="+94 77 234 5678"
              required
            />
            <FieldRow
              label="Alt Mobile (optional)"
              value={locModal.data.altMobile}
              onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, altMobile: v } })}
              placeholder="+94 11 491 2300"
            />
          </div>

          <FieldRow
            label="Description"
            value={locModal.data.description}
            onChange={(v) => setLocModal({ ...locModal, data: { ...locModal.data, description: v } })}
            placeholder="Brief description of this centre..."
            textarea
          />

          {/* Colour picker */}
          <div>
            <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "8px" }}>
              Colour Theme
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setLocColor(preset)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "50px",
                    border: locModal.data.color === preset.color ? `2px solid ${preset.color}` : "1px solid rgba(45,80,22,0.2)",
                    backgroundColor: locModal.data.color === preset.color ? preset.light : "transparent",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    color: preset.color,
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: preset.color,
                      display: "inline-block",
                    }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </ModalShell>
      )}

      {/* ── Service Modal ── */}
      {svcModal && (
        <ModalShell
          title={svcModal.mode === "add" ? "Add Service" : "Edit Service"}
          onClose={() => setSvcModal(null)}
          onSave={saveService}
        >
          {/* Icon picker */}
          <div>
            <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "6px" }}>
              Icon
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SERVICE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setSvcModal({ ...svcModal, data: { ...svcModal.data, icon: ic } })}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9px",
                    border: svcModal.data.icon === ic ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
                    backgroundColor: svcModal.data.icon === ic ? "rgba(45,80,22,0.1)" : "transparent",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <FieldRow
            label="Service Name"
            value={svcModal.data.name}
            onChange={(v) => setSvcModal({ ...svcModal, data: { ...svcModal.data, name: v } })}
            placeholder="e.g. Full Body Ayurvedic Massage"
            required
          />

          <FieldRow
            label="Duration"
            value={svcModal.data.duration}
            onChange={(v) => setSvcModal({ ...svcModal, data: { ...svcModal.data, duration: v } })}
            placeholder="e.g. 60 – 90 min"
          />

          <FieldRow
            label="Description"
            value={svcModal.data.description}
            onChange={(v) => setSvcModal({ ...svcModal, data: { ...svcModal.data, description: v } })}
            placeholder="Brief description of this service..."
            textarea
          />
        </ModalShell>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={deleteTarget.action}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
