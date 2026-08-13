// Section "À bord" — le bandeau fourni tel quel (image identique), bords
// arrondis, placé après les Promotions. Responsive : l'image s'adapte en
// largeur sur PC comme sur mobile. Seul le bouton « Découvrir notre menu »
// (en bas à droite du visuel) est cliquable.

export default function OnboardExperience() {
  return (
    <div className="hz" style={{ padding: "0 56px 88px" }}>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/onboard-banner.jpg"
          alt="À bord, Haïti vous accompagne — plats 100 % haïtiens et recharge à bord"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <a
          href="/notre-flotte"
          aria-label="Découvrir notre menu"
          style={{ position: "absolute", left: "68.5%", top: "72%", width: "20%", height: "16%", borderRadius: 999 }}
        />
      </div>
    </div>
  );
}
