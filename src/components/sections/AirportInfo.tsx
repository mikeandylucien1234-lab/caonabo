"use client";

import { useState } from "react";

export interface AirportEntry {
  code: string;
  city: string;
  country: string;
  name: string;
  address: string;
  arrival: string;
  parking: string;
  transport: string;
  terminal: string;
}

export default function AirportInfo({ airports }: { airports: AirportEntry[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="grid-2 airport-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {airports.map((a) => {
        const isOpen = open === a.code;
        return (
          <div
            key={a.code}
            style={{
              background: "#fff",
              border: `1.5px solid ${isOpen ? "#c9b8ef" : "#eceafa"}`,
              borderRadius: 18,
              boxShadow: "0 4px 20px rgba(30,27,75,0.06)",
              overflow: "hidden",
              transition: "border-color .15s",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : a.code)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 22px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <TowerIcon />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1e1b4b" }}>
                  {a.city} <span style={{ color: "#8a8aa0", fontWeight: 700 }}>· {a.code}</span>
                </div>
                <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 2 }}>{a.country}</div>
              </div>
              <span style={{ fontSize: 20, color: "#5b21b6", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ⌄
              </span>
            </button>

            {isOpen && (
              <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontWeight: 700, color: "#3d1e8a", fontSize: 14 }}>{a.name}</div>
                <Row icon="📍" label="Adresse" value={a.address} />
                <Row icon="⏱" label="Arrivée recommandée" value={a.arrival} />
                <Row icon="🚗" label="Parking" value={a.parking} />
                <Row icon="🚌" label="Transports" value={a.transport} />
                <Row icon="🛫" label="Terminal Caonabo" value={a.terminal} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 14, color: "#3a3a55", lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

function TowerIcon() {
  return (
    <span style={{ width: 46, height: 46, borderRadius: 13, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21V9l3-2 3 2v12" />
        <path d="M9 13h6" />
        <path d="M12 7V4" />
        <path d="M7 21h10" />
        <path d="M12 4l4-1M12 4L8 3" />
      </svg>
    </span>
  );
}
