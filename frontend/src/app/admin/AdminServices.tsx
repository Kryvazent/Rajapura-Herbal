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
  AlertCircle,
  Check,
  UploadCloud,
  LoaderCircle,
} from "lucide-react";
import axios from "axios";
import { useUploadThing } from "../lib/uploadthing";

const API_URL = import.meta.env.VITE_BACKEND_URL;


interface ServiceItem {
  _id?: any;
  id?: any;
  name: string;
  description: string;
  duration: string;
  icon: string;
  imageUrl?: string;
}

interface ServiceLocation {
  _id?: any;
  id?: any;
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

interface FormErrors {
  [key: string]: string;
}


const COLOR_PRESETS = [
  { label: "Forest", color: "#2D5016", light: "rgba(45,80,22,0.08)", border: "rgba(45,80,22,0.2)" },
  { label: "Earth",  color: "#8B5E3C", light: "rgba(139,94,60,0.07)", border: "rgba(139,94,60,0.2)" },
  { label: "Gold",   color: "#D4A017", light: "rgba(212,160,23,0.08)", border: "rgba(212,160,23,0.2)" },
  { label: "Teal",   color: "#2A7C6F", light: "rgba(42,124,111,0.08)", border: "rgba(42,124,111,0.2)" },
  { label: "Plum",   color: "#6B3A6B", light: "rgba(107,58,107,0.07)", border: "rgba(107,58,107,0.2)" },
];

const SERVICE_ICONS = ["🫧","🦶","🧖","💆","🫗","♨️","🌿","🌺","💎","🍃","🏺","✨"];
const PHONE_REGEX   = /^\+?[\d\s\-\(\)]{7,20}$/;


const validateLocation = (data: Omit<ServiceLocation, "id">): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Centre name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Must be at least 2 characters.";
  } else if (data.name.trim().length > 100) {
    errors.name = "Cannot exceed 100 characters.";
  }

  if (!data.area.trim()) {
    errors.area = "Area is required.";
  } else if (data.area.trim().length > 100) {
    errors.area = "Cannot exceed 100 characters.";
  }

  if (!data.address.trim()) {
    errors.address = "Address is required.";
  } else if (data.address.trim().length > 200) {
    errors.address = "Cannot exceed 200 characters.";
  }

  if (!data.mobile.trim()) {
    errors.mobile = "Primary mobile is required.";
  } else if (!PHONE_REGEX.test(data.mobile.trim())) {
    errors.mobile = "Please enter a valid phone number.";
  }

  if (data.altMobile && !PHONE_REGEX.test(data.altMobile.trim())) {
    errors.altMobile = "Please enter a valid alternate phone number.";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "Description cannot exceed 500 characters.";
  }

  return errors;
};

const validateServiceItem = (data: Omit<ServiceItem, "id">): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Service name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Must be at least 2 characters.";
  } else if (data.name.trim().length > 100) {
    errors.name = "Cannot exceed 100 characters.";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "Description cannot exceed 500 characters.";
  }

  if (data.duration && data.duration.length > 50) {
    errors.duration = "Duration cannot exceed 50 characters.";
  }

  return errors;
};


function Toast({ message, type }: { message: string; type: "success" | "error" }) {
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


function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
      <AlertCircle size={12} style={{ color: "#D4183D", flexShrink: 0 }} />
      <p style={{ color: "#D4183D", fontSize: "0.73rem", margin: 0 }}>{message}</p>
    </div>
  );
}


function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
    backgroundColor: error ? "rgba(212,24,61,0.04)" : "#FAF6EE",
    color: "#2D5016",
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Lato', sans-serif",
    resize: "vertical",
    transition: "border-color 0.2s",
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
      <FieldError message={error} />
    </div>
  );
}


function ModalShell({
  title,
  onClose,
  onSave,
  children,
  wide,
  loading,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  wide?: boolean;
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
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            flex: 1,
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


function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
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
          <button
            onClick={onCancel}
            disabled={loading}
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
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: loading ? "#e8738a" : "#D4183D",
              color: "#FAF6EE",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trash2 size={13} /> {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}


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
  imageUrl: "",
  videoUrl: "",
  services: [],
});

const blankService = (): Omit<ServiceItem, "id"> => ({
  name: "",
  description: "",
  duration: "",
  icon: "🌿",
  imageUrl: "",
});


export default function AdminServices() {
  const [locations, setLocations]     = useState<ServiceLocation[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pageLoading, setPageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [delLoading, setDelLoading]   = useState(false);
  const [mediaUploading, setMediaUploading] = useState<"centre-image" | "centre-video" | "service-image" | null>(null);
  const [toast, setToast]             = useState<{ message: string; type: "success" | "error" } | null>(null);

  
  const [locModal, setLocModal] = useState<null | {
    mode: "add" | "edit";
    data: Omit<ServiceLocation, "id">;
    id?: string;
    errors: FormErrors;
  }>(null);

  
  const [svcModal, setSvcModal] = useState<null | {
    mode: "add" | "edit";
    location_id: string;
    data: Omit<ServiceItem, "id">;
    service_id?: string;
    errors: FormErrors;
  }>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    name: string;
    action: () => void;
  } | null>(null);

  
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { startUpload: startImageUpload } = useUploadThing("serviceImage");
  const { startUpload: startVideoUpload } = useUploadThing("serviceVideo");
  const uploadedUrl = (result: any[] | undefined) =>
    result?.[0]?.ufsUrl ?? result?.[0]?.url ?? result?.[0]?.serverData?.url ?? "";

  const uploadCentreMedia = async (file: File, kind: "image" | "video") => {
    if (!locModal) return;
    setMediaUploading(kind === "image" ? "centre-image" : "centre-video");
    try {
      const result = await (kind === "image" ? startImageUpload([file]) : startVideoUpload([file]));
      const url = uploadedUrl(result);
      if (!url) throw new Error("The upload completed without a file URL.");
      setLocModal((current) => current ? { ...current, data: { ...current.data, [kind === "image" ? "imageUrl" : "videoUrl"]: url } } : current);
      showToast(`${kind === "image" ? "Image" : "Video"} uploaded. Save the centre to apply it.`, "success");
    } catch (error: any) {
      showToast(error?.message ?? `Failed to upload ${kind}.`, "error");
    } finally { setMediaUploading(null); }
  };

  const uploadServiceImage = async (file: File) => {
    if (!svcModal) return;
    setMediaUploading("service-image");
    try {
      const result = await startImageUpload([file]);
      const url = uploadedUrl(result);
      if (!url) throw new Error("The upload completed without a file URL.");
      setSvcModal((current) => current ? { ...current, data: { ...current.data, imageUrl: url } } : current);
      showToast("Treatment image uploaded. Save the service to apply it.", "success");
    } catch (error: any) {
      showToast(error?.message ?? "Failed to upload treatment image.", "error");
    } finally { setMediaUploading(null); }
  };

  
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  
  const fetchServiceLocations = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get(`${API_URL}/user/services`);
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setLocations(data);
    } catch (e) {
      console.error("fetchServiceLocations error:", e);
      setLocations([]);
      showToast("Failed to load service locations.", "error");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceLocations();
  }, []);

  
  const openAddLocation = () =>
    setLocModal({ mode: "add", data: blankLocation(), errors: {} });

  const openEditLocation = (loc: ServiceLocation) => {
    const { id, ...rest } = loc as any;
    setLocModal({
      mode: "edit",
      data: { ...rest, services: rest.services },
      id: loc._id,
      errors: {},
    });
  };

  const saveLocation = async () => {
    if (!locModal) return;

    
    const errors = validateLocation(locModal.data);
    if (Object.keys(errors).length > 0) {
      setLocModal({ ...locModal, errors });
      return;
    }

    try {
      setSaveLoading(true);
      if (locModal.mode === "add") {
        await axios.post(`${API_URL}/admin/services`, locModal.data, {
          withCredentials: true,
        });
        showToast("Service centre added successfully.", "success");
      } else {
        await axios.put(
          `${API_URL}/admin/services`,
          { _id: locModal.id, ...locModal.data },
          { withCredentials: true }
        );
        showToast("Service centre updated successfully.", "success");
      }
      await fetchServiceLocations();
      setLocModal(null);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save service centre.";
      showToast(msg, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteLocation = (loc: ServiceLocation) => {
    setDeleteTarget({
      name: loc.name,
      action: async () => {
        try {
          setDelLoading(true);
          await axios.delete(`${API_URL}/admin/services`, {
            data: { _id: loc._id },
            withCredentials: true,
          });
          await fetchServiceLocations();
          setDeleteTarget(null);
          showToast("Service centre deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete service centre.";
          showToast(msg, "error");
        } finally {
          setDelLoading(false);
        }
      },
    });
  };

  
  const openAddService = (location_id: string) =>
    setSvcModal({ mode: "add", location_id, data: blankService(), errors: {} });

  const openEditService = (location_id: string, svc: ServiceItem) => {
    const { id, _id, ...rest } = svc as any;
    setSvcModal({
      mode: "edit",
      location_id,
      data: rest,
      service_id: svc._id,
      errors: {},
    });
  };

  const saveService = async () => {
    if (!svcModal) return;

    
    const errors = validateServiceItem(svcModal.data);
    if (Object.keys(errors).length > 0) {
      setSvcModal({ ...svcModal, errors });
      return;
    }

    try {
      setSaveLoading(true);
      if (svcModal.mode === "add") {
        await axios.post(
          `${API_URL}/admin/services/item`,
          { location_id: svcModal.location_id, serviceItem: svcModal.data },
          { withCredentials: true }
        );
        showToast("Service added successfully.", "success");
      } else {
        await axios.put(
          `${API_URL}/admin/services/item`,
          {
            location_id: svcModal.location_id,
            service_id: svcModal.service_id,
            serviceItem: svcModal.data,
          },
          { withCredentials: true }
        );
        showToast("Service updated successfully.", "success");
      }
      await fetchServiceLocations();
      setSvcModal(null);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save service.";
      showToast(msg, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteService = (location_id: string, svc: ServiceItem) => {
    setDeleteTarget({
      name: svc.name,
      action: async () => {
        try {
          setDelLoading(true);
          await axios.delete(`${API_URL}/admin/services/item`, {
            data: { location_id, service_id: svc._id },
            withCredentials: true,
          });
          await fetchServiceLocations();
          setDeleteTarget(null);
          showToast("Service deleted.", "success");
        } catch (err: any) {
          const msg = err.response?.data?.message ?? "Failed to delete service.";
          showToast(msg, "error");
        } finally {
          setDelLoading(false);
        }
      },
    });
  };

  const setLocColor = (preset: (typeof COLOR_PRESETS)[0]) => {
    if (!locModal) return;
    setLocModal({
      ...locModal,
      data: {
        ...locModal.data,
        color: preset.color,
        lightColor: preset.light,
        borderColor: preset.border,
      },
    });
  };

  
  const totalServices = (Array.isArray(locations) ? locations : []).reduce(
    (a, l) => a + (l.services?.length ?? 0),
    0
  );

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
            Wellness Services
          </h2>
          <p style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.82rem" }}>
            {locations.length} service centres · {totalServices} services total
          </p>
        </div>
        <button
          onClick={openAddLocation}
          disabled={pageLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: pageLoading ? "#A8C580" : "#2D5016",
            color: "#FAF6EE",
            border: "none",
            padding: "10px 20px",
            borderRadius: "50px",
            cursor: pageLoading ? "not-allowed" : "pointer",
            fontSize: "0.88rem",
          }}
        >
          <Plus size={16} /> Add Service Centre
        </button>
      </div>

      
      {pageLoading && (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "3px solid rgba(45,80,22,0.15)",
              borderTopColor: "#2D5016",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 10px",
            }}
          />
          <p style={{ color: "#8B5E3C", fontSize: "0.85rem", margin: 0 }}>
            Loading service centres...
          </p>
        </div>
      )}

      
      {!pageLoading && (
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
            const locId = loc._id?.toString() ?? loc.id?.toString() ?? "";
            const isOpen = expandedIds.has(locId);

            return (
              <div
                key={locId}
                style={{
                  backgroundColor: "#FAF6EE",
                  border: `1px solid ${loc.borderColor ?? "rgba(45,80,22,0.2)"}`,
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
                }}
                
              >
                
                <div
                  style={{
                    gap: "14px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    background: isOpen ? loc.lightColor : "transparent",
                    transition: "background 0.2s",
                  }}
                  onClick={() => toggleExpand(locId)}
                  className="flex flex-col sm:flex-row items-start"
                >
                  
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

                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#2D5016", margin: 0, fontSize: "0.98rem", fontWeight: 600 }}>
                      {loc.name}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "3px" }}>
                      <span
                        style={{
                          color: "#5C4033",
                          fontSize: "0.76rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <MapPin size={11} /> {loc.address}
                      </span>
                      <span
                        style={{
                          color: "#5C4033",
                          fontSize: "0.76rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Phone size={11} /> {loc.mobile}
                      </span>
                    </div>
                  </div>

                  
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
                    {loc.services?.length ?? 0} services
                  </span>

                  
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openAddService(locId)}
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

                
                {isOpen && (
                  <div
                    style={{
                      borderTop: `1px solid ${loc.borderColor ?? "rgba(45,80,22,0.2)"}`,
                      padding: "12px 16px 16px",
                    }}
                  >
                    {loc.description && (
                      <div
                        style={{
                          backgroundColor: loc.lightColor,
                          borderRadius: "10px",
                          padding: "10px 14px",
                          marginBottom: "12px",
                        }}
                      >
                        <p
                          style={{
                            color: "#5C4033",
                            fontSize: "0.82rem",
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          {loc.description}
                        </p>
                      </div>
                    )}

                    {(!loc.services || loc.services.length === 0) && (
                      <p
                        style={{
                          color: "#A8C580",
                          fontSize: "0.82rem",
                          textAlign: "center",
                          padding: "12px",
                        }}
                      >
                        No services yet. Click "+ Service" to add one.
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(loc.services ?? []).map((svc) => {
                        const svcId = svc._id?.toString() ?? svc.id?.toString() ?? svc.name;
                        return (
                          <div
                            key={svcId}
                            style={{
                              backgroundColor: "white",
                              border: `1px solid ${loc.borderColor ?? "rgba(45,80,22,0.2)"}`,
                              borderRadius: "12px",
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            
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

                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p
                                  style={{
                                    color: loc.color,
                                    margin: 0,
                                    fontSize: "0.88rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {svc.name}
                                </p>
                                {svc.duration && (
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
                                )}
                              </div>
                              {svc.description && (
                                <p
                                  style={{
                                    color: "#5C4033",
                                    margin: "3px 0 0",
                                    fontSize: "0.78rem",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {svc.description}
                                </p>
                              )}
                            </div>

                            
                            <div
                              className="flex items-center gap-2"
                              style={{ flexShrink: 0 }}
                            >
                              <button
                                onClick={() => openEditService(locId, svc)}
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
                                onClick={() => deleteService(locId, svc)}
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
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      
      {locModal && (
        <ModalShell
          title={locModal.mode === "add" ? "Add Service Centre" : "Edit Service Centre"}
          onClose={() => setLocModal(null)}
          onSave={saveLocation}
          wide
          loading={saveLoading || mediaUploading === "centre-image" || mediaUploading === "centre-video"}
        >
          
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px", alignItems: "start" }}>
            <div>
              <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "5px" }}>
                Icon
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "120px" }}>
                {["🌆","🏔️","🌊","🌿","☕","🏺","💎","🌅","🏛️"].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() =>
                      setLocModal({ ...locModal, data: { ...locModal.data, icon: ic } })
                    }
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border:
                        locModal.data.icon === ic
                          ? "2px solid #2D5016"
                          : "1px solid rgba(45,80,22,0.2)",
                      backgroundColor:
                        locModal.data.icon === ic ? "rgba(45,80,22,0.1)" : "transparent",
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
              onChange={(v) => {
                setLocModal({
                  ...locModal,
                  data: { ...locModal.data, name: v },
                  errors: { ...locModal.errors, name: "" },
                });
              }}
              placeholder="e.g. Rajapura Wellness Centre – Paliyagoda"
              required
              error={locModal.errors.name}
            />
          </div>

          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FieldRow
              label="Area (short name)"
              value={locModal.data.area}
              onChange={(v) =>
                setLocModal({
                  ...locModal,
                  data: { ...locModal.data, area: v },
                  errors: { ...locModal.errors, area: "" },
                })
              }
              placeholder="e.g. Paliyagoda"
              required
              error={locModal.errors.area}
            />
            <FieldRow
              label="Map Label"
              value={locModal.data.mapLabel}
              onChange={(v) =>
                setLocModal({ ...locModal, data: { ...locModal.data, mapLabel: v } })
              }
              placeholder="e.g. Western Province · Colombo District"
            />
          </div>

          <FieldRow
            label="Address"
            value={locModal.data.address}
            onChange={(v) =>
              setLocModal({
                ...locModal,
                data: { ...locModal.data, address: v },
                errors: { ...locModal.errors, address: "" },
              })
            }
            placeholder="Full address"
            required
            error={locModal.errors.address}
          />

          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FieldRow
              label="Primary Mobile"
              value={locModal.data.mobile}
              onChange={(v) =>
                setLocModal({
                  ...locModal,
                  data: { ...locModal.data, mobile: v },
                  errors: { ...locModal.errors, mobile: "" },
                })
              }
              placeholder="+94 77 234 5678"
              required
              error={locModal.errors.mobile}
            />
            <FieldRow
              label="Alt Mobile (optional)"
              value={locModal.data.altMobile}
              onChange={(v) =>
                setLocModal({
                  ...locModal,
                  data: { ...locModal.data, altMobile: v },
                  errors: { ...locModal.errors, altMobile: "" },
                })
              }
              placeholder="+94 11 491 2300"
              error={locModal.errors.altMobile}
            />
          </div>

          <FieldRow
            label="Description"
            value={locModal.data.description}
            onChange={(v) =>
              setLocModal({
                ...locModal,
                data: { ...locModal.data, description: v },
                errors: { ...locModal.errors, description: "" },
              })
            }
            placeholder="Brief description of this centre..."
            textarea
            error={locModal.errors.description}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            <MediaUpload label="Centre showcase image" url={locModal.data.imageUrl} accept="image/*" uploading={mediaUploading === "centre-image"} onSelect={(file) => uploadCentreMedia(file, "image")} onRemove={() => setLocModal({ ...locModal, data: { ...locModal.data, imageUrl: "" } })} />
            <MediaUpload label="Experience video (optional)" url={locModal.data.videoUrl} accept="video/*" uploading={mediaUploading === "centre-video"} onSelect={(file) => uploadCentreMedia(file, "video")} onRemove={() => setLocModal({ ...locModal, data: { ...locModal.data, videoUrl: "" } })} />
          </div>

          
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
                    border:
                      locModal.data.color === preset.color
                        ? `2px solid ${preset.color}`
                        : "1px solid rgba(45,80,22,0.2)",
                    backgroundColor:
                      locModal.data.color === preset.color
                        ? preset.light
                        : "transparent",
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

      
      {svcModal && (
        <ModalShell
          title={svcModal.mode === "add" ? "Add Service" : "Edit Service"}
          onClose={() => setSvcModal(null)}
          onSave={saveService}
          loading={saveLoading || mediaUploading === "service-image"}
        >
          
          <div>
            <label style={{ display: "block", color: "#2D5016", fontSize: "0.8rem", marginBottom: "6px" }}>
              Icon
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SERVICE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() =>
                    setSvcModal({ ...svcModal, data: { ...svcModal.data, icon: ic } })
                  }
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9px",
                    border:
                      svcModal.data.icon === ic
                        ? "2px solid #2D5016"
                        : "1px solid rgba(45,80,22,0.2)",
                    backgroundColor:
                      svcModal.data.icon === ic ? "rgba(45,80,22,0.1)" : "transparent",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <MediaUpload label="Treatment showcase image" url={svcModal.data.imageUrl} accept="image/*" uploading={mediaUploading === "service-image"} onSelect={uploadServiceImage} onRemove={() => setSvcModal({ ...svcModal, data: { ...svcModal.data, imageUrl: "" } })} />

          <FieldRow
            label="Service Name"
            value={svcModal.data.name}
            onChange={(v) =>
              setSvcModal({
                ...svcModal,
                data: { ...svcModal.data, name: v },
                errors: { ...svcModal.errors, name: "" },
              })
            }
            placeholder="e.g. Full Body Ayurvedic Massage"
            required
            error={svcModal.errors.name}
          />

          <FieldRow
            label="Duration"
            value={svcModal.data.duration}
            onChange={(v) =>
              setSvcModal({
                ...svcModal,
                data: { ...svcModal.data, duration: v },
                errors: { ...svcModal.errors, duration: "" },
              })
            }
            placeholder="e.g. 60 – 90 min"
            error={svcModal.errors.duration}
          />

          <FieldRow
            label="Description"
            value={svcModal.data.description}
            onChange={(v) =>
              setSvcModal({
                ...svcModal,
                data: { ...svcModal.data, description: v },
                errors: { ...svcModal.errors, description: "" },
              })
            }
            placeholder="Brief description of this service..."
            textarea
            error={svcModal.errors.description}
          />
        </ModalShell>
      )}

      
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={deleteTarget.action}
          onCancel={() => setDeleteTarget(null)}
          loading={delLoading}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .service-upload-spinner { animation: spin .8s linear infinite; }
      `}</style>
    </div>
  );
}

function MediaUpload({ label, url, accept, uploading, onSelect, onRemove }: {
  label: string; url?: string; accept: "image/*" | "video/*"; uploading: boolean;
  onSelect: (file: File) => void; onRemove: () => void;
}) {
  const isVideo = accept === "video/*";
  return <div style={{ padding: "14px", border: "1px solid rgba(45,80,22,0.16)", borderRadius: "12px", background: "#fff" }}>
    <label style={{ display: "block", color: "#2D5016", fontSize: ".8rem", marginBottom: "8px", fontWeight: 700 }}>{label}</label>
    {url && <div style={{ position: "relative", marginBottom: "10px" }}>
      {isVideo ? <video src={url} controls style={{ width: "100%", maxHeight: "180px", borderRadius: "9px", background: "#14281d" }} /> : <img src={url} alt="Uploaded preview" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "9px" }} />}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} style={{ position: "absolute", top: 7, right: 7, border: 0, borderRadius: "50%", width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "white", background: "rgba(140,20,35,.88)" }}><X size={14} /></button>
    </div>}
    <label style={{ minHeight: "42px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px dashed rgba(45,80,22,.35)", borderRadius: 9, color: "#2D5016", background: "rgba(45,80,22,.04)", cursor: uploading ? "wait" : "pointer", fontSize: ".78rem" }}>
      {uploading ? <><LoaderCircle size={16} className="service-upload-spinner" /> Uploading...</> : <><UploadCloud size={16} /> {url ? "Replace file" : `Upload ${isVideo ? "video" : "image"}`}</>}
      <input type="file" accept={accept} disabled={uploading} hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) onSelect(file); event.target.value = ""; }} />
    </label>
    <small style={{ display: "block", color: "#7b877f", marginTop: 6 }}>{isVideo ? "MP4/WebM, up to 64 MB" : "JPG, PNG or WebP, up to 8 MB"}</small>
  </div>;
}
