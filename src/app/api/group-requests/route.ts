import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface GroupBody {
  travelers?: number | string;
  route?: string;
  approxDates?: string;
  email?: string;
  phone?: string;
}

// POST /api/group-requests → enregistre une demande de devis "Voyages de Groupe".
export async function POST(req: Request) {
  let body: GroupBody;
  try {
    body = (await req.json()) as GroupBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const travelers = Math.floor(Number(body.travelers));
  const route = (body.route ?? "").trim();
  const email = (body.email ?? "").trim();
  const approxDates = (body.approxDates ?? "").trim() || null;
  const phone = (body.phone ?? "").trim() || null;

  if (!Number.isFinite(travelers) || travelers < 2) {
    return NextResponse.json(
      { error: "Indiquez au moins 2 voyageurs pour un tarif de groupe." },
      { status: 400 },
    );
  }
  if (!route) {
    return NextResponse.json({ error: "Route souhaitée requise." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Email valide requis." }, { status: 400 });
  }

  await prisma.groupRequest.create({
    data: { travelers, route, approxDates, email, phone },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
