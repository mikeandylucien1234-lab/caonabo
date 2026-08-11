import Link from "next/link";

const NAV = [
  { label: "Accueil", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Check In", href: "/check-in" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/#contact" },
];

/**
 * En-tête. `variant="hero"` => transparent, posé au-dessus de l'image du hero
 * (page d'accueil). `variant="solid"` => fond blanc (pages secondaires).
 */
export default function Header({
  variant = "solid",
  active,
}: {
  variant?: "hero" | "solid";
  active?: string;
}) {
  const isHero = variant === "hero";
  return (
    <header
      className="relative z-[5] flex items-center justify-between"
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
          style={{ height: isHero ? 104 : 72, width: "auto" }}
        />
      </Link>
      <nav className="flex items-center" style={{ gap: 40 }}>
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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
