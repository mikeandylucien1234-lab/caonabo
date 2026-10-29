// Styles partagés par les pages "contenu" (charte Caonabo).
import type { CSSProperties } from "react";

export const pageBadge: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#f0ecfb",
  color: "#5b21b6",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  padding: "8px 16px",
  borderRadius: 999,
};

export const pageCard: CSSProperties = {
  background: "#fff",
  border: "1px solid #eceafa",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(30,27,75,0.06)",
  padding: "28px 32px",
};

export const pageH2: CSSProperties = {
  fontWeight: 800,
  fontSize: 24,
  color: "#1e1b4b",
  margin: "0 0 14px",
};

export const pageP: CSSProperties = {
  fontSize: 15.5,
  color: "#4b4b63",
  lineHeight: 1.75,
  margin: "0 0 16px",
};

export const pageIconCircle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "#f0ecfb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  marginBottom: 16,
};
