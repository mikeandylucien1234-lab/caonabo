"use client";

import { useState } from "react";

const STAGES = ["Pris en charge", "En transit", "Dédouanement", "Prêt pour livraison"];
const CITIES = ["Santiago", "Lima", "Port-au-Prince", "Cap-Haïtien", "Toronto", "Montréal"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function CargoTracker() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ code: string; stage: number; city: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function track(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 5) {
      setError("Entrez un numéro de suivi valide (au moins 5 caractères).");
      setResult(null);
      return;
    }
    setError(null);
    const h = hash(c);
    setResult({ code: c, stage: h % STAGES.length, city: CITIES[h % CITIES.length] });
  }

  const inputStyle: React.CSSProperties = {
    padding: "13px 15px",
    borderRadius: 12,
    border: "1.5px solid #dcdae6",
    fontSize: 14,
    color: "#1e1b4b",
    flex: 1,
    minWidth: 0,
    background: "#fff",
  };

  return (
    <div>
      <form onSubmit={track} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          style={inputStyle}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ex : CAO-CARGO-4821"
          aria-label="Numéro de suivi"
        />
        <button
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#3d1e8a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "13px 26px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Suivre mon envoi <span>→</span>
        </button>
      </form>
      {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20, border: "1px solid #eceafa", borderRadius: 16, padding: "20px 22px", background: "#faf9ff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            <div style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>
              Envoi {result.code}
            </div>
            <div style={{ fontSize: 13, color: "#5c5c7a" }}>
              Destination : <b style={{ color: "#3d1e8a" }}>{result.city}</b>
            </div>
          </div>
          {/* progression */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {STAGES.map((s, i) => {
              const done = i <= result.stage;
              return (
                <div key={s} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  {i < STAGES.length - 1 && (
                    <div style={{ position: "absolute", top: 13, left: "50%", width: "100%", height: 3, background: i < result.stage ? "#5b21b6" : "#e6e2f2" }} />
                  )}
                  <div style={{ position: "relative", width: 28, height: 28, borderRadius: 999, margin: "0 auto 8px", background: done ? "#5b21b6" : "#e6e2f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: i === result.stage ? 700 : 500, color: i === result.stage ? "#3d1e8a" : "#8a8aa0" }}>
                    {s}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: "#a0a0b4", marginTop: 16, marginBottom: 0, fontStyle: "italic" }}>
            Suivi de démonstration — le service cargo Caonabo est présenté à titre illustratif.
          </p>
        </div>
      )}
    </div>
  );
}
