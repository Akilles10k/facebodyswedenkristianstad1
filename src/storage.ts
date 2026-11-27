export type PaymentChoice = "swish" | "plats";

export type StoredService = {
  id: string;
  name: string;
  minutes: number;
  price: number;
};

export type Booking = {
  id: string;
  createdAt: string;
  services: StoredService[];
  date: string;
  time: string;
  minutes: number;
  total: number;
  name: string;
  email: string;
  phone: string;
  note: string;
  payment: PaymentChoice;
};

const BOOKING_KEY = "fbs-bookings-v1";
const CART_KEY = "fbs-cart-v1";

function canStore(): boolean {
  return typeof localStorage !== "undefined";
}

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<Booking>;
  return (
    typeof booking.id === "string" &&
    typeof booking.date === "string" &&
    typeof booking.time === "string" &&
    typeof booking.name === "string" &&
    Array.isArray(booking.services)
  );
}

export function loadBookings(): Booking[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(BOOKING_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBooking);
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): Booking[] {
  const next = [booking, ...loadBookings()].slice(0, 40);
  if (canStore()) localStorage.setItem(BOOKING_KEY, JSON.stringify(next));
  return next;
}

export function loadCart(): string[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function saveCart(ids: string[]): void {
  if (!canStore()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

export function makeReference(existing: Booking[]): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = new Set(existing.map((booking) => booking.id));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let id = "FB-";
    for (let index = 0; index < 4; index += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!used.has(id)) return id;
  }
  return `FB-${Date.now().toString(36).toUpperCase()}`;
}

export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 80 && /^[\p{L}\s.'-]+$/u.test(trimmed);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("46")) return digits.length >= 10 && digits.length <= 12;
  if (digits.startsWith("0")) return digits.length >= 9 && digits.length <= 11;
  return false;
}
