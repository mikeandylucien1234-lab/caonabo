import LegalPage, { P, UL, type LegalSection } from "@/components/sections/LegalPage";

export const metadata = { title: "Politique de Confidentialité — Caonabo Airlinje" };

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    heading: "Responsable du traitement",
    body: (
      <P>
        Caonabo Airlinje est responsable du traitement des données personnelles collectées via
        son site. La présente politique explique quelles données sont traitées, dans quel but, et
        quels sont vos droits.
      </P>
    ),
  },
  {
    id: "donnees",
    heading: "Données collectées",
    body: (
      <>
        <P>Nous collectons uniquement les données nécessaires à nos services :</P>
        <UL
          items={[
            "Données de compte : nom, prénom, adresse e-mail et mot de passe (stocké de façon chiffrée) ;",
            "Données de réservation : passagers, documents de voyage, itinéraires, sièges et bagages ;",
            "Données de contact : messages envoyés via le formulaire de contact ou les demandes de groupe ;",
            "Solde et historique des Miles Caonabo rattachés à votre compte.",
          ]}
        />
      </>
    ),
  },
  {
    id: "finalites",
    heading: "Finalités du traitement",
    body: (
      <UL
        items={[
          "Gérer vos réservations, votre compte et votre programme de fidélité ;",
          "Vous transmettre les informations liées à vos vols et à vos demandes ;",
          "Assurer la sécurité du service et prévenir les usages frauduleux.",
        ]}
      />
    ),
  },
  {
    id: "base-legale",
    heading: "Base légale",
    body: (
      <P>
        Les traitements reposent selon les cas sur l&apos;exécution du contrat de transport,
        votre consentement, ou l&apos;intérêt légitime de la compagnie à sécuriser et améliorer
        ses services.
      </P>
    ),
  },
  {
    id: "conservation",
    heading: "Durée de conservation",
    body: (
      <P>
        Vos données sont conservées le temps nécessaire à la finalité poursuivie : la durée de vie
        de votre compte pour les données de compte, et la durée requise par les obligations
        légales et comptables pour les données de réservation. Vous pouvez demander la suppression
        de votre compte à tout moment.
      </P>
    ),
  },
  {
    id: "partage",
    heading: "Partage des données",
    body: (
      <P>
        Vos données ne sont ni vendues ni louées. Elles ne sont partagées qu&apos;avec les
        prestataires strictement nécessaires à la fourniture du service (par exemple
        l&apos;hébergement), tenus à la confidentialité.
      </P>
    ),
  },
  {
    id: "droits",
    heading: "Vos droits",
    body: (
      <>
        <P>Conformément à la réglementation applicable, vous disposez des droits suivants :</P>
        <UL
          items={[
            "Droit d'accès et de rectification de vos données ;",
            "Droit à l'effacement (« droit à l'oubli ») ;",
            "Droit à la limitation et à l'opposition au traitement ;",
            "Droit à la portabilité de vos données.",
          ]}
        />
        <P>
          Pour exercer ces droits, contactez-nous via la page{" "}
          <a href="/contact" style={{ color: "#5b21b6", fontWeight: 600 }}>Contactez-nous</a>.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <P>
        Le site utilise des cookies techniques nécessaires à son fonctionnement, notamment pour
        maintenir votre session lorsque vous êtes connecté. Aucun cookie publicitaire de suivi
        n&apos;est déposé à des fins commerciales.
      </P>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <P>
        Pour toute question relative à vos données personnelles, écrivez-nous à{" "}
        <b>support@caonabo-airlinje.com</b> ou via la page{" "}
        <a href="/contact" style={{ color: "#5b21b6", fontWeight: 600 }}>Contactez-nous</a>.
      </P>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      active="/politique-confidentialite"
      eyebrow="INFORMATIONS LÉGALES"
      title="Politique de Confidentialité"
      intro="Comment Caonabo Airlinje collecte, utilise et protège vos données personnelles, et comment exercer vos droits."
      sections={SECTIONS}
      lastUpdated="13 août 2026"
    />
  );
}
