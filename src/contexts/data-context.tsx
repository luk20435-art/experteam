"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockPRs, mockPOs, mockSuppliers, mockProjects } from "@/src/lib/mock-data"
import type { PurchaseRequisition, PurchaseOrder, Supplier, Project } from "@/src/types"

interface DataContextType {
  prs: PurchaseRequisition[]
  pos: PurchaseOrder[]
  suppliers: Supplier[]
  projects: Project[]
  addPR: (pr: PurchaseRequisition) => void
  updatePR: (id: string, pr: Partial<PurchaseRequisition>) => void
  moveToTrashPR: (id: string) => void
  restorePR: (id: string) => void
  permanentlyDeletePR: (id: string) => void
  getPR: (id: string) => PurchaseRequisition | undefined

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
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [prs, setPRs] = useState<PurchaseRequisition[]>([])
  const [pos, setPOs] = useState<PurchaseOrder[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [suppliers] = useState<Supplier[]>(mockSuppliers)
  const [isLoaded, setIsLoaded] = useState(false)

  // โหลดข้อมูลจาก localStorage (หรือใช้ mock ถ้าไม่มี)
  useEffect(() => {
    if (typeof window === "undefined") return // ป้องกัน SSR error

    try {
      const savedPRs = localStorage.getItem("prs")
      const savedPOs = localStorage.getItem("pos")
      const savedProjects = localStorage.getItem("projects")

      setPRs(savedPRs ? JSON.parse(savedPRs) : mockPRs)
      setPOs(savedPOs ? JSON.parse(savedPOs) : mockPOs)
      setProjects(savedProjects ? JSON.parse(savedProjects) : mockProjects)
    } catch (err) {
      console.error("Error loading from localStorage:", err)
      // ถ้า localStorage พัง ให้ fallback เป็น mock
      setPRs(mockPRs)
      setPOs(mockPOs)
      setProjects(mockProjects)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // === บันทึกข้อมูลกลับเข้า localStorage อัตโนมัติเมื่อมีการเปลี่ยน ===
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

  // === PR ===
  const addPR = (pr: PurchaseRequisition) => setPRs((prev) => [...prev, pr])
  const updatePR = (id: string, updates: Partial<PurchaseRequisition>) => {
    setPRs((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, ...updates, updatedAt: new Date().toISOString() } : pr))
    )
  }
  const moveToTrashPR = (id: string) =>
    setPRs((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, deleted: true, deletedAt: new Date().toISOString() } : pr))
    )
  const restorePR = (id: string) =>
    setPRs((prev) => prev.map((pr) => (pr.id === id ? { ...pr, deleted: false, deletedAt: undefined } : pr)))
  const permanentlyDeletePR = (id: string) => setPRs((prev) => prev.filter((pr) => pr.id !== id))
  const getPR = (id: string) => prs.find((pr) => pr.id === id)

  // === PO ===
  const addPO = (po: PurchaseOrder) => setPOs((prev) => [...prev, po])
  const updatePO = (id: string, updates: Partial<PurchaseOrder>) => {
    setPOs((prev) =>
      prev.map((po) => (po.id === id ? { ...po, ...updates, updatedAt: new Date().toISOString() } : po))
    )
  }
  const moveToTrashPO = (id: string) =>
    setPOs((prev) =>
      prev.map((po) => (po.id === id ? { ...po, deleted: true, deletedAt: new Date().toISOString() } : po))
    )
  const restorePO = (id: string) =>
    setPOs((prev) => prev.map((po) => (po.id === id ? { ...po, deleted: false, deletedAt: undefined } : po)))
  const permanentlyDeletePO = (id: string) => setPOs((prev) => prev.filter((po) => po.id !== id))
  const getPO = (id: string) => pos.find((po) => po.id === id)

  // === Project ===
  const addProject = (project: Project) => setProjects((prev) => [...prev, project])
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) => {
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
  }
  const moveToTrashProject = (id: string) =>
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, deleted: true, deletedAt: new Date().toISOString() } : project
      )
    )
  const restoreProject = (id: string) =>
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, deleted: false, deletedAt: undefined } : project))
    )
  const permanentlyDeleteProject = (id: string) => setProjects((prev) => prev.filter((p) => p.id !== id))
  const getProject = (id: string) => projects.find((project) => project.id === id)

  // แสดง loading สั้น ๆ ก่อน render (ป้องกันจอดำหรือ state เพี้ยน)
  if (!isLoaded) {
    return <div className="p-6 text-gray-500 text-sm">Loading saved data...</div>
  }

  return (
    <DataContext.Provider
      value={{
        prs,
        pos,
        suppliers,
        projects,
        addPR,
        updatePR,
        moveToTrashPR,
        restorePR,
        permanentlyDeletePR,
        getPR,
        addPO,
        updatePO,
        moveToTrashPO,
        restorePO,
        permanentlyDeletePO,
        getPO,
        addProject,
        updateProject,
        moveToTrashProject,
        restoreProject,
        permanentlyDeleteProject,
        getProject,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error("useData must be used within DataProvider")
  return context
}
