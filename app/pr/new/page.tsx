"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, Building2, Check, ChevronsUpDown, ArrowLeft, Loader2, CheckCircle2, XCircle, Moon, Sun } from "lucide-react"
import type { PRItem } from "@/src/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Job {
  id: number
  jobName: string
  trader: string
  jobNo: string
  ccNo: string
  projectCode: string
  estimatedPrCost: number
  expteamQuotation: string
  jobBalanceCost: string
}

interface Supplier {
  id: number
  companyName: string
  isActive: boolean
}

interface Department {
  id: string
  name: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export default function NewPRPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [jobs, setJobs] = useState<Job[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>("none")
  const [isCalculatingFromDates, setIsCalculatingFromDates] = useState(false)
  const [status, setStatus] = useState<"DRAFT" | "PENDING" | "APPROVED">("DRAFT")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string;
    description: string;
    isSuccess: boolean;
    prNumber?: string;
  }>({ title: "", description: "", isSuccess: false })

  const [formData, setFormData] = useState({
    jobName: "",
    jobNote: "",
    extraCharge: false,
    department: "",
    supplier: "",
    supplierName: "",
    supplierId: 0,
    requestedBy: "",
    requestDate: new Date().toISOString().split("T")[0],
    requiredDate: "",
    duration: "",
    trader: "",
    jobNo: "",
    ccNo: "",
    paymentMethod: "",
    paymentTerms: "",
    remark: `1) โปรดระบุเลขที่ใบสั่งซื้อ ใบเสร็จรับเงิน / ใบกำกับภาษี หรือ ใบเสนอราคา ทุกครั้งเพื่อสะดวกในการอ้างอิงและชำระเงิน
2) เมื่อรับใบสั่งซื้อถือว่ายอมรับเงื่อนไขข้างต้น และเงื่อนไขที่แนบมาด้วย
3) โปรดแนบใบสั่งซื้อ สำเนา เมื่อมาวางบิลเรียกเก็บเงิน`,
    deliveryLocation: "",
    planType: "" as "PLAN" | "UNPLAN",
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "",
    jobId: 0,
  })

  const [items, setItems] = useState<PRItem[]>([
    { id: "1", itemNo: 1, description: "", quantity: 1, unit: "", estimatedPrice: 0, totalPrice: 0 },
  ])

  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const jobsUrl = `${API_BASE_URL}/jobs`
        const suppliersUrl = `${API_BASE_URL}/suppliers`

        const [jobsRes, suppliersRes] = await Promise.all([
          fetch(jobsUrl),
          fetch(suppliersUrl)
        ])

        let jobsData = []
        let suppliersData = []

        if (jobsRes.ok) {
          jobsData = await jobsRes.json()
        } else {
          console.error("Jobs fetch failed")
        }

        if (suppliersRes.ok) {
          suppliersData = await suppliersRes.json()
        } else {
          console.error("Suppliers fetch failed")
        }

        setJobs(jobsData || [])
        setSuppliers(suppliersData || [])

        setDepartments([
          { id: "1", name: "Purchasing" },
          { id: "2", name: "Engineering" },
          { id: "3", name: "Management" }
        ])
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedJobId && selectedJobId !== "none") {
      const job = jobs.find(j => j.id.toString() === selectedJobId)
      if (job) {
        setFormData(prev => ({
          ...prev,
          jobName: job.jobName,
          trader: job.trader,
          jobNo: job.jobNo,
          ccNo: job.ccNo,
          expteamQuotation: job.expteamQuotation || "",
          estimatedPrCost: job.estimatedPrCost?.toString() || "",
          jobBalanceCost: job.jobBalanceCost?.toString() || "",
          jobId: job.id,
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        jobName: "",
        trader: "",
        jobNo: "",
        ccNo: "",
        expteamQuotation: "",
        estimatedPrCost: "",
        jobBalanceCost: "",
        jobId: 0,
      }))
    }
  }, [selectedJobId, jobs])

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
    const newItem: PRItem = {
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

  const updateItem = (id: string, field: keyof PRItem, value: any) => {
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

  const showModal = (title: string, description: string, isSuccess: boolean, prNumber?: string) => {
    setModalContent({ title, description, isSuccess, prNumber })
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    if (modalContent.isSuccess) {
      router.push("/pr")
    }
  }

  const handleSave = async (saveStatus: "DRAFT" | "PENDING") => {
    if (!formData.requestedBy) {
      showModal("ข้อมูลไม่ครบถ้วน", "กรุณากรอก Requester", false)
      return
    }

    if (!formData.jobId) {
      showModal("ข้อมูลไม่ครบถ้วน", "กรุณาเลือก Job", false)
      return
    }

    if (!formData.supplierId) {
      showModal("ข้อมูลไม่ครบถ้วน", "กรุณาเลือก Supplier", false)
      return
    }

    const invalidItem = items.find(item => !item.description || !item.unit || !item.estimatedPrice)
    if (invalidItem) {
      showModal("ข้อมูลไม่ครบถ้วน", "กรุณากรอกรายการสินค้าให้ครบทุกช่อง (รายละเอียด, หน่วย, ราคา)", false)
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        departments: formData.department,
        requester: formData.requestedBy,
        jobNote: formData.jobNote,
        extraCharge: formData.extraCharge,
        requestDate: formData.requestDate,
        requiredDate: formData.requiredDate || null,
        jobId: formData.jobId,
        supplierId: formData.supplierId,
        deliveryLocation: formData.deliveryLocation,
        planType: formData.planType,
        vatPercent: Number(vatRate),
        discountPercent: Number(serviceTaxRate),

        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.estimatedPrice)
        })),

        approvals: []
      }

      const response = await fetch(`${API_BASE_URL}/pr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = typeof result.message === 'string'
          ? result.message
          : Array.isArray(result.message)
            ? result.message.join(", ")
            : JSON.stringify(result.message) || "Failed to create PR";

        throw new Error(errorMessage)
      }

      showModal(
        "บันทึกสำเร็จ",
        `สร้าง PR หมายเลข ${result.prNumber || '-'} เรียบร้อยแล้ว`,
        true,
        result.prNumber
      )

    } catch (err) {
      console.error("Error:", err)
      showModal(
        "เกิดข้อผิดพลาด",
        err instanceof Error ? err.message : "ไม่สามารถสร้าง PR ได้ กรุณาลองใหม่อีกครั้ง",
        false
      )
    } finally {
      setSubmitting(false)
    }
  }

  function SupplierCombobox() {
    const [query, setQuery] = useState("")
    const filteredSuppliers = useMemo(() => {
      const active = suppliers.filter(s => s.isActive === true)
      if (!query.trim()) return active
      return active.filter(s => s.companyName.toLowerCase().includes(query.toLowerCase()))
    }, [suppliers, query])

    return (
      <div className="relative">
        <Combobox
          value={formData.supplierId.toString()}
          onChange={(v: string | null) => {
            const selected = suppliers.find(s => s.id.toString() === v)
            updateForm("supplierId", Number(v) || 0)
            updateForm("supplier", selected?.id.toString() || "")
            updateForm("supplierName", selected?.companyName ?? "")
          }}
          nullable
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <ComboboxInput
              className={cn(
                "pl-10 pr-10 w-full h-10 rounded-md border border-input bg-background dark:bg-black text-sm dark:text-slate-100",
                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                "placeholder:text-slate-400 dark:placeholder:text-slate-600"
              )}
              displayValue={(id: string) => {
                if (id && id !== "0") return suppliers.find(s => s.id.toString() === id)?.companyName || ""
                return formData.supplierName || ""
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="--Select Supplier--"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredSuppliers.length === 0 ? (
              <div className="px-4 py-2 text-slate-500 dark:text-slate-400">ไม่พบซัพพลายเออร์</div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <ComboboxOption
                  key={supplier.id}
                  value={supplier.id.toString()}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white dark:bg-indigo-700" : "text-gray-900 dark:text-slate-100")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {supplier.companyName}
                      </span>
                      {selected && (
                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", active ? "text-white" : "text-indigo-600 dark:text-indigo-400")}>
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
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-900 dark:text-slate-100" />
          <p className="text-muted-foreground dark:text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen dark:bg-black">
      <div className="w-full px-4 py-4 md:py-6 space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/pr")}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Create (PR)</h1>
                {/* <p className="text-sm text-slate-600 dark:text-slate-400">Fill in the information PR</p> */}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={submitting}
                className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white hover:text-white dark:bg-yellow-600 dark:hover:bg-yellow-600 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Draft
              </Button>
              <Button
                onClick={() => handleSave("PENDING")}
                disabled={submitting}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600 hover:text-white dark:bg-blue-700 dark:hover:bg-green-700  dark:text-white cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin " /> : <Save className="h-4 w-4 mr-1 dark:text-white" />}
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* เลือก Job */}
        <Card className="dark:bg-black dark:border-white-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-slate-100">Job <span className="text-red-600">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full dark:bg-black dark:border-white-700 dark:text-slate-100">
                <SelectValue placeholder="เลือกโปรเจกต์ หรือไม่ผูกโปรเจกต์" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                <SelectItem value="none" className="dark:text-slate-100">--Select Job--</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id.toString()} className="dark:text-slate-100">
                    {job.jobNo} - {job.jobName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก */}
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-4 md:p-6 space-y-6 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Job Name <span className="text-red-600">*</span></Label>
              <Input value={formData.jobName}
                readOnly
                onChange={e => updateForm("jobName", e.target.value)}
                placeholder="Project Name"
                className="h-10 text-sm bg-background bg-gray-50 dark:bg-black dark:border-white-800 dark:text-slate-100" />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Department</Label>
              <Select value={formData.department} onValueChange={(v) => updateForm("department", v)}>
                <SelectTrigger className="h-10 text-sm w-full dark:bg-black dark:border-white-700 dark:text-white-400"><SelectValue
                  placeholder="--Select Department--" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name} className="dark:text-slate-100">{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Requester</Label>
              <Input value={formData.requestedBy}
                onChange={e => updateForm("requestedBy", e.target.value)}
                placeholder="Requester"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-100" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Job Note</Label>

              <Input
                type="text"
                value={formData.jobNote}
                onChange={e => {
                  updateForm("jobNote", e.target.value)
                  setIsCalculatingFromDates(false)
                }}
                placeholder="jobNote"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-100"
              />

              {/* Extra charge checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="extraCharge"
                  checked={formData.extraCharge}
                  onChange={e => updateForm("extraCharge", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
                 dark:bg-black dark:border-gray-600"
                />
                <Label
                  htmlFor="extraCharge"
                  className="text-sm dark:text-slate-200 cursor-pointer"
                >
                  Extra charge
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-200">Request date <span className="text-red-600">*</span></Label>
              <Input
                type="date"
                value={formData.requestDate}
                onChange={e => {
                  updateForm("requestDate", e.target.value)
                  setIsCalculatingFromDates(true)
                }}
                className="h-10 dark:bg-black dark:border-white-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">ROS date</Label>
              <Input
                type="date"
                value={formData.requiredDate}
                onChange={e => {
                  updateForm("requiredDate", e.target.value)
                  setIsCalculatingFromDates(true)
                }}
                className="h-10 dark:bg-black dark:border-white-700 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Client</Label>
              <Input
                value={formData.trader}
                readOnly
                placeholder="trader"
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Job No.</Label>
              <Input
                value={formData.jobNo}
                readOnly
                placeholder="Job No."
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">CC No.</Label>
              <Input
                value={formData.ccNo}
                readOnly
                placeholder="CC NO."
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Expteam Quotation</Label>
              <Input
                value={formData.expteamQuotation}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Estimated PR Cost</Label>
              <Input
                value={formData.estimatedPrCost}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Job Balance Cost </Label>
              <Input
                value={formData.jobBalanceCost}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm bg-gray-50 dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-white-700">Supplier</Label>
              <SupplierCombobox />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Currency <span className="text-red-600">*</span></Label>
              <Input
                value={formData.jobBalanceCost}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Distcount Type <span className="text-red-600">*</span></Label>
              <Input
                value={formData.jobBalanceCost}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Discount Value <span className="text-red-600">*</span></Label>
              <Input
                value={formData.jobBalanceCost}
                readOnly
                placeholder="Expteam Quotation"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Delivery Location <span className="text-red-600">*</span></Label>
              <Input value={formData.deliveryLocation}
                onChange={e => updateForm("deliveryLocation", e.target.value)}
                placeholder="Delivery Location"
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-100" />
            </div>
            {/* Plan / Unplan */}
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.planType === "PLAN"}
                    onChange={() => updateForm("planType", "PLAN")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

                {/* UNPLAN */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.planType === "UNPLAN"}
                    onChange={() => updateForm("planType", "UNPLAN")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Unplan</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-200">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as any)}>
                <SelectTrigger className="h-10 text-sm w-full dark:bg-black dark:border-white-700 dark:text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                  <SelectItem value="DRAFT" className="dark:text-white-200">Draft</SelectItem>
                  <SelectItem value="PENDING" className="dark:text-slate-100">Pending</SelectItem>
                  <SelectItem value="APPROVED" className="dark:text-slate-100">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Payment Method <span className="text-red-600">*</span>
              </Label>

              <div className="flex items-center space-x-6">
                {/* Radio Group */}
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    updateForm("paymentMethod", value as "cash" | "credit")
                  }
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="font-normal cursor-pointer">
                      Cash
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="payment-credit" />
                    <Label htmlFor="payment-credit" className="font-normal cursor-pointer">
                      Credit
                    </Label>
                  </div>
                </RadioGroup>

                {/* Payment Terms (แสดงเฉพาะ Credit) */}
                {formData.paymentMethod === "credit" && (
                  <div className="flex items-center space-x-2">
                    <Label className="whitespace-nowrap">Payment Terms</Label>
                    <Input
                      className="w-70 h-9"
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        updateForm("paymentTerms", e.target.value)
                      }
                      placeholder="30 days"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* หมายเหตุ */}
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Remark</Label>
            <Textarea
              value={formData.remark}
              onChange={e => updateForm("remark", e.target.value)}
              rows={5}
              placeholder="หมายเหตุเพิ่มเติม..."
              className="resize-none text-sm dark:bg-black dark:border-white-700 dark:text-slate-100"
            />
          </div>
        </div>

        {/* ตารางรายการสินค้า */}
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-4 md:p-6 dark:border-white-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="font-bold text-lg dark:text-slate-100">Product list</h2>
            <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-green-600 dark:bg-blue-700 dark:hover:bg-green-700  dark:text-white cursor-pointer">
              <Plus className="h-4 w-4 mr-1  dark:text-white" /> Add Product
            </Button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-700 dark:bg-slate-800">
                  <TableHead className="w-12 sm:w-16 dark:text-slate-300">No.</TableHead>
                  <TableHead className="dark:text-slate-300">Item</TableHead>
                  <TableHead className="w-20 sm:w-24 text-center dark:text-slate-300">Qty</TableHead>
                  <TableHead className="w-20 sm:w-24 text-center dark:text-slate-300">UOM</TableHead>
                  <TableHead className="w-28 sm:w-32 text-right dark:text-slate-300">Unit Price</TableHead>
                  <TableHead className="w-28 sm:w-32 text-right dark:text-slate-300">Amount</TableHead>
                  <TableHead className="w-16 sm:w-20 dark:text-slate-300"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id} className="dark:border-white-700 dark:hover:bg-slate-800">
                    <TableCell className="text-center dark:text-slate-300">{item.itemNo}</TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm dark:bg-black dark:border-white-700 dark:text-slate-100"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                        min="1"
                        className="h-9 w-full text-sm dark:bg-black dark:border-white-700 dark:text-slate-100"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={e => updateItem(item.id, "unit", e.target.value)}
                        placeholder=""
                        className="h-9 w-full text-sm dark:bg-black dark:border-white-700 dark:text-slate-100"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.estimatedPrice}
                        onChange={e => updateItem(item.id, "estimatedPrice", Number(e.target.value) || 0)}
                        min="0"
                        className="h-9 w-full text-sm text-right dark:bg-black dark:border-white-700 dark:text-slate-100"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium dark:text-slate-200">
                      {item.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="h-8 w-8 dark:hover:bg-slate-700">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* สรุปยอด */}
          <div className="mt-6 border-t dark:border-slate-700 pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base dark:text-slate-300">Total</span>
              <span className="font-medium w-28 sm:w-32 dark:text-slate-100">{subtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base dark:text-slate-300 ">VAT (%)</span>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                min="0"
                step="0.01"
              />
              <span className="font-medium w-28 sm:w-32 dark:text-slate-100">{vatAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center">
              <span className="text-sm sm:text-base dark:text-slate-300">หัก ณ ที่จ่าย (%)</span>
              <input
                type="number"
                value={serviceTaxRate}
                onChange={e => setServiceTaxRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                min="0"
                step="0.01"
              />
              <span className="font-medium w-28 sm:w-32 dark:text-slate-100">{serviceTaxAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-4 sm:gap-8 items-center pt-2 border-t dark:border-slate-700">
              <span className="text-lg font-bold dark:text-slate-100">Total Amount</span>
              <span className="text-xl font-bold text-green-600 dark:text-blue-400 w-28 sm:w-32">{totalAmount.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {modalContent.isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
              )}
              <DialogTitle className={modalContent.isSuccess ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {modalContent.title}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-base dark:text-slate-300">
              {modalContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant={modalContent.isSuccess ? "default" : "secondary"}
              onClick={handleModalClose}
              className={modalContent.isSuccess ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" : "dark:bg-slate-800 dark:hover:bg-slate-700"}
            >
              {modalContent.isSuccess ? "ตกลง" : "ปิด"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}