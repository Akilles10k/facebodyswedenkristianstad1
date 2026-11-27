export type CategoryId =
  | "leende"
  | "injektion"
  | "laser"
  | "massage"
  | "hud"
  | "piercing"
  | "ovrigt";

export type Service = {
  id: string;
  category: CategoryId;
  name: string;
  minutes: number;
  price: number;
};

export type Category = {
  id: CategoryId;
  label: string;
  intro: string;
};

/** Sunday = 0. Hours from the clinic's Bokadirekt page. */
export const OPENING: Record<number, { start: string; end: string }> = {
  0: { start: "12:00", end: "16:00" },
  1: { start: "10:00", end: "19:00" },
  2: { start: "10:00", end: "19:00" },
  3: { start: "10:00", end: "19:00" },
  4: { start: "10:00", end: "19:00" },
  5: { start: "10:00", end: "19:00" },
  6: { start: "12:00", end: "16:00" },
};

export const HOURS_SUMMARY = [
  ["Måndag – fredag", "10–19"],
  ["Lördag – söndag", "12–16"],
] as const;

export const SITE = {
  name: "Face & Body Sweden",
  phone: "076-226 54 76",
  phoneHref: "tel:+46762265476",
  email: "info@facebodysweden.se",
  emailHref: "mailto:info@facebodysweden.se",
  instagram: "@face_and_body_sweden",
  instagramHref: "https://instagram.com/face_and_body_sweden",
  facebookHref: "https://www.facebook.com/100063610621067",
  bokadirektHref: "https://www.bokadirekt.se/places/face-body-sweden-32402",
  address: "Stridsvagnsvägen 10A",
  postal: "291 39 Kristianstad",
  mapHref: "https://maps.google.com/?q=Stridsvagnsv%C3%A4gen%2010A%2C%20291%2039%20Kristianstad",
};

export type HeroSlide = {
  id: string;
  image?: string;
  alt?: string;
  position?: string;
  tone: "light" | "dark";
  kicker: string;
  title: string;
  emphasis?: string;
  text: string;
};

/**
 * Swap `image` for the clinic's own files in public/hero.
 * Facebook links are not direct image files, so the first prototype
 * uses stills plus the clinic's own campaign lines.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "valkommen",
    image: "/hero/klinik.jpg",
    alt: "Ljust stilleben med handduk, flaska och tulpaner.",
    position: "center 70%",
    tone: "light",
    kicker: "Kristianstad",
    title: "Ansikte, kropp",
    emphasis: "och leende.",
    text: "Kliniken vid Högskolan. Boka tid och betala med Swish eller på plats.",
  },
  {
    id: "tandsmycke",
    tone: "dark",
    kicker: "Tandsmycke",
    title: "Ge ditt leende",
    emphasis: "en extra glans.",
    text: "En liten detalj som gör stor skillnad. Tandblekning och tandsmycke, 1 490 kr.",
  },
  {
    id: "hud",
    image: "/hero/ansikte.jpg",
    alt: "Ansiktsbehandling där en mask penslas på i ett ljust rum.",
    position: "center 40%",
    tone: "dark",
    kicker: "Hud",
    title: "Huden,",
    emphasis: "i lugn takt.",
    text: "Peeling, microneedling och Hollywoodbehandling. Legitimerad personal.",
  },
  {
    id: "kropp",
    image: "/hero/massage.jpg",
    alt: "Massage med olja i ett lugnt behandlingsrum.",
    position: "center 65%",
    tone: "dark",
    kicker: "Kropp",
    title: "En stund",
    emphasis: "för kroppen.",
    text: "Klassisk massage och avslappning. Friskvård via Epassi går bra.",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "leende",
    label: "Leende",
    intro: "Tandblekning med ledljus tar cirka 40 minuter. På fastsättning av tandsmycke lämnas en månads garanti.",
  },
  {
    id: "injektion",
    label: "Injektion",
    intro: "Konsultation minst 48 timmar innan om det gått mer än sex månader. 18 år. Utebliven konsultation debiteras 300 kr.",
  },
  {
    id: "laser",
    label: "Laser",
    intro: "Permanent hårborttagning med Soprano Ice Titanium. Flera besök behövs. Klippkort finns i kliniken.",
  },
  {
    id: "massage",
    label: "Massage",
    intro: "Friskvård och Epassi. Massage hemma hos dig bokas via telefon på 076-226 54 76.",
  },
  {
    id: "hud",
    label: "Hud",
    intro: "Peeling, microneedling, plasma och Hollywoodbehandling.",
  },
  {
    id: "piercing",
    label: "Håltagning",
    intro: "Öron och näsa med Shine-system.",
  },
  {
    id: "ovrigt",
    label: "Övrigt",
    intro: "Spraytan, hudförändringar och tatueringsborttagning med picolaser. Rådgivning ges inför besöket.",
  },
];

export const SERVICES: Service[] = [
  { id: "tandsmycke-diamant", category: "leende", name: "Tandsmycke, diamant", minutes: 20, price: 149 },
  { id: "tandsmycke-fast", category: "leende", name: "Tandsmycke med fastsättning", minutes: 30, price: 595 },
  { id: "tandsmycke-medtaget", category: "leende", name: "Fastsättning av medtaget tandsmycke", minutes: 30, price: 495 },
  { id: "tandblekning", category: "leende", name: "Tandblekning", minutes: 40, price: 1099 },
  { id: "paket-leende", category: "leende", name: "Tandblekning + tandsmycke", minutes: 60, price: 1490 },

  { id: "konsultation", category: "injektion", name: "Konsultation botox eller fillers", minutes: 20, price: 0 },
  { id: "botox-1", category: "injektion", name: "Botox, 1 område", minutes: 30, price: 2100 },
  { id: "botox-2", category: "injektion", name: "Botox, 2 områden", minutes: 30, price: 3200 },
  { id: "botox-3", category: "injektion", name: "Botox, 3 områden", minutes: 40, price: 3900 },
  { id: "botox-lipflip", category: "injektion", name: "Botox lipflip", minutes: 30, price: 1000 },
  { id: "botox-bryn", category: "injektion", name: "Botox ögonbrynslyft", minutes: 30, price: 1595 },
  { id: "botox-haka", category: "injektion", name: "Botox apelsinhaka", minutes: 30, price: 1195 },
  { id: "fillers-revolax-lappar", category: "injektion", name: "Fillers läppar, Revolax 1 ml", minutes: 40, price: 2000 },
  { id: "fillers-stylage-lappar", category: "injektion", name: "Fillers läppar, Stylage 1 ml", minutes: 40, price: 2400 },
  { id: "fillers-kindben", category: "injektion", name: "Fillers kindben, Stylage 1 ml", minutes: 40, price: 2600 },
  { id: "fillers-kaklinje", category: "injektion", name: "Fillers käklinje, Stylage 1 ml", minutes: 60, price: 2600 },
  { id: "fillers-revolax-kontur", category: "injektion", name: "Fillers kontur, Revolax 1 ml", minutes: 40, price: 2300 },
  { id: "profhilo", category: "injektion", name: "Profhilo", minutes: 45, price: 3000 },
  { id: "hyalase-liten", category: "injektion", name: "Hyalase, mindre område", minutes: 30, price: 1595 },
  { id: "hyalase-stor", category: "injektion", name: "Hyalase, större område", minutes: 45, price: 2900 },

  { id: "laser-haka", category: "laser", name: "Haka", minutes: 20, price: 200 },
  { id: "laser-overlapp", category: "laser", name: "Överläpp", minutes: 20, price: 200 },
  { id: "laser-haka-overlapp", category: "laser", name: "Haka + överläpp", minutes: 30, price: 300 },
  { id: "laser-nacke", category: "laser", name: "Nacke", minutes: 20, price: 349 },
  { id: "laser-hals", category: "laser", name: "Hals", minutes: 20, price: 400 },
  { id: "laser-ansikte", category: "laser", name: "Ansikte", minutes: 30, price: 500 },
  { id: "laser-ansikte-hals", category: "laser", name: "Ansikte + hals", minutes: 40, price: 690 },
  { id: "laser-armhalor", category: "laser", name: "Armhålor", minutes: 30, price: 450 },
  { id: "laser-underarm", category: "laser", name: "Underarm", minutes: 30, price: 600 },
  { id: "laser-overarm", category: "laser", name: "Överarm", minutes: 30, price: 500 },
  { id: "laser-armar", category: "laser", name: "Hela armar", minutes: 40, price: 899 },
  { id: "laser-bikini", category: "laser", name: "Bikinilinje", minutes: 30, price: 549 },
  { id: "laser-brazilian", category: "laser", name: "Brazilian", minutes: 30, price: 649 },
  { id: "laser-mage", category: "laser", name: "Mage", minutes: 20, price: 699 },
  { id: "laser-brost", category: "laser", name: "Bröst", minutes: 30, price: 499 },
  { id: "laser-brost-mage", category: "laser", name: "Bröst + mage", minutes: 40, price: 1000 },
  { id: "laser-lar", category: "laser", name: "Lår", minutes: 40, price: 899 },
  { id: "laser-ben", category: "laser", name: "Ben utan lår", minutes: 45, price: 799 },
  { id: "laser-ben-lar", category: "laser", name: "Ben + lår", minutes: 60, price: 1099 },
  { id: "laser-rygg", category: "laser", name: "Rygg", minutes: 30, price: 1500 },
  { id: "laser-rumpa", category: "laser", name: "Rumpa", minutes: 30, price: 500 },
  { id: "laser-fingrar", category: "laser", name: "Fingrar eller tår", minutes: 20, price: 450 },

  { id: "massage-30", category: "massage", name: "Klassisk massage 30 min", minutes: 30, price: 490 },
  { id: "massage-45", category: "massage", name: "Klassisk massage 45 min", minutes: 45, price: 590 },
  { id: "massage-60", category: "massage", name: "Klassisk massage 60 min", minutes: 60, price: 750 },
  { id: "massage-90", category: "massage", name: "Klassisk massage 90 min", minutes: 90, price: 990 },
  { id: "avslappning-60", category: "massage", name: "Avslappningsmassage 60 min", minutes: 60, price: 650 },
  { id: "avslappning-90", category: "massage", name: "Avslappningsmassage 90 min", minutes: 90, price: 900 },
  { id: "massage-hart", category: "massage", name: "Massage med hårt tryck", minutes: 60, price: 990 },

  { id: "microneedling", category: "hud", name: "Microneedling", minutes: 60, price: 1200 },
  { id: "kemisk-peeling", category: "hud", name: "Kemisk peeling", minutes: 50, price: 960 },
  { id: "carbon-ansikte", category: "hud", name: "Carbon peeling, ansikte", minutes: 30, price: 790 },
  { id: "carbon-hals", category: "hud", name: "Carbon peeling, hals", minutes: 25, price: 590 },
  { id: "carbon-ansikte-hals", category: "hud", name: "Carbon peeling, ansikte och hals", minutes: 40, price: 1190 },
  { id: "carbon-dekolletage", category: "hud", name: "Carbon peeling, ansikte, hals och dekolletage", minutes: 50, price: 1490 },
  { id: "plasma-ogon", category: "hud", name: "Plasma pen, ögonlockslyft", minutes: 60, price: 2000 },
  { id: "plasma-ogon-under", category: "hud", name: "Plasma pen, ögonlock och under ögonen", minutes: 80, price: 3000 },
  { id: "plasma-hals", category: "hud", name: "Plasma pen, hals", minutes: 60, price: 2500 },

  { id: "oron-1", category: "piercing", name: "Öron, 1 hål", minutes: 15, price: 199 },
  { id: "oron-2", category: "piercing", name: "Öron, 2 hål", minutes: 20, price: 299 },
  { id: "oron-brosk", category: "piercing", name: "Öron brosk, 1 hål", minutes: 20, price: 245 },
  { id: "oron-brosk-2", category: "piercing", name: "Öron brosk, 2 hål", minutes: 25, price: 395 },
  { id: "nasa", category: "piercing", name: "Näsa", minutes: 20, price: 395 },

  { id: "spraytan", category: "ovrigt", name: "Spraytan", minutes: 20, price: 690 },
  { id: "spraytan-duo", category: "ovrigt", name: "Spraytan duo", minutes: 30, price: 1000 },
  { id: "hudforandring", category: "ovrigt", name: "Borttagning av hudförändring", minutes: 30, price: 900 },
  { id: "tatuering-liten", category: "ovrigt", name: "Tatueringsborttagning, upp till 2×5 cm", minutes: 25, price: 499 },
  { id: "tatuering-mellan", category: "ovrigt", name: "Tatueringsborttagning, upp till 5×5 cm", minutes: 30, price: 699 },
  { id: "tatuering-stor", category: "ovrigt", name: "Tatueringsborttagning, upp till 10×10 cm", minutes: 25, price: 1099 },
];

export const FEATURED = ["paket-leende", "botox-1", "massage-60"] as const;

export function serviceById(id: string): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}
