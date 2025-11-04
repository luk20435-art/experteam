import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    draft: "bg-warning text-white",
    pending: "bg-warning/10 text-warning",
    level1_approved: "bg-primary/10 text-primary",
    level2_approved: "bg-primary/20 text-primary",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    active: "bg-success/10 text-success",
    inactive: "bg-muted text-muted-foreground",
    submitted: "bg-success text-white",
  }
  return statusColors[status] || "bg-muted text-muted-foreground"
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    draft: "ฉบับร่าง",
    pending: "รออนุมัติ",
    level1_approved: "อนุมัติระดับ 1",
    level2_approved: "อนุมัติระดับ 2",
    approved: "อนุมัติแล้ว",
    rejected: "ไม่อนุมัติ",
    active: "ใช้งาน",
    inactive: "ไม่ใช้งาน",
    submitted: "submitted",
  }
  return statusLabels[status] || status
}
