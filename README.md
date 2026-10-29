# Caonabo Airlinje ✈️

Site web de la compagnie aérienne fictive **Caonabo Airlinje**, dédiée à la
diaspora haïtienne : vols entre le **Chili, Haïti, le Canada et le Pérou**.

Application web complète construite à partir du prototype HTML : frontend fidèle
au design d'origine + backend réel (recherche de vols, réservation, promotions et
destinations dynamiques).

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS |
| Backend | API Routes Next.js (serverless) |
| ORM | Prisma |
| Base de données | **PostgreSQL** en prod (Supabase) · **SQLite** en dev local |
| Polices | Poppins + Inter (`next/font/google`, auto-hébergées) |
| Déploiement | Vercel (frontend + API) + Supabase (base) |

## Démarrage rapide

Le schéma cible **PostgreSQL** (Supabase) par défaut.

```bash
npm install
cp .env.example .env          # renseigner DATABASE_URL + DIRECT_URL + AUTH_SECRET
npx prisma db push            # applique le schéma
npm run db:seed               # injecte les données du prototype
npm run dev                   # http://localhost:3000
```

**Dev local sans Postgres (SQLite)** : dans `prisma/schema.prisma`, mettre
`provider = "sqlite"`, retirer la ligne `directUrl`, poser
`DATABASE_URL="file:./dev.db"`, puis `npx prisma db push && npm run db:seed`.

## Structure

```
src/
├── app/
│   ├── layout.tsx            # polices Poppins/Inter + métadonnées
│   ├── page.tsx              # PAGE D'ACCUEIL (assemble les sections)
│   ├── destinations/         # toutes les destinations + promotions
│   ├── book/                 # tunnel de réservation (recherche → passagers → confirmation)
│   ├── check-in/             # web check-in (recherche par référence)
│   └── api/
│       ├── flights/search/   # POST — recherche de vols
│       ├── destinations/     # GET  — destinations phares (prix formatés)
│       ├── promotions/       # GET  — promotions
│       ├── faqs/             # GET  — FAQ
│       └── bookings/         # POST — créer une réservation ; /lookup — check-in
├── components/
│   ├── layout/               # Header, Footer
│   └── sections/             # Hero, FlightSearch, PopularDestinations, Faq,
│                             # Promotions, PrepToTravel, BookingFlow, CheckInForm
└── lib/
    ├── prisma.ts             # client Prisma singleton
    ├── currency.ts           # conversion / formatage des devises
    └── data/                 # requêtes serveur + types partagés
prisma/
├── schema.prisma            # modèle de données
└── seed.ts                  # données extraites du prototype
public/images/               # 3 images extraites du proto + 8 illustrations SVG
```

## Gestion des devises

Le prototype mélangeait CLP (destinations) et USD (promotions). Pour rester
cohérent :

- **En base**, tous les prix sont stockés en **USD, en entiers (cents)**
  (`priceUsdCents`) — aucun flottant, aucune devise figée.
- **À l'affichage**, la conversion se fait via la table `ExchangeRate` :
  - marché chilien → **CLP** (comme le proto pour les destinations),
  - ailleurs → **USD** (comme le proto pour les promotions).
- Helper : `formatPrice(usdCents, currency, rates)` dans `src/lib/currency.ts`.

## Images

- **3 images réelles** extraites du prototype : `logo.png`, `hero-bg.png`,
  `faq-illustration.webp`.
- **8 illustrations SVG** créées pour ce projet (destinations, promotions,
  préparation) — libres de droit, dans le style du site. Elles peuvent être
  remplacées par des photos réelles en changeant simplement l'`imageUrl` dans
  `prisma/seed.ts`.

## Passage en production (PostgreSQL / Supabase)

Le projet Supabase de prod est **`caonabo`**.

1. Dans `prisma/schema.prisma`, mettre :
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")   // décommenter
   }
   ```
2. Renseigner les variables (Supabase → Project Settings → Database) :
   ```
   # connexion POOLÉE (pgBouncer, port 6543) — pour les API serverless Vercel
   DATABASE_URL="postgresql://…@…pooler.supabase.com:6543/postgres?pgbouncer=true"
   # connexion DIRECTE (port 5432) — pour les migrations Prisma
   DIRECT_URL="postgresql://…@…pooler.supabase.com:5432/postgres"
   ```
3. Appliquer le schéma et injecter les données :
   ```bash
   npx prisma db push
   npm run db:seed
   ```

## Déploiement Vercel

- Vercel héberge le **frontend + les API routes** ; la **base reste sur
  Supabase** (Vercel n'héberge pas de PostgreSQL persistant).
- Ajouter `DATABASE_URL` (pooler 6543) et `DIRECT_URL` (5432) dans les variables
  d'environnement du projet Vercel.
- `npm run build` exécute `prisma generate` avant le build Next.js.

## Scripts

| Commande | Rôle |
|----------|------|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production (Prisma generate + Next build) |
| `npm run db:push` | applique le schéma à la base |
| `npm run db:seed` | injecte les données du prototype |
| `npm run db:studio` | ouvre Prisma Studio |
