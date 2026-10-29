import type { MetadataRoute } from "next";
import { getDestinations, getPromotions } from "@/lib/data/queries";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://caonabo.vercel.app").replace(/\/$/, "");
}

const STATIC_PATHS = [
  "",
  "/destinations",
  "/book",
  "/check-in",
  "/contact",
  "/centre-aide",
  "/notre-histoire",
  "/notre-flotte",
  "/politique-bagages",
  "/moyens-de-paiement",
  "/voyages-de-groupe",
  "/cargo",
  "/explorer-caraibes",
  "/informations-aeroport",
  "/informations-checkin",
  "/conditions-generales",
  "/conditions-transport",
  "/politique-confidentialite",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [destinations, promotions] = await Promise.all([
    getDestinations().catch(() => []),
    getPromotions().catch(() => []),
  ]);

  const offerEntries: MetadataRoute.Sitemap = [...destinations, ...promotions].map((o) => ({
    url: `${base}/offre/${o.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...offerEntries];
}
