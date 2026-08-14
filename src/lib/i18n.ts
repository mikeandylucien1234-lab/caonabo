// ─────────────────────────────────────────────────────────────────────────────
// Internationalisation (i18n) — 4 langues : français, anglais, espagnol, créole.
// Les chaînes de l'interface (« ossature » du site) sont traduites ici.
// La préférence est stockée dans un cookie et lue côté serveur.
// ─────────────────────────────────────────────────────────────────────────────

export const LOCALES = ["fr", "en", "es", "ht"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ht: "Kreyòl",
};
export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  ht: "🇭🇹",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

export interface Dict {
  nav: { home: string; destinations: string; checkin: string; book: string; contact: string };
  login: string;
  hero: { badge: string; title1: string; hi1: string; title2: string; hi2: string; subtitle: string };
  flightSearch: { title: string; search: string };
  dest: { badge: string; titleA: string; hi: string; subtitle: string; cta: string; from: string; direct: string };
  footer: { tagline: string; rights: string; columns: Record<string, string>; links: Record<string, string> };
}

const fr: Dict = {
  nav: { home: "Accueil", destinations: "Destinations", checkin: "Check In", book: "Réserver", contact: "Contact" },
  login: "Se connecter",
  hero: { badge: "✈ VOLS DIRECTS & AVEC ESCALE", title1: "Voyagez ", hi1: "Plus Loin", title2: ", Vivez ", hi2: "Plus Fort", subtitle: "Vols vers Haïti, le Chili, le Canada et le Pérou." },
  flightSearch: { title: "Trouvez un vol à votre mesure", search: "Rechercher" },
  dest: { badge: "✈ NOS DESTINATIONS PHARES", titleA: "Explorez nos destinations les plus", hi: "populaires", subtitle: "Des villes vibrantes aux lieux chargés d'histoire, voyagez en toute sérénité avec Caonabo Airlinje.", cta: "📍 Voir toutes les destinations →", from: "À partir de", direct: "Vol direct" },
  footer: {
    tagline: "Compagnie aérienne de la diaspora haïtienne.",
    rights: "Tous droits réservés.",
    columns: { about: "À Propos", support: "Support & Contact", booking: "Réservation & Voyage", info: "Informations & Services", legal: "Informations Légales" },
    links: {
      "Notre Histoire": "Notre Histoire", "Contactez-nous": "Contactez-nous", "Voyages de Groupe": "Voyages de Groupe",
      Destinations: "Destinations", "Notre Flotte": "Notre Flotte", "Informations Check-In": "Informations Check-In",
      "Politique de Bagages": "Politique de Bagages", "Informations Aéroport": "Informations Aéroport",
      "Courrier et Cargo": "Courrier et Cargo", "Explorer les Caraïbes": "Explorer les Caraïbes",
      "Conditions Générales": "Conditions Générales", "Conditions de Transport": "Conditions de Transport",
      "Moyens de Paiement": "Moyens de Paiement", "Politique de Confidentialité": "Politique de Confidentialité",
    },
  },
};

const en: Dict = {
  nav: { home: "Home", destinations: "Destinations", checkin: "Check In", book: "Book", contact: "Contact" },
  login: "Sign in",
  hero: { badge: "✈ DIRECT & CONNECTING FLIGHTS", title1: "Travel ", hi1: "Farther", title2: ", Live ", hi2: "Stronger", subtitle: "Flights to Haiti, Chile, Canada and Peru." },
  flightSearch: { title: "Find a flight that fits you", search: "Search" },
  dest: { badge: "✈ OUR FLAGSHIP DESTINATIONS", titleA: "Explore our most", hi: "popular destinations", subtitle: "From vibrant cities to places steeped in history, travel with peace of mind with Caonabo Airlinje.", cta: "📍 See all destinations →", from: "From", direct: "Direct flight" },
  footer: {
    tagline: "The airline of the Haitian diaspora.",
    rights: "All rights reserved.",
    columns: { about: "About", support: "Support & Contact", booking: "Booking & Travel", info: "Information & Services", legal: "Legal" },
    links: {
      "Notre Histoire": "Our Story", "Contactez-nous": "Contact Us", "Voyages de Groupe": "Group Travel",
      Destinations: "Destinations", "Notre Flotte": "Our Fleet", "Informations Check-In": "Check-In Info",
      "Politique de Bagages": "Baggage Policy", "Informations Aéroport": "Airport Info",
      "Courrier et Cargo": "Mail & Cargo", "Explorer les Caraïbes": "Explore the Caribbean",
      "Conditions Générales": "Terms & Conditions", "Conditions de Transport": "Conditions of Carriage",
      "Moyens de Paiement": "Payment Methods", "Politique de Confidentialité": "Privacy Policy",
    },
  },
};

const es: Dict = {
  nav: { home: "Inicio", destinations: "Destinos", checkin: "Check In", book: "Reservar", contact: "Contacto" },
  login: "Iniciar sesión",
  hero: { badge: "✈ VUELOS DIRECTOS Y CON ESCALA", title1: "Viaja ", hi1: "Más Lejos", title2: ", Vive ", hi2: "Más Fuerte", subtitle: "Vuelos a Haití, Chile, Canadá y Perú." },
  flightSearch: { title: "Encuentra un vuelo a tu medida", search: "Buscar" },
  dest: { badge: "✈ NUESTROS DESTINOS ESTRELLA", titleA: "Explora nuestros destinos más", hi: "populares", subtitle: "De ciudades vibrantes a lugares llenos de historia, viaja con total tranquilidad con Caonabo Airlinje.", cta: "📍 Ver todos los destinos →", from: "Desde", direct: "Vuelo directo" },
  footer: {
    tagline: "La aerolínea de la diáspora haitiana.",
    rights: "Todos los derechos reservados.",
    columns: { about: "Acerca de", support: "Soporte y Contacto", booking: "Reserva y Viaje", info: "Información y Servicios", legal: "Información Legal" },
    links: {
      "Notre Histoire": "Nuestra Historia", "Contactez-nous": "Contáctanos", "Voyages de Groupe": "Viajes en Grupo",
      Destinations: "Destinos", "Notre Flotte": "Nuestra Flota", "Informations Check-In": "Información Check-In",
      "Politique de Bagages": "Política de Equipaje", "Informations Aéroport": "Información del Aeropuerto",
      "Courrier et Cargo": "Correo y Carga", "Explorer les Caraïbes": "Explorar el Caribe",
      "Conditions Générales": "Términos y Condiciones", "Conditions de Transport": "Condiciones de Transporte",
      "Moyens de Paiement": "Métodos de Pago", "Politique de Confidentialité": "Política de Privacidad",
    },
  },
};

const ht: Dict = {
  nav: { home: "Akèy", destinations: "Destinasyon", checkin: "Check In", book: "Rezève", contact: "Kontak" },
  login: "Konekte",
  hero: { badge: "✈ VÒL DIRÈK & AK ESKAL", title1: "Vwayaje ", hi1: "Pi Lwen", title2: ", Viv ", hi2: "Pi Fò", subtitle: "Vòl pou Ayiti, Chili, Kanada ak Perou." },
  flightSearch: { title: "Jwenn yon vòl ki fèt pou ou", search: "Chèche" },
  dest: { badge: "✈ PI BÈL DESTINASYON NOU YO", titleA: "Eksplore destinasyon ki pi", hi: "popilè yo", subtitle: "Depi vil ki gen anpil vi rive kote ki chaje ak istwa, vwayaje an tout trankilite ak Caonabo Airlinje.", cta: "📍 Wè tout destinasyon yo →", from: "Apati", direct: "Vòl dirèk" },
  footer: {
    tagline: "Konpayi avyon dyaspora ayisyen an.",
    rights: "Tout dwa rezève.",
    columns: { about: "Konsènan", support: "Sipò & Kontak", booking: "Rezèvasyon & Vwayaj", info: "Enfòmasyon & Sèvis", legal: "Enfòmasyon Legal" },
    links: {
      "Notre Histoire": "Istwa Nou", "Contactez-nous": "Kontakte Nou", "Voyages de Groupe": "Vwayaj an Gwoup",
      Destinations: "Destinasyon", "Notre Flotte": "Flòt Nou", "Informations Check-In": "Enfòmasyon Check-In",
      "Politique de Bagages": "Règ sou Bagaj", "Informations Aéroport": "Enfòmasyon Ayewopò",
      "Courrier et Cargo": "Kourye & Kago", "Explorer les Caraïbes": "Eksplore Karayib la",
      "Conditions Générales": "Kondisyon Jeneral", "Conditions de Transport": "Kondisyon Transpò",
      "Moyens de Paiement": "Mwayen Peman", "Politique de Confidentialité": "Politik Konfidansyalite",
    },
  },
};

export const dictionaries: Record<Locale, Dict> = { fr, en, es, ht };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? fr;
}
