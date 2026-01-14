// src/types/index.ts
import { ReactNode } from "react"

export type ApprovalStatus = "draft" | "submitted"
export type DocumentType = "PR" | "PO"

export interface Supplier {
  id: string
  code: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  taxId: string
  paymentTerms: string
  status: "active" | "inactive"
  createdAt: string
}

export interface PRItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  estimatedPrice: number
  totalPrice: number
  remarks?: string
}

export interface PurchaseRequisition {
  id: string
  prNumber: string
  projectName: string
  projectNumber: string
  department: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  status: string
  items: PRItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  serviceTaxRate: number
  serviceTaxAmount: number
  totalAmount: number
  purpose: string
  duration: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  jobNo: string
  projectNote: string
  trader: string
  ccNo: string
  supplier: string
  deliveryLocation: string
  remark: string
  projectId?: string
  expteamQuotation?: string | number
  estimatedPrCost?: string | number
  jobBalanceCost?: string | number
  traderId?: string
  traderName?: string
  clientId?: string
  supplierName?: string
}

export interface POItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  estimatedPrice: number
  totalPrice: number
  remarks?: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  projectName: string
  department: string
  prId?: string
  prNumber: string
  supplierId: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  orderDate: string
  deliveryDate: string
  items: POItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  serviceTaxRate: number
  serviceTaxAmount: number
  totalAmount: number
  paymentTerms: string
  deliveryAddress: string
  remarks?: string
  status: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
  title?: string
  projectId?: string
  supplier: string
  supplierName: string
  duration?: number
  jobNo?: string
  trader?: string
  traderName?: string
  ccNo?: string
  expteamQuotation?: string | number
  estimatedPrCost?: string | number
  jobBalanceCost?: string | number
  deliveryLocation?: string
  description?: string
  history?: POHIstory[]
  poDate?: string
  remark: string
}

export type POHIstory = {
  by: string
  action: string
  at: string
}

export interface DashboardStats {
  totalPRs: number
  totalPOs: number
  pendingApprovals: number
  totalAmount: number | string
  prByStatus: Record<ApprovalStatus, number>
  poByStatus: Record<ApprovalStatus, number>
}

export interface ProjectSection {
  id: string
  name: "Material" | "Man Power" | "OP" | "IE" | "Supply" | "Engineer"
  budget: number
  spent: number
  progress: number
  items: ProjectSectionItem[]
  remarks?: string
}

export interface ProjectSectionItem {
  id: string
  description: string
  quantity: number
  unit: string
  estimatedCost: number
  actualCost: number
  status: "in_progress" | "completed"
}

export interface Project {
  id: string
  projectNumber: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: "planning" | "in_progress" | "completed"
  totalBudget: number
  totalSpent: number
  overallProgress: number
  sections: ProjectSection[]
  manager: string
  department: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
  code?: string
  duration?: number
  jobNo?: string
  trader?: string
  ccNo?: string
  contactPerson?: string
  contactNumber?: string
  contactEmail?: string
  jobBalanceCost?: string | number
  estimatedPrCost?: string | number
  expteamQuotation?: string | number
  waName?: string
  waNumber?: string
  clientId?: string
  supplier?: string
  supplierName?: string
  paymentTerms?: string
  estimatedCost?: string
  budget?: string | number
  projectName?: string
  traderId?: string
  approvals?: {
    chief: string
    manager: string
    executive: string
  }
  employee: string
  wrPoSrRoNumber: string
}

export interface WRItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  estimatedPrice: number
  totalPrice: number
  remarks?: string
}

export interface WorkRequisition {
  id: string
  wrNumber: string
  projectName: string
  projectNumber: string
  department: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  status: ApprovalStatus
  items: WRItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  serviceTaxRate: number
  serviceTaxAmount: number
  totalAmount: number
  purpose: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  jobNo: string
  projectNote: string
  trader: string
  ccNo: string
  supplier: string
  deliveryLocation: string
  remark: string
  duration: string | number
  projectId?: string
  expteamQuotation?: string | number
  estimatedPrCost?: string | number
  jobBalanceCost?: string | number
  traderId?: string
  traderName?: string
  clientId?: string
  supplierName?: string
}

// สำคัญมาก! แก้ชื่อ type ให้ถูกต้อง และเพิ่มทุก field ที่ใช้ใน Edit WO
// src/types/index.ts (เฉพาะส่วนที่เกี่ยวข้องกับ WO)
export interface WOItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  estimatedPrice: number
  totalPrice: number
  remarks?: string
  woNumber?: string
}

export interface WorkOrder {
  id: string
  orderNumber?: string
  title?: string
  workRequestId?: string
  assignedTo?: number
  status: "ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว" | "In Progress" | "Completed" | "Cancelled"
  totalCost?: number
  createdAt: string
  updatedAt?: string
  items?: WOItem[]
  remarks?: string

  // เพิ่มทุก field ที่ใช้ในหน้า edit
  trader?: string
  traderName?: string
  supplier?: string
  supplierId?: string
  supplierName?: string
  deliveryLocation?: string
  deliveryDate?: string
  paymentTerms?: string
  description?: string
  subtotal?: number
  vatRate?: number
  vatAmount?: number
  serviceTaxRate?: number
  serviceTaxAmount?: number
  totalAmount?: number
  expteamQuotation?: string | number
  estimatedPrCost?: string | number
  jobBalanceCost?: string | number
  projectId?: string
  projectName?: string
  jobNo?: string
  jobNumber?: string
  ccNo?: string
  durationDays?: number
  history?: WOHistory[]
  woNumber?: string | number
  remark: string
  department: string
  prId?: string
  prNumber: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  orderDate: string
  deliveryAddress: string
  deleted?: boolean
  duration?: number
}

export type WOHistory = {
  by: string
  action: string
  at: string
}

export interface Employee {
  id: string
  name: string
  department: string   // เช่น "ฝ่ายการเงิน"
  role?: "chief" | "manager" | "executive" | "requester"
}