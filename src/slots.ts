import { OPENING } from "./data.ts";

export const LEAD_MINUTES = 45;
export const SLOT_STEP = 30;
export const MAX_DAYS_AHEAD = 120;
export const WEEKDAYS = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"] as const;

export type Taken = { time: string; minutes: number };

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  if (dateKey(date) !== key) return null;
  return date;
}

export function toMinutes(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;
  return hours * 60 + minutes;
}

export function fromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function overlaps(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
  if (![aStart, aDur, bStart, bDur].every(Number.isFinite)) return false;
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBookableDay(date: Date, now = new Date()): boolean {
  const day = startOfDay(date).getTime();
  const today = startOfDay(now).getTime();
  const max = startOfDay(now);
  max.setDate(max.getDate() + MAX_DAYS_AHEAD);
  return day >= today && day <= max.getTime();
}

export function slotsForDate(
  date: Date,
  duration: number,
  taken: Taken[],
  now = new Date(),
): string[] {
  if (duration <= 0 || !isBookableDay(date, now)) return [];
  const hours = OPENING[date.getDay()];
  if (!hours) return [];
  const open = toMinutes(hours.start);
  const close = toMinutes(hours.end);
  const leadEdge =
    dateKey(date) === dateKey(now) ? now.getHours() * 60 + now.getMinutes() + LEAD_MINUTES : -1;
  const result: string[] = [];
  for (let start = open; start + duration <= close; start += SLOT_STEP) {
    if (start < leadEdge) continue;
    const blocked = taken.some((item) =>
      overlaps(start, duration, toMinutes(item.time), item.minutes),
    );
    if (!blocked) result.push(fromMinutes(start));
  }
  return result;
}

export function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const pad = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
