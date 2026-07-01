import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(tnd: number): string {
  return (
    new Intl.NumberFormat("fr-TN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(tnd) + " DT"
  );
}
