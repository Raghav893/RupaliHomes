import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianPrice(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return "Price on Request";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}
