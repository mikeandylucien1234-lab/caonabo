import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/sections/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Créer un compte — Caonabo Airlinje" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" />
      <AuthForm mode="register" />
      <Footer />
    </div>
  );
}
