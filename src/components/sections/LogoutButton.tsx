"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      style={{
        background: "#fff",
        color: "#3d1e8a",
        fontWeight: 600,
        fontSize: 14,
        padding: "10px 18px",
        borderRadius: 12,
        border: "1.5px solid #3d1e8a",
        cursor: "pointer",
      }}
    >
      Se déconnecter
    </button>
  );
}
