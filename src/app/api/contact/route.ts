import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUBJECTS = new Set(["Réservation", "Réclamation", "Presse", "Cargo", "Autre"]);

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

// POST /api/contact → enregistre un message du formulaire "Contactez-nous".
export async function POST(req: Request) {
  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Votre nom est requis." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Email valide requis." }, { status: 400 });
  }
  if (!SUBJECTS.has(subject)) {
    return NextResponse.json({ error: "Sujet invalide." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Votre message doit contenir au moins 10 caractères." },
      { status: 400 },
    );
  }

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
