import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte estados con guiones bajos a formato legible
 * EN_CAMINO → En camino
 * EN_PROCESO → En proceso
 * FINALIZADO → Finalizado
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDIENTE: "Pendiente",
    ACEPTADO: "Aceptado",
    EN_CAMINO: "En camino",
    EN_PROCESO: "En proceso",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };
  return statusMap[status] || status;
}
