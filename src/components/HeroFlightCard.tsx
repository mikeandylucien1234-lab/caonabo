"use client";

import { useState } from "react";
import type { BaggagePolicyRow } from "@/lib/data/queries";

const MONTHS_ABBR_FR = [
  "JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN",
  "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC.",
];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Carte « Prochain vol » / « Bagage » flottante du hero. La date affichée est
 * TOUJOURS celle du prochain vol réel à venir (calculée côté serveur) : une
 * fois ce vol passé, la carte affiche automatiquement la date suivante du
 * calendrier — jamais de date codée en dur.
 */
export default function HeroFlightCard({
  nextDeparture,
  policy,
}: {
  nextDeparture: string | null; // ISO
  policy: BaggagePolicyRow;
}) {
  const [tab, setTab] = useState<"vol" | "bagage">("vol");
  const d = nextDeparture ? new Date(nextDeparture) : null;

  return (
    <div
      className="hero-flightcard"
      style={{
        width: "min(560px, 92vw)",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 22,
        boxShadow: "0 24px 60px rgba(20,10,60,0.22)",
        padding: "20px 22px",
      }}
    >
      {/* onglets cliquables */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => setTab("vol")}
          style={tab === "vol" ? tabActiveStyle : tabInactiveStyle}
        >
          <IconPlane color={tab === "vol" ? "#fff" : "#3d1e8a"} size={18} /> Prochain vol
        </button>
        <button type="button" onClick={() => setTab("bagage")} style={tab === "bagage" ? tabActiveStyle : tabInactiveStyle}>
          <IconSuitcase color={tab === "bagage" ? "#fff" : "#3d1e8a"} /> Bagage
        </button>
      </div>

      {tab === "vol" ? (
        <>
          {/* Depuis / Vers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
            <div>
              <div style={labelStyle}>Depuis</div>
              <div style={valueRow}>
                <IconPin /> <span>Santiago, Chili</span>
              </div>
            </div>
            <div style={{ color: "#4b4b63", marginTop: 18 }}>
              <IconPlaneSide />
            </div>
            <div>
              <div style={labelStyle}>Vers</div>
              <div style={valueRow}>
                <IconPin /> <span>Cap-Haïtien, Haïti</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "#e6e4f0", margin: "16px 0" }} />

          {/* Départ / Retour */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CalendarRed
                monthAbbr={d ? MONTHS_ABBR_FR[d.getMonth()] : "—"}
                day={d ? d.getDate() : "—"}
              />
              <div>
                <div style={labelStyle}>Départ</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                  {d ? `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}` : "À venir"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, borderLeft: "1px solid #e6e4f0", paddingLeft: 16 }}>
              <IconCalPurple />
              <div>
                <div style={labelStyle}>Retour</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                  Selon votre choix
                </div>
              </div>
            </div>
          </div>

          <a href="#recherche" style={detailsBtnStyle}>
            Voir les détails <IconChevron />
          </a>
        </>
      ) : (
        <>
          {/* Franchise incluse */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconSuitcaseBadge />
              <div>
                <div style={labelStyle}>Bagage soute inclus</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                  {policy.includedCheckedKg} kg
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, borderLeft: "1px solid #e6e4f0", paddingLeft: 16 }}>
              <IconCabinBadge />
              <div>
                <div style={labelStyle}>Bagage cabine inclus</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                  {policy.includedCabinKg} kg
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "#e6e4f0", margin: "16px 0" }} />

          {/* Suppléments */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Supplément poids</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                {(policy.extraKgPriceCents / 100).toFixed(0)} $ / kg
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #e6e4f0", paddingLeft: 16 }}>
              <div style={labelStyle}>Valise supplémentaire</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
                {(policy.extraBagPriceCents / 100).toFixed(0)} $ / valise
              </div>
            </div>
          </div>

          <a href="/politique-bagages" style={detailsBtnStyle}>
            Voir la politique de bagages <IconChevron />
          </a>
        </>
      )}
    </div>
  );
}

const tabActiveStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: "#3d1e8a",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  padding: "11px 20px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
};
const tabInactiveStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: "transparent",
  color: "#3d1e8a",
  fontWeight: 700,
  fontSize: 15,
  padding: "11px 12px",
  border: "none",
  cursor: "pointer",
};
const detailsBtnStyle: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(255,255,255,0.6)",
  border: "1px solid #e6e4f0",
  borderRadius: 14,
  padding: "15px 20px",
  fontWeight: 800,
  fontSize: 16,
  color: "#1a1a2e",
  textDecoration: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b6b80",
  marginBottom: 6,
};
const valueRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
  fontSize: 18,
  color: "#1a1a2e",
};

// ── Icônes (SVG en ligne) ────────────────────────────────────────────────────
function IconPlane({ color = "currentColor", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden>
      <path d="M2.5 14.5l19-6.2c.9-.3.9-1.6 0-1.9L2.5 0.2 2.4 6l12 1.4-12 1.4z" transform="translate(0 4)" />
    </svg>
  );
}
function IconSuitcase({ color = "#3d1e8a" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={2} aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 11v5" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill="#e11d2a" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  );
}
function IconPlaneSide() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="#4b4b63" aria-hidden>
      <path d="M21 15.5v-1.6l-7.5-4.7V4.2c0-.9-.7-1.6-1.5-1.6s-1.5.7-1.5 1.6v5L3 13.9v1.6l7.5-2.3v4.6l-2 1.4v1.2l3.5-1 3.5 1v-1.2l-2-1.4v-4.6z" />
    </svg>
  );
}
function CalendarRed({ monthAbbr, day }: { monthAbbr: string; day: number | string }) {
  return (
    <div
      aria-hidden
      style={{
        width: 44,
        height: 44,
        borderRadius: 9,
        overflow: "hidden",
        border: "1px solid #ececf2",
        boxShadow: "0 2px 6px rgba(20,10,60,0.12)",
        flexShrink: 0,
        background: "#fff",
      }}
    >
      <div style={{ background: "#e11d2a", color: "#fff", fontSize: 9, fontWeight: 800, textAlign: "center", padding: "3px 0 2px", letterSpacing: 0.3 }}>
        {monthAbbr}
      </div>
      <div style={{ color: "#1a1a2e", fontWeight: 800, fontSize: 18, textAlign: "center", lineHeight: 1, paddingTop: 3 }}>
        {day}
      </div>
    </div>
  );
}
function IconCalPurple() {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#5b21b6" strokeWidth={2} aria-hidden style={{ flexShrink: 0 }}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconSuitcaseBadge() {
  return (
    <div
      aria-hidden
      style={{
        width: 44, height: 44, borderRadius: 9, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fff", border: "1px solid #ececf2", boxShadow: "0 2px 6px rgba(20,10,60,0.12)",
      }}
    >
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#5b21b6" strokeWidth={2}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 11v5" />
      </svg>
    </div>
  );
}
function IconCabinBadge() {
  return (
    <div
      aria-hidden
      style={{
        width: 44, height: 44, borderRadius: 9, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fff", border: "1px solid #ececf2", boxShadow: "0 2px 6px rgba(20,10,60,0.12)",
      }}
    >
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#5b21b6" strokeWidth={2}>
        <rect x="4" y="9" width="16" height="11" rx="2" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
    </div>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#1a1a2e" strokeWidth={2.5} aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
