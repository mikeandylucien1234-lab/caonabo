import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Flow renvoie l'utilisateur ici (GET ou POST avec token) après le paiement.
// On NE marque PAS la réservation payée ici (c'est le rôle du webhook, seule
// source de vérité) : on redirige vers une page de résultat lisible.
function refFrom(url: string): string {
  return new URL(url).searchParams.get("ref") ?? "";
}

export async function GET(req: Request) {
  const ref = refFrom(req.url);
  return NextResponse.redirect(new URL(`/paiement/retour?ref=${encodeURIComponent(ref)}`, req.url));
}

export async function POST(req: Request) {
  let ref = refFrom(req.url);
  if (!ref) {
    try {
      const form = await req.formData();
      // certains flux renvoient le token ; le ref est déjà dans l'URL de retour
      ref = String(form.get("ref") ?? "");
    } catch {
      /* ignore */
    }
  }
  return NextResponse.redirect(
    new URL(`/paiement/retour?ref=${encodeURIComponent(ref)}`, req.url),
    303,
  );
}
