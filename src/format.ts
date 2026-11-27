import type { Service } from "./data.ts";

export function formatPrice(value: number): string {
  if (value === 0) return "Kostnadsfri";
  return `${new Intl.NumberFormat("sv-SE").format(value)} kr`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourLabel = hours === 1 ? "1 timme" : `${hours} timmar`;
  if (rest === 0) return hourLabel;
  return `${hours} tim ${rest} min`;
}

export function sumPrice(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.price, 0);
}

export function sumMinutes(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.minutes, 0);
}

export function formatDay(date: Date): string {
  const label = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMonth(date: Date): string {
  const label = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
