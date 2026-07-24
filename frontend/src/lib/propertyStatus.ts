import { PropertyStatus } from "@/types";

export function getPropertyStatusStyles(status: PropertyStatus | string) {
  const normalized = String(status).toUpperCase();

  switch (normalized) {
    case PropertyStatus.SOLD:
      return { dot: "bg-red-500", text: "text-red-600" };
    case PropertyStatus.RENTED:
      return { dot: "bg-orange-500", text: "text-orange-600" };
    case PropertyStatus.HIDDEN:
      return { dot: "bg-gray-400", text: "text-gray-600" };
    default:
      return { dot: "bg-green-500", text: "text-green-600" };
  }
}
