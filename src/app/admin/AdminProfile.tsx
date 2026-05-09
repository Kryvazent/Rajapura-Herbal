// src/pages/admin/AdminProfile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,20}$/;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "STAFF";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── FieldError ───────────────────────────────────────────────────────────────
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

// ─── InputField ───────────────────────────────────────────────────────────────
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
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  disabled?: boolean;
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
        {label}{" "}
        {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: disabled ? "#A8C580" : error ? "#D4183D" : "#8B5E3C",
              display: "flex",
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: `10px ${rightElement ? "40px" : "14px"} 10px ${
              icon ? "38px" : "14px"
            }`,
            borderRadius: "12px",
            border: `1.5px solid ${
              disabled
                ? "rgba(45,80,22,0.1)"
                : error
                ? "#D4183D"
                : "rgba(45,80,22,0.2)"
            }`,
            backgroundColor: disabled
              ? "rgba(45,80,22,0.03)"
              : error
              ? "rgba(212,24,61,0.04)"
              : "#FAF6EE",
            color: disabled ? "#8B5E3C" : "#2D5016",
            fontSize: "0.88rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => {
            if (!error && !disabled) e.target.style.borderColor = "#2D5016";
          }}
          onBlur={(e) => {
            if (!error && !disabled)
              e.target.style.borderColor = "rgba(45,80,22,0.2)";
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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function BigAvatar({ profile }: { profile: Profile }) {
  const initials =
    `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const colors = ["#2D5016", "#4A7C23", "#6B4423", "#8B5E3C", "#1A3009"];
  const colorIndex =
    (profile.firstName.charCodeAt(0) + profile.lastName.charCodeAt(0)) %
    colors.length;
  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: colors[colorIndex],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FAF6EE",
        fontSize: "1.8rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        border: "4px solid rgba(139,195,74,0.3)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FAF6EE",
        border: "1px solid rgba(45,80,22,0.12)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(45,80,22,0.05)",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(45,80,22,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "rgba(45,80,22,0.02)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "rgba(45,80,22,0.08)",
            border: "1px solid rgba(45,80,22,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2D5016",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2D5016",
              margin: 0,
              fontSize: "1rem",
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.78rem" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {/* Card Body */}
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile form
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        const data: Profile = res.data.data;
        setProfile(data);
        setProfileForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? "",
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate("/admin");
        } else {
          showToast("Failed to load profile.", "error");
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ── Detect dirty profile form ─────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const dirty =
      profileForm.firstName !== profile.firstName ||
      profileForm.lastName !== profile.lastName ||
      profileForm.phone !== (profile.phone ?? "");
    setProfileDirty(dirty);
  }, [profileForm, profile]);

  // ── Validate profile form ─────────────────────────────────────────────────
  const validateProfile = (): FormErrors => {
    const errors: FormErrors = {};
    if (!profileForm.firstName.trim())
      errors.firstName = "First name is required.";
    else if (profileForm.firstName.trim().length < 2)
      errors.firstName = "Must be at least 2 characters.";
    else if (profileForm.firstName.trim().length > 50)
      errors.firstName = "Cannot exceed 50 characters.";

    if (!profileForm.lastName.trim())
      errors.lastName = "Last name is required.";
    else if (profileForm.lastName.trim().length < 2)
      errors.lastName = "Must be at least 2 characters.";
    else if (profileForm.lastName.trim().length > 50)
      errors.lastName = "Cannot exceed 50 characters.";

    if (profileForm.phone && !PHONE_REGEX.test(profileForm.phone))
      errors.phone = "Please enter a valid phone number.";

    return errors;
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    try {
      setSavingProfile(true);
      const res = await axios.put(`${API_URL}/auth/me`, profileForm, {
        withCredentials: true,
      });
      const updated: Profile = res.data.data;
      setProfile(updated);
      setProfileForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone ?? "",
      });
      setProfileErrors({});
      setProfileDirty(false);
      showToast("Profile updated successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to update profile.";
      showToast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Validate password ─────────────────────────────────────────────────────
  const validatePassword = (): FormErrors => {
    const errors: FormErrors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = "Current password is required.";
    if (!passwordForm.newPassword)
      errors.newPassword = "New password is required.";
    else if (passwordForm.newPassword.length < 6)
      errors.newPassword = "Must be at least 6 characters.";
    else if (passwordForm.newPassword.length > 128)
      errors.newPassword = "Cannot exceed 128 characters.";
    else if (passwordForm.newPassword === passwordForm.currentPassword)
      errors.newPassword = "New password must be different from current.";
    if (!passwordForm.confirmPassword)
      errors.confirmPassword = "Please confirm your new password.";
    else if (passwordForm.confirmPassword !== passwordForm.newPassword)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    try {
      setSavingPassword(true);
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      showToast("Password changed successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to change password.";
      showToast(msg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Clear error helper ────────────────────────────────────────────────────
  const clearProfileError = (field: string) => {
    if (profileErrors[field])
      setProfileErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  };
  const clearPasswordError = (field: string) => {
    if (passwordErrors[field])
      setPasswordErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid rgba(45,80,22,0.15)",
            borderTopColor: "#2D5016",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#8B5E3C", fontSize: "0.88rem", margin: 0 }}>
          Loading profile...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) return null;

  const passwordStrength = (() => {
    const p = passwordForm.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "#D4183D", width: "20%" };
    if (score <= 2) return { label: "Fair", color: "#D4A017", width: "40%" };
    if (score <= 3) return { label: "Good", color: "#4A7C23", width: "65%" };
    return { label: "Strong", color: "#2D5016", width: "100%" };
  })();

  return (
    <div style={{ maxWidth: "760px" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Profile Hero ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #2D5016 0%, #4A7C23 100%)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          boxShadow: "0 4px 20px rgba(45,80,22,0.2)",
          flexWrap: "wrap",
        }}
      >
        <BigAvatar profile={profile} />
        <div style={{ flex: 1, minWidth: "180px" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              margin: "0 0 4px",
              fontSize: "1.4rem",
            }}
          >
            {profile.firstName} {profile.lastName}
          </h2>
          <p
            style={{
              color: "rgba(168,197,128,0.9)",
              margin: "0 0 10px",
              fontSize: "0.85rem",
            }}
          >
            {profile.email}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Role badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "0.72rem",
                fontWeight: 600,
                backgroundColor: "rgba(139,195,74,0.2)",
                color: "#A8D870",
                border: "1px solid rgba(139,195,74,0.3)",
              }}
            >
              {profile.role === "ADMIN" ? (
                <ShieldAlert size={11} />
              ) : (
                <Shield size={11} />
              )}
              {profile.role}
            </span>
            {/* Status badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "0.72rem",
                fontWeight: 600,
                backgroundColor:
                  profile.status === "ACTIVE"
                    ? "rgba(74,124,35,0.25)"
                    : "rgba(212,24,61,0.2)",
                color:
                  profile.status === "ACTIVE" ? "#8BC34A" : "rgba(255,120,130,0.9)",
                border: `1px solid ${
                  profile.status === "ACTIVE"
                    ? "rgba(139,195,74,0.3)"
                    : "rgba(212,24,61,0.3)"
                }`,
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor:
                    profile.status === "ACTIVE"
                      ? "#8BC34A"
                      : "rgba(255,120,130,0.9)",
                }}
              />
              {profile.status === "ACTIVE" ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
        {/* Meta info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(168,197,128,0.7)",
              fontSize: "0.76rem",
            }}
          >
            <Calendar size={12} />
            Joined{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(168,197,128,0.7)",
              fontSize: "0.76rem",
            }}
          >
            <RefreshCw size={12} />
            Updated{" "}
            {new Date(profile.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── Personal Information ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <SectionCard
          title="Personal Information"
          subtitle="Update your name and contact details"
          icon={<User size={16} />}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Name row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InputField
                label="First Name"
                value={profileForm.firstName}
                onChange={(v) => {
                  setProfileForm((f) => ({ ...f, firstName: v }));
                  clearProfileError("firstName");
                }}
                placeholder="John"
                required
                error={profileErrors.firstName}
                icon={<User size={14} />}
              />
              <InputField
                label="Last Name"
                value={profileForm.lastName}
                onChange={(v) => {
                  setProfileForm((f) => ({ ...f, lastName: v }));
                  clearProfileError("lastName");
                }}
                placeholder="Silva"
                required
                error={profileErrors.lastName}
                icon={<User size={14} />}
              />
            </div>

            {/* Email — read only */}
            <InputField
              label="Email Address"
              value={profile.email}
              icon={<Mail size={14} />}
              disabled
              placeholder=""
            />
            <p
              style={{
                color: "#8B5E3C",
                fontSize: "0.74rem",
                margin: "-8px 0 0",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <AlertCircle size={11} />
              Email cannot be changed. Contact a super admin if needed.
            </p>

            {/* Phone */}
            <InputField
              label="Phone Number"
              value={profileForm.phone}
              onChange={(v) => {
                setProfileForm((f) => ({ ...f, phone: v }));
                clearProfileError("phone");
              }}
              placeholder="077 123 4567"
              error={profileErrors.phone}
              icon={<Phone size={14} />}
            />

            {/* Role — read only */}
            <InputField
              label="Role"
              value={profile.role}
              icon={<Shield size={14} />}
              disabled
              placeholder=""
            />

            {/* Save button */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || !profileDirty}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor:
                    savingProfile || !profileDirty ? "#A8C580" : "#2D5016",
                  color: "#FAF6EE",
                  cursor:
                    savingProfile || !profileDirty ? "not-allowed" : "pointer",
                  fontSize: "0.87rem",
                  fontWeight: 500,
                  transition: "background-color 0.2s",
                }}
              >
                {savingProfile ? (
                  <>
                    <div
                      style={{
                        width: "13px",
                        height: "13px",
                        border: "2px solid rgba(250,246,238,0.4)",
                        borderTopColor: "#FAF6EE",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {profileDirty ? "Save Changes" : "No Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Change Password ────────────────────────────────────────────────── */}
        <SectionCard
          title="Change Password"
          subtitle="Keep your account secure with a strong password"
          icon={<Lock size={16} />}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Current password */}
            <InputField
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(v) => {
                setPasswordForm((f) => ({ ...f, currentPassword: v }));
                clearPasswordError("currentPassword");
              }}
              type={showCurrent ? "text" : "password"}
              placeholder="Enter your current password"
              required
              error={passwordErrors.currentPassword}
              icon={<Lock size={14} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8B5E3C",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* New password */}
            <InputField
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(v) => {
                setPasswordForm((f) => ({ ...f, newPassword: v }));
                clearPasswordError("newPassword");
              }}
              type={showNew ? "text" : "password"}
              placeholder="Enter a strong new password"
              required
              error={passwordErrors.newPassword}
              icon={<Lock size={14} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8B5E3C",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Password strength bar */}
            {passwordStrength && (
              <div style={{ marginTop: "-6px" }}>
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "rgba(45,80,22,0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                      borderRadius: "4px",
                      transition: "width 0.3s ease, background-color 0.3s ease",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: passwordStrength.color,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {passwordStrength.label} password
                </p>
              </div>
            )}

            {/* Confirm password */}
            <InputField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(v) => {
                setPasswordForm((f) => ({ ...f, confirmPassword: v }));
                clearPasswordError("confirmPassword");
              }}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your new password"
              required
              error={passwordErrors.confirmPassword}
              icon={<Lock size={14} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8B5E3C",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Password tips */}
            <div
              style={{
                backgroundColor: "rgba(45,80,22,0.04)",
                border: "1px solid rgba(45,80,22,0.1)",
                borderRadius: "12px",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  color: "#2D5016",
                  fontSize: "0.78rem",
                  margin: "0 0 6px",
                  fontWeight: 600,
                }}
              >
                Password requirements:
              </p>
              {[
                { text: "At least 6 characters", met: passwordForm.newPassword.length >= 6 },
                { text: "At least one uppercase letter", met: /[A-Z]/.test(passwordForm.newPassword) },
                { text: "At least one number", met: /[0-9]/.test(passwordForm.newPassword) },
                {
                  text: "At least one special character",
                  met: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                },
              ].map((req) => (
                <div
                  key={req.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "3px",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: req.met
                        ? "rgba(74,124,35,0.15)"
                        : "rgba(45,80,22,0.06)",
                      border: `1px solid ${
                        req.met ? "rgba(74,124,35,0.4)" : "rgba(45,80,22,0.15)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {req.met && (
                      <Check size={8} style={{ color: "#4A7C23" }} />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.74rem",
                      color: req.met ? "#4A7C23" : "#8B5E3C",
                      margin: 0,
                      transition: "color 0.2s",
                    }}
                  >
                    {req.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Save password button */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
              <button
                onClick={handleSavePassword}
                disabled={savingPassword}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: savingPassword ? "#A8C580" : "#2D5016",
                  color: "#FAF6EE",
                  cursor: savingPassword ? "not-allowed" : "pointer",
                  fontSize: "0.87rem",
                  fontWeight: 500,
                  transition: "background-color 0.2s",
                }}
              >
                {savingPassword ? (
                  <>
                    <div
                      style={{
                        width: "13px",
                        height: "13px",
                        border: "2px solid rgba(250,246,238,0.4)",
                        borderTopColor: "#FAF6EE",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Account Info (read-only) ────────────────────────────────────────── */}
        <SectionCard
          title="Account Information"
          subtitle="Read-only account metadata"
          icon={<Shield size={16} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              {
                label: "Account Status",
                value: profile.status,
                icon: <Shield size={13} />,
              },
              {
                label: "Role",
                value: profile.role,
                icon: <ShieldAlert size={13} />,
              },
              {
                label: "Member Since",
                value: new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                icon: <Calendar size={13} />,
              },
              {
                label: "Last Updated",
                value: new Date(profile.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                icon: <RefreshCw size={13} />,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: "rgba(45,80,22,0.04)",
                  border: "1px solid rgba(45,80,22,0.08)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ color: "#4A7C23", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p
                    style={{
                      color: "#8B5E3C",
                      fontSize: "0.7rem",
                      margin: "0 0 2px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      color: "#2D5016",
                      fontSize: "0.83rem",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}