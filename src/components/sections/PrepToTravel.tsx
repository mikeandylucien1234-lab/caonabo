import type { PrepStepDTO } from "@/lib/data/types";
import PrepStack from "@/components/sections/PrepStack";

export default function PrepToTravel({ steps }: { steps: PrepStepDTO[] }) {
  return (
    <>
    {/* DESKTOP : version d'origine, inchangée (masquée sur mobile) */}
    <div className="hz prep-desktop" style={{ padding: "0 56px 88px" }}>
      <div
        className="grid-2"
        style={{
          border: "1px solid #eceafa",
          borderRadius: 24,
          padding: 48,
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        <div className="prep-left">
          <div
            className="prep-circle"
            style={{
              width: 150,
              height: 150,
              borderRadius: 999,
              background: "#f0ecfb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <div style={{ width: 80, height: 80 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prep-illustration.webp"
                alt="Illustration passager + check-in"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
          <h2
            className="font-heading"
            style={{
              fontWeight: 800,
              fontSize: 32,
              color: "#1e1b4b",
              margin: "0 0 14px",
            }}
          >
            Préparez-vous à voyager.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#5c5c7a",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 380,
            }}
          >
            Suivez ces recommandations pour vivre votre prochain vol Caonabo en
            toute sérénité.
          </p>
        </div>
        <div>
          {steps.map((step) => (
            <div
              key={step.id}
              className="prep-step"
              style={{
                display: "flex",
                gap: 18,
                padding: "20px 0",
                borderBottom: "1px solid #eceafa",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#f0ecfb",
                  color: "#5b21b6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: "#1e1b4b",
                    marginBottom: 6,
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: 14, color: "#5c5c7a", lineHeight: 1.6 }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
          <button
            style={{
              width: "100%",
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#f0ecfb",
              color: "#3d1e8a",
              fontWeight: 700,
              fontSize: 15,
              padding: 16,
              borderRadius: 999,
              border: "1.5px solid #ded9f5",
              cursor: "pointer",
            }}
          >
            Voir les exigences de voyage <span>→</span>
          </button>
        </div>
      </div>
    </div>

    {/* MOBILE : même en-tête + pile de cartes swipeable (masquée sur desktop) */}
    <div
      className="hz prep-mobile"
      style={{ padding: "8px 20px 72px", textAlign: "center" }}
    >
      <h2
        className="font-heading"
        style={{ fontWeight: 800, fontSize: 30, color: "#1e1b4b", margin: "0 0 12px" }}
      >
        Préparez-vous à voyager.
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#5c5c7a",
          lineHeight: 1.6,
          margin: "0 auto 26px",
          maxWidth: 420,
        }}
      >
        Suivez ces recommandations pour vivre votre prochain vol Caonabo en toute
        sérénité.
      </p>
      <PrepStack />
    </div>
    </>
  );
}
