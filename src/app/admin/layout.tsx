"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminProviders, { useAuth } from "@/components/admin/AdminProviders";
import AdminShell from "@/components/admin/AdminShell";
import { Loading } from "@/components/admin/ui";

function Guard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAdmin, loading } = useAuth();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLogin) return;
    if (!session || !isAdmin) router.replace("/admin/login");
  }, [loading, isLogin, session, isAdmin, router]);

  if (isLogin) return <>{children}</>;
  if (loading) return <div style={{ minHeight: "100vh", background: "#f4f4f8" }}><Loading label="Vérification de l'accès…" /></div>;
  if (!session || !isAdmin)
    return <div style={{ minHeight: "100vh", background: "#f4f4f8" }}><Loading label="Redirection…" /></div>;

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <Guard>{children}</Guard>
    </AdminProviders>
  );
}
