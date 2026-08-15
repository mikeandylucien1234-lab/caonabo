import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  consentGiven?: boolean;
}

// POST /api/newsletter/subscribe → inscrit un email à la newsletter.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400 });
  }
  if (body.consentGiven !== true) {
    return NextResponse.json({ error: "Vous devez accepter de recevoir nos communications pour vous abonner." }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({
      data: { email, consentGiven: true },
    });
  } catch (e) {
    // Email déjà inscrit (contrainte d'unicité) → message clair, pas d'erreur brute.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ ok: true, already: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
