import LegalPage, { P, UL, type LegalSection } from "@/components/sections/LegalPage";

export const metadata = { title: "Moyens de Paiement — Caonabo Airlinje" };

const SECTIONS: LegalSection[] = [
  {
    id: "acceptes",
    heading: "Moyens de paiement acceptés",
    body: (
      <>
        <P>Au moment de régler votre réservation, vous pouvez utiliser :</P>
        <UL
          items={[
            "Cartes bancaires : Visa, Mastercard (débit et crédit) ;",
            "Portefeuille en ligne de type PayPal ;",
            "Paiement en ligne sécurisé via la plateforme Flow (flow.cl).",
          ]}
        />
      </>
    ),
  },
  {
    id: "securite",
    heading: "Sécurité des paiements",
    body: (
      <P>
        Les échanges liés au paiement se font via une connexion chiffrée. Caonabo Airlinje ne
        conserve jamais le numéro complet de votre carte : seul un libellé cosmétique (par
        exemple « Carte •••• 4242 ») est associé à la réservation à titre indicatif.
      </P>
    ),
  },
  {
    id: "devises",
    heading: "Devises et facturation",
    body: (
      <P>
        Les prix sont affichés dans la devise du marché (USD comme devise pivot, avec conversion
        indicative en CLP, CAD ou PEN). Le montant débité correspond au total affiché avant
        confirmation, options incluses.
      </P>
    ),
  },
  {
    id: "justificatifs",
    heading: "Justificatifs et reçus",
    body: (
      <P>
        Après confirmation, un récapitulatif de réservation détaillant le tarif du vol, les
        options et les taxes est associé à votre référence. Il tient lieu de justificatif de
        commande.
      </P>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      active="/moyens-de-paiement"
      eyebrow="INFORMATIONS LÉGALES"
      title="Moyens de Paiement"
      intro="Les moyens de règlement acceptés pour vos réservations Caonabo Airlinje."
      sections={SECTIONS}
      lastUpdated="13 août 2026"
    />
  );
}
