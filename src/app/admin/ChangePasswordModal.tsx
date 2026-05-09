// ChangePasswordModal.tsx
import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Check, Shield } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface Props {
  onSuccess: () => void;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ✅ Moved OUTSIDE the parent component
interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  placeholder?: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  placeholder,
}: PasswordInputProps) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#2D5016",
          fontSize: "0.82rem",
          marginBottom: "6px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Lock
          size={15}
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            color: error ? "#D4183D" : "#8B5E3C",
          }}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "11px 42px 11px 40px",
            borderRadius: "12px",
            border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
            backgroundColor: error ? "rgba(212,24,61,0.04)" : "#FAF6EE",
            color: "#2D5016",
            fontSize: "0.88rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#8B5E3C",
            display: "flex",
            padding: 0,
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "5px",
          }}
        >
          <AlertCircle size={12} style={{ color: "#D4183D", flexShrink: 0 }} />
          <p style={{ color: "#D4183D", fontSize: "0.73rem", margin: 0 }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

// Password strength indicator — also moved outside
function getStrength(pwd: string): {
  label: string;
  color: string;
  width: string;
} {
  if (!pwd) return { label: "", color: "transparent", width: "0%" };
  if (pwd.length < 6)
    return { label: "Too short", color: "#D4183D", width: "20%" };
  if (pwd.length < 8)
    return { label: "Weak", color: "#D4A017", width: "40%" };
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score === 3) return { label: "Strong", color: "#4A7C23", width: "100%" };
  if (score === 2) return { label: "Good", color: "#8BC34A", width: "70%" };
  return { label: "Fair", color: "#D4A017", width: "50%" };
}

export default function ChangePasswordModal({ onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!currentPassword) e.currentPassword = "Current password is required.";
    if (!newPassword) {
      e.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      e.newPassword = "Must be at least 6 characters.";
    } else if (newPassword.length > 128) {
      e.newPassword = "Cannot exceed 128 characters.";
    } else if (newPassword === currentPassword) {
      e.newPassword =
        "New password must be different from your current password.";
    }
    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setGlobalError("");
    if (!validate()) return;
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setSuccess(true);
      setTimeout(() => onSuccess(), 1800);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        "Failed to change password. Please try again.";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(newPassword);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(14,26,8,0.85)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#FAF6EE",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "460px",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,195,74,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #2D5016, #4A7C23)",
            padding: "28px 32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(139,195,74,0.2)",
              border: "2px solid rgba(139,195,74,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Shield size={24} style={{ color: "#8BC34A" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#FAF6EE",
              margin: "0 0 6px",
              fontSize: "1.25rem",
            }}
          >
            Change Your Password
          </h2>
          <p
            style={{
              color: "rgba(168,197,128,0.9)",
              fontSize: "0.82rem",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            For your security, please set a new password before continuing.
            <br />
            You were assigned a temporary password.
          </p>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {globalError && (
            <div
              style={{
                backgroundColor: "rgba(212,24,61,0.08)",
                border: "1px solid rgba(212,24,61,0.25)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle
                size={15}
                style={{ color: "#D4183D", flexShrink: 0 }}
              />
              <p style={{ color: "#D4183D", fontSize: "0.83rem", margin: 0 }}>
                {globalError}
              </p>
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: "rgba(74,124,35,0.08)",
                border: "1px solid rgba(74,124,35,0.25)",
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#4A7C23",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={16} style={{ color: "#FAF6EE" }} />
              </div>
              <p
                style={{
                  color: "#2D5016",
                  fontSize: "0.88rem",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Password changed successfully! Redirecting...
              </p>
            </div>
          )}

          {!success && (
            <>
              {/* Info box */}
              <div
                style={{
                  backgroundColor: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(212,160,23,0.25)",
                  borderRadius: "12px",
                  padding: "12px 16px",
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
                    marginTop: "1px",
                  }}
                />
                <div>
                  <p
                    style={{
                      color: "#7A5C00",
                      fontSize: "0.82rem",
                      margin: "0 0 2px",
                      fontWeight: 600,
                    }}
                  >
                    Temporary password in use
                  </p>
                  <p
                    style={{
                      color: "#8B6914",
                      fontSize: "0.78rem",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Your admin set a temporary password:{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(212,160,23,0.15)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      Welcome@123
                    </code>
                    <br />
                    Please enter it above and choose a new secure password.
                  </p>
                </div>
              </div>

              {/* ✅ Now uses the stable external PasswordInput component */}
              <PasswordInput
                label="Current (Temporary) Password"
                value={currentPassword}
                onChange={(v) => {
                  setCurrentPassword(v);
                  setErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined,
                  }));
                }}
                show={showCurrent}
                onToggle={() => setShowCurrent((s) => !s)}
                error={errors.currentPassword}
                placeholder="Enter the temporary password"
              />

              <div>
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={(v) => {
                    setNewPassword(v);
                    setErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  show={showNew}
                  onToggle={() => setShowNew((s) => !s)}
                  error={errors.newPassword}
                  placeholder="Minimum 6 characters"
                />
                {newPassword && (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        height: "4px",
                        backgroundColor: "rgba(45,80,22,0.1)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: strength.width,
                          backgroundColor: strength.color,
                          borderRadius: "2px",
                          transition: "width 0.3s, background-color 0.3s",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        color: strength.color,
                        fontSize: "0.72rem",
                        margin: "3px 0 0",
                        textAlign: "right",
                      }}
                    >
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                show={showConfirm}
                onToggle={() => setShowConfirm((s) => !s)}
                error={errors.confirmPassword}
                placeholder="Re-enter your new password"
              />

              {/* Password tips */}
              <div
                style={{
                  backgroundColor: "rgba(45,80,22,0.04)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                <p
                  style={{
                    color: "#4A7C23",
                    fontSize: "0.75rem",
                    margin: "0 0 4px",
                    fontWeight: 600,
                  }}
                >
                  Password tips:
                </p>
                {[
                  "At least 6 characters long",
                  "Mix uppercase and lowercase letters",
                  "Include numbers and special characters",
                  "Avoid using your name or email",
                ].map((tip) => (
                  <p
                    key={tip}
                    style={{
                      color: "#5C4033",
                      fontSize: "0.74rem",
                      margin: "2px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ color: "#8BC34A" }}>✓</span> {tip}
                  </p>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading
                    ? "#A8C580"
                    : "linear-gradient(135deg, #2D5016, #4A7C23)",
                  color: "#FAF6EE",
                  fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Set New Password
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}