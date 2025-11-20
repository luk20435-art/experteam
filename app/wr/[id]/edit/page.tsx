// app/wr/[id]/edit/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, CreditCard, Building2, Briefcase, Check, ChevronsUpDown, ArrowLeft, Loader } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import type { WRItem, Project } from "@/src/types"  // ใช้ type จาก types
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDepartments } from '@/lib/storage'
import { Department } from "@/app/lib/types"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "work-requests"

// ลบ interface WRItem ทิ้งทั้งหมด เพราะซ้ำกับ import
// interface WRItem { ... }  <-- ลบออก

export default function EditWRPage() {
  const router = useRouter()
  const params = useParams()
  const wrId = params?.id as string
  const { updateWR, wrs = [], projects = [], clients = [], suppliers = [] } = useData() || {}
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("none")
  const [isCalculatingFromDates, setIsCalculatingFromDates] = useState(false)
  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">("ร่าง")

  const [formData, setFormData] = useState({
    projectName: "",
    department: "",
    client: "",
    clientName: "",
    supplier: "",
    supplierName: "",
    requestedBy: "",
    requestDate: new Date().toISOString().split("T")[0],
    requiredDate: "",
    duration: "",
    jobNumber: "",
    projectNote: "",
    ccNo: "",
    remark: "",
    deliveryLocation: "",
    expteamQuotation: "",
    estimatedPrCost: "",
  })

  // ใช้ WRItem จาก import โดยตรง
  const [items, setItems] = useState<WRItem[]>([
    { id: "1", itemNo: 1, description: "", quantity: 1, unit: "", estimatedPrice: 0, totalPrice: 0 },
  ])

  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [wrNumber, setWrNumber] = useState("")
  const [wrStatus, setWrStatus] = useState<"draft" | "รออนุมัติ">("draft")

  // === โหลดข้อมูล WR เดิม ===
  useEffect(() => {
    if (!wrId) return

    try {
      const savedWRs = Array.isArray(wrs) ? wrs : JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const wr = savedWRs.find((w: any) => w.id === wrId)

      if (wr) {
        setFormData({
          projectName: wr.projectName || "",
          department: wr.department || "",
          client: wr.clientId || "",
          clientName: wr.clientName || "",
          supplier: wr.supplier || "",
          supplierName: wr.supplierName || "",
          requestedBy: wr.requestedBy || "",
          requestDate: wr.requestDate || new Date().toISOString().split("T")[0],
          requiredDate: wr.requiredDate || "",
          duration: wr.duration || "",
          jobNumber: wr.jobNumber || "",
          projectNote: wr.projectNote || "",
          ccNo: wr.ccNo || "",
          remark: wr.remark || "",
          deliveryLocation: wr.deliveryLocation || "",
          expteamQuotation: wr.expteamQuotation || "",
          estimatedPrCost: wr.estimatedPrCost || "",
        })

        setItems(wr.items || [])
        setVatRate(wr.vatRate || 7)
        setServiceTaxRate(wr.serviceTaxRate || 0)
        setWrNumber(wr.wrNumber || "")
        setWrStatus(wr.status || "draft")
        setSelectedProjectId(wr.projectId || "none")
      } else {
        toast({ title: "ไม่พบใบขอทำงาน", variant: "destructive" })
        router.push("/wr")
      }
    } catch (error) {
      console.error("Error loading WR:", error)
      toast({ title: "เกิดข้อผิดพลาดในการโหลดข้อมูล", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [wrId, wrs])

  // === ดึงข้อมูลโปรเจกต์ + Trader อัตโนมัติ (เหมือน Add) ===
  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== "none" && projects.length > 0) {
      const project = projects.find(p => p.id === selectedProjectId)
      if (project) {
        setFormData(prev => ({
          ...prev,
          projectName: project.name || "",
          jobNumber: project.jobNumber || "",
          projectNote: project.jobNo || "",
          ccNo: project.ccNo || "",
          client: project.trader || "",
          clientName: project.trader ? (clients.find(c => c.id === project.trader)?.name || "") : "",
          expteamQuotation: project.expteamQuotation || "",
          estimatedPrCost: project.estimatedPrCost || "",
        }))
      }
    } else {
      // ถ้าไม่ผูกโปรเจกต์ → ยังคงเก็บค่าที่แก้ไขไว้
      // ไม่ต้องล้างฟิลด์ที่ผู้ใช้แก้ไขแล้ว
    }
  }, [selectedProjectId, projects, clients])

  // === คำนวณ Duration จากวันที่ (เหมือน Add) ===
  useEffect(() => {
    if (formData.requestDate && formData.requiredDate) {
      const request = new Date(formData.requestDate)
      const required = new Date(formData.requiredDate)
      const diffTime = required.getTime() - request.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        updateForm("duration", diffDays.toString())
      } else {
        updateForm("duration", "")
      }
    } else {
      updateForm("duration", "")
    }
  }, [formData.requestDate, formData.requiredDate])

  // === คำนวณ ROS Date จาก Duration (เฉพาะกรอกเอง) ===
  useEffect(() => {
    if (formData.requestDate && formData.duration && !isCalculatingFromDates) {
      const days = parseInt(formData.duration) || 0
      if (days > 0) {
        const requestDate = new Date(formData.requestDate)
        const required = new Date(requestDate)
        required.setDate(requestDate.getDate() + days)
        updateForm("requiredDate", required.toISOString().split("T")[0])
      }
    }
  }, [formData.requestDate, formData.duration, isCalculatingFromDates])

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    const newItem: WRItem = {
      id: String(Date.now()),
      itemNo: items.length + 1,
      description: "",
      quantity: 1,
      unit: "",
      estimatedPrice: 0,
      totalPrice: 0,
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof WRItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "estimatedPrice") {
            updated.totalPrice = (updated.quantity || 0) * (updated.estimatedPrice || 0)
          }
          return updated
        }
        return item
      })
    )
  }

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const expteamQuotation = parseFloat(formData.expteamQuotation) || 0
  const estimatedPrCost = parseFloat(formData.estimatedPrCost) || 0
  const jobBalanceCost = expteamQuotation - estimatedPrCost

  // === บันทึก/อัปเดต WR ===
  const handleSave = (status: "draft" | "รออนุมัติ") => {
    if (!formData.projectName || !formData.department || !formData.requestedBy) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" })
      return
    }
    if (!formData.requiredDate && !formData.duration) {
      toast({ title: "กรุณากรอก Duration หรือ วันที่ต้องการรับสินค้า", variant: "destructive" })
      return
    }
    const invalidItem = items.find(item => !item.description || !item.unit)
    if (invalidItem) {
      toast({ title: "กรอกรายการสินค้าให้ครบทุกช่อง", variant: "destructive" })
      return
    }

    const updatedWR = {
      id: wrId,
      wrNumber,
      projectName: formData.projectName,
      department: formData.department,
      requestedBy: formData.requestedBy,
      requestDate: formData.requestDate,
      requiredDate: formData.requiredDate,
      duration: formData.duration,
      status,
      jobNumber: formData.jobNumber || "",
      projectNote: formData.projectNote || "",
      ccNo: formData.ccNo || "",
      supplier: formData.supplier || "",
      supplierName: formData.supplierName || "",
      deliveryLocation: formData.deliveryLocation || "",
      remark: formData.remark || "",
      items: items.map((item, i) => ({ ...item, itemNo: i + 1 })),
      subtotal,
      vatRate,
      vatAmount,
      serviceTaxRate,
      serviceTaxAmount,
      totalAmount,
      projectId: selectedProjectId !== "none" ? selectedProjectId : undefined,
      clientId: formData.client || undefined,
      clientName: formData.clientName || undefined,
      expteamQuotation: formData.expteamQuotation || "",
      estimatedPrCost: formData.estimatedPrCost || "",
      createdAt: undefined, // Keep original
      updatedAt: new Date().toISOString(),
    }

    try {
      if (updateWR) {
        updateWR(wrId, updatedWR)
      }

      const savedWRs = Array.isArray(wrs) ? wrs : JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const updated = savedWRs.map((wr: any) => wr.id === wrId ? { ...updatedWR, createdAt: wr.createdAt } : wr)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      toast({ title: "อัปเดต WR สำเร็จ!", description: `เลขที่ ${wrNumber}` })
      router.push("/wr")
    } catch (error) {
      console.error("Error saving WR:", error)
      toast({ title: "เกิดข้อผิดพลาดในการบันทึก", variant: "destructive" })
    }
  }

  const [departments, setDepartments] = useState<Department[]>([])
  useEffect(() => {
    setDepartments(getDepartments())
  }, [])

  // === Client Combobox (เหมือน Add) ===
  function ClientCombobox() {
    const [query, setQuery] = useState("")
    const filteredClients = useMemo(() => {
      if (!query.trim()) return (clients || []).filter(c => c.status === "active")
      return (clients || [])
        .filter(c => c.status === "active")
        .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    }, [clients, query])

    return (
      <div className="relative">
        <Combobox
          value={formData.client}
          onChange={(v: string | null) => {
            const selected = (clients || []).find(c => c.id === v)
            updateForm("client", v ?? "")
            updateForm("clientName", selected?.name ?? "")
          }}
          nullable
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <ComboboxInput
              className={cn(
                "pl-10 pr-10 w-full h-10 rounded-md border border-input bg-background text-sm",
                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                "placeholder:text-slate-400"
              )}
              displayValue={(id: string) => {
                if (id) return (clients || []).find(c => c.id === id)?.name || ""
                return formData.clientName || ""
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เลือก Trader (ลูกค้า)"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredClients.length === 0 ? (
              <div className="px-4 py-2 text-slate-500">ไม่พบลูกค้า</div>
            ) : (
              filteredClients.map((client) => (
                <ComboboxOption
                  key={client.id}
                  value={client.id}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {client.name} {client.contactPerson && `(${client.contactPerson})`}
                      </span>
                      {selected && (
                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", active ? "text-white" : "text-indigo-600")}>
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    )
  }

  // === Supplier Combobox (เหมือน Add) ===
  function SupplierCombobox() {
    const [query, setQuery] = useState("")
    const filteredSuppliers = useMemo(() => {
      if (!query.trim()) return (suppliers || []).filter(s => s.status === "active")
      return (suppliers || [])
        .filter(s => s.status === "active")
        .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    }, [suppliers, query])

    return (
      <div className="relative">
        <Combobox
          value={formData.supplier}
          onChange={(v: string | null) => {
            const selected = (suppliers || []).find(s => s.id === v)
            updateForm("supplier", v ?? "")
            updateForm("supplierName", selected?.name ?? "")
          }}
          nullable
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <ComboboxInput
              className={cn(
                "pl-10 pr-10 w-full h-10 rounded-md border border-input bg-background text-sm",
                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                "placeholder:text-slate-400"
              )}
              displayValue={(id: string) => (suppliers || []).find(s => s.id === id)?.name ?? ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เลือกซัพพลายเออร์"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredSuppliers.length === 0 ? (
              <div className="px-4 py-2 text-slate-500">ไม่พบซัพพลายเออร์</div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <ComboboxOption
                  key={supplier.id}
                  value={supplier.id}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {supplier.name}
                      </span>
                      {selected && (
                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", active ? "text-white" : "text-indigo-600")}>
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="w-full px-4 py-4 md:py-6 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/wr")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Edit (WR)</h1>
                <p className="text-sm text-blue-600 font-bold">เลขที่: {wrNumber}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => handleSave("รออนุมัติ")} className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
                <Save className="h-4 w-4 mr-1" /> บันทึก
              </Button>
            </div>
          </div>
        </div>

        {/* เลือกโปรเจกต์ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกโปรเจกต์ หรือไม่ผูกโปรเจกต์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">กรุณาเลือกโครงการ</SelectItem>
                {(projects || []).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.jobNo} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={formData.projectName} onChange={e => updateForm("projectName", e.target.value)} placeholder="Project Name" className="h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department} onValueChange={(v) => updateForm("department", v)}>
                <SelectTrigger className="h-10 text-sm w-full"><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input value={formData.requestedBy} onChange={e => updateForm("requestedBy", e.target.value)} placeholder="ชื่อ-สกุล" className="h-10 text-sm" />
            </div>
          </div>

          {/* Row 2 - Duration + ROS Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Request date</Label>
              <Input
                type="date"
                value={formData.requestDate}
                onChange={e => {
                  updateForm("requestDate", e.target.value)
                  setIsCalculatingFromDates(true)
                }}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>ROS date <span className="text-xs text-green-600"></span></Label>
              <Input
                type="date"
                value={formData.requiredDate}
                onChange={e => {
                  updateForm("requiredDate", e.target.value)
                  setIsCalculatingFromDates(true)
                }}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (วัน) <span className="text-xs text-green-600"></span></Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={e => {
                  updateForm("duration", e.target.value)
                  setIsCalculatingFromDates(false)
                }}
                placeholder="คำนวณอัตโนมัติ"
                className="h-10 text-sm"
                min="1"
              />
            </div>
          </div>

          {/* Row 3 - Job No., Trader, CC No., Cost Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Job No.</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 h-10 flex items-center text-slate-400" />
                <Input
                  value={formData.projectNote}
                  onChange={e => updateForm("projectNote", e.target.value)}
                  placeholder="Job No."
                  className="h-10 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trader</Label>
              <ClientCombobox />
            </div>
            <div className="space-y-2">
              <Label>C.C. No.</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 h-10 flex items-center text-slate-400" />
                <Input
                  value={formData.ccNo}
                  onChange={e => updateForm("ccNo", e.target.value)}
                  placeholder="1101-01"
                  className="h-10 text-sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input
                type="number"
                value={formData.expteamQuotation}
                onChange={e => updateForm("expteamQuotation", e.target.value)}
                placeholder="Expteam Quotation"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input
                type="number"
                value={formData.estimatedPrCost}
                onChange={e => updateForm("estimatedPrCost", e.target.value)}
                placeholder="Estimated PR Cost"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input
                value={jobBalanceCost >= 0 ? jobBalanceCost.toLocaleString() : "0"}
                readOnly
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <SupplierCombobox />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select value={status} onValueChange={v => setStatus(v as any)}>
                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ร่าง">ร่าง</SelectItem>
                  <SelectItem value="รออนุมัติ">รออนุมัติ</SelectItem>
                  <SelectItem value="อนุมัติแล้ว">อนุมัติแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>สถานที่ส่งของ</Label>
            <Input value={formData.deliveryLocation} onChange={e => updateForm("deliveryLocation", e.target.value)} placeholder="สถานที่ส่งของ" className="h-10 text-sm" />
          </div>

          {/* หมายเหตุ */}
          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea value={formData.remark} onChange={e => updateForm("remark", e.target.value)} rows={3} placeholder="หมายเหตุเพิ่มเติม..." className="resize-none text-sm" />
          </div>
        </div>

        {/* ตารางรายการสินค้า */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="font-bold text-lg">รายการสินค้า</h2>
            <Button onClick={addItem} size="sm" className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการ
            </Button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 sm:w-16">ลำดับ</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="w-20 sm:w-24 text-center">จำนวน</TableHead>
                  <TableHead className="w-20 sm:w-24 text-center">หน่วย</TableHead>
                  <TableHead className="w-28 sm:w-32 text-right">ราคา/หน่วย</TableHead>
                  <TableHead className="w-28 sm:w-32 text-right">รวม</TableHead>
                  <TableHead className="w-16 sm:w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{item.itemNo}</TableCell>
                    <TableCell>
                      <Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="เช่น ซ่อมเครื่อง" className="h-9 text-sm" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} min="1" className="h-9 w-full text-sm" />
                    </TableCell>
                    <TableCell>
                      <Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} placeholder="ครั้ง" className="h-9 w-full text-sm" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.estimatedPrice} onChange={e => updateItem(item.id, "estimatedPrice", Number(e.target.value) || 0)} min="0" className="h-9 w-full text-sm text-right" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(item.totalPrice || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* สรุปยอด */}
          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base">ยอดรวม</span>
              <span className="font-medium w-28 sm:w-32">{subtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base">VAT (%)</span>
              <input type="number" value={vatRate} onChange={e => setVatRate(Number(e.target.value) || 0)} className="w-16 p-1 border rounded text-right text-sm" min="0" step="0.01" />
              <span className="font-medium w-28 sm:w-32">{vatAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base">Service Tax (%)</span>
              <input type="number" value={serviceTaxRate} onChange={e => setServiceTaxRate(Number(e.target.value) || 0)} className="w-16 p-1 border rounded text-right text-sm" min="0" step="0.01" />
              <span className="font-medium w-28 sm:w-32">{serviceTaxAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center pt-2 border-t">
              <span className="text-lg font-bold">รวมทั้งสิ้น</span>
              <span className="text-xl font-bold text-blue-600 w-28 sm:w-32">{totalAmount.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}