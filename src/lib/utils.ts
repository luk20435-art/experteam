// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ==================== เงิน ==================== */
export function formatCurrency(amount?: string |number | null | undefined): string {
  const value = Number(amount ?? 0)
  if (isNaN(value)) return "0.00 ฿"

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value)
}

/* ==================== วันที่ ==================== */
function isValidDate(date?: string | null): boolean {
  if (!date || date === "null" || date === "undefined") return false
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

export function formatDate(date?: string | null): string {
  if (!isValidDate(date)) return "-"

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date!))
}

export function formatDateTime(date?: string | null): string {
  if (!isValidDate(date)) return "-"

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date!))
}

/* ==================== สถานะ WR ==================== */
export function getStatusColor(status: string): string {
  switch (status) {
    case "รออนุมัติ":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "อนุมัติแล้ว":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium"
    case "ปฏิเสธ":
      return "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "รออนุมัติ":
      return "รออนุมัติ"
    case "อนุมัติแล้ว":
      return "อนุมัติแล้ว"
    case "ปฏิเสธ":
      return "ปฏิเสธ"
    default:
      return status || "-"
  }
}

/* ==================== อันอื่น ๆ (ถ้ามีเพิ่มในอนาคต) ==================== */
// ตัวอย่างเพิ่มเติมที่คนชอบใช้
export const isEmpty = (value: any): boolean =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)