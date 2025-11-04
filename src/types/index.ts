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
  title: string
  department: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  status: ApprovalStatus
  items: PRItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  serviceTaxRate: number
  serviceTaxAmount: number
  totalAmount: number
  purpose: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
}

export interface POItem {
  unitPrice(unitPrice: any): unknown
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  estimatedPrice: number
  totalPrice: number
  remarks?: string
}

export interface PurchaseOrder {
  description: ReactNode
  id: string
  poNumber: string
  prId: string
  prNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  deliveryDate: string
  status: ApprovalStatus
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
  createdAt: string
  updatedAt: string
  deleted?: boolean
  title?: string
}

export interface DashboardStats {
  totalPRs: number
  totalPOs: number
  pendingApprovals: number
  totalAmount: number
  prByStatus: Record<ApprovalStatus, number>
  poByStatus: Record<ApprovalStatus, number>
}

export interface ProjectSection {
  id: string
  name: "Material" | "Man Power" | "OP" | "IE" | "Supply" | "Engineer"
  budget: number
  spent: number
  progress: number // 0-100
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
  code: ReactNode
  id: string
  projectNumber: string
  name: string
  description: string
  startDate: string
  endDate: string
  status:"in_progress" | "completed"
  totalBudget: number
  totalSpent: number
  overallProgress: number // 0-100, calculated from sections
  sections: ProjectSection[]
  manager: string
  department: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
}
