import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Chiffrement centralisé des identifiants sensibles (clés API Flow).
//   - Algorithme : AES-256-GCM (chiffrement authentifié)
//   - Clé : CREDENTIALS_ENCRYPTION_KEY (variable d'environnement Vercel),
//           32 octets encodés en hex (64 caractères) ou en base64.
//   - Format stocké : "iv:tag:ciphertext" (chaque partie en base64)
// La clé de chiffrement n'est JAMAIS en base ; seules les valeurs chiffrées le
// sont. Le déchiffrement n'a lieu que côté serveur, au moment de l'appel Flow.
// ─────────────────────────────────────────────────────────────────────────────

const ALGO = "aes-256-gcm";

function loadKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY manquante.");
  }
  // hex (64) ou base64 (44 avec padding)
  const buf =
    /^[0-9a-fA-F]{64}$/.test(raw.trim())
      ? Buffer.from(raw.trim(), "hex")
      : Buffer.from(raw.trim(), "base64");
  if (buf.length !== 32) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY invalide : 32 octets attendus (hex 64 car. ou base64).",
    );
  }
  return buf;
}

/** true si une clé de chiffrement valide est disponible. */
export function isEncryptionAvailable(): boolean {
  try {
    loadKey();
    return true;
  } catch {
    return false;
  }
}

/** Chiffre une valeur en clair → chaîne "iv:tag:ciphertext" (base64). */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, loadKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/** Déchiffre une chaîne "iv:tag:ciphertext" → valeur en clair. */
export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Valeur chiffrée invalide.");
  }
  const decipher = createDecipheriv(ALGO, loadKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/**
 * Indicateur masqué sûr à exposer au frontend : "••••••••" + 4 derniers
 * caractères de la valeur en CLAIR. Ne renvoie jamais la valeur complète.
 */
export function maskedHint(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;
  const tail = plaintext.slice(-4);
  return `••••••••${tail}`;
}
