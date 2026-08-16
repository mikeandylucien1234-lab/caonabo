"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/admin/AdminProviders";
import { INK, PURPLE } from "@/components/admin/ui";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", exact: true },
  { href: "/admin/vols", label: "Vols", icon: "✈️" },
  { href: "/admin/routes", label: "Routes & Aéroports", icon: "🗺️" },
  { href: "/admin/destinations", label: "Destinations", icon: "📍" },
  { href: "/admin/promotions", label: "Promotions", icon: "🏷️" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/reservations", label: "Réservations", icon: "🎫" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👤" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "✉️" },
  { href: "/admin/medias", label: "Médias du site", icon: "🖼️" },
  { href: "/admin/paiement", label: "Paiement — Flow", icon: "💳" },
  { href: "/admin/taux-de-change", label: "Taux de change", icon: "💱" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, signOut } = useAuth();

  const initials = (email ?? "AD").slice(0, 2).toUpperCase();

  async function logout() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f8" }}>
      {/* sidebar */}
      <aside className="adm-sidebar" style={{ width: 250, background: INK, color: "#fff", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "22px 22px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Caonabo" style={{ height: 40, width: "auto" }} />
        </div>
        <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  marginBottom: 4,
                  fontSize: 14.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "#b9b6d6",
                  background: active ? PURPLE : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email ?? "Admin"}</div>
            <div style={{ fontSize: 11.5, color: "#9a97bf" }}>Administrateur</div>
          </div>
          <button onClick={logout} title="Déconnexion" aria-label="Déconnexion" style={{ background: "none", border: "none", color: "#b9b6d6", cursor: "pointer", fontSize: 18 }}>⏻</button>
        </div>
      </aside>

      {/* zone principale */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 66, background: "#fff", borderBottom: "1px solid #ececf4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ color: "#9a97bf", fontSize: 14 }}>Caonabo Airlinje · Back-office</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 13, color: "#6b6b80" }}>{email}</span>
            <div style={{ width: 34, height: 34, borderRadius: 999, background: PURPLE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{initials}</div>
          </div>
        </header>
        <main style={{ padding: "30px 32px 60px", maxWidth: 1280, width: "100%" }}>{children}</main>
      </div>
    </div>
  );
}
