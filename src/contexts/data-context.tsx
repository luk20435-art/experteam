// src/contexts/data-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { mockPRs, mockPOs, mockSuppliers, mockProjects } from "@/src/lib/mock-data"
import type { PurchaseRequisition, PurchaseOrder, Project } from "@/src/types"

// === Client Type ===
export type Client = {
  id: string
  clientId: string
  name: string
  contactPerson: string
  contactNumber: string
  contactEmail?: string
  address?: string
  status: "active" | "inactive"
  registrationDate: string
}

// === Supplier Type ===
export type Supplier = {
  id: string
  registrationDate: string
  name: string
  group: string
  type: string
  product: string
  address: string
  email: string
  secondaryEmail?: string
  contactNumber: string
  contactPerson: string
  status: "active" | "inactive"
}

// === WR Item & WR Type ===
export interface WRItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  estimatedPrice: number
  totalPrice: number
}

export interface WR {
  id: string
  wrNumber: string
  projectName: string
  department: string
  requestedBy: string
  requestDate: string
  requiredDate: string
  purpose: string
  status: "draft" | "รออนุมัติ" | "อนุมัติแล้ว" 
  jobNumber?: string
  projectNote?: string
  ccNo?: string
  supplier?: string
  supplierName?: string
  deliveryLocation?: string
  remark?: string
  items: WRItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  serviceTaxRate: number
  serviceTaxAmount: number
  totalAmount: number
  projectId?: string
  clientId?: string
  clientName?: string
  createdAt: string
  updatedAt: string
  description: string
  deleted?: boolean
  deletedAt?: string
}

// === WO Type (เพิ่มใหม่) ===
export interface WO {
  id: string
  orderNumber: string
  workRequestId: string
  wrNumber: string
  projectId?: string
  projectName: string
  jobNumber: string
  ccNo: string
  title: string
  assignedTo: number
  totalCost: number
  status: "ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว" | "ดำเนินการ" | "เสร็จสิ้น"
  createdAt: string
  updatedAt: string
  deleted?: boolean
  deletedAt?: string
}

type Trader = { id: string; name: string }

// === DataContextType (เพิ่ม WO) ===
interface DataContextType {
  prs: PurchaseRequisition[]
  pos: PurchaseOrder[]
  suppliers: Supplier[]
  projects: Project[]
  traders: Trader[]
  clients: Client[]
  wrs: WR[]
  wos: WO[]                     // เพิ่ม
  addPR: (pr: PurchaseRequisition) => void
  updatePR: (id: string, pr: Partial<PurchaseRequisition>) => void
  moveToTrashPR: (id: string) => void
  restorePR: (id: string) => void
  permanentlyDeletePR: (id: string) => void
  getPR: (id: string) => PurchaseRequisition | undefined
  approvePR: (id: string) => void
  addPO: (po: PurchaseOrder) => void
  updatePO: (id: string, po: Partial<PurchaseOrder>) => void
  moveToTrashPO: (id: string) => void
  restorePO: (id: string) => void
  permanentlyDeletePO: (id: string) => void
  getPO: (id: string) => PurchaseOrder | undefined
  addProject: (project: Project) => void
  updateProject: (id: string, project: Partial<Project>) => void
  moveToTrashProject: (id: string) => void
  restoreProject: (id: string) => void
  permanentlyDeleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  addWR: (wr: WR) => void
  updateWR: (id: string, updates: Partial<WR>) => void
  deleteWR: (id: string) => void
  getWR: (id: string) => WR | undefined
  // WO Functions
  addWO: (wo: WO) => void
  updateWO: (id: string, updates: Partial<WO>) => void
  moveToTrashWO: (id: string) => void
  restoreWO: (id: string) => void
  permanentlyDeleteWO: (id: string) => void
  getWO: (id: string) => WO | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [prs, setPRs] = useState<PurchaseRequisition[]>([])
  const [pos, setPOs] = useState<PurchaseOrder[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [traders, setTraders] = useState<Trader[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [wrs, setWRs] = useState<WR[]>([])
  const [wos, setWOs] = useState<WO[]>([])  // เพิ่ม
  const [isLoaded, setIsLoaded] = useState(false)

  // === โหลดข้อมูลจาก localStorage ===
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const savedPRs = localStorage.getItem("prs")
      const savedPOs = localStorage.getItem("pos")
      const savedProjects = localStorage.getItem("projects")
      const savedClients = localStorage.getItem("clients")
      const savedTraders = localStorage.getItem("traders")
      const savedSuppliers = localStorage.getItem("suppliers")
      const savedWRs = localStorage.getItem("work-requests")
      const savedWOs = localStorage.getItem("work-orders")  // เพิ่ม

      setPRs(savedPRs ? JSON.parse(savedPRs) : mockPRs)
      setPOs(savedPOs ? JSON.parse(savedPOs) : mockPOs)
      setProjects(savedProjects ? JSON.parse(savedProjects) : mockProjects)
      setClients(savedClients ? JSON.parse(savedClients) : [])
      setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : mockSuppliers)
      setWRs(savedWRs ? JSON.parse(savedWRs) : [])
      setWOs(savedWOs ? JSON.parse(savedWOs) : [])  // โหลด WO

      if (savedTraders) {
        setTraders(JSON.parse(savedTraders))
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setPRs(mockPRs)
      setPOs(mockPOs)
      setProjects(mockProjects)
      setClients([])
      setSuppliers(mockSuppliers)
      setWRs([])
      setWOs([])  // fallback
      setTraders([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // === บันทึกอัตโนมัติ ===
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("prs", JSON.stringify(prs))
  }, [prs, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("pos", JSON.stringify(pos))
  }, [pos, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("clients", JSON.stringify(clients))
  }, [clients, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("suppliers", JSON.stringify(suppliers))
  }, [suppliers, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("work-requests", JSON.stringify(wrs))
  }, [wrs, isLoaded])

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem("work-orders", JSON.stringify(wos))  // บันทึก WO
  }, [wos, isLoaded])

  // === Supplier Functions ===
  const addSupplier = useCallback((supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier])
  }, [])

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }, [])

  // === Client Functions ===
  const addClient = useCallback((client: Client) => {
    setClients(prev => [...prev, client])
  }, [])

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
  }, [])

  // === PR Functions ===
  const addPR = useCallback((pr: PurchaseRequisition) => {
    setPRs(prev => [...prev, pr])
  }, [])

  const updatePR = useCallback((id: string, updates: Partial<PurchaseRequisition>) => {
    setPRs(prev =>
      prev.map(pr => pr.id === id ? { ...pr, ...updates, updatedAt: new Date().toISOString() } : pr)
    )
  }, [])

  const moveToTrashPR = useCallback((id: string) => {
    setPRs(prev => prev.map(pr => pr.id === id ? { ...pr, deleted: true, deletedAt: new Date().toISOString() } : pr))
  }, [])

  const restorePR = useCallback((id: string) => {
    setPRs(prev => prev.map(pr => pr.id === id ? { ...pr, deleted: false, deletedAt: undefined } : pr))
  }, [])

  const permanentlyDeletePR = useCallback((id: string) => {
    setPRs(prev => prev.filter(pr => pr.id !== id))
  }, [])

  const getPR = useCallback((id: string) => prs.find(pr => pr.id === id), [prs])

  const approvePR = useCallback((id: string) => {
    setPRs(prev =>
      prev.map(pr =>
        pr.id === id ? { ...pr, status: "อนุมัติแล้ว", approvedAt: new Date().toISOString() } : pr
      )
    )
  }, [])

  // === PO Functions ===
  const addPO = useCallback((po: PurchaseOrder) => {
    setPOs(prev => [...prev, po])
  }, [])

  const updatePO = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
    setPOs(prev =>
      prev.map(po => po.id === id ? { ...po, ...updates, updatedAt: new Date().toISOString() } : po)
    )
  }, [])

  const moveToTrashPO = useCallback((id: string) => {
    setPOs(prev => prev.map(po => po.id === id ? { ...po, deleted: true, deletedAt: new Date().toISOString() } : po))
  }, [])

  const restorePO = useCallback((id: string) => {
    setPOs(prev => prev.map(po => po.id === id ? { ...po, deleted: false, deletedAt: undefined } : po))
  }, [])

  const permanentlyDeletePO = useCallback((id: string) => {
    setPOs(prev => prev.filter(po => po.id !== id))
  }, [])

  const getPO = useCallback((id: string) => pos.find(po => po.id === id), [pos])

  // === Project Functions ===
  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project])
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === id) {
          const updated = { ...project, ...updates, updatedAt: new Date().toISOString() }
          if (updated.sections) {
            const totalProgress = updated.sections.reduce((sum, s) => sum + (s.progress || 0), 0)
            updated.overallProgress = Math.round(totalProgress / updated.sections.length)
          }
          return updated
        }
        return project
      })
    )
  }, [])

  const moveToTrashProject = useCallback((id: string) => {
    setProjects(prev =>
      prev.map(project => project.id === id ? { ...project, deleted: true, deletedAt: new Date().toISOString() } : project)
    )
  }, [])

  const restoreProject = useCallback((id: string) => {
    setProjects(prev =>
      prev.map(project => project.id === id ? { ...project, deleted: false, deletedAt: undefined } : project)
    )
  }, [])

  const permanentlyDeleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const getProject = useCallback((id: string) => projects.find(p => p.id === id), [projects])

  // === WR Functions ===
  const addWR = useCallback((wr: WR) => {
    setWRs(prev => [...prev, wr])
  }, [])

  const updateWR = useCallback((id: string, updates: Partial<WR>) => {
    setWRs(prev =>
      prev.map(wr => wr.id === id ? { ...wr, ...updates, updatedAt: new Date().toISOString() } : wr)
    )
  }, [])

  const deleteWR = useCallback((id: string) => {
    setWRs(prev => prev.filter(wr => wr.id !== id))
  }, [])

  const getWR = useCallback((id: string) => wrs.find(wr => wr.id === id), [wrs])

  // === WO Functions (เพิ่มใหม่) ===
  const addWO = useCallback((wo: WO) => {
    setWOs(prev => [...prev, wo])
  }, [])

  const updateWO = useCallback((id: string, updates: Partial<WO>) => {
    setWOs(prev =>
      prev.map(wo => wo.id === id ? { ...wo, ...updates, updatedAt: new Date().toISOString() } : wo)
    )
  }, [])

  const moveToTrashWO = useCallback((id: string) => {
    setWOs(prev => prev.map(wo => wo.id === id ? { ...wo, deleted: true, deletedAt: new Date().toISOString() } : wo))
  }, [])

  const restoreWO = useCallback((id: string) => {
    setWOs(prev => prev.map(wo => wo.id === id ? { ...wo, deleted: false, deletedAt: undefined } : wo))
  }, [])

  const permanentlyDeleteWO = useCallback((id: string) => {
    setWOs(prev => prev.filter(wo => wo.id !== id))
  }, [])

  const getWO = useCallback((id: string) => wos.find(wo => wo.id === id), [wos])

  // === ค่าที่ส่งให้ Context ===
  const value = useMemo(() => ({
    prs, pos, projects, traders, clients, suppliers, wrs, wos,
    addPR, updatePR, moveToTrashPR, restorePR, permanentlyDeletePR, getPR, approvePR,
    addPO, updatePO, moveToTrashPO, restorePO, permanentlyDeletePO, getPO,
    addProject, updateProject, moveToTrashProject, restoreProject, permanentlyDeleteProject, getProject,
    addClient, updateClient, deleteClient,
    addSupplier, updateSupplier, deleteSupplier,
    addWR, updateWR, deleteWR, getWR,
    addWO, updateWO, moveToTrashWO, restoreWO, permanentlyDeleteWO, getWO
  }), [
    prs, pos, projects, traders, clients, suppliers, wrs, wos,
    addPR, updatePR, moveToTrashPR, restorePR, permanentlyDeletePR, getPR, approvePR,
    addPO, updatePO, moveToTrashPO, restorePO, permanentlyDeletePO, getPO,
    addProject, updateProject, moveToTrashProject, restoreProject, permanentlyDeleteProject, getProject,
    addClient, updateClient, deleteClient,
    addSupplier, updateSupplier, deleteSupplier,
    addWR, updateWR, deleteWR, getWR,
    addWO, updateWO, moveToTrashWO, restoreWO, permanentlyDeleteWO, getWO
  ])

  if (!isLoaded) {
    return <div className="p-6 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error("useData must be used within DataProvider")
  return context
}