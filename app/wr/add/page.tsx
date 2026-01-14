"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Plus, Trash2, Save, Building2, Check, ChevronsUpDown } from "lucide-react"
import { addDays, differenceInDays } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import { cn } from "@/lib/utils"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Job {
  id: number
  jobName: string
  trader?: string
  jobNo?: string
  ccNo?: string
  expteamQuotation?: string
  estimatedPrCost?: number
  jobBalanceCost?: string
}

interface Supplier {
  id: number
  companyName: string
  isActive: boolean
}

interface WRItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export default function CreateWRPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [jobs, setJobs] = useState<Job[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedJobId, setSelectedJobId] = useState<string>("none")
  const [status, setStatus] = useState<string>("pending")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
    remark: `1) โปรดระบุเลขที่ใบสั่งซื้อ ใบเสร็จรับเงิน / ใบกำกับภาษี หรือ ใบเสนอราคา ทุกครั้งเพื่อสะดวกในการอ้างอิงและชำระเงิน
2) เมื่อรับใบสั่งซื้อถือว่ายอมรับเงื่อนไขข้างต้น และเงื่อนไขที่แนบมาด้วย
3) โปรดแนบใบสั่งซื้อ สำเนา เมื่อมาวางบิลเรียกเก็บเงิน`,
    deliveryLocation: "",
    planType: "" as "PLAN" | "UNPLAN",
    status: "pending" as "Received" | "pending" | "approved" | "unapproved" | "reject",
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "",
    paymentTerms: "",
    paymentMethod: "" as "cash" | "credit",
    currency: "THB" as "THB" | "USD" | "EUR" | "GBP" | "JPY" | "INR",
    discountType: "" as "discount" | "absolute",
    discountValue: "",
    jobId: 0,
  })

  const [items, setItems] = useState<WRItem[]>([])

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // อัตราแลกเปลี่ยนล่าสุด (22 ธันวาคม 2025) - 1 หน่วยสกุลเงินต่างประเทศ = กี่บาท
  const exchangeRates: Record<string, number> = {
    THB: 1,
    USD: 31.45,
    EUR: 37.10,
    GBP: 42.15,
    JPY: 0.20,
    INR: 0.37,
  }

  // คำนวณ subtotal ในสกุลที่เลือก (จากราคาที่ผู้ใช้กรอก)
  const subtotalInSelectedCurrency = items.reduce((sum, item) => sum + item.totalPrice, 0)

  // แปลงเป็นเงินบาทเพื่อคำนวณ VAT และแสดงยอดรวม
  const subtotalInTHB = subtotalInSelectedCurrency * exchangeRates[formData.currency]
  const vatAmountInTHB = subtotalInTHB * 0.07
  const totalAmountInTHB = subtotalInTHB + vatAmountInTHB

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [jobsRes, suppliersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs`),
          fetch(`${API_BASE_URL}/suppliers`)
        ])

        if (jobsRes.ok) setJobs(await jobsRes.json())
        if (suppliersRes.ok) setSuppliers(await suppliersRes.json())
      } catch (err) {
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  useEffect(() => {
    if (selectedJobId === "none" || !selectedJobId) {
      updateForm("jobName", "")
      updateForm("trader", "")
      updateForm("jobNo", "")
      updateForm("ccNo", "")
      updateForm("expteamQuotation", "")
      updateForm("estimatedPrCost", "")
      updateForm("jobBalanceCost", "")
      updateForm("jobId", 0)
      return
    }

    const job = jobs.find(j => j.id.toString() === selectedJobId)
    if (job) {
      updateForm("jobName", job.jobName || "")
      updateForm("trader", job.trader || "")
      updateForm("jobNo", job.jobNo || "")
      updateForm("ccNo", job.ccNo || "")
      updateForm("expteamQuotation", job.expteamQuotation || "")
      updateForm("estimatedPrCost", job.estimatedPrCost?.toString() || "")
      updateForm("jobBalanceCost", job.jobBalanceCost?.toString() || "")
      updateForm("jobId", job.id)
    }
  }, [selectedJobId, jobs])

  useEffect(() => {
    if (formData.requestDate && formData.requiredDate) {
      const days = differenceInDays(new Date(formData.requiredDate), new Date(formData.requestDate))
      if (days >= 0) updateForm("duration", days.toString())
      else updateForm("duration", "")
    } else {
      updateForm("duration", "")
    }
  }, [formData.requestDate, formData.requiredDate])

  const handleDurationChange = (days: string) => {
    const numDays = parseInt(days) || 0
    updateForm("duration", days)
    if (formData.requestDate && numDays > 0) {
      const newDate = addDays(new Date(formData.requestDate), numDays)
      updateForm("requiredDate", newDate.toISOString().split("T")[0])
    }
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `wr-item-${Date.now()}`,
      itemNo: prev.length + 1,
      description: "",
      quantity: 1,
      unit: "ชิ้น",
      unitPrice: 0,
      totalPrice: 0,
    }])
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id)
      return filtered.map((item, i) => ({ ...item, itemNo: i + 1 }))
    })
  }

  const updateItem = (id: string, field: keyof WRItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let updatedValue = value
        if (field === "quantity" || field === "unitPrice") {
          updatedValue = Number(value) || 0
        }
        const updated = { ...item, [field]: updatedValue }
        updated.totalPrice = updated.quantity * updated.unitPrice
        return updated
      }
      return item
    }))
  }

  const handleSave = () => {
    if (items.length === 0) return toast({ title: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ", variant: "destructive" })
    if (items.some(i => !i.description.trim())) return toast({ title: "กรุณากรอกรายการสินค้าให้ครบทุกบรรทัด", variant: "destructive" })
    if (formData.supplierId === 0) return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })
    setShowConfirmModal(true)
  }

  const confirmSave = async () => {
    try {
      const payload = {
        jobId: selectedJobId !== "none" ? Number(selectedJobId) : null,
        supplierId: formData.supplierId,
        jobNote: formData.jobNote,
        extraCharge: formData.extraCharge,
        requester: formData.requestedBy.trim() || "ไม่ระบุ",
        department: formData.department.trim() || "",
        requestDate: formData.requestDate,
        requiredDate: formData.requiredDate || undefined,
        deliveryLocation: formData.deliveryLocation.trim() || undefined,
        planType: formData.planType,
        remark: formData.remark.trim() || undefined,
        paymentMethod: formData.paymentMethod,
        paymentTerms: formData.paymentMethod === "credit" ? formData.paymentTerms.trim() : null,
        currency: formData.currency,
        subtotalInSelectedCurrency: subtotalInSelectedCurrency,
        subtotalInTHB: subtotalInTHB,
        vatInTHB: vatAmountInTHB,
        totalInTHB: totalAmountInTHB,
        status,
        items: items.filter(i => i.description.trim()).map(i => ({
          description: i.description.trim(),
          quantity: i.quantity,
          unit: i.unit?.trim() || "ชิ้น",
          unitPrice: i.unitPrice,
        })),
      }

      const res = await fetch(`${API_BASE_URL}/wr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "สร้าง WR ไม่สำเร็จ")
      }

      toast({ title: "สร้าง WR สำเร็จ!" })
      router.push("/wr")
    } catch (err: any) {
      toast({ title: "สร้าง WR ไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setShowConfirmModal(false)
    }
  }

  function SupplierCombobox() {
    const [query, setQuery] = useState("")
    const filteredSuppliers = useMemo(() => {
      const active = suppliers.filter(s => s.isActive)
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
            updateForm("supplierName", selected?.companyName ?? "")
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
                if (id && id !== "0") return suppliers.find(s => s.id.toString() === id)?.companyName || ""
                return formData.supplierName || ""
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="--เลือก Supplier--"
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
                  value={supplier.id.toString()}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>{supplier.companyName}</span>
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
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full space-y-6">
      {/* Header */}
      <Card className="border border-white-700 shadow-lg dark:bg-black">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/wr">
                <Button variant="outline" size="icon" className="hover:dark:bg-slate-400  cursor-pointer">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Create (WR) </h1>
                {/* <p className="text-lg text-slate-200 font-medium">Work Requisition</p> */}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStatus("draft"); handleSave(); }} className="bg-yellow-500 hover:bg-yellow-600 text-white  cursor-pointer dark:bg-yellow-600 hover:dark:bg-slate-400">
                <Save className="h-4 w-4 mr-2" /> Draft
              </Button>
              <Button onClick={() => { setStatus("pending"); handleSave(); }} className="bg-blue-600 hover:bg-green-600  cursor-pointer dark:text-white">
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* เลือกโครงการ */}
      <Card className="dark:bg-black">
        <CardHeader>
          <CardTitle>Job <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกโครงการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Job --</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.jobNo} ({job.jobName || "-"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ฟอร์มข้อมูล */}
      {/* ฟอร์มข้อมูล */}
      <Card className="dark:bg-black">
        <CardContent className="pt-6 space-y-8">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Project Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.jobName}
                readOnly
                className="bg-gray-50"
                placeholder="Project Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input
                value={formData.requestedBy}
                onChange={e => updateForm("requestedBy", e.target.value)}
                placeholder="Requester"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={e => updateForm("department", e.target.value)}
                placeholder="Department"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input
                type="text"
                value={formData.jobNote}
                onChange={e => updateForm("jobNote", e.target.value)}
                placeholder="Job Note"
                className="h-10 text-sm dark:bg-black"
              />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="extraCharge"
                  checked={formData.extraCharge}
                  onChange={e => updateForm("extraCharge", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
                       dark:bg-black dark:border-gray-600"
                />
                <Label htmlFor="extraCharge" className="text-sm dark:text-slate-200 cursor-pointer">
                  Extra charge
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Request date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.requestDate}
                onChange={e => updateForm("requestDate", e.target.value)}
                className="dark:bg-black"
              />
            </div>
            <div className="space-y-2">
              <Label>Required Date</Label>
              <Input
                type="date"
                value={formData.requiredDate}
                onChange={e => updateForm("requiredDate", e.target.value)}
                className="dark:bg-black"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={formData.trader} readOnly className="bg-gray-50 dark:bg-black" placeholder="Trader" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input value={formData.jobNo} readOnly className="bg-gray-50 dark:bg-black" placeholder="Job No." />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input value={formData.ccNo} readOnly className="bg-gray-50 dark:bg-black" placeholder="CC No." />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input value={formData.expteamQuotation} readOnly className="bg-gray-50 dark:bg-black" placeholder="Expteam Quotation" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input value={formData.estimatedPrCost} readOnly className="bg-gray-50 dark:bg-black" placeholder="Estimated PR Cost" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input
                value={formData.jobBalanceCost}
                onChange={e => updateForm("jobBalanceCost", e.target.value)}
                placeholder="Job Balance Cost"
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Supplier <span className="text-red-600">*</span></Label>
              <SupplierCombobox />
            </div>
            <div className="space-y-2">
              <Label>Currency <span className="text-red-600">*</span></Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => updateForm("currency", value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกสกุลเงิน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Type <span className="text-red-600">*</span></Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => updateForm("discountType", value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">% Discount</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Discount Value <span className="text-red-600">*</span></Label>
              <Input
                value={formData.discountValue}
                onChange={e => updateForm("discountValue", e.target.value)}
                placeholder="Discount Value"
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location <span className="text-red-500">*</span></Label>
              <Input
                value={formData.deliveryLocation}
                onChange={e => updateForm("deliveryLocation", e.target.value)}
                placeholder="Delivery Location"
              />
            </div>
            {/* Plan / Unplan */}
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.planType === "PLAN"}
                    onChange={() => updateForm("planType", "PLAN")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

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
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateForm("status", value)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Waiting for approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="unapproved">Unapproved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method <span className="text-red-600">*</span></Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => updateForm("paymentMethod", value as "cash" | "credit")}
                  className="flex flex-col space-y-3"
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
              </div>

              {formData.paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input
                    value={formData.paymentTerms}
                    onChange={(e) => updateForm("paymentTerms", e.target.value)}
                    placeholder="30 days"
                  />
                </div>
              )}
            </div>
          </div>

          {/* หมายเหตุ */}
          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={formData.remark}
              onChange={e => updateForm("remark", e.target.value)}
              rows={5}
              placeholder="Remark..."
              className="resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>


      {/* รายการขอเบิก */}
      <Card className="dark:bg-black">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product list</CardTitle>
            <Button onClick={addItem} className="bg-blue-600 hover:bg-green-600 dark:bg-blue-600 dark:text-white hover:dark:bg-green-600 cursor-pointer">
              <Plus className="h-4 w-4 mr-2 " /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-24 text-center">Qty</TableHead>
                  <TableHead className="w-24 text-center">UOM</TableHead>
                  <TableHead className="w-32 text-right">Unit Price </TableHead>
                  <TableHead className="w-32 text-right">Amount </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการขอเบิก
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{item.itemNo}</TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={e => updateItem(item.id, "description", e.target.value)}
                          placeholder="รายการ" />
                      </TableCell>
                      <TableCell>
                        <Input type="number"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, "quantity", e.target.value)}
                          className="text-center" min="1" />
                      </TableCell>
                      <TableCell>
                        <Input value={item.unit}
                          onChange={e => updateItem(item.id, "unit", e.target.value)}
                          className="text-center" />
                      </TableCell>
                      <TableCell>
                        <Input type="number"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, "unitPrice", e.target.value)}
                          className="text-right" min="0" step="0.01" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:dark:bg-red-600 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t text-right space-y-3">
                <div className="flex justify-end gap-12 p-3 bg-blue-50 rounded dark:bg-black">
                  <span>ยอดรวม ({formData.currency})</span>
                  <span className="font-medium w-32">{formatCurrency(subtotalInSelectedCurrency)} บาท</span>
                </div>
                <div className="flex justify-end gap-12 p-3 bg-blue-50 rounded dark:bg-black">
                  <span>ยอดรวมเป็นเงินบาท</span>
                  <span className="font-medium w-32">{formatCurrency(subtotalInTHB)} บาท</span>
                </div>
                <div className="flex justify-end gap-12 p-3 bg-blue-50 rounded dark:bg-black">
                  <span>VAT 7% (บาท)</span>
                  <span className="font-bold text-white-700 w-32">{formatCurrency(vatAmountInTHB)} บาท</span>
                </div>
                <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold text-white-600">
                  <span>รวมทั้งสิ้น</span>
                  <span className="w-32 dark:text-green-600">{formatCurrency(totalAmountInTHB)} บาท</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal ยืนยัน */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการสร้าง WR</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการสร้างใบขอเบิกวัสดุใหม่นี้หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>ยืนยันสร้าง WR</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}