import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";

export interface AdminTourStep {
  selector?: string;
  title: string;
  description: string;
}

interface AdminTourProps {
  open: boolean;
  steps: AdminTourStep[];
  onClose: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const GAP = 12;
const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT = 330;

export default function AdminTour({
  open,
  steps,
  onClose,
}: AdminTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;

    const updateTarget = () => {
      const target = step.selector
        ? document.querySelector<HTMLElement>(step.selector)
        : null;

      if (!target) {
        setTargetRect(null);
        return;
      }

      target.scrollIntoView({ block: "nearest", inline: "nearest" });
      const rect = target.getBoundingClientRect();
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth;

      setTargetRect(isVisible ? rect : null);
    };

    const frame = window.requestAnimationFrame(updateTarget);
    const delayedUpdate = window.setTimeout(updateTarget, 320);
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayedUpdate);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && stepIndex > 0) {
        setStepIndex((current) => current - 1);
      }
      if (event.key === "ArrowRight" && !isLastStep) {
        setStepIndex((current) => current + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLastStep, onClose, open, stepIndex]);

  if (!open || !step) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fitsRight = Boolean(
    targetRect && targetRect.right + GAP + TOOLTIP_WIDTH <= viewportWidth - 16
  );
  const fitsLeft = Boolean(
    targetRect && targetRect.left - GAP - TOOLTIP_WIDTH >= 16
  );
  const tooltipLeft = targetRect
    ? fitsRight
      ? targetRect.right + GAP
      : fitsLeft
        ? targetRect.left - TOOLTIP_WIDTH - GAP
        : Math.max(16, (viewportWidth - TOOLTIP_WIDTH) / 2)
    : Math.max(16, (viewportWidth - TOOLTIP_WIDTH) / 2);
  const tooltipTop = targetRect
    ? fitsRight || fitsLeft
      ? Math.max(16, Math.min(targetRect.top, viewportHeight - TOOLTIP_HEIGHT - 16))
      : targetRect.bottom + GAP + TOOLTIP_HEIGHT <= viewportHeight - 16
        ? targetRect.bottom + GAP
        : Math.max(16, targetRect.top - TOOLTIP_HEIGHT - GAP)
    : Math.max(16, (viewportHeight - TOOLTIP_HEIGHT) / 2);

  const overlayStyle = {
    position: "fixed" as const,
    backgroundColor: "rgba(10, 18, 7, 0.72)",
    zIndex: 200,
  };

  return (
    <>
      {targetRect ? (
        <>
          <div style={{ ...overlayStyle, top: 0, left: 0, right: 0, height: Math.max(0, targetRect.top - 6) }} />
          <div style={{ ...overlayStyle, top: targetRect.bottom + 6, left: 0, right: 0, bottom: 0 }} />
          <div style={{ ...overlayStyle, top: Math.max(0, targetRect.top - 6), left: 0, width: Math.max(0, targetRect.left - 6), height: targetRect.height + 12 }} />
          <div style={{ ...overlayStyle, top: Math.max(0, targetRect.top - 6), left: targetRect.right + 6, right: 0, height: targetRect.height + 12 }} />
          <div
            style={{
              position: "fixed",
              top: targetRect.top - 5,
              left: targetRect.left - 5,
              width: targetRect.width + 10,
              height: targetRect.height + 10,
              border: "2px solid #9CCC65",
              borderRadius: "8px",
              boxShadow: "0 0 0 4px rgba(156,204,101,0.2)",
              pointerEvents: "none",
              zIndex: 201,
            }}
          />
        </>
      ) : (
        <div style={{ ...overlayStyle, inset: 0 }} />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-tour-title"
        style={{
          position: "fixed",
          top: tooltipTop,
          left: tooltipLeft,
          width: `min(${TOOLTIP_WIDTH}px, calc(100vw - 32px))`,
          backgroundColor: "#FAF6EE",
          border: "1px solid rgba(45,80,22,0.2)",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          padding: "22px",
          zIndex: 202,
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2D5016",
              color: "#FAF6EE",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <Compass size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin guide"
            title="Close guide"
            style={{
              border: 0,
              background: "transparent",
              color: "#6F5139",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p
          style={{
            margin: "18px 0 6px",
            color: "#6F5139",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2
          id="admin-tour-title"
          style={{
            margin: 0,
            color: "#2D5016",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.3rem",
          }}
        >
          {step.title}
        </h2>
        <p
          style={{
            margin: "10px 0 20px",
            color: "#654B38",
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          {step.description}
        </p>

        <div
          aria-label="Tour progress"
          style={{ display: "flex", gap: "5px", marginBottom: "20px" }}
        >
          {steps.map((_, index) => (
            <span
              key={index}
              style={{
                height: "4px",
                flex: 1,
                backgroundColor: index <= stepIndex ? "#4A7C23" : "#D9D5CB",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: "transparent",
              color: "#6F5139",
              padding: "9px 4px",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((current) => current - 1)}
                aria-label="Previous tour step"
                title="Previous"
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid rgba(45,80,22,0.25)",
                  backgroundColor: "#FAF6EE",
                  color: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                <ArrowLeft size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                isLastStep
                  ? onClose()
                  : setStepIndex((current) => current + 1)
              }
              style={{
                minWidth: "104px",
                height: "38px",
                border: 0,
                backgroundColor: "#2D5016",
                color: "#FAF6EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "0.84rem",
              }}
            >
              {isLastStep ? (
                <>
                  <Check size={16} /> Finish
                </>
              ) : (
                <>
                  Next <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
