"use client";

import { useEffect } from "react";

// Rafraîchit la page tant que le paiement est en attente de confirmation webhook.
export default function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), seconds * 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return null;
}
