import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  const amount = cents / 100;
  return (
    new Intl.NumberFormat("fr-TN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount) + " DT"
  );
}
