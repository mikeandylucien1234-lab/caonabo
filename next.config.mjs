// En-têtes de sécurité HTTP appliqués à toutes les routes. CSP volontairement
// pragmatique (pas de nonce par requête) : 'unsafe-inline' reste nécessaire
// pour le script de démarrage de Next.js et les styles inline (React
// style={{}}) utilisés partout sur le site, mais aucune origine tierce n'est
// autorisée à charger un script — la protection principale contre l'injection
// de script distant (XSS) reste donc active.
const SUPABASE_ORIGIN = "https://xfdugmfqyphmjdbghlow.supabase.co";
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${SUPABASE_ORIGIN}`,
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_ORIGIN}`,
  "form-action 'self' https://www.flow.cl https://sandbox.flow.cl",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Les images du prototype sont servies en local depuis /public/images.
    // Autoriser quelques hôtes distants au cas où on branche un CDN plus tard.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
