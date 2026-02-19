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
// Iconos estandarizados para acciones
export const ActionIcons = {
  EDIT: "✏️",
  DELETE: "🗑️",
  SAVE: "✓",
  CANCEL: "✕",
  ACTIVE: "◉",
  INACTIVE: "◯",
  VIEW: "👁️",
  ADD: "➕",
  CLOSE: "✕",
  CHECK: "✓",
  X: "✕",
  PHONE: "📞",
  EMAIL: "✉️",
  LOCATION: "📍",
  CALENDAR: "📅",
  CLOCK: "🕐",
  STATUS_PENDING: "⏳",
  STATUS_ACTIVE: "✓",
  STATUS_INACTIVE: "✕",
  STAR: "⭐",
  DOWNLOAD: "⬇️",
  UPLOAD: "⬆️",
  SEARCH: "🔍",
  FILTER: "🔍",
  SORT: "⇅",
} as const;

// Clases de estilos para botones de ícono
export const ActionButtonStyles = {
  EDIT: "bg-blue-500/30 text-blue-300 hover:bg-blue-500/50",
  DELETE: "bg-red-500/30 text-red-300 hover:bg-red-500/50",
  SAVE: "bg-green-600 text-white hover:bg-green-700",
  CANCEL: "bg-white/10 text-white hover:bg-white/20",
  ACTIVE: "bg-white/10 text-white hover:bg-white/20",
  INACTIVE: "bg-orange-500/30 text-orange-300 hover:bg-orange-500/50",
  VIEW: "bg-blue-500/30 text-blue-300 hover:bg-blue-500/50",
  DEFAULT: "bg-white/10 text-white hover:bg-white/20",
} as const;