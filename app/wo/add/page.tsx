// app/wo/add/page.tsx
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
import { ArrowLeft, Plus, Trash2, Save, Check, ChevronsUpDown, Building2 } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Supplier {
  id: number
  companyName: string
  isActive: boolean
}

interface WR {
  id: number
  wrNumber: string
  jobNote: string
  requester: string
  extraCharge: boolean
  tax: string
  requestDate: string
  requiredDate: string
  deliveryLocation?: string
  planType: string
  remark?: string
  status: string
  job?: {
    jobName: string
    trader?: string
    jobNo?: string
    ccNo?: string
    expteamQuotation?: string
    estimatedPrCost?: number
    jobBalanceCost?: string
  }
  items: {
    description: string
    quantity: number
    unit?: string
    unitPrice: number
  }[]
}

interface WOItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export default function CreateWOPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [wrs, setWRs] = useState<WR[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWRId, setSelectedWRId] = useState<string>("none")

  // Supplier state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierQuery, setSupplierQuery] = useState("")

  const [projectName, setProjectName] = useState("")
  const [requester, setRequester] = useState("")
  const [department, setDepartment] = useState("")
  const [jobNote, setJobNote] = useState("")
  const [extraCharge, setExtraCharge] = useState(false)
  const [traderName, setTraderName] = useState("")
  const [jobNo, setJobNo] = useState("")
  const [ccNo, setCcNo] = useState("")
  const [expteamQuotation, setExpteamQuotation] = useState("")
  const [estimatedPrCost, setEstimatedPrCost] = useState("")
  const [jobBalanceCost, setJobBalanceCost] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [remark, setRemark] = useState("")
  const [currency, setCurrency] = useState("THB")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("ภายใน 30 วัน")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "">("")
  const [items, setItems] = useState<WOItem[]>([])
  const [orderDate, setOrderDate] = useState(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [saveMode, setSaveMode] = useState<"draft" | "pending" | "approved" | "submitted" | "complete">("pending")
  const [tax, setTax] = useState("")
  const [planType, setPlanType] = useState("")
  const [status, setStatus] = useState<string>("pending")

  // ดึงข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [wrRes, supplierRes] = await Promise.all([
          fetch(`${API_BASE_URL}/wr`),
          fetch(`${API_BASE_URL}/suppliers`),
        ])

        if (wrRes.ok) setWRs(await wrRes.json())
        if (supplierRes.ok) setSuppliers(await supplierRes.json())
      } catch (err) {
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])
  const approvedPRs = wrs.filter(wr => wr.status === "APPROVED")

  const approvedWRs = useMemo(() => wrs.filter(wr => wr.status.toLowerCase() === "approved"), [wrs])

  const filteredSuppliers = useMemo(() => {
    const active = suppliers.filter(s => s.isActive)
    if (!supplierQuery.trim()) return active
    return active.filter(s => s.companyName.toLowerCase().includes(supplierQuery.toLowerCase()))
  }, [suppliers, supplierQuery])

  // เมื่อเลือก WR → ดึงข้อมูลมาใส่ฟอร์ม
  useEffect(() => {
    if (selectedWRId === "none" || !selectedWRId) {
      setProjectName("")
      setRequester("")
      setDepartment("")
      setJobNote("")
      setExtraCharge(false)
      setTraderName("")
      setJobNo("")
      setCcNo("")
      setExpteamQuotation("")
      setEstimatedPrCost("")
      setJobBalanceCost("")
      setDeliveryLocation("")
      setPlanType("")
      setRemark("")
      setTax("")
      setItems([])
      setDeliveryDate(null)
      setPaymentMethod("")
      setPaymentTerms("ภายใน 30 วัน")
      setSelectedSupplier(null)
      setSupplierQuery("")
      setStatus("pending")
      return
    }

    const wr = wrs.find(w => w.id.toString() === selectedWRId)
    if (!wr) return

    setProjectName(wr.job?.jobName || "")
    setRequester(wr.requester || "")
    setJobNote(wr.jobNote || "")
    setExtraCharge(wr.extraCharge)
    setTraderName(wr.job?.trader || "")
    setJobNo(wr.job?.jobNo || "")
    setCcNo(wr.job?.ccNo || "")
    setExpteamQuotation(wr.job?.expteamQuotation || "")
    setEstimatedPrCost(wr.job?.estimatedPrCost?.toString() || "")
    setJobBalanceCost(wr.job?.jobBalanceCost || "")
    setDeliveryLocation(wr.deliveryLocation || "")
    setPlanType(wr.planType || "-")
    setRemark(wr.remark || "")
    setTax(wr.tax || "")

    if (wr.requiredDate) {
      const parsed = parseISO(wr.requiredDate)
      if (isValid(parsed)) setDeliveryDate(parsed)
    }

    setItems(wr.items.map((item, i) => ({
      id: `wo-item-${Date.now()}-${i}`,
      itemNo: i + 1,
      description: item.description.trim() || "งานจาก WR",
      quantity: item.quantity || 1,
      unit: item.unit || "ชิ้น",
      unitPrice: item.unitPrice || 0,
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
    })))
  }, [selectedWRId, wrs])

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `wo-item-${Date.now()}`,
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

  const updateItem = (id: string, field: keyof WOItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedValue = (field === "quantity" || field === "unitPrice") ? Number(value) || 0 : value
        const updated = { ...item, [field]: updatedValue }
        updated.totalPrice = updated.quantity * updated.unitPrice
        return updated
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const vatAmount = subtotal * 0.07
  const totalAmount = subtotal + vatAmount

  const handleSave = (mode: "draft" | "pending") => {
    if (items.length === 0) return toast({ title: "กรุณาเพิ่มรายการงานอย่างน้อย 1 รายการ", variant: "destructive" })
    if (items.some(i => !i.description.trim())) return toast({ title: "กรุณากรอกรายการงานให้ครบ", variant: "destructive" })
    if (!selectedSupplier) return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })

    setSaveMode(mode)
    setShowConfirmModal(true)
  }

  const confirmSave = async () => {
    try {
      const payload = {
        wrId: selectedWRId !== "none" ? Number(selectedWRId) : null,
        supplierId: selectedSupplier!.id,
        supplierName: selectedSupplier!.companyName,
        requester: requester.trim() || "ไม่ระบุ",
        department: department.trim() || null,
        orderDate: format(orderDate, "yyyy-MM-dd"),
        deliveryDate: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : null,
        deliveryLocation: deliveryLocation?.trim() || null,
        remark: remark?.trim() || null,
        paymentTerms: paymentTerms?.trim() || "ภายใน 30 วัน",
        paymentMethod: paymentMethod || null,
        currency: currency,
        tax: tax?.trim() || null,
        status: saveMode,
        items: items.map(i => ({
          description: i.description.trim(),
          quantity: i.quantity,
          unit: i.unit?.trim() || "ชิ้น",
          unitPrice: i.unitPrice,
        })),
      }

      const res = await fetch(`${API_BASE_URL}/wo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "สร้าง WO ไม่สำเร็จ")

      toast({ title: "สร้าง WO สำเร็จ!" })
      router.push("/wo")
    } catch (err: any) {
      toast({ title: "สร้าง WO ไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setShowConfirmModal(false)
    }
  }

  // Supplier Combobox ที่สมบูรณ์และไม่ล้นหน้าจอ
  const SupplierCombobox = () => (
    <Combobox value={selectedSupplier} onChange={setSelectedSupplier} nullable>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Building2 className="h-5 w-5 text-slate-400" />
        </div>
        <ComboboxInput
          className={cn(
            "pl-10 pr-10 w-full h-10 rounded-md border border-input bg-background text-sm",
            "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          )}
          displayValue={(supplier: Supplier | null) => supplier?.companyName || ""}
          onChange={(e) => setSupplierQuery(e.target.value)}
          placeholder="--เลือก Supplier--"
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5"
        style={{ maxWidth: "100%" }}
      >
        {filteredSuppliers.length === 0 ? (
          <div className="px-4 py-2 text-center text-slate-500">
            {supplierQuery ? `ไม่พบ "${supplierQuery}"` : "ไม่มี Supplier ที่ใช้งานอยู่"}
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <ComboboxOption
              key={supplier.id}
              value={supplier}
              className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
            >
              {({ selected, active }) => (
                <>
                  <span className={cn("block break-words pr-8", selected && "font-medium")}>
                    {supplier.companyName}
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
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล WR...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full space-y-6 px-6">
      {/* Header */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/wo">
                <Button variant="outline" size="icon" className="hover:dark:bg-slate-600 cursor-pointer">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Increase WO</h1>
                {/* <p className="text-sm font-medium text-slate-200">Work Order</p> */}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 hover:dark:bg-slate-600 cursor-pointer"
              >
                <Save className="h-4 w-4 mr-2" /> Draft
              </Button>
              <Button onClick={() => handleSave("pending")} className="bg-blue-600 hover:bg-green-600 cursor-pointer dark:text-white">
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* เลือก WR */}
      <Card>
        <CardHeader>
          <CardTitle>WR Approved</CardTitle>
          {/* <p className="text-sm text-muted-foreground">มี {approvedWRs.length} รายการที่อนุมัติแล้ว</p> */}
        </CardHeader>
        <CardContent>
          <Select value={selectedWRId} onValueChange={setSelectedWRId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="กรุณาเลือก WR ที่อนุมัติแล้ว" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">--Select Work Request--</SelectItem>
              {approvedWRs.map(wr => (
                <SelectItem key={wr.id} value={wr.id.toString()}>
                  {wr.wrNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ฟอร์มข้อมูลหลัก */}
      <Card>
        <CardContent className="pt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={projectName} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input value={requester || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department || ""} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input value={jobNote || ""} readOnly className="bg-gray-50" />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  checked={planType === "PLAN"}
                  onChange={() => setPlanType("PLAN")}
                  className="h-4 w-4"
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
              <Label>Order Date</Label>
              <Input
                type="date"
                value={format(orderDate, "yyyy-MM-dd")}
                onChange={(e) => e.target.value && setOrderDate(new Date(e.target.value))}
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setDeliveryDate(e.target.value ? new Date(e.target.value) : null)}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={traderName || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input value={jobNo || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input value={ccNo || ""} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input value={expteamQuotation || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input value={estimatedPrCost || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input value={jobBalanceCost || ""} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 ">
              <Label>Supplier <span className="text-red-600">*</span></Label>
              <SupplierCombobox />
            </div>
            <div className="space-y-2">
              <Label>Currency <span className="text-red-600">*</span></Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full bg-gray-50">
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
              <Label>Discount Type</Label>
              <Input value={discountType || ""} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input value={discountValue || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>With Holding Tax</Label>
              <Input value={tax || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input value={deliveryLocation || ""} readOnly className="bg-gray-50" />
            </div>
            {/* Plan / Unplan */}
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planType === "PLAN"}
                    onChange={() => setPlanType("PLAN")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

                {/* UNPLAN */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planType === "UNPLAN"}
                    onChange={() => setPlanType("UNPLAN")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Unplan</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 text-sm w-full dark:bg-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Waiting for approved</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
              <div className="space-y-2">
                <Label>Payment Method <span className="text-red-600">*</span></Label>
                <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="font-normal cursor-pointer">Cash </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="payment-credit" />
                    <Label htmlFor="payment-credit" className="font-normal cursor-pointer">Credit </Label>
                  </div>
                </RadioGroup>
              </div>
              {paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label>Remark</Label>
              <Textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* รายการงาน */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product list</CardTitle>
            <Button onClick={addItem} className="dark:bg-green-600 bg-green-600 text-white hover:dark:bg-slate-600 hover:bg-blue-600 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">UOM</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการงาน
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{item.itemNo}</TableCell>
                      <TableCell>
                        <Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="text-center" />
                      </TableCell>
                      <TableCell>
                        <Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="text-center" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)} className="text-right" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t text-right space-y-3">
                <div className="flex justify-end gap-12 p-3">
                  <span>Total</span>
                  <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3">
                  <span>VAT (7.00%)</span>
                  <span className="font-bold w-32">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold">
                  <span>total Amount</span>
                  <span className="w-32 text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการบันทึก WO</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการบันทึก WO นี้ในสถานะ <strong>{saveMode === "draft" ? "ร่าง" : "รออนุมัติ"}</strong> หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>ยืนยัน</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}