"use client";

import { useEffect, useState } from "react";
import { adminFetch, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Btn, Loading, INK, PURPLE, inputStyle } from "@/components/admin/ui";

interface Status {
  isConfigured: boolean;
  mode: "SANDBOX" | "PRODUCTION";
  apiKeyHint: string | null;
  secretKeyHint: string | null;
  lastTestedAt: string | null;
  lastTestResult: "SUCCESS" | "FAILURE" | null;
  encryptionAvailable: boolean;
}

export default function AdminPayment() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mode, setMode] = useState<"SANDBOX" | "PRODUCTION">("SANDBOX");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/payment-settings");
      const d = (await res.json()) as Status;
      if (res.ok) {
        setStatus(d);
        setMode(d.mode);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setMsg(null);
    if (mode === "PRODUCTION" && status?.mode !== "PRODUCTION") {
      const ok = window.confirm(
        "Passer en mode PRODUCTION : les paiements réels seront traités. Confirmez-vous ce changement ?",
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/payment-settings", {
        method: "POST",
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          secretKey: secretKey || undefined,
          mode,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Échec de l'enregistrement.");
      setStatus(d as Status);
      setApiKey("");
      setSecretKey("");
      setMsg({ ok: true, text: "Configuration enregistrée." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur." });
    } finally {
      setSaving(false);
    }
  }

  async function test() {
    setMsg(null);
    setTesting(true);
    try {
      const res = await adminFetch("/api/admin/payment-settings/test", { method: "POST" });
      const d = await res.json();
      setMsg({ ok: Boolean(d.success), text: d.message ?? (res.ok ? "" : "Échec du test.") });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur." });
    } finally {
      setTesting(false);
    }
  }

  const prod = mode === "PRODUCTION";

  return (
    <div>
      <PageHead
        title="Paiement — Flow"
        subtitle="Configurez vos identifiants Flow (flow.cl). Les clés sont chiffrées en base et ne sont jamais réaffichées."
      />

      {loading ? (
        <Loading label="Chargement de la configuration…" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
          {/* Bandeau mode actif */}
          <div
            style={{
              borderRadius: 12,
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: 14,
              border: `1.5px solid ${status?.mode === "PRODUCTION" ? "#bfe3c6" : "#f0d79a"}`,
              background: status?.mode === "PRODUCTION" ? "#eefaf0" : "#fff7e6",
              color: status?.mode === "PRODUCTION" ? "#1f7a3d" : "#a9820f",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>{status?.mode === "PRODUCTION" ? "🟢 Mode PRODUCTION actif" : "🟠 Mode SANDBOX (test) actif"}</span>
            <span style={{ fontWeight: 600, color: "#6b6b80" }}>·</span>
            <span style={{ fontWeight: 700, color: status?.isConfigured ? "#1f7a3d" : "#b23333" }}>
              {status?.isConfigured ? "Configuré ✓" : "Non configuré"}
            </span>
          </div>

          {status && !status.encryptionAvailable && (
            <div style={{ borderRadius: 12, padding: "12px 16px", background: "#fdecec", border: "1.5px solid #f5c2c2", color: "#b23333", fontSize: 13.5 }}>
              ⚠️ La clé de chiffrement serveur (CREDENTIALS_ENCRYPTION_KEY) n&apos;est pas configurée.
              L&apos;enregistrement des clés Flow est désactivé tant qu&apos;elle n&apos;est pas ajoutée aux variables d&apos;environnement.
            </div>
          )}

          <Card>
            <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 17, color: INK, margin: "0 0 14px" }}>
              Identifiants Flow
            </h2>

            <Field label={`API Key${status?.apiKeyHint ? ` (actuelle : ${status.apiKeyHint})` : ""}`}>
              <input
                style={inputStyle}
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={status?.apiKeyHint ? "Laisser vide pour conserver la clé actuelle" : "Collez votre API Key Flow"}
                autoComplete="off"
              />
            </Field>

            <div style={{ height: 12 }} />

            <Field label={`Secret Key${status?.secretKeyHint ? ` (actuelle : ${status.secretKeyHint})` : ""}`}>
              <input
                style={inputStyle}
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={status?.secretKeyHint ? "Laisser vide pour conserver la clé actuelle" : "Collez votre Secret Key Flow"}
                autoComplete="off"
              />
            </Field>

            <div style={{ height: 16 }} />

            <Field label="Mode">
              <div style={{ display: "flex", gap: 10 }}>
                {(["SANDBOX", "PRODUCTION"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1.5px solid ${mode === m ? PURPLE : "#dcdae6"}`,
                      background: mode === m ? "#f4efff" : "#fff",
                      color: mode === m ? PURPLE : "#5c5c7a",
                    }}
                  >
                    {m === "SANDBOX" ? "Sandbox (test)" : "Production (réel)"}
                  </button>
                ))}
              </div>
            </Field>

            {prod && (
              <div style={{ marginTop: 12, borderRadius: 10, padding: "10px 14px", background: "#fdecec", border: "1.5px solid #f5c2c2", color: "#b23333", fontSize: 13 }}>
                ⚠️ En mode Production, les paiements réels seront traités. Confirmez le changement à l&apos;enregistrement.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Btn onClick={save} disabled={saving || (status ? !status.encryptionAvailable : false)}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Btn>
              <Btn variant="ghost" onClick={test} disabled={testing || !status?.isConfigured}>
                {testing ? "Test en cours…" : "Tester la connexion"}
              </Btn>
            </div>

            {msg && (
              <p style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600, color: msg.ok ? "#1f7a3d" : "#b23333" }}>
                {msg.ok ? "✓ " : "✕ "}
                {msg.text}
              </p>
            )}

            {status?.lastTestedAt && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: "#8a8aa0" }}>
                Dernier test : {fmtDateTime(status.lastTestedAt)} —{" "}
                <b style={{ color: status.lastTestResult === "SUCCESS" ? "#1f7a3d" : "#b23333" }}>
                  {status.lastTestResult === "SUCCESS" ? "Succès" : "Échec"}
                </b>
              </div>
            )}
          </Card>

          <div style={{ fontSize: 12.5, color: "#8a8aa0", lineHeight: 1.6 }}>
            <b style={{ color: PURPLE }}>Sécurité :</b> les clés sont chiffrées (AES-256-GCM) avant d&apos;être
            stockées et ne sont jamais renvoyées à cette page — seul un indice masqué est affiché. Le
            déchiffrement n&apos;a lieu que côté serveur au moment d&apos;appeler l&apos;API Flow.
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, color: "#6b6b80", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}
