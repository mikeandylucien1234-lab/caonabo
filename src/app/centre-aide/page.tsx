import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HelpCenterContent from "@/components/sections/HelpCenterContent";
import { getFaqs } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Centre d'Aide — Caonabo Airlinje" };

export default async function CentreAidePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [faqs, sp] = await Promise.all([getFaqs(), searchParams]);
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="" />
      {/* key=q : force le remontage du composant client quand la recherche change
          via l'URL (ex: clic sur la carte "Réservation & Modification"), sinon
          React conserverait l'état interne (useState) de l'ancienne navigation. */}
      <HelpCenterContent key={sp.q ?? ""} faqs={faqs} initialQuery={sp.q ?? ""} />
      <Footer />
    </div>
  );
}
