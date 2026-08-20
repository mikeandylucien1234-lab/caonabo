import LegalPage, { P, UL, type LegalSection } from "@/components/sections/LegalPage";

export const metadata = { title: "Conditions Générales — Caonabo Airlinje" };

const SECTIONS: LegalSection[] = [
  {
    id: "objet",
    heading: "Objet et champ d'application",
    body: (
      <>
        <P>
          Les présentes conditions générales de vente (CGV) régissent la vente de billets et
          de services annexes proposés par Caonabo Airlinje sur son site. Toute réservation
          implique l&apos;acceptation pleine et entière des présentes CGV, ainsi que des
          conditions de transport applicables.
        </P>
        <P>
          Caonabo Airlinje est une compagnie fictive présentée à des fins de démonstration ;
          aucun transport réel n&apos;est effectué et aucune somme réelle n&apos;est encaissée.
        </P>
      </>
    ),
  },
  {
    id: "reservation",
    heading: "Réservation et formation du contrat",
    body: (
      <>
        <P>
          La réservation s&apos;effectue en ligne selon le parcours en cinq étapes : recherche,
          choix du vol, informations passagers, options (bagages et sièges) puis paiement. Le
          contrat est formé lorsque la confirmation, accompagnée d&apos;une référence de
          réservation (PNR), est émise.
        </P>
        <P>
          Le passager s&apos;engage à fournir des informations exactes. Toute erreur sur
          l&apos;identité ou les documents de voyage relève de sa responsabilité.
        </P>
      </>
    ),
  },
  {
    id: "prix",
    heading: "Prix, taxes et frais",
    body: (
      <>
        <P>
          Les prix sont affichés toutes taxes comprises, dans la devise du marché. Ils incluent
          le tarif du vol, les taxes et redevances applicables. Les options (bagages en soute,
          choix de siège) sont facturées en supplément et détaillées avant paiement.
        </P>
        <P>
          Les tarifs promotionnels sont valables dans la limite des places disponibles et pour
          les dates indiquées sur chaque offre.
        </P>
      </>
    ),
  },
  {
    id: "paiement",
    heading: "Paiement",
    body: (
      <P>
        Les moyens de paiement acceptés sont décrits dans notre page{" "}
        <a href="/moyens-de-paiement" style={{ color: "#5b21b6", fontWeight: 600 }}>Moyens de Paiement</a>. Le
        contrat n&apos;est définitif qu&apos;après validation du paiement.
      </P>
    ),
  },
  {
    id: "modification",
    heading: "Modification et annulation",
    body: (
      <>
        <P>
          Les conditions de modification et d&apos;annulation dépendent du tarif choisi et sont
          rappelées avant l&apos;achat. Certains tarifs promotionnels peuvent être non
          modifiables et non remboursables.
        </P>
        <UL
          items={[
            "Toute demande de modification est soumise à disponibilité et à l'éventuelle différence tarifaire.",
            "Les remboursements, lorsqu'ils sont autorisés, sont effectués sur le moyen de paiement d'origine.",
          ]}
        />
      </>
    ),
  },
  {
    id: "responsabilite",
    heading: "Responsabilité",
    body: (
      <P>
        La responsabilité de Caonabo Airlinje au titre du transport est régie par les conditions
        de transport et les conventions internationales applicables. La compagnie ne saurait être
        tenue responsable des conséquences d&apos;informations erronées fournies par le passager.
      </P>
    ),
  },
  {
    id: "reclamations",
    heading: "Réclamations et service client",
    body: (
      <P>
        Toute réclamation peut être adressée via la page{" "}
        <a href="/contact" style={{ color: "#5b21b6", fontWeight: 600 }}>Contactez-nous</a>. Nous nous
        engageons à accuser réception et à traiter chaque demande dans les meilleurs délais.
      </P>
    ),
  },
  {
    id: "droit",
    heading: "Droit applicable et litiges",
    body: (
      <P>
        Les présentes CGV sont soumises au droit applicable au lieu du siège de la compagnie. En
        cas de litige, une solution amiable sera recherchée en priorité avant toute action
        contentieuse.
      </P>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      active="/conditions-generales"
      eyebrow="INFORMATIONS LÉGALES"
      title="Conditions Générales de Vente"
      intro="Les règles applicables à la vente de billets et de services Caonabo Airlinje. Utilisez le sommaire ci-dessous pour accéder directement à une section."
      sections={SECTIONS}
      lastUpdated="13 août 2026"
    />
  );
}
