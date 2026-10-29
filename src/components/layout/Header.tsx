import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import MobileNav from "@/components/layout/MobileNav";
import LocaleCurrencySwitcher from "@/components/LocaleCurrencySwitcher";
import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";

const NAV = [
  { key: "home", href: "/" },
  { key: "destinations", href: "/destinations" },
  { key: "checkin", href: "/check-in" },
  { key: "book", href: "/book" },
  { key: "contact", href: "/contact" },
] as const;

/**
 * En-tête. `variant="hero"` => transparent, posé au-dessus de l'image du hero
 * (page d'accueil). `variant="solid"` => fond blanc (pages secondaires).
 * Affiche "Connexion" ou "Mon compte" selon la session.
 */
export default async function Header({
  variant = "solid",
  active,
}: {
  variant?: "hero" | "solid";
  active?: string;
}) {
  const isHero = variant === "hero";
  const user = await getCurrentUser();
  const { locale } = await getPrefs();
  const t = getDictionary(locale);
  return (
    <header
      className="site-header relative z-[5] flex items-center justify-between"
      style={{
        padding: isHero ? "28px 56px 0" : "20px 56px",
        background: isHero ? "transparent" : "#fff",
        borderBottom: isHero ? "none" : "1px solid #eceafa",
      }}
    >
      <Link href="/" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Caonabo Airlinje"
          className="logo-img"
          style={{ height: isHero ? 104 : 72, width: "auto" }}
        />
      </Link>
      <nav className="site-nav flex items-center" style={{ gap: 40 }}>
        {NAV.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: "#1e1b4b",
                fontWeight: isActive ? 600 : 500,
                fontSize: 17,
                borderBottom: isActive ? "2px solid #dc2626" : "none",
                paddingBottom: isActive ? 6 : 0,
              }}
            >
              {t.nav[item.key]}
            </Link>
          );
        })}
        <LocaleCurrencySwitcher tone={isHero ? "hero" : "solid"} />
        {user ? (
          <Link
            href="/account"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 18px",
              borderRadius: 12,
            }}
          >
            👤 {user.firstName}
          </Link>
        ) : (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 18px",
              borderRadius: 12,
            }}
          >
            {t.login}
          </Link>
        )}
      </nav>

      {/* Navigation mobile (hamburger) — masquée sur desktop */}
      <MobileNav firstName={user?.firstName} />
    </header>
  );
}
