import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/supabase/admin";
import { encryptSecret, decryptSecret, maskedHint, isEncryptionAvailable } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const MODES = new Set(["SANDBOX", "PRODUCTION"]);

// Statut SÛR renvoyé au frontend : jamais les clés (même chiffrées), seulement
// des indicateurs (configuré ? mode ? indice masqué ••••1234 ?).
function safeStatus(row: {
  apiKeyEncrypted: string | null;
  secretKeyEncrypted: string | null;
  mode: string;
  isConfigured: boolean;
  lastTestedAt: Date | null;
  lastTestResult: string | null;
}) {
  const encOk = isEncryptionAvailable();
  let apiKeyHint: string | null = null;
  let secretKeyHint: string | null = null;
  if (encOk) {
    try {
      if (row.apiKeyEncrypted) apiKeyHint = maskedHint(decryptSecret(row.apiKeyEncrypted));
      if (row.secretKeyEncrypted) secretKeyHint = maskedHint(decryptSecret(row.secretKeyEncrypted));
    } catch {
      // clé de chiffrement changée / valeur corrompue → pas d'indice
    }
  }
  return {
    isConfigured: row.isConfigured,
    mode: row.mode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
    apiKeyHint,
    secretKeyHint,
    lastTestedAt: row.lastTestedAt?.toISOString() ?? null,
    lastTestResult: row.lastTestResult ?? null,
    encryptionAvailable: encOk,
  };
}

async function getSingleton() {
  const existing = await prisma.paymentSettings.findFirst();
  return existing;
}

// GET → statut actuel (sans clés)
export async function GET(req: Request) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  const row = await getSingleton();
  if (!row) {
    return NextResponse.json({
      isConfigured: false,
      mode: "SANDBOX",
      apiKeyHint: null,
      secretKeyHint: null,
      lastTestedAt: null,
      lastTestResult: null,
      encryptionAvailable: isEncryptionAvailable(),
    });
  }
  return NextResponse.json(safeStatus(row));
}

interface Body {
  apiKey?: string;
  secretKey?: string;
  mode?: string;
}

// POST → enregistre/met à jour les clés (chiffrées) et le mode
export async function POST(req: Request) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  if (!isEncryptionAvailable()) {
    return NextResponse.json(
      { error: "Chiffrement indisponible : CREDENTIALS_ENCRYPTION_KEY n'est pas configurée sur le serveur." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }
  if (body.mode && !MODES.has(body.mode)) {
    return NextResponse.json({ error: "Mode invalide." }, { status: 400 });
  }

  const existing = await getSingleton();

  // Ne remplace une clé que si une nouvelle valeur non vide est fournie.
  const apiKeyEncrypted = body.apiKey?.trim()
    ? encryptSecret(body.apiKey.trim())
    : existing?.apiKeyEncrypted ?? null;
  const secretKeyEncrypted = body.secretKey?.trim()
    ? encryptSecret(body.secretKey.trim())
    : existing?.secretKeyEncrypted ?? null;
  const mode = body.mode ?? existing?.mode ?? "SANDBOX";
  const isConfigured = Boolean(apiKeyEncrypted && secretKeyEncrypted);

  const row = existing
    ? await prisma.paymentSettings.update({
        where: { id: existing.id },
        data: { apiKeyEncrypted, secretKeyEncrypted, mode, isConfigured },
      })
    : await prisma.paymentSettings.create({
        data: { apiKeyEncrypted, secretKeyEncrypted, mode, isConfigured },
      });

  return NextResponse.json(safeStatus(row));
}
