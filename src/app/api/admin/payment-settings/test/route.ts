import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/supabase/admin";
import { decryptSecret, isEncryptionAvailable } from "@/lib/crypto";
import { testFlowConnection } from "@/lib/flow";

export const dynamic = "force-dynamic";

// POST → teste la connexion Flow avec les clés enregistrées (non destructif),
// met à jour lastTestedAt / lastTestResult.
export async function POST(req: Request) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  if (!isEncryptionAvailable()) {
    return NextResponse.json(
      { error: "CREDENTIALS_ENCRYPTION_KEY non configurée sur le serveur." },
      { status: 500 },
    );
  }

  const row = await prisma.paymentSettings.findFirst();
  if (!row || !row.apiKeyEncrypted || !row.secretKeyEncrypted) {
    return NextResponse.json(
      { success: false, message: "Aucune clé enregistrée. Enregistrez d'abord vos identifiants Flow." },
      { status: 400 },
    );
  }

  const mode = row.mode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";
  let result: { success: boolean; message: string };
  try {
    const apiKey = decryptSecret(row.apiKeyEncrypted);
    const secretKey = decryptSecret(row.secretKeyEncrypted);
    result = await testFlowConnection(apiKey, secretKey, mode);
  } catch {
    // Ne jamais divulguer le détail des clés dans le message d'erreur
    result = { success: false, message: "Impossible de déchiffrer ou d'utiliser les clés enregistrées." };
  }

  await prisma.paymentSettings.update({
    where: { id: row.id },
    data: {
      lastTestedAt: new Date(),
      lastTestResult: result.success ? "SUCCESS" : "FAILURE",
    },
  });

  return NextResponse.json(result);
}
