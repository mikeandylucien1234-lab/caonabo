import LegalPage, { P, UL, type LegalSection } from "@/components/sections/LegalPage";

export const metadata = { title: "Conditions de Transport — Caonabo Airlinje" };

const SECTIONS: LegalSection[] = [
  {
    id: "definitions",
    heading: "Définitions",
    body: (
      <UL
        items={[
          <><b>Transporteur</b> : Caonabo Airlinje, émetteur du titre de transport.</>,
          <><b>Passager</b> : toute personne titulaire d'un billet et transportée avec l'accord du transporteur.</>,
          <><b>Billet</b> : le titre de transport électronique et son PNR associé.</>,
          <><b>Bagage</b> : les effets personnels accompagnant le passager, en cabine ou en soute.</>,
        ]}
      />
    ),
  },
  {
    id: "billet",
    heading: "Billet et titre de transport",
    body: (
      <>
        <P>
          Le billet est nominatif et incessible. Il n&apos;est valable que pour le transport
          mentionné, du point de départ au point de destination, aux dates et vols indiqués.
        </P>
        <P>
          Le passager doit être en mesure de présenter sa référence de réservation et une pièce
          d&apos;identité valable à chaque étape du voyage.
        </P>
      </>
    ),
  },
  {
    id: "enregistrement",
    heading: "Enregistrement et embarquement",
    body: (
      <>
        <P>
          Les délais d&apos;enregistrement et d&apos;embarquement sont précisés par aéroport sur
          la page{" "}
          <a href="/informations-aeroport" style={{ color: "#5b21b6", fontWeight: 600 }}>Informations Aéroport</a>.
          Le passager doit se présenter à la porte d&apos;embarquement à l&apos;heure indiquée sur
          sa carte d&apos;embarquement.
        </P>
        <P>
          Le transporteur peut refuser l&apos;embarquement d&apos;un passager qui ne respecte pas
          les délais ou ne présente pas les documents requis.
        </P>
      </>
    ),
  },
  {
    id: "refus",
    heading: "Refus et limitation de transport",
    body: (
      <P>
        Pour des raisons de sécurité ou d&apos;ordre public, le transporteur peut refuser le
        transport d&apos;un passager ou d&apos;un bagage, notamment en cas de comportement
        dangereux, de documents non conformes ou de non-respect des consignes de sûreté.
      </P>
    ),
  },
  {
    id: "bagages",
    heading: "Bagages",
    body: (
      <P>
        Les franchises incluses par classe, les tarifs des bagages supplémentaires et la liste des
        objets interdits figurent sur la page{" "}
        <a href="/politique-bagages" style={{ color: "#5b21b6", fontWeight: 600 }}>Politique de Bagages</a>. Le
        passager est responsable de la conformité de ses bagages.
      </P>
    ),
  },
  {
    id: "horaires",
    heading: "Horaires, retards et annulations",
    body: (
      <>
        <P>
          Les horaires ne sont pas garantis et peuvent être modifiés pour des raisons
          opérationnelles ou météorologiques. En cas de retard important ou d&apos;annulation, le
          transporteur propose au passager un réacheminement ou un remboursement selon les
          conditions applicables.
        </P>
        <P>Le passager est informé de tout changement via les coordonnées fournies lors de la réservation.</P>
      </>
    ),
  },
  {
    id: "responsabilite",
    heading: "Responsabilité du transporteur",
    body: (
      <P>
        La responsabilité du transporteur en cas de dommage, de retard ou de perte de bagages
        s&apos;exerce dans les limites prévues par les conventions internationales applicables au
        transport aérien. Les objets de valeur doivent être conservés en cabine.
      </P>
    ),
  },
  {
    id: "formalites",
    heading: "Formalités administratives",
    body: (
      <P>
        Le passager est seul responsable de l&apos;obtention et de la validité des documents de
        voyage (passeport, visa, autorisations) exigés par les pays de départ, de transit et de
        destination. Le transporteur n&apos;est pas responsable des conséquences d&apos;un défaut
        de documents.
      </P>
    ),
  },
  {
    id: "conduite",
    heading: "Conduite à bord",
    body: (
      <P>
        À bord, le passager doit respecter les consignes de l&apos;équipage. Tout comportement
        compromettant la sécurité du vol ou le confort des autres passagers peut entraîner des
        mesures appropriées, y compris à l&apos;arrivée.
      </P>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      active="/conditions-transport"
      eyebrow="INFORMATIONS LÉGALES"
      title="Conditions de Transport"
      intro="Les règles applicables au transport aérien des passagers et de leurs bagages sur les vols Caonabo Airlinje."
      sections={SECTIONS}
      lastUpdated="13 août 2026"
    />
  );
}
