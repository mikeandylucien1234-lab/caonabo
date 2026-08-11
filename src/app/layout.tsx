import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caonabo Airlinje — Voyagez Plus Loin, Vivez Plus Fort",
  description:
    "Compagnie aérienne pour la diaspora haïtienne. Vols directs et avec escale entre le Chili, Haïti, le Canada et le Pérou.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  icons: { icon: "/images/logo.png" },
  openGraph: {
    title: "Caonabo Airlinje",
    description:
      "Voyagez Plus Loin, Vivez Plus Fort — vols vers Haïti, le Chili, le Canada et le Pérou.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
