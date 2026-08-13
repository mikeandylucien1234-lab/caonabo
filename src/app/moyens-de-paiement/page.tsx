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
            "Miles Caonabo, en règlement partiel ou total (voir ci-dessous).",
          ]}
        />
        <p style={{ margin: "0 0 12px", fontStyle: "italic", color: "#8a8aa0" }}>
          Caonabo Airlinje étant une démonstration, le paiement est simulé : aucune transaction
          réelle n&apos;est effectuée et aucune donnée de carte réelle ne doit être saisie.
        </p>
      </>
    ),
  },
  {
    id: "miles",
    heading: "Payer avec vos Miles Caonabo",
    body: (
      <>
        <P>
          Les Miles Caonabo sont une véritable fonctionnalité du site. Cumulés à chaque
          réservation payante, ils peuvent être utilisés pour régler tout ou partie d&apos;un
          billet, à raison de <b>1 Mile = 0,01 USD</b> de remise.
        </P>
        <UL
          items={[
            "L'option d'utilisation des Miles apparaît à l'étape de paiement pour les comptes connectés ;",
            "Le montant réglé en Miles est plafonné au solde disponible et au total de la commande ;",
            "Les Miles sont personnels, non cessibles et rattachés à votre compte client.",
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
        confirmation, options et remises Miles incluses.
      </P>
    ),
  },
  {
    id: "justificatifs",
    heading: "Justificatifs et reçus",
    body: (
      <P>
        Après confirmation, un récapitulatif de réservation détaillant le tarif du vol, les
        options, les taxes et l&apos;éventuelle remise en Miles est associé à votre référence. Il
        tient lieu de justificatif de commande.
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
      intro="Les moyens de règlement acceptés pour vos réservations Caonabo Airlinje, dont l'utilisation de vos Miles Caonabo."
      sections={SECTIONS}
      lastUpdated="13 août 2026"
    />
  );
}
