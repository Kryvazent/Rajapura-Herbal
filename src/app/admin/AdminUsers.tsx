import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  User,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  Check,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;


interface StaffUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "STAFF";
  status: "ACTIVE" | "DISABLED";
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
  phone: string;
  status: "ACTIVE" | "DISABLED";
}

interface FormErrors {
  [key: string]: string;
}


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,20}$/;

const emptyForm = (): UserForm => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "STAFF",
  phone: "",
  status: "ACTIVE",
});

const validateForm = (form: UserForm, isEdit: boolean): FormErrors => {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  else if (form.firstName.trim().length < 2)
    errors.firstName = "Must be at least 2 characters.";
  else if (form.firstName.trim().length > 50)
    errors.firstName = "Cannot exceed 50 characters.";

  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  else if (form.lastName.trim().length < 2)
    errors.lastName = "Must be at least 2 characters.";
  else if (form.lastName.trim().length > 50)
    errors.lastName = "Cannot exceed 50 characters.";

  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(form.email.trim()))
    errors.email = "Please enter a valid email address.";

  if (form.password && form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (form.password && form.password.length > 128) {
    errors.password = "Password cannot exceed 128 characters.";
  }

  if (form.phone && !PHONE_REGEX.test(form.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!["ADMIN", "STAFF"].includes(form.role)) {
    errors.role = "Please select a valid role.";
  }

  return errors;
};


function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
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
    <div
      style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
    >
      <AlertCircle size={12} style={{ color: "#D4183D", flexShrink: 0 }} />
      <p style={{ color: "#D4183D", fontSize: "0.73rem", margin: 0 }}>{message}</p>
    </div>
  );
}


function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  icon,
  rightElement,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#2D5016",
          fontSize: "0.8rem",
          marginBottom: "5px",
          fontWeight: 500,
        }}
      >
        {label} {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: error ? "#D4183D" : "#8B5E3C",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: `9px ${rightElement ? "40px" : "12px"} 9px ${
              icon ? "38px" : "12px"
            }`,
            borderRadius: "10px",
            border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
            backgroundColor: error ? "rgba(212,24,61,0.04)" : "#FAF6EE",
            color: "#2D5016",
            fontSize: "0.85rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = "#2D5016";
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = "rgba(45,80,22,0.2)";
          }}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      <FieldError message={error} />
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
          Delete <strong>"{name}"</strong>? This action cannot be undone and
          will permanently remove their account.
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "center" }}
        >
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


function RoleBadge({ role }: { role: "ADMIN" | "STAFF" }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "50px",
        fontSize: "0.7rem",
        fontWeight: 600,
        backgroundColor: isAdmin
          ? "rgba(45,80,22,0.12)"
          : "rgba(139,94,60,0.12)",
        color: isAdmin ? "#2D5016" : "#6B4423",
        border: `1px solid ${
          isAdmin ? "rgba(45,80,22,0.2)" : "rgba(139,94,60,0.2)"
        }`,
      }}
    >
      {isAdmin ? <ShieldAlert size={11} /> : <Shield size={11} />}
      {role}
    </span>
  );
}


function StatusBadge({ status }: { status: "ACTIVE" | "DISABLED" }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "50px",
        fontSize: "0.7rem",
        fontWeight: 600,
        backgroundColor: isActive
          ? "rgba(74,124,35,0.12)"
          : "rgba(212,24,61,0.1)",
        color: isActive ? "#4A7C23" : "#D4183D",
        border: `1px solid ${
          isActive ? "rgba(74,124,35,0.25)" : "rgba(212,24,61,0.2)"
        }`,
      }}
    >
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isActive ? "#4A7C23" : "#D4183D",
        }}
      />
      {isActive ? "Active" : "Disabled"}
    </span>
  );
}


function Avatar({ user, size = 40 }: { user: StaffUser; size?: number }) {
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const colors = ["#2D5016", "#4A7C23", "#6B4423", "#8B5E3C", "#1A3009"];
  const colorIndex =
    (user.firstName.charCodeAt(0) + user.lastName.charCodeAt(0)) %
    colors.length;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors[colorIndex],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FAF6EE",
        fontSize: size * 0.35,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.05em",
      }}
    >
      {initials}
    </div>
  );
}


function DetailModal({
  user,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  loading,
  currentUserId,
}: {
  user: StaffUser;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  loading: boolean;
  currentUserId: string;
}) {
  const isSelf = user._id === currentUserId;
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
          borderRadius: "22px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        
        <div
          style={{
            background: "linear-gradient(135deg, #2D5016, #4A7C23)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Avatar user={user} size={52} />
            <div>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#FAF6EE",
                  margin: "0 0 4px",
                  fontSize: "1.1rem",
                }}
              >
                {user.firstName} {user.lastName}
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(250,246,238,0.7)",
              cursor: "pointer",
              display: "flex",
              padding: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: <Mail size={14} />, label: "Email", value: user.email },
              {
                icon: <Phone size={14} />,
                label: "Phone",
                value: user.phone || "—",
              },
              { icon: <Shield size={14} />, label: "Role", value: user.role },
              {
                icon: <User size={14} />,
                label: "Member since",
                value: new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
              {
                icon: <RefreshCw size={14} />,
                label: "Last updated",
                value: new Date(user.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  backgroundColor: "rgba(45,80,22,0.04)",
                  borderRadius: "10px",
                  border: "1px solid rgba(45,80,22,0.08)",
                }}
              >
                <div style={{ color: "#4A7C23", flexShrink: 0 }}>
                  {row.icon}
                </div>
                <div>
                  <p
                    style={{
                      color: "#8B5E3C",
                      fontSize: "0.7rem",
                      margin: "0 0 1px",
                    }}
                  >
                    {row.label}
                  </p>
                  <p
                    style={{
                      color: "#2D5016",
                      fontSize: "0.85rem",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div
          style={{
            padding: "14px 28px",
            borderTop: "1px solid rgba(45,80,22,0.1)",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            backgroundColor: "rgba(45,80,22,0.02)",
          }}
        >
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(45,80,22,0.2)",
              backgroundColor: "rgba(45,80,22,0.06)",
              color: "#2D5016",
              cursor: "pointer",
              fontSize: "0.83rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontWeight: 500,
            }}
          >
            <Pencil size={13} /> Edit
          </button>

          {!isSelf && (
            <button
              onClick={onToggleStatus}
              disabled={loading}
              style={{
                flex: 1,
                padding: "9px 16px",
                borderRadius: "10px",
                border: `1px solid ${
                  user.status === "ACTIVE"
                    ? "rgba(212,24,61,0.2)"
                    : "rgba(74,124,35,0.2)"
                }`,
                backgroundColor:
                  user.status === "ACTIVE"
                    ? "rgba(212,24,61,0.06)"
                    : "rgba(74,124,35,0.06)",
                color: user.status === "ACTIVE" ? "#D4183D" : "#4A7C23",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.83rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: 500,
              }}
            >
              {user.status === "ACTIVE" ? (
                <>
                  <ToggleLeft size={14} /> Disable
                </>
              ) : (
                <>
                  <ToggleRight size={14} /> Enable
                </>
              )}
            </button>
          )}

          {!isSelf && (
            <button
              onClick={onDelete}
              disabled={loading}
              style={{
                flex: 1,
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(212,24,61,0.2)",
                backgroundColor: "rgba(212,24,61,0.06)",
                color: "#D4183D",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.83rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: 500,
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          )}

          {isSelf && (
            <p
              style={{
                flex: 1,
                fontSize: "0.75rem",
                color: "#8B5E3C",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "9px 0",
              }}
            >
              <AlertCircle size={12} /> This is your account
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


function FormModal({
  title,
  form,
  setForm,
  errors,
  setErrors,
  onClose,
  onSave,
  loading,
  isEdit,
}: {
  title: string;
  form: UserForm;
  setForm: React.Dispatch<React.SetStateAction<UserForm>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  isEdit: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const clearError = (field: string) => {
    if (errors[field])
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  };

  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
      onClick={handleBackdropClick}
    >
      
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: "22px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        }}
        
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            backgroundColor: "#FAF6EE",
            borderRadius: "22px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          
          <div
            style={{
              background: "linear-gradient(135deg, #2D5016, #4A7C23)",
              padding: "20px 28px",
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
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InputField
                label="First Name"
                value={form.firstName}
                onChange={(v) => {
                  setForm((f) => ({ ...f, firstName: v }));
                  clearError("firstName");
                }}
                placeholder="John"
                required
                error={errors.firstName}
                icon={<User size={14} />}
              />
              <InputField
                label="Last Name"
                value={form.lastName}
                onChange={(v) => {
                  setForm((f) => ({ ...f, lastName: v }));
                  clearError("lastName");
                }}
                placeholder="Silva"
                required
                error={errors.lastName}
                icon={<User size={14} />}
              />
            </div>

            
            <InputField
              label="Email Address"
              value={form.email}
              onChange={(v) => {
                setForm((f) => ({ ...f, email: v }));
                clearError("email");
              }}
              placeholder="john.silva@example.com"
              type="email"
              required
              error={errors.email}
              icon={<Mail size={14} />}
            />

            
            {!isEdit && (
              <div
                style={{
                  backgroundColor: "rgba(212,160,23,0.07)",
                  border: "1px solid rgba(212,160,23,0.2)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <AlertCircle
                  size={15}
                  style={{
                    color: "#D4A017",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <div>
                  <p
                    style={{
                      color: "#7A5C00",
                      fontSize: "0.82rem",
                      margin: "0 0 4px",
                      fontWeight: 600,
                    }}
                  >
                    Temporary password will be set automatically
                  </p>
                  <p
                    style={{
                      color: "#8B6914",
                      fontSize: "0.78rem",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    The user will be assigned the temporary password{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(212,160,23,0.15)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                      }}
                    >
                      Welcome@123
                    </code>{" "}
                    and will be required to change it on first login.
                  </p>
                </div>
              </div>
            )}

            
            {isEdit && (
              <InputField
                label="New Password (leave blank to keep current)"
                value={form.password}
                onChange={(v) => {
                  setForm((f) => ({ ...f, password: v }));
                  if (errors.password)
                    setErrors((e) => ({ ...e, password: undefined as any }));
                }}
                placeholder="Enter new password to change..."
                type={showPassword ? "text" : "password"}
                error={errors.password}
                icon={<Shield size={14} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8B5E3C",
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            )}

            
            <InputField
              label="Phone Number"
              value={form.phone}
              onChange={(v) => {
                setForm((f) => ({ ...f, phone: v }));
                clearError("phone");
              }}
              placeholder="077 123 4567"
              error={errors.phone}
              icon={<Phone size={14} />}
            />

            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#2D5016",
                    fontSize: "0.8rem",
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                  Role <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <ShieldAlert
                    size={14}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8B5E3C",
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        role: e.target.value as "ADMIN" | "STAFF",
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "9px 32px 9px 36px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(45,80,22,0.2)",
                      backgroundColor: "#FAF6EE",
                      color: "#2D5016",
                      fontSize: "0.85rem",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8B5E3C",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#2D5016",
                    fontSize: "0.8rem",
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                  Status
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as "ACTIVE" | "DISABLED",
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "9px 32px 9px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(45,80,22,0.2)",
                      backgroundColor: "#FAF6EE",
                      color: "#2D5016",
                      fontSize: "0.85rem",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8B5E3C",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div
            style={{
              padding: "14px 28px",
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
              type="button"
              onClick={(e) => {
                e.stopPropagation(); 
                onSave();
              }}
              disabled={loading}
              style={{
                padding: "9px 24px",
                borderRadius: "50px",
                border: "none",
                backgroundColor: loading ? "#A8C580" : "#2D5016",
                color: "#FAF6EE",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontWeight: 500,
              }}
            >
              <Save size={14} />{" "}
              {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AdminUsers() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "STAFF">(
    "ALL"
  );
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ACTIVE" | "DISABLED"
  >("ALL");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  
  const [detailUser, setDetailUser] = useState<StaffUser | null>(null);
  const [formModal, setFormModal] = useState<{
    mode: "add" | "edit";
    user?: StaffUser;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [createdInfo, setCreatedInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  
  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/users`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setUsers(data);
    } catch (error) {
      console.error("fetchUsers error:", error);
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await axios.get(
          `${API_URL}/admin/users/search?q=${encodeURIComponent(searchQuery)}`,
          { withCredentials: true }
        );
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setUsers(data);
      } catch {
        showToast("Search failed.", "error");
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers, showToast]);

  
  const filteredUsers = users.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (filterStatus !== "ALL" && u.status !== filterStatus) return false;
    return true;
  });

  
  const openAddModal = () => {
    setForm(emptyForm());
    setFormErrors({});
    setFormModal({ mode: "add" });
  };

  
  const openEditModal = (user: StaffUser) => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone ?? "",
      status: user.status,
    });
    setFormErrors({});
    setDetailUser(null);
    setFormModal({ mode: "edit", user });
  };

  
  
  const handleSave = useCallback(async () => {

    console.log("form")
    const isEdit = formModal?.mode === "edit";
    const errors = validateForm(form, isEdit ?? false);

    console.log("bbb")
    console.log(errors)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    console.log("ccc")

    try {
      setActionLoading(true);

      if (isEdit && formModal?.user) {

    console.log("ddd")

        await axios.put(
          `${API_URL}/admin/users/${formModal.user._id}`,
          form,
          { withCredentials: true }
        );
        showToast("User updated successfully.", "success");
        await fetchUsers();
        setFormModal(null);
        setFormErrors({});
      } else {
        console.log("Creating user with data:", form);
        await axios.post(`${API_URL}/admin/users`, form, {
          withCredentials: true,
        });
        setCreatedInfo({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
        });
        showToast("User created successfully.", "success");
        await fetchUsers();
        setFormModal(null);
        setFormErrors({});
      }
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save user.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }, [form, formModal, fetchUsers, showToast]);

  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await axios.delete(`${API_URL}/admin/users/${deleteTarget._id}`, {
        withCredentials: true,
      });
      await fetchUsers();
      setDeleteTarget(null);
      setDetailUser(null);
      showToast("User deleted successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to delete user.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  
  const handleToggleStatus = async (user: StaffUser) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(
        `${API_URL}/admin/users/${user._id}/toggle-status`,
        {},
        { withCredentials: true }
      );
      const updated = res.data?.data;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, status: updated.status } : u
        )
      );
      if (detailUser?._id === user._id) {
        setDetailUser((prev) =>
          prev ? { ...prev, status: updated.status } : prev
        );
      }
      showToast(
        `User ${
          updated.status === "ACTIVE" ? "enabled" : "disabled"
        } successfully.`,
        "success"
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? "Failed to update user status.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalStaff = users.filter((u) => u.role === "STAFF").length;
  const totalActive = users.filter((u) => u.status === "ACTIVE").length;
  const totalDisabled = users.filter((u) => u.status === "DISABLED").length;

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
            User Management
          </h2>
          <p
            style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.82rem" }}
          >
            {users.length} total · {totalAdmins} admins · {totalStaff} staff ·{" "}
            {totalActive} active · {totalDisabled} disabled
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
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
            fontWeight: 500,
          }}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "#2D5016",
            bg: "rgba(45,80,22,0.08)",
          },
          {
            label: "Admins",
            value: totalAdmins,
            color: "#4A7C23",
            bg: "rgba(74,124,35,0.08)",
          },
          {
            label: "Staff",
            value: totalStaff,
            color: "#6B4423",
            bg: "rgba(107,68,35,0.08)",
          },
          {
            label: "Active",
            value: totalActive,
            color: "#4A7C23",
            bg: "rgba(74,124,35,0.08)",
          },
          {
            label: "Disabled",
            value: totalDisabled,
            color: "#D4183D",
            bg: "rgba(212,24,61,0.06)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: stat.bg,
              border: `1px solid ${stat.color}22`,
              borderRadius: "14px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: stat.color,
                fontSize: "1.6rem",
                fontWeight: 700,
                margin: "0 0 2px",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                color: stat.color,
                fontSize: "0.72rem",
                margin: 0,
                opacity: 0.8,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      
      <div
        style={{
          backgroundColor: "#FAF6EE",
          border: "1px solid rgba(45,80,22,0.12)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8B5E3C",
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: "10px",
              border: "1.5px solid rgba(45,80,22,0.2)",
              backgroundColor: "#FAF6EE",
              color: "#2D5016",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {searchLoading && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                border: "2px solid rgba(45,80,22,0.2)",
                borderTopColor: "#2D5016",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          )}
        </div>

        
        <div style={{ position: "relative" }}>
          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value as typeof filterRole)
            }
            style={{
              padding: "9px 32px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid rgba(45,80,22,0.2)",
              backgroundColor: "#FAF6EE",
              color: "#2D5016",
              fontSize: "0.83rem",
              outline: "none",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>
          <ChevronDown
            size={13}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8B5E3C",
              pointerEvents: "none",
            }}
          />
        </div>

        
        <div style={{ position: "relative" }}>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as typeof filterStatus)
            }
            style={{
              padding: "9px 32px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid rgba(45,80,22,0.2)",
              backgroundColor: "#FAF6EE",
              color: "#2D5016",
              fontSize: "0.83rem",
              outline: "none",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
          <ChevronDown
            size={13}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8B5E3C",
              pointerEvents: "none",
            }}
          />
        </div>

        
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 14px",
            borderRadius: "10px",
            border: "1.5px solid rgba(45,80,22,0.2)",
            backgroundColor: "transparent",
            color: "#2D5016",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.83rem",
          }}
        >
          <RefreshCw
            size={13}
            style={{
              animation: loading ? "spin 0.8s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
      </div>

      
      <div
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
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
            padding: "12px 20px",
            backgroundColor: "rgba(45,80,22,0.04)",
            borderBottom: "1px solid rgba(45,80,22,0.1)",
          }}
        >
          {["User", "Email", "Role", "Status", "Actions"].map((h) => (
            <p
              key={h}
              style={{
                color: "#4A7C23",
                fontSize: "0.72rem",
                margin: 0,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </p>
          ))}
        </div>

        
        {loading && (
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
              Loading users...
            </p>
          </div>
        )}

        
        {!loading && filteredUsers.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <User
              size={32}
              style={{
                color: "#A8C580",
                margin: "0 auto 10px",
                display: "block",
              }}
            />
            <p
              style={{
                color: "#8B5E3C",
                fontSize: "0.9rem",
                margin: "0 0 4px",
              }}
            >
              {searchQuery
                ? "No users found for your search."
                : "No users found."}
            </p>
            <p style={{ color: "#A8C580", fontSize: "0.8rem", margin: 0 }}>
              {searchQuery
                ? "Try a different search term."
                : "Click 'Add User' to create the first one."}
            </p>
          </div>
        )}

        
        {!loading &&
          filteredUsers.map((user, i) => (
            <div
              key={user._id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                padding: "14px 20px",
                borderBottom:
                  i < filteredUsers.length - 1
                    ? "1px solid rgba(45,80,22,0.07)"
                    : "none",
                alignItems: "center",
                transition: "background-color 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(45,80,22,0.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => setDetailUser(user)}
            >
              
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Avatar user={user} size={36} />
                <div>
                  <p
                    style={{
                      color: "#2D5016",
                      margin: "0 0 1px",
                      fontSize: "0.87rem",
                      fontWeight: 600,
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                  {user.phone && (
                    <p
                      style={{
                        color: "#8B5E3C",
                        margin: 0,
                        fontSize: "0.72rem",
                      }}
                    >
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>

              
              <p
                style={{
                  color: "#5C4033",
                  margin: 0,
                  fontSize: "0.83rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </p>

              
              <div>
                <RoleBadge role={user.role} />
              </div>

              
              <div>
                <StatusBadge status={user.status} />
              </div>

              
              <div
                style={{ display: "flex", gap: "6px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  disabled={actionLoading}
                  title="Edit user"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    border: "1px solid rgba(45,80,22,0.2)",
                    backgroundColor: "rgba(45,80,22,0.06)",
                    color: "#2D5016",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pencil size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(user)}
                  disabled={actionLoading || user._id === currentUserId}
                  title={
                    user.status === "ACTIVE" ? "Disable user" : "Enable user"
                  }
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    border: `1px solid ${
                      user.status === "ACTIVE"
                        ? "rgba(212,160,23,0.3)"
                        : "rgba(74,124,35,0.3)"
                    }`,
                    backgroundColor:
                      user.status === "ACTIVE"
                        ? "rgba(212,160,23,0.08)"
                        : "rgba(74,124,35,0.08)",
                    color:
                      user.status === "ACTIVE" ? "#D4A017" : "#4A7C23",
                    cursor:
                      actionLoading || user._id === currentUserId
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: user._id === currentUserId ? 0.4 : 1,
                  }}
                >
                  {user.status === "ACTIVE" ? (
                    <ToggleLeft size={13} />
                  ) : (
                    <ToggleRight size={13} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(user)}
                  disabled={actionLoading || user._id === currentUserId}
                  title="Delete user"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    border: "1px solid rgba(212,24,61,0.2)",
                    backgroundColor: "rgba(212,24,61,0.06)",
                    color: "#D4183D",
                    cursor:
                      actionLoading || user._id === currentUserId
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: user._id === currentUserId ? 0.4 : 1,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
      </div>

      
      {detailUser && (
        <DetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onEdit={() => openEditModal(detailUser)}
          onToggleStatus={() => handleToggleStatus(detailUser)}
          onDelete={() => setDeleteTarget(detailUser)}
          loading={actionLoading}
          currentUserId={currentUserId}
        />
      )}

      
      {formModal && (
        <FormModal
          title={formModal.mode === "add" ? "Add New User" : "Edit User"}
          form={form}
          setForm={setForm}
          errors={formErrors}
          setErrors={setFormErrors}
          onClose={() => {
            setFormModal(null);
            setFormErrors({});
          }}
          onSave={handleSave}
          loading={actionLoading}
          isEdit={formModal.mode === "edit"}
        />
      )}

      
      {deleteTarget && (
        <DeleteConfirm
          name={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}

      
      {createdInfo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14,26,8,0.75)",
            zIndex: 400,
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
              maxWidth: "420px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
            }}
          >
            
            <div
              style={{
                background: "linear-gradient(135deg, #2D5016, #4A7C23)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(139,195,74,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={20} style={{ color: "#8BC34A" }} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#FAF6EE",
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  User Created Successfully
                </p>
                <p
                  style={{
                    color: "rgba(168,197,128,0.8)",
                    fontSize: "0.76rem",
                    margin: 0,
                  }}
                >
                  Share these credentials with the user
                </p>
              </div>
            </div>

            
            <div style={{ padding: "20px 24px 24px" }}>
              <p
                style={{
                  color: "#5C4033",
                  fontSize: "0.83rem",
                  marginBottom: "14px",
                  lineHeight: 1.5,
                }}
              >
                <strong>{createdInfo.name}</strong> has been created. Please
                securely share the following login credentials:
              </p>

              {[
                { label: "Email", value: createdInfo.email },
                { label: "Temporary Password", value: "Welcome@123" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    backgroundColor: "rgba(45,80,22,0.05)",
                    border: "1px solid rgba(45,80,22,0.12)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#8B5E3C",
                      fontSize: "0.74rem",
                      margin: 0,
                    }}
                  >
                    {row.label}
                  </p>
                  <p
                    style={{
                      color: "#2D5016",
                      fontSize: "0.88rem",
                      margin: 0,
                      fontFamily:
                        row.label === "Temporary Password"
                          ? "monospace"
                          : "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {row.value}
                  </p>
                </div>
              ))}

              <div
                style={{
                  backgroundColor: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(212,160,23,0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <AlertCircle
                  size={13}
                  style={{
                    color: "#D4A017",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <p
                  style={{
                    color: "#7A5C00",
                    fontSize: "0.76rem",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  The user will be prompted to change their password immediately
                  on first login.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreatedInfo(null);
                }}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2D5016",
                  color: "#FAF6EE",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Check size={15} /> Got it, close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}