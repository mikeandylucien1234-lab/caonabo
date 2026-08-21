"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FaqDTO } from "@/lib/data/types";
import { WHATSAPP_NUMBER } from "@/lib/contactInfo";

const INK = "#1e1b4b";
const PURPLE = "#5b21b6";

interface Category {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

const CATEGORIES: Category[] = [
  { icon: "🎫", title: "Réservation & Modification", desc: "Modifier, annuler ou consulter une réservation existante.", href: "/centre-aide?q=r%C3%A9servation#faq" },
  { icon: "🧳", title: "Check-in & Embarquement", desc: "Enregistrement en ligne, carte d'embarquement, horaires.", href: "/informations-checkin" },
  { icon: "🎒", title: "Bagages", desc: "Franchise incluse, bagages supplémentaires, tarifs.", href: "/politique-bagages" },
  { icon: "🛫", title: "Informations Aéroport", desc: "Terminaux, accès, contrôles de sécurité.", href: "/informations-aeroport" },
  { icon: "👥", title: "Voyages de Groupe", desc: "Devis et conditions pour les groupes de voyageurs.", href: "/voyages-de-groupe" },
  { icon: "📦", title: "Cargo & Courrier", desc: "Envoi de colis et documents entre nos destinations.", href: "/cargo" },
];

const LEGAL_LINKS = [
  { label: "Conditions Générales", href: "/conditions-generales" },
  { label: "Conditions de Transport", href: "/conditions-transport" },
  { label: "Moyens de Paiement", href: "/moyens-de-paiement" },
  { label: "Politique de Confidentialité", href: "/politique-confidentialite" },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // retire les accents pour une recherche plus tolérante
}

export default function HelpCenterContent({
  faqs,
  initialQuery = "",
}: {
  faqs: FaqDTO[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [openIdx, setOpenIdx] = useState<number>(0);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return faqs;
    return faqs.filter((f) => norm(f.question).includes(q) || norm(f.answer).includes(q));
  }, [faqs, query]);

  return (
    <div>
      {/* ── Barre de recherche ─────────────────────────────────────────── */}
      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={badge}>🆘 CENTRE D&apos;AIDE</div>
          <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 40, color: "#0f0f2d", margin: "16px 0 10px" }}>
            Comment pouvons-nous vous <span style={{ color: PURPLE }}>aider</span> ?
          </h1>
          <p style={{ color: "#5c5c7a", fontSize: 15.5, margin: "0 0 28px" }}>
            Cherchez une réponse ou parcourez nos rubriques ci-dessous.
          </p>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9a94b5" }}>
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une question (ex : bagages, check-in, paiement...)"
              style={{
                width: "100%",
                padding: "17px 20px 17px 52px",
                borderRadius: 16,
                border: "1.5px solid #dcdae6",
                fontSize: 15.5,
                color: INK,
                boxShadow: "0 6px 24px rgba(30,27,75,0.08)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Catégories ──────────────────────────────────────────────────── */}
      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 22, color: "#0f0f2d", margin: "0 0 20px" }}>
          Parcourir par rubrique
        </h2>
        <div
          className="help-cat-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              style={{
                display: "block",
                background: "#fff",
                border: "1.5px solid #eceafa",
                borderRadius: 18,
                padding: "22px 22px",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(30,27,75,0.05)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <div className="font-heading" style={{ fontWeight: 800, fontSize: 16.5, color: INK, marginBottom: 6 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 13.5, color: "#5c5c7a", lineHeight: 1.5 }}>{c.desc}</div>
            </Link>
          ))}

          {/* Conditions & Légal : carte à liens multiples */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #eceafa",
              borderRadius: 18,
              padding: "22px 22px",
              boxShadow: "0 4px 16px rgba(30,27,75,0.05)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚖️</div>
            <div className="font-heading" style={{ fontWeight: 800, fontSize: 16.5, color: INK, marginBottom: 10 }}>
              Conditions & Légal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ fontSize: 13.5, color: PURPLE, fontWeight: 600, textDecoration: "none" }}
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ complète (filtrable) ────────────────────────────────────── */}
      <div id="faq" className="hz" style={{ padding: "56px 56px 0" }}>
        <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 22, color: "#0f0f2d", margin: "0 0 6px" }}>
          Questions fréquentes
        </h2>
        <p style={{ fontSize: 13.5, color: "#8a8aa0", margin: "0 0 20px" }}>
          {query.trim()
            ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""} pour « ${query} »`
            : `${faqs.length} questions`}
        </p>

        <div style={{ maxWidth: 820 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                background: "#faf9fc",
                border: "1.5px solid #eceafa",
                borderRadius: 16,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>🤔</div>
              <div style={{ fontWeight: 700, color: INK, marginBottom: 4 }}>Aucun résultat pour « {query} »</div>
              <p style={{ fontSize: 13.5, color: "#5c5c7a", margin: 0 }}>
                Essayez un autre mot-clé, ou contactez-nous directement ci-dessous.
              </p>
            </div>
          ) : (
            filtered.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={faq.id} style={{ borderBottom: "1px solid #e6e4ee" }}>
                  <div
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "18px 4px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 15, color: INK, fontWeight: 500 }}>{faq.question}</span>
                    <span
                      style={{
                        color: "#dc2626",
                        fontSize: 22,
                        fontWeight: 400,
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 4px 18px", color: "#5c5c7a", fontSize: 14, lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <div className="hz" style={{ padding: "64px 56px 90px" }}>
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            background: "linear-gradient(120deg,#1e1b4b,#3d1e8a)",
            borderRadius: 24,
            padding: "40px 36px",
            textAlign: "center",
          }}
        >
          <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 24, color: "#fff", margin: "0 0 8px" }}>
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14.5, margin: "0 0 24px" }}>
            Notre équipe vous répond avec le sourire.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                color: "#1e1b4b",
                fontWeight: 700,
                fontSize: 14.5,
                padding: "13px 24px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              ✉️ Nous contacter
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14.5,
                padding: "13px 24px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              💬 Écrivez-nous sur WhatsApp
            </a>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            🕒 Lundi à dimanche de 8h00 à 20h00
          </div>
        </div>
      </div>
    </div>
  );
}

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#f0ecfb",
  color: PURPLE,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  padding: "8px 16px",
  borderRadius: 999,
};
