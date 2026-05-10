import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  MapPin,
  Phone,
  Clock,
  Store,
  AlertTriangle,
  Home,
  Wand2,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import type { Province, District, Town, Shop } from "../data/stores";
import axios from "axios";

type ShopType = Shop["type"];
const SHOP_TYPES: ShopType[] = [
  "Ayurvedic Store",
  "Pharmacy",
  "Health Center",
  "Supermarket",
];

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface FormErrors {
  [key: string]: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "4px",
      }}
    >
      <AlertCircle size={12} style={{ color: "#D4183D", flexShrink: 0 }} />
      <p style={{ color: "#D4183D", fontSize: "0.73rem", margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

function Toast({
  message,
  type,
}: {
  message: string;
  type: "error" | "success";
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        backgroundColor: type === "error" ? "#D4183D" : "#2D5016",
        color: "#FAF6EE",
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "360px",
      }}
    >
      {type === "error" ? <AlertCircle size={15} /> : <Check size={15} />}
      {message}
    </div>
  );
}
function InputRow({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#2D5016",
          fontSize: "0.8rem",
          marginBottom: "5px",
        }}
      >
        {label}{" "}
        {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "10px",
          border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
          backgroundColor: error ? "rgba(212,24,61,0.04)" : "#FAF6EE",
          color: "#2D5016",
          fontSize: "0.85rem",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
      />
      <FieldError message={error} />
    </div>
  );
}
function Modal({
  title,
  onClose,
  onSave,
  children,
  loading,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  loading?: boolean;
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
          maxWidth: "520px",
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
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              margin: 0,
              fontSize: "1.05rem",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(250,246,238,0.7)",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
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
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: loading ? "#A8C580" : "#2D5016",
              color: "#FAF6EE",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <Save size={14} /> {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
function DeleteConfirm({ name, onConfirm, onCancel, getComplete }: { name: string; onConfirm: () => void; onCancel: () => void; getComplete: boolean }) {
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
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2D5016",
            marginBottom: "8px",
            fontSize: "1rem",
          }}
        >
          Confirm Delete
        </h3>
        <p
          style={{
            color: "#5C4033",
            fontSize: "0.85rem",
            marginBottom: "22px",
            lineHeight: 1.6,
          }}
        >
          Delete <strong>"{name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {getComplete == false ?
            <div className="flex gap-4">
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
            :
            <div>
              Deleting...
            </div>
          }
        </div>
      </div>
    </div>
  );
}
const wizInputStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1.5px solid rgba(45,80,22,0.2)",
  backgroundColor: "#FAF6EE",
  color: "#2D5016",
  fontSize: "0.85rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const wizInputErrorStyle: React.CSSProperties = {
  ...wizInputStyle,
  border: "1.5px solid #D4183D",
  backgroundColor: "rgba(212,24,61,0.04)",
};
interface WizardState {
  step: 1 | 2 | 3 | 4;
  provMode: "existing" | "new";
  selectedProvId: string;
  newProvName: string;
  newProvIcon: string;
  distMode: "existing" | "new";
  selectedDistId: string;
  newDistName: string;
  townMode: "existing" | "new";
  selectedTownId: string;
  newTownName: string;
  shopForm: Omit<Shop, "id">;
}
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,20}$/;

const validateProvince = (name: string, icon: string): FormErrors => {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = "Province name is required.";
  else if (name.trim().length < 2) errors.name = "Must be at least 2 characters.";
  else if (name.trim().length > 50) errors.name = "Cannot exceed 50 characters.";
  if (!icon.trim()) errors.icon = "Please select an icon.";
  return errors;
};

const validateDistrict = (name: string): FormErrors => {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = "District name is required.";
  else if (name.trim().length < 2) errors.name = "Must be at least 2 characters.";
  else if (name.trim().length > 50) errors.name = "Cannot exceed 50 characters.";
  return errors;
};

const validateTown = (name: string): FormErrors => {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = "Town name is required.";
  else if (name.trim().length < 2) errors.name = "Must be at least 2 characters.";
  else if (name.trim().length > 50) errors.name = "Cannot exceed 50 characters.";
  return errors;
};

const validateShop = (shop: Omit<Shop, "id">): FormErrors => {
  const errors: FormErrors = {};
  if (!shop.name.trim()) errors.name = "Shop name is required.";
  else if (shop.name.trim().length < 2) errors.name = "Must be at least 2 characters.";
  else if (shop.name.trim().length > 100) errors.name = "Cannot exceed 100 characters.";

  if (!shop.address.trim()) errors.address = "Address is required.";
  else if (shop.address.trim().length > 200) errors.address = "Cannot exceed 200 characters.";

  if (shop.phone && !PHONE_REGEX.test(shop.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (shop.hours && shop.hours.length > 100) {
    errors.hours = "Cannot exceed 100 characters.";
  }

  if (!["Pharmacy", "Ayurvedic Store", "Health Center", "Supermarket"].includes(shop.type)) {
    errors.type = "Please select a valid shop type.";
  }

  return errors;
};
export default function AdminStores() {
  const [provinces, setProvincesState] = useState<Province[]>([]);
  const [openProvinces, setOpenProvinces] = useState<Set<string>>(new Set());
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set());
  const [openTowns, setOpenTowns] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [wizardErrors, setWizardErrors] = useState<FormErrors>({});
  const [completing, setcompleting] = useState(false);


  type ModalType =
    | { kind: "addProvince" }
    | { kind: "editProvince"; index: number }
    | { kind: "addDistrict"; provinceIndex: number }
    | { kind: "editDistrict"; provinceIndex: number; districtIndex: number }
    | { kind: "addTown"; provinceIndex: number; districtIndex: number }
    | { kind: "editTown"; provinceIndex: number; districtIndex: number; townIndex: number }
    | { kind: "addShop"; provinceIndex: number; districtIndex: number; townIndex: number }
    | { kind: "editShop"; provinceIndex: number; districtIndex: number; townIndex: number; shopIndex: number };

  const [modal, setModal] = useState<ModalType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    name: string;
    action: () => void;
  } | null>(null);
  const [wizard, setWizard] = useState<WizardState | null>(null);

  const [provForm, setProvForm] = useState({ _id: "", name: "", icon: "🌿" });
  const [distForm, setDistForm] = useState({ _id: "", name: "" });
  const [townForm, setTownForm] = useState({ name: "" });
  const [shopForm, setShopForm] = useState<Omit<Shop, "id">>({
    name: "",
    address: "",
    phone: "",
    hours: "",
    type: "Ayurvedic Store",
  });

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/provinces`, {
        withCredentials: true,
      });
  
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProvincesState(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      showToast("Failed to load provinces.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleProvince = (name: string) =>
    setOpenProvinces((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });

  const toggleDistrict = (key: string) =>
    setOpenDistricts((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const toggleTown = (key: string) =>
    setOpenTowns((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const openAddProvince = () => {
    setProvForm({ _id: "", name: "", icon: "🌿" });
    setFormErrors({});
    setModal({ kind: "addProvince" });
  };

  const openEditProvince = (i: number) => {
    setProvForm({
      _id: provinces[i]._id,
      name: provinces[i].name,
      icon: provinces[i].icon,
    });
    setFormErrors({});
    setModal({ kind: "editProvince", index: i });
  };

  const saveProvince = async () => {
    const errors = validateProvince(provForm.name, provForm.icon);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      if (modal?.kind === "addProvince") {
        await axios.post(
          `${API_URL}/admin/add-province`,
          { province: { name: provForm.name.trim(), icon: provForm.icon } },
          { withCredentials: true }
        );
        showToast("Province added successfully.", "success");
      } else if (modal?.kind === "editProvince") {
        await axios.put(
          `${API_URL}/admin/update-province`,
          { _id: provForm._id, name: provForm.name.trim(), icon: provForm.icon },
          { withCredentials: true }
        );
        showToast("Province updated successfully.", "success");
      }
      await fetchProvinces();
      setModal(null);
      setFormErrors({});
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? "Failed to save province.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProvince = (i: number) => {
    setDeleteTarget({
      name: provinces[i].name,
      action: async () => {
        try {
          setLoading(true);
          setcompleting(true)
          await axios.delete(`${API_URL}/admin/delete-province`, {
            data: { _id: provinces[i]._id },
            withCredentials: true,
          });
          await fetchProvinces();
          setDeleteTarget(null);
          showToast("Province deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete province.";
          showToast(msg, "error");
        } finally {
          setLoading(false);
          setcompleting(false)
        }
      },
    });
  };

  const openAddDistrict = (pi: number) => {
    setDistForm({ _id: "", name: "" });
    setFormErrors({});
    setModal({ kind: "addDistrict", provinceIndex: pi });
  };

  const openEditDistrict = (pi: number, di: number) => {
    setDistForm({
      _id: provinces[pi].districts[di]._id,
      name: provinces[pi].districts[di].name,
    });
    setFormErrors({});
    setModal({ kind: "editDistrict", provinceIndex: pi, districtIndex: di });
  };

  const saveDistrict = async () => {
    const errors = validateDistrict(distForm.name);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      if (modal?.kind === "addDistrict") {
        await axios.post(
          `${API_URL}/admin/add-district`,
          {
            _id: provinces[modal.provinceIndex]._id,
            name: distForm.name.trim(),
          },
          { withCredentials: true }
        );
        showToast("District added successfully.", "success");
      } else if (modal?.kind === "editDistrict") {
        await axios.put(
          `${API_URL}/admin/update-district`,
          {
            province_id: provinces[modal.provinceIndex]._id,
            district_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]._id,
            name: distForm.name.trim(),
          },
          { withCredentials: true }
        );
        showToast("District updated successfully.", "success");
      }
      await fetchProvinces();
      setModal(null);
      setFormErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save district.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDistrict = (pi: number, di: number) => {
    setDeleteTarget({
      name: provinces[pi].districts[di].name,
      action: async () => {
        try {
          setLoading(true);
          setcompleting(true);
          await axios.delete(`${API_URL}/admin/delete-district`, {
            data: {
              province_id: provinces[pi]._id,
              district_id: provinces[pi].districts[di]._id,
            },
            withCredentials: true,
          });
          await fetchProvinces();
          setDeleteTarget(null);
          showToast("District deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete district.";
          showToast(msg, "error");
        } finally {
          setLoading(false);
          setcompleting(false);
        }
      },
    });
  };

  const openAddTown = (pi: number, di: number) => {
    setTownForm({ name: "" });
    setFormErrors({});
    setModal({ kind: "addTown", provinceIndex: pi, districtIndex: di });
  };

  const openEditTown = (pi: number, di: number, ti: number) => {
    setTownForm({ name: provinces[pi].districts[di].towns[ti].name });
    setFormErrors({});
    setModal({ kind: "editTown", provinceIndex: pi, districtIndex: di, townIndex: ti });
  };

  const saveTown = async () => {
    const errors = validateTown(townForm.name);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      if (modal?.kind === "addTown") {
        await axios.post(
          `${API_URL}/admin/add-town`,
          {
            province_id: provinces[modal.provinceIndex]._id,
            district_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]._id,
            name: townForm.name.trim(),
          },
          { withCredentials: true }
        );
        showToast("Town added successfully.", "success");
      } else if (modal?.kind === "editTown") {
        await axios.put(
          `${API_URL}/admin/update-town`,
          {
            province_id: provinces[modal.provinceIndex]._id,
            district_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]._id,
            town_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]
                .towns[modal.townIndex]._id,
            name: townForm.name.trim(),
          },
          { withCredentials: true }
        );
        showToast("Town updated successfully.", "success");
      }
      await fetchProvinces();
      setModal(null);
      setFormErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save town.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTown = (pi: number, di: number, ti: number) => {
    setDeleteTarget({
      name: provinces[pi].districts[di].towns[ti].name,
      action: async () => {
        try {
          setLoading(true);
          setcompleting(true);
          await axios.delete(`${API_URL}/admin/delete-town`, {
            data: {
              province_id: provinces[pi]._id,
              district_id: provinces[pi].districts[di]._id,
              town_id: provinces[pi].districts[di].towns[ti]._id,
            },
            withCredentials: true,
          });
          await fetchProvinces();
          setDeleteTarget(null);
          showToast("Town deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete town.";
          showToast(msg, "error");
        } finally {
          setLoading(false);
          setcompleting(false);
        }
      },
    });
  };

  const openAddShop = (pi: number, di: number, ti: number) => {
    setShopForm({ name: "", address: "", phone: "", hours: "", type: "Ayurvedic Store" });
    setFormErrors({});
    setModal({ kind: "addShop", provinceIndex: pi, districtIndex: di, townIndex: ti });
  };

  const openEditShop = (pi: number, di: number, ti: number, si: number) => {
    const shop = provinces[pi].districts[di].towns[ti].shops[si];
    setShopForm({
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      hours: shop.hours,
      type: shop.type,
    });
    setFormErrors({});
    setModal({
      kind: "editShop",
      provinceIndex: pi,
      districtIndex: di,
      townIndex: ti,
      shopIndex: si,
    });
  };

  const saveShop = async () => {
    const errors = validateShop(shopForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      if (modal?.kind === "addShop") {
        await axios.post(
          `${API_URL}/admin/add-shop`,
          {
            province_id: provinces[modal.provinceIndex]._id,
            district_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]._id,
            town_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]
                .towns[modal.townIndex]._id,
            shopData: shopForm,
          },
          { withCredentials: true }
        );
        showToast("Shop added successfully.", "success");
      } else if (modal?.kind === "editShop") {
        await axios.put(
          `${API_URL}/admin/update-shop`,
          {
            province_id: provinces[modal.provinceIndex]._id,
            district_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]._id,
            town_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]
                .towns[modal.townIndex]._id,
            shop_id:
              provinces[modal.provinceIndex].districts[modal.districtIndex]
                .towns[modal.townIndex].shops[modal.shopIndex]._id,
            shopData: shopForm,
          },
          { withCredentials: true }
        );
        showToast("Shop updated successfully.", "success");
      }
      await fetchProvinces();
      setModal(null);
      setFormErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save shop.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteShop = (pi: number, di: number, ti: number, si: number) => {
    setDeleteTarget({
      name: provinces[pi].districts[di].towns[ti].shops[si].name,
      action: async () => {
        try {
          setLoading(true);
          setcompleting(true);
          await axios.delete(`${API_URL}/admin/delete-shop`, {
            data: {
              province_id: provinces[pi]._id,
              district_id: provinces[pi].districts[di]._id,
              town_id: provinces[pi].districts[di].towns[ti]._id,
              shop_id: provinces[pi].districts[di].towns[ti].shops[si]._id,
            },
            withCredentials: true,
          });
          await fetchProvinces();
          setDeleteTarget(null);
          showToast("Shop deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete shop.";
          showToast(msg, "error");
        } finally {
          setLoading(false);
          setcompleting(false);
        }
      },
    });
  };

  const openWizard = () => {
    setWizardErrors({});
    setWizard({
      step: 1,
      provMode: provinces.length > 0 ? "existing" : "new",
      selectedProvId: provinces[0]?._id ?? "",
      newProvName: "",
      newProvIcon: "🌿",
      distMode: "existing",
      selectedDistId: "",
      newDistName: "",
      townMode: "existing",
      selectedTownId: "",
      newTownName: "",
      shopForm: { name: "", address: "", phone: "", hours: "", type: "Ayurvedic Store" },
    });
  };

  const wizardProvince =
    wizard?.provMode === "existing"
      ? provinces.find((p) => p._id === wizard.selectedProvId) ?? null
      : null;

  const wizardDistrict =
    wizardProvince && wizard?.distMode === "existing"
      ? wizardProvince.districts.find((d) => d._id === wizard.selectedDistId) ?? null
      : null;

  const validateWizardStep = (): FormErrors => {
    if (!wizard) return {};
    const errors: FormErrors = {};

    switch (wizard.step) {
      case 1:
        if (wizard.provMode === "existing" && !wizard.selectedProvId) {
          errors.province = "Please select an existing province.";
        }
        if (wizard.provMode === "new") {
          if (!wizard.newProvName.trim()) errors.newProvName = "Province name is required.";
          else if (wizard.newProvName.trim().length < 2) errors.newProvName = "Must be at least 2 characters.";
          else if (wizard.newProvName.trim().length > 50) errors.newProvName = "Cannot exceed 50 characters.";
        }
        break;

      case 2:
        if (wizard.distMode === "existing" && !wizard.selectedDistId) {
          errors.district = "Please select an existing district.";
        }
        if (wizard.distMode === "new") {
          if (!wizard.newDistName.trim()) errors.newDistName = "District name is required.";
          else if (wizard.newDistName.trim().length < 2) errors.newDistName = "Must be at least 2 characters.";
          else if (wizard.newDistName.trim().length > 50) errors.newDistName = "Cannot exceed 50 characters.";
        }
        break;

      case 3:
        if (wizard.townMode === "existing" && !wizard.selectedTownId) {
          errors.town = "Please select an existing town.";
        }
        if (wizard.townMode === "new") {
          if (!wizard.newTownName.trim()) errors.newTownName = "Town name is required.";
          else if (wizard.newTownName.trim().length < 2) errors.newTownName = "Must be at least 2 characters.";
          else if (wizard.newTownName.trim().length > 50) errors.newTownName = "Cannot exceed 50 characters.";
        }
        break;

      case 4:
        return validateShop(wizard.shopForm);
    }
    return errors;
  };

  const canAdvance = (): boolean => {
    if (!wizard) return false;
    switch (wizard.step) {
      case 1:
        return wizard.provMode === "existing"
          ? !!wizard.selectedProvId
          : !!wizard.newProvName.trim();
      case 2:
        return wizard.distMode === "existing"
          ? !!wizard.selectedDistId
          : !!wizard.newDistName.trim();
      case 3:
        return wizard.townMode === "existing"
          ? !!wizard.selectedTownId
          : !!wizard.newTownName.trim();
      case 4:
        return (
          !!wizard.shopForm.name.trim() && !!wizard.shopForm.address.trim()
        );
    }
  };

  const advanceWizard = async () => {
    if (!wizard) return;

    const errors = validateWizardStep();
    if (Object.keys(errors).length > 0) {
      setWizardErrors(errors);
      return;
    }
    setWizardErrors({});

    if (wizard.step === 4) {
      try {
        setLoading(true);
        await axios.post(
          `${API_URL}/admin/add-shop-wizard`,
          {
            wizardData: {
              provMode: wizard.provMode,
              selectedProvId: wizard.selectedProvId,
              newProvName: wizard.newProvName,
              newProvIcon: wizard.newProvIcon,
              distMode: wizard.distMode,
              selectedDistId: wizard.selectedDistId,
              newDistName: wizard.newDistName,
              townMode: wizard.townMode,
              selectedTownId: wizard.selectedTownId,
              newTownName: wizard.newTownName,
              shopForm: wizard.shopForm,
            },
          },
          { withCredentials: true }
        );
        await fetchProvinces();
        setWizard(null);
        showToast("Shop created successfully.", "success");
      } catch (err: any) {
        const msg = err.response?.data?.message ?? "Failed to create shop.";
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    } else {
      const next = {
        ...wizard,
        step: (wizard.step + 1) as WizardState["step"],
      };
      if (wizard.step === 1) {
        const prov =
          wizard.provMode === "existing"
            ? provinces.find((p) => p._id === wizard.selectedProvId)
            : null;
        next.distMode = prov && prov.districts.length > 0 ? "existing" : "new";
        next.selectedDistId = prov?.districts[0]?._id ?? "";
        next.newDistName = "";
      }
      if (wizard.step === 2) {
        const dist = wizardProvince?.districts.find(
          (d) => d._id === wizard.selectedDistId
        );
        next.townMode = dist && dist.towns.length > 0 ? "existing" : "new";
        next.selectedTownId = dist?.towns[0]?._id ?? "";
        next.newTownName = "";
      }
      setWizard(next);
    }
  };

  const typeColors: Record<ShopType, { bg: string; text: string }> = {
    "Ayurvedic Store": { bg: "rgba(45,80,22,0.1)", text: "#2D5016" },
    Pharmacy: { bg: "rgba(30,90,160,0.1)", text: "#1E5AA0" },
    "Health Center": { bg: "rgba(130,50,0,0.1)", text: "#823200" },
    Supermarket: { bg: "rgba(212,160,23,0.12)", text: "#7A5C00" },
  };

  const totalShops = (Array.isArray(provinces) ? provinces : [])
    .flatMap((p) => p.districts || [])
    .flatMap((d) => d.towns || [])
    .reduce((total, town) => total + (town.shops?.length || 0), 0);

  const getModalTitle = () => {
    if (!modal) return "";
    switch (modal.kind) {
      case "addProvince": return "Add Province";
      case "editProvince": return "Edit Province";
      case "addDistrict": return "Add District";
      case "editDistrict": return "Edit District";
      case "addTown": return "Add Town";
      case "editTown": return "Edit Town";
      case "addShop": return "Add Shop";
      case "editShop": return "Edit Shop";
    }
  };

  const handleSave = () => {
    if (!modal) return;
    switch (modal.kind) {
      case "addProvince":
      case "editProvince":
        return saveProvince();
      case "addDistrict":
      case "editDistrict":
        return saveDistrict();
      case "addTown":
      case "editTown":
        return saveTown();
      case "addShop":
      case "editShop":
        return saveShop();
    }
  };

  const iconRow = (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
      {["🌆", "🏔️", "🌊", "🏛️", "🌅", "🌿", "🏺", "☕", "💎"].map((ic) => (
        <button
          key={ic}
          type="button"
          onClick={() => setProvForm((p) => ({ ...p, icon: ic }))}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border:
              provForm.icon === ic
                ? "2px solid #2D5016"
                : "1px solid rgba(45,80,22,0.2)",
            backgroundColor:
              provForm.icon === ic ? "rgba(45,80,22,0.1)" : "transparent",
            cursor: "pointer",
            fontSize: "1.1rem",
          }}
        >
          {ic}
        </button>
      ))}
    </div>
  );

  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: "50px",
    border: active ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
    backgroundColor: active ? "rgba(45,80,22,0.1)" : "white",
    color: "#2D5016",
    cursor: "pointer",
    fontSize: "0.82rem",
  });

  const newPillBtn = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "50px",
    border: active
      ? "2px solid #4A7C23"
      : "1px dashed rgba(74,124,35,0.4)",
    backgroundColor: active ? "rgba(74,124,35,0.1)" : "transparent",
    color: "#4A7C23",
    cursor: "pointer",
    fontSize: "0.82rem",
    marginBottom: "10px",
  });

  if (loading && provinces.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <p style={{ color: "#2D5016", fontSize: "1rem" }}>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "40px 60px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}>
          
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid #E8F5E1",
            borderTop: "4px solid #2D5016",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>

          
          <p style={{
            color: "#2D5016",
            fontSize: "1.1rem",
            fontWeight: "500",
            margin: 0
          }}>
            Loading...
          </p>
        </div>

        
        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div>
      
      {toast && <Toast message={toast.message} type={toast.type} />}

      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2D5016",
              margin: 0,
              fontSize: "1.3rem",
            }}
          >
            Store Management
          </h2>
          <p style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.82rem" }}>
            {provinces.length} provinces · {totalShops} authorized stores ·
            Province → District → Town → Shop
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={openWizard}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: loading ? "#ccc" : "#D4A017",
              color: "#1A3009",
              border: "none",
              padding: "10px 20px",
              borderRadius: "50px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            <Wand2 size={15} /> Add Shop (Step-by-Step)
          </button>
          <button
            onClick={openAddProvince}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: loading ? "#ccc" : "#2D5016",
              color: "#FAF6EE",
              border: "none",
              padding: "10px 20px",
              borderRadius: "50px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.88rem",
            }}
          >
            <Plus size={16} /> Add Province
          </button>
        </div>
      </div>

      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {provinces.map((province, pi) => {
          const provOpen = openProvinces.has(province.name);
          const provShops = province.districts.reduce(
            (a, d) => a + d.towns.reduce((b, t) => b + t.shops.length, 0),
            0
          );
          return (
            <div
              key={province._id ?? province.name}
              style={{
                backgroundColor: "#FAF6EE",
                border: "1px solid rgba(45,80,22,0.12)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(45,80,22,0.05)",
              }}
            >
              
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  cursor: "pointer",
                  backgroundColor: provOpen ? "rgba(45,80,22,0.04)" : "transparent",
                  transition: "background-color 0.2s",
                }}
                onClick={() => toggleProvince(province.name)}
              >
                <span style={{ fontSize: "1.3rem" }}>{province.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#2D5016", margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                    {province.name}
                  </p>
                  <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.75rem" }}>
                    {province.districts.length} districts · {provShops} stores
                  </p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openAddDistrict(pi)}
                    disabled={loading}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      color: "#4A7C23", border: "1px solid rgba(74,124,35,0.3)",
                      backgroundColor: "rgba(74,124,35,0.07)", padding: "5px 12px",
                      borderRadius: "50px", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.75rem",
                    }}
                  >
                    <Plus size={12} /> District
                  </button>
                  <button
                    onClick={() => openEditProvince(pi)}
                    disabled={loading}
                    style={{
                      width: "30px", height: "30px", borderRadius: "8px",
                      border: "1px solid rgba(45,80,22,0.2)", backgroundColor: "rgba(45,80,22,0.06)",
                      color: "#2D5016", cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteProvince(pi)}
                    disabled={loading}
                    style={{
                      width: "30px", height: "30px", borderRadius: "8px",
                      border: "1px solid rgba(212,24,61,0.2)", backgroundColor: "rgba(212,24,61,0.06)",
                      color: "#D4183D", cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {provOpen ? (
                  <ChevronDown size={16} style={{ color: "#8B5E3C" }} />
                ) : (
                  <ChevronRight size={16} style={{ color: "#8B5E3C" }} />
                )}
              </div>

              
              {provOpen && (
                <div style={{ borderTop: "1px solid rgba(45,80,22,0.08)", padding: "8px 12px 12px" }}>
                  {province.districts.length === 0 && (
                    <p style={{ color: "#A8C580", fontSize: "0.82rem", padding: "12px 8px", textAlign: "center" }}>
                      No districts yet. Add one to get started.
                    </p>
                  )}
                  {province.districts.map((district, di) => {
                    const dKey = `${province.name}-${district.name}`;
                    const distOpen = openDistricts.has(dKey);
                    const distShops = district.towns.reduce((a, t) => a + t.shops.length, 0);
                    return (
                      <div
                        key={district._id ?? district.name}
                        style={{
                          backgroundColor: "rgba(45,80,22,0.025)",
                          border: "1px solid rgba(45,80,22,0.08)",
                          borderRadius: "12px",
                          marginBottom: "6px",
                          overflow: "hidden",
                        }}
                      >
                        
                        <div
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer" }}
                          onClick={() => toggleDistrict(dKey)}
                        >
                          <MapPin size={14} style={{ color: "#4A7C23", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#2D5016", margin: 0, fontSize: "0.88rem", fontWeight: 500 }}>
                              {district.name}
                            </p>
                            <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.72rem" }}>
                              {district.towns.length} town{district.towns.length !== 1 ? "s" : ""} · {distShops} store{distShops !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openAddTown(pi, di)}
                              disabled={loading}
                              style={{
                                display: "flex", alignItems: "center", gap: "4px",
                                color: "#8B5E3C", border: "1px solid rgba(139,94,60,0.3)",
                                backgroundColor: "rgba(139,94,60,0.07)", padding: "4px 10px",
                                borderRadius: "50px", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.72rem",
                              }}
                            >
                              <Plus size={11} /> Town
                            </button>
                            <button
                              onClick={() => openEditDistrict(pi, di)}
                              disabled={loading}
                              style={{
                                width: "28px", height: "28px", borderRadius: "7px",
                                border: "1px solid rgba(45,80,22,0.2)", backgroundColor: "rgba(45,80,22,0.06)",
                                color: "#2D5016", cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => deleteDistrict(pi, di)}
                              disabled={loading}
                              style={{
                                width: "28px", height: "28px", borderRadius: "7px",
                                border: "1px solid rgba(212,24,61,0.2)", backgroundColor: "rgba(212,24,61,0.06)",
                                color: "#D4183D", cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {distOpen ? (
                            <ChevronDown size={14} style={{ color: "#8B5E3C" }} />
                          ) : (
                            <ChevronRight size={14} style={{ color: "#8B5E3C" }} />
                          )}
                        </div>

                        
                        {distOpen && (
                          <div style={{ borderTop: "1px solid rgba(45,80,22,0.07)", padding: "6px 10px 8px" }}>
                            {district.towns.length === 0 && (
                              <p style={{ color: "#A8C580", fontSize: "0.8rem", padding: "8px", textAlign: "center" }}>
                                No towns yet. Add one to get started.
                              </p>
                            )}
                            {district.towns.map((town, ti) => {
                              const tKey = `${province.name}-${district.name}-${town.name}`;
                              const townOpen = openTowns.has(tKey);
                              return (
                                <div
                                  key={town._id ?? town.name}
                                  style={{
                                    backgroundColor: "rgba(212,160,23,0.04)",
                                    border: "1px solid rgba(212,160,23,0.15)",
                                    borderRadius: "10px",
                                    marginBottom: "5px",
                                    overflow: "hidden",
                                  }}
                                >
                                  
                                  <div
                                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer" }}
                                    onClick={() => toggleTown(tKey)}
                                  >
                                    <Home size={13} style={{ color: "#8B5E3C", flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                      <p style={{ color: "#5C3D20", margin: 0, fontSize: "0.84rem", fontWeight: 500 }}>
                                        {town.name}
                                      </p>
                                      <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.7rem" }}>
                                        {town.shops.length} shop{town.shops.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => openAddShop(pi, di, ti)}
                                        disabled={loading}
                                        style={{
                                          display: "flex", alignItems: "center", gap: "4px",
                                          color: "#D4A017", border: "1px solid rgba(212,160,23,0.3)",
                                          backgroundColor: "rgba(212,160,23,0.08)", padding: "3px 9px",
                                          borderRadius: "50px", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.7rem",
                                        }}
                                      >
                                        <Plus size={10} /> Shop
                                      </button>
                                      <button
                                        onClick={() => openEditTown(pi, di, ti)}
                                        disabled={loading}
                                        style={{
                                          width: "26px", height: "26px", borderRadius: "6px",
                                          border: "1px solid rgba(45,80,22,0.2)", backgroundColor: "rgba(45,80,22,0.06)",
                                          color: "#2D5016", cursor: loading ? "not-allowed" : "pointer",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        onClick={() => deleteTown(pi, di, ti)}
                                        disabled={loading}
                                        style={{
                                          width: "26px", height: "26px", borderRadius: "6px",
                                          border: "1px solid rgba(212,24,61,0.2)", backgroundColor: "rgba(212,24,61,0.06)",
                                          color: "#D4183D", cursor: loading ? "not-allowed" : "pointer",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                    {townOpen ? (
                                      <ChevronDown size={13} style={{ color: "#8B5E3C" }} />
                                    ) : (
                                      <ChevronRight size={13} style={{ color: "#8B5E3C" }} />
                                    )}
                                  </div>

                                  
                                  {townOpen && (
                                    <div style={{ borderTop: "1px solid rgba(212,160,23,0.1)", padding: "6px" }}>
                                      {town.shops.length === 0 && (
                                        <p style={{ color: "#A8C580", fontSize: "0.78rem", padding: "8px", textAlign: "center" }}>
                                          No shops yet.
                                        </p>
                                      )}
                                      {town.shops.map((shop, si) => {
                                        const ts = typeColors[shop.type];
                                        return (
                                          <div
                                            key={shop._id ?? shop.name}
                                            style={{
                                              backgroundColor: "white",
                                              borderRadius: "9px",
                                              padding: "10px 12px",
                                              marginBottom: "5px",
                                              border: "1px solid rgba(45,80,22,0.08)",
                                              display: "flex",
                                              gap: "10px",
                                              alignItems: "flex-start",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "30px", height: "30px", borderRadius: "7px",
                                                backgroundColor: ts.bg, display: "flex",
                                                alignItems: "center", justifyContent: "center", flexShrink: 0,
                                              }}
                                            >
                                              <Store size={13} style={{ color: ts.text }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                                                <p style={{ color: "#2D5016", margin: "0 0 2px", fontSize: "0.83rem", fontWeight: 500 }}>
                                                  {shop.name}
                                                </p>
                                                <span style={{ backgroundColor: ts.bg, color: ts.text, fontSize: "0.65rem", padding: "2px 8px", borderRadius: "50px", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                  {shop.type}
                                                </span>
                                              </div>
                                              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8B5E3C", fontSize: "0.73rem" }}>
                                                  <MapPin size={11} /> {shop.address}
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8B5E3C", fontSize: "0.73rem" }}>
                                                  <Phone size={11} /> {shop.phone}
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8B5E3C", fontSize: "0.73rem" }}>
                                                  <Clock size={11} /> {shop.hours}
                                                </span>
                                              </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                                              <button
                                                onClick={() => openEditShop(pi, di, ti, si)}
                                                disabled={loading}
                                                style={{
                                                  width: "26px", height: "26px", borderRadius: "6px",
                                                  border: "1px solid rgba(45,80,22,0.2)", backgroundColor: "rgba(45,80,22,0.06)",
                                                  color: "#2D5016", cursor: loading ? "not-allowed" : "pointer",
                                                  display: "flex", alignItems: "center", justifyContent: "center",
                                                }}
                                              >
                                                <Pencil size={11} />
                                              </button>
                                              <button
                                                onClick={() => deleteShop(pi, di, ti, si)}
                                                disabled={loading}
                                                style={{
                                                  width: "26px", height: "26px", borderRadius: "6px",
                                                  border: "1px solid rgba(212,24,61,0.2)", backgroundColor: "rgba(212,24,61,0.06)",
                                                  color: "#D4183D", cursor: loading ? "not-allowed" : "pointer",
                                                  display: "flex", alignItems: "center", justifyContent: "center",
                                                }}
                                              >
                                                <Trash2 size={11} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      
      {wizard && (
        <div
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(14,26,8,0.8)",
            zIndex: 200, display: "flex", alignItems: "center",
            justifyContent: "center", padding: "24px",
          }}
          onClick={(e) => e.target === e.currentTarget && setWizard(null)}
        >
          <div
            style={{
              backgroundColor: "#FAF6EE", borderRadius: "22px", width: "100%",
              maxWidth: "560px", boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            
            <div style={{ background: "linear-gradient(135deg, #1A3009, #2D5016)", padding: "22px 28px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Wand2 size={18} style={{ color: "#D4A017" }} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", margin: 0, fontSize: "1.05rem" }}>
                    Add New Shop — Step by Step
                  </h3>
                </div>
                <button
                  onClick={() => setWizard(null)}
                  style={{ background: "none", border: "none", color: "rgba(250,246,238,0.6)", cursor: "pointer", display: "flex" }}
                >
                  <X size={18} />
                </button>
              </div>

              
              <div style={{ display: "flex", alignItems: "center", paddingBottom: "0" }}>
                {[
                  { n: 1, label: "Province" },
                  { n: 2, label: "District" },
                  { n: 3, label: "Town" },
                  { n: 4, label: "Shop" },
                ].map((s, i) => {
                  const done = wizard.step > s.n;
                  const active = wizard.step === s.n;
                  return (
                    <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                        <div
                          style={{
                            width: "30px", height: "30px", borderRadius: "50%",
                            backgroundColor: done ? "#8BC34A" : active ? "#D4A017" : "rgba(255,255,255,0.15)",
                            border: active ? "2px solid #D4A017" : "none",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                          }}
                        >
                          {done ? (
                            <Check size={14} style={{ color: "#1A3009" }} />
                          ) : (
                            <span style={{ color: active ? "#1A3009" : "rgba(255,255,255,0.45)", fontSize: "0.75rem", fontWeight: 700 }}>
                              {s.n}
                            </span>
                          )}
                        </div>
                        <span style={{ color: active ? "#D4A017" : done ? "#8BC34A" : "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                          {s.label.toUpperCase()}
                        </span>
                      </div>
                      {i < 3 && (
                        <div style={{ flex: 1, height: "2px", backgroundColor: done ? "#8BC34A" : "rgba(255,255,255,0.1)", margin: "0 6px", marginBottom: "18px", transition: "background-color 0.3s" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            
            <div style={{ padding: "24px 28px", flex: 1, minHeight: "220px" }}>

              
              {wizard.step === 1 && (
                <div>
                  <p style={{ color: "#5C4033", fontSize: "0.82rem", marginBottom: "12px", marginTop: 0 }}>
                    Select an existing province or create a new one.
                  </p>
                  {provinces.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                      {provinces.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => setWizard({ ...wizard, provMode: "existing", selectedProvId: p._id })}
                          style={pillBtn(wizard.provMode === "existing" && wizard.selectedProvId === p._id)}
                        >
                          {p.icon} {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {wizardErrors.province && <FieldError message={wizardErrors.province} />}
                  <div style={{ borderTop: "1px dashed rgba(45,80,22,0.2)", paddingTop: "14px" }}>
                    <button type="button" onClick={() => setWizard({ ...wizard, provMode: "new", selectedProvId: "" })} style={newPillBtn(wizard.provMode === "new")}>
                      <Plus size={13} /> Create New Province
                    </button>
                    {wizard.provMode === "new" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <input
                            value={wizard.newProvName}
                            onChange={(e) => setWizard({ ...wizard, newProvName: e.target.value })}
                            placeholder="Province name"
                            style={wizardErrors.newProvName ? wizInputErrorStyle : wizInputStyle}
                          />
                          <FieldError message={wizardErrors.newProvName} />
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {["🌆", "🏔️", "🌊", "🏛️", "🌅", "🌿", "🏺", "☕", "💎"].map((ic) => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setWizard({ ...wizard, newProvIcon: ic })}
                              style={{
                                width: "34px", height: "34px", borderRadius: "8px",
                                border: wizard.newProvIcon === ic ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
                                backgroundColor: wizard.newProvIcon === ic ? "rgba(45,80,22,0.1)" : "transparent",
                                cursor: "pointer", fontSize: "1rem",
                              }}
                            >
                              {ic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              
              {wizard.step === 2 && (
                <div>
                  <p style={{ color: "#5C4033", fontSize: "0.82rem", marginBottom: "12px", marginTop: 0 }}>
                    Select a district in{" "}
                    <strong>
                      {wizard.provMode === "existing"
                        ? provinces.find((p) => p._id === wizard.selectedProvId)?.name ?? wizard.selectedProvId
                        : wizard.newProvName}
                    </strong>, or create a new one.
                  </p>
                  {wizardProvince && wizardProvince.districts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                      {wizardProvince.districts.map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => setWizard({ ...wizard, distMode: "existing", selectedDistId: d._id })}
                          style={pillBtn(wizard.distMode === "existing" && wizard.selectedDistId === d._id)}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {wizardErrors.district && <FieldError message={wizardErrors.district} />}
                  <div style={{ borderTop: "1px dashed rgba(45,80,22,0.2)", paddingTop: "14px" }}>
                    <button type="button" onClick={() => setWizard({ ...wizard, distMode: "new", selectedDistId: "" })} style={newPillBtn(wizard.distMode === "new")}>
                      <Plus size={13} /> Create New District
                    </button>
                    {wizard.distMode === "new" && (
                      <div>
                        <input
                          value={wizard.newDistName}
                          onChange={(e) => setWizard({ ...wizard, newDistName: e.target.value })}
                          placeholder="District name"
                          style={wizardErrors.newDistName ? wizInputErrorStyle : wizInputStyle}
                        />
                        <FieldError message={wizardErrors.newDistName} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              
              {wizard.step === 3 && (
                <div>
                  <p style={{ color: "#5C4033", fontSize: "0.82rem", marginBottom: "12px", marginTop: 0 }}>
                    Select a town in{" "}
                    <strong>
                      {wizard.distMode === "existing"
                        ? wizardProvince?.districts.find((d) => d._id === wizard.selectedDistId)?.name ?? wizard.selectedDistId
                        : wizard.newDistName}
                    </strong>, or create a new one.
                  </p>
                  {wizardDistrict && wizardDistrict.towns.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                      {wizardDistrict.towns.map((t) => (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => setWizard({ ...wizard, townMode: "existing", selectedTownId: t._id })}
                          style={pillBtn(wizard.townMode === "existing" && wizard.selectedTownId === t._id)}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {wizardErrors.town && <FieldError message={wizardErrors.town} />}
                  <div style={{ borderTop: "1px dashed rgba(45,80,22,0.2)", paddingTop: "14px" }}>
                    <button type="button" onClick={() => setWizard({ ...wizard, townMode: "new", selectedTownId: "" })} style={newPillBtn(wizard.townMode === "new")}>
                      <Plus size={13} /> Create New Town
                    </button>
                    {wizard.townMode === "new" && (
                      <div>
                        <input
                          value={wizard.newTownName}
                          onChange={(e) => setWizard({ ...wizard, newTownName: e.target.value })}
                          placeholder="Town name"
                          style={wizardErrors.newTownName ? wizInputErrorStyle : wizInputStyle}
                        />
                        <FieldError message={wizardErrors.newTownName} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              
              {wizard.step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  <div style={{ backgroundColor: "rgba(45,80,22,0.06)", border: "1px solid rgba(45,80,22,0.15)", borderRadius: "10px", padding: "8px 14px", fontSize: "0.78rem", color: "#4A7C23", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <MapPin size={12} />
                    {wizard.provMode === "existing"
                      ? provinces.find((p) => p._id === wizard.selectedProvId)?.name ?? wizard.selectedProvId
                      : `✦ ${wizard.newProvName}`}
                    {" → "}
                    {wizard.distMode === "existing"
                      ? wizardProvince?.districts.find((d) => d._id === wizard.selectedDistId)?.name ?? wizard.selectedDistId
                      : `✦ ${wizard.newDistName}`}
                    {" → "}
                    {wizard.townMode === "existing"
                      ? wizardDistrict?.towns.find((t) => t._id === wizard.selectedTownId)?.name ?? wizard.selectedTownId
                      : `✦ ${wizard.newTownName}`}
                  </div>

                  <InputRow
                    label="Shop Name"
                    value={wizard.shopForm.name}
                    onChange={(v) => setWizard({ ...wizard, shopForm: { ...wizard.shopForm, name: v } })}
                    placeholder="e.g. Rajapura Herbal Centre – Colombo"
                    required
                    error={wizardErrors.name}
                  />
                  <InputRow
                    label="Address"
                    value={wizard.shopForm.address}
                    onChange={(v) => setWizard({ ...wizard, shopForm: { ...wizard.shopForm, address: v } })}
                    placeholder="Full street address"
                    required
                    error={wizardErrors.address}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <InputRow
                      label="Phone"
                      value={wizard.shopForm.phone}
                      onChange={(v) => setWizard({ ...wizard, shopForm: { ...wizard.shopForm, phone: v } })}
                      placeholder="011 2 567 890"
                      error={wizardErrors.phone}
                    />
                    <InputRow
                      label="Opening Hours"
                      value={wizard.shopForm.hours}
                      onChange={(v) => setWizard({ ...wizard, shopForm: { ...wizard.shopForm, hours: v } })}
                      placeholder="Mon–Sat: 8AM–7PM"
                      error={wizardErrors.hours}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>
                      Store Type
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {SHOP_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setWizard({ ...wizard, shopForm: { ...wizard.shopForm, type: t } })}
                          style={{
                            padding: "6px 14px", borderRadius: "50px",
                            border: wizard.shopForm.type === t ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
                            backgroundColor: wizard.shopForm.type === t ? "rgba(45,80,22,0.1)" : "white",
                            color: "#2D5016", cursor: "pointer", fontSize: "0.78rem",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            
            <div style={{ padding: "14px 28px", borderTop: "1px solid rgba(45,80,22,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(45,80,22,0.02)" }}>
              <button
                onClick={() => {
                  if (wizard.step === 1) {
                    setWizard(null);
                  } else if (wizard.step === 2) {
                    setWizard({ ...wizard, step: 1 });
                  } else if (wizard.step === 3) {
                    const prov = wizard.provMode === "existing"
                      ? provinces.find((p) => p._id === wizard.selectedProvId)
                      : null;
                    setWizard({
                      ...wizard,
                      step: 2,
                      distMode: prov && prov.districts.length > 0 ? "existing" : "new",
                      selectedDistId: wizard.selectedDistId || prov?.districts[0]?._id || "",
                    });
                  } else {
                    setWizard({ ...wizard, step: (wizard.step - 1) as WizardState["step"] });
                  }
                  setWizardErrors({});
                }}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", borderRadius: "50px",
                  border: "1px solid rgba(45,80,22,0.2)", backgroundColor: "transparent",
                  color: "#6B4423", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.85rem",
                }}
              >
                <ArrowLeft size={14} /> {wizard.step === 1 ? "Cancel" : "Back"}
              </button>
              <span style={{ color: "#A8C580", fontSize: "0.75rem" }}>Step {wizard.step} of 4</span>
              <button
                onClick={advanceWizard}
                disabled={!canAdvance() || loading}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 20px", borderRadius: "50px", border: "none",
                  backgroundColor: canAdvance() && !loading
                    ? wizard.step === 4 ? "#2D5016" : "#D4A017"
                    : "rgba(45,80,22,0.15)",
                  color: canAdvance() && !loading
                    ? wizard.step === 4 ? "#FAF6EE" : "#1A3009"
                    : "#A8C580",
                  cursor: canAdvance() && !loading ? "pointer" : "not-allowed",
                  fontSize: "0.85rem", fontWeight: 600,
                }}
              >
                {wizard.step === 4 ? (
                  <><Save size={14} /> {loading ? "Saving..." : "Save Shop"}</>
                ) : (
                  <>Next <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {modal && (
        <Modal
          title={getModalTitle()}
          onClose={() => { setModal(null); setFormErrors({}); }}
          onSave={handleSave}
          loading={loading}
        >
          {(modal.kind === "addProvince" || modal.kind === "editProvince") && (
            <>
              <InputRow
                label="Province Name"
                value={provForm.name}
                onChange={(v) => {
                  setProvForm((p) => ({ ...p, name: v }));
                  if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder="e.g. Western Province"
                required
                error={formErrors.name}
              />
              <div>
                <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>
                  Icon
                </label>
                {iconRow}
                <FieldError message={formErrors.icon} />
              </div>
            </>
          )}

          {(modal.kind === "addDistrict" || modal.kind === "editDistrict") && (
            <InputRow
              label="District Name"
              value={distForm.name}
              onChange={(v) => {
                setDistForm((prev) => ({ ...prev, name: v }));
                if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="e.g. Colombo"
              required
              error={formErrors.name}
            />
          )}

          {(modal.kind === "addTown" || modal.kind === "editTown") && (
            <InputRow
              label="Town Name"
              value={townForm.name}
              onChange={(v) => {
                setTownForm({ name: v });
                if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="e.g. Nugegoda"
              required
              error={formErrors.name}
            />
          )}

          {(modal.kind === "addShop" || modal.kind === "editShop") && (
            <>
              <InputRow
                label="Shop Name"
                value={shopForm.name}
                onChange={(v) => {
                  setShopForm((s) => ({ ...s, name: v }));
                  if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder="e.g. Rajapura Herbal Centre"
                required
                error={formErrors.name}
              />
              <InputRow
                label="Address"
                value={shopForm.address}
                onChange={(v) => {
                  setShopForm((s) => ({ ...s, address: v }));
                  if (formErrors.address) setFormErrors((e) => ({ ...e, address: undefined }));
                }}
                placeholder="No. 45, Main Street, Town"
                required
                error={formErrors.address}
              />
              <InputRow
                label="Phone"
                value={shopForm.phone}
                onChange={(v) => {
                  setShopForm((s) => ({ ...s, phone: v }));
                  if (formErrors.phone) setFormErrors((e) => ({ ...e, phone: undefined }));
                }}
                placeholder="011 2 567 890"
                error={formErrors.phone}
              />
              <InputRow
                label="Hours"
                value={shopForm.hours}
                onChange={(v) => {
                  setShopForm((s) => ({ ...s, hours: v }));
                  if (formErrors.hours) setFormErrors((e) => ({ ...e, hours: undefined }));
                }}
                placeholder="Mon–Sat: 8:00 AM – 8:00 PM"
                error={formErrors.hours}
              />
              <div>
                <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>
                  Store Type
                </label>
                <select
                  value={shopForm.type}
                  onChange={(e) => setShopForm((s) => ({ ...s, type: e.target.value as ShopType }))}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: "10px",
                    border: "1.5px solid rgba(45,80,22,0.2)", backgroundColor: "#FAF6EE",
                    color: "#2D5016", fontSize: "0.85rem", outline: "none",
                  }}
                >
                  {SHOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </>
          )}
        </Modal>
      )}

      
      {deleteTarget && (
        <DeleteConfirm name={deleteTarget.name} onConfirm={deleteTarget.action} onCancel={() => setDeleteTarget(null)} getComplete={completing} />
      )}
    </div>
  );
}