"use client";

import { useEffect } from "react";

export const INK = "#1e1b4b";
export const PURPLE = "#5b21b6";
export const PURPLE_DK = "#3d1e8a";

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
      <div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 30, color: "#0f0f2d", margin: 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ color: "#6b6b80", fontSize: 15, margin: "8px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ececf4", borderRadius: 16, boxShadow: "0 2px 12px rgba(30,27,75,0.05)", padding: 22, ...style }}>
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 18px",
    borderRadius: 11,
    cursor: disabled ? "default" : "pointer",
    border: "1.5px solid transparent",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.6 : 1,
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: PURPLE, color: "#fff" },
    ghost: { ...base, background: "#fff", color: PURPLE_DK, borderColor: "#dcd7f0" },
    danger: { ...base, background: "#fff", color: "#dc2626", borderColor: "#f3c9c9" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} style={styles[variant]}>
      {children}
    </button>
  );
}

export function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "violet" | "grey" }) {
  const tones: Record<string, React.CSSProperties> = {
    green: { background: "#e3f7ea", color: "#1f9d55" },
    amber: { background: "#fdf0d9", color: "#b5730f" },
    red: { background: "#fde3e3", color: "#dc2626" },
    violet: { background: "#efeafc", color: PURPLE },
    grey: { background: "#eef0f5", color: "#6b6b80" },
  };
  return (
    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, ...tones[tone] }}>
      {label}
    </span>
  );
}

// Tableau générique
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, color: "#8a8aa0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #ececf4" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "15px 16px", fontSize: 14, color: "#3a3a55", borderBottom: "1px solid #f2f2f8", verticalAlign: "middle", ...style }}>{children}</td>;
}

// Champ de formulaire
export const inputStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: 10,
  border: "1.5px solid #dcdae6",
  fontSize: 14,
  color: INK,
  width: "100%",
  background: "#fff",
};
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12.5, color: "#6b6b80", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </label>
  );
}

// Modale (création / édition)
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,10,45,0.5)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px", overflowY: "auto" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "min(560px, 100%)", boxShadow: "0 30px 80px rgba(10,5,40,0.35)", padding: "26px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 20, color: INK, margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Fermer" style={{ background: "#f2f2f8", border: "none", borderRadius: 999, width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "#6b6b80" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Loading({ label = "Chargement…" }: { label?: string }) {
  return <div style={{ padding: 40, textAlign: "center", color: "#8a8aa0", fontSize: 14 }}>{label}</div>;
}
export function ErrorBox({ message }: { message: string }) {
  return <div style={{ padding: 16, background: "#fde3e3", color: "#b5480f", borderRadius: 12, fontSize: 14 }}>{message}</div>;
}
