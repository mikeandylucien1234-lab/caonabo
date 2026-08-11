import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckInForm from "@/components/sections/CheckInForm";

export const metadata = { title: "Check-In — Caonabo Airlinje" };

export default function CheckInPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/check-in" />
      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#f0ecfb",
            color: "#5b21b6",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          🧳 ENREGISTREMENT EN LIGNE
        </div>
        <h1
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 40, color: "#0f0f2d", margin: "16px 0 0" }}
        >
          Web <span style={{ color: "#5b21b6" }}>Check-In</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 15, marginTop: 10 }}>
          Enregistrez-vous dès 24 heures avant votre vol avec votre référence de
          réservation.
        </p>
      </div>
      <CheckInForm />
      <Footer />
    </div>
  );
}
