import React, { useEffect, useMemo, useState } from "react";

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

interface OnboardingTourProps {
  userId?: string | number;
}

// A minimal dependency-free guided tour that positions a tooltip near target elements
const OnboardingTour: React.FC<OnboardingTourProps> = ({ userId }) => {
  const storageKey = useMemo(() => `onboardingTour.seen.${userId ?? "anon"}`, [userId]);

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const steps: TourStep[] = [
    {
      selector: "#tour-dashboard",
      title: "Dashboard",
      description: "Your overview with insights and recent activity.",
    },
    {
      selector: "#tour-agents",
      title: "Voice Agents",
      description: "Create and manage your AI voice agents.",
    },
    {
      selector: "#tour-phones",
      title: "Phone Number",
      description: "Configure phone numbers for inbound and outbound calls.",
    },
    {
      selector: "#tour-campaigns",
      title: "Campaigns",
      description: "Launch outreach campaigns and track performance.",
    },
    {
      selector: "#tour-schedule",
      title: "Campaign Scheduling",
      description: "Plan when campaigns run to reach users at the right time.",
    },
    {
      selector: "#tour-knowledge",
      title: "Agent Knowledge",
      description: "Upload and manage knowledge sources to power better responses.",
    },
    {
      selector: "#tour-logs",
      title: "Call Logs",
      description: "Review past calls, notes, and outcomes.",
    },
    {
      selector: "#tour-settings",
      title: "Settings",
      description: "Manage account, billing, tools, and more.",
    },
  ];

  useEffect(() => {
    // Open the tour only if user hasn't seen it
    const seen = localStorage.getItem(storageKey) === "1";
    if (!seen) {
      setIsOpen(true);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        endTour();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const endTour = () => {
    localStorage.setItem(storageKey, "1");
    setIsOpen(false);
    setCurrentIndex(0);
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      endTour();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  if (!isOpen) return null;

  const step = steps[currentIndex];
  const target = document.querySelector(step.selector) as HTMLElement | null;

  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    top: 80,
    left: 80,
    zIndex: 10000,
    maxWidth: 360,
  };

  let highlightStyle: React.CSSProperties | undefined;

  if (target) {
    const rect = target.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Prefer to position to the right; fallback below; then above; then left
    const spacing = 12;
    const width = 360;
    const height = 160;

    const rightX = rect.right + spacing;
    const rightFits = rightX + width <= viewportW;
    const belowY = rect.bottom + spacing;
    const belowFits = belowY + height <= viewportH;
    const aboveY = rect.top - spacing - height;
    const aboveFits = aboveY >= 0;
    const leftX = rect.left - spacing - width;
    const leftFits = leftX >= 0;

    if (rightFits) {
      tooltipStyle.top = Math.max(16, rect.top);
      tooltipStyle.left = rightX;
    } else if (belowFits) {
      tooltipStyle.top = belowY;
      tooltipStyle.left = Math.min(Math.max(16, rect.left), viewportW - width - 16);
    } else if (aboveFits) {
      tooltipStyle.top = aboveY;
      tooltipStyle.left = Math.min(Math.max(16, rect.left), viewportW - width - 16);
    } else if (leftFits) {
      tooltipStyle.top = Math.max(16, rect.top);
      tooltipStyle.left = leftX;
    } else {
      tooltipStyle.top = Math.min(Math.max(16, rect.top), viewportH - height - 16);
      tooltipStyle.left = Math.min(Math.max(16, rect.left), viewportW - width - 16);
    }

    highlightStyle = {
      position: "fixed",
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      border: "2px solid rgba(59,130,246,0.9)", // blue-500
      borderRadius: 8,
      boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
      zIndex: 9999,
      pointerEvents: "none",
    } as React.CSSProperties;
  }

  return (
    <>
      {/* Backdrop click to skip */}
      <div
        onClick={endTour}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 9998 }}
      />
      {/* Highlight around target */}
      {highlightStyle && <div style={highlightStyle} />}
      {/* Tooltip card */}
      <div
        style={{
          ...tooltipStyle,
          background: "#111827",
          color: "white",
          padding: 16,
          borderRadius: 12,
          width: 360,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{step.description}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <button
            onClick={endTour}
            className="px-3 py-1.5 rounded text-sm"
            style={{ background: "transparent", color: "#93c5fd" }}
          >
            Skip
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded text-sm disabled:opacity-50"
              style={{ background: "#374151", color: "white" }}
            >
              Back
            </button>
            <button
              onClick={goNext}
              className="px-3 py-1.5 rounded text-sm"
              style={{ background: "#2563eb", color: "white" }}
            >
              {currentIndex === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          {currentIndex + 1} / {steps.length}
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;


