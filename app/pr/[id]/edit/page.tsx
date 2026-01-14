"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, Building2, Check, ChevronsUpDown, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react"
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Supplier {
  id: number
  companyName: string
  isActive: boolean
}

interface Department {
  id: string
  name: string
}

interface PRData {
  id: number
  prNumber: string
  jobId: number
  requester: string
  jobNote: string
  extraCharge: boolean
  requestDate: string
  requiredDate: string
  duration: number
  deliveryLocation: string
  planType: "PLAN" | "UNPLAN"
  supplierId: number
  currency: string
  discountType: string
  discountValue: string
  vatPercent: number
  discountPercent: number
  paymentMethod: string
  paymentTerms: string
  remark: string
  items: any[]
  approvals: any[]
  job?: any
  status?: string
}

export default function EditPRPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [prData, setPrData] = useState<PRData | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<PRItem[]>([])
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [status, setStatus] = useState(prData?.status || "DRAFT")

  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    description: string
    isSuccess: boolean
  }>({ title: "", description: "", isSuccess: false })

  const departments: Department[] = [
    { id: "1", name: "Purchasing" },
    { id: "2", name: "Engineering" },
    { id: "3", name: "Management" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [prRes, suppliersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/pr/${id}`),
          fetch(`${API_BASE_URL}/suppliers`)
        ])

        if (!prRes.ok) throw new Error("ไม่สามารถโหลดข้อมูล PR ได้")

        const pr = await prRes.json()
        const suppliersData = suppliersRes.ok ? await suppliersRes.json() : []

        setPrData(pr)
        setSuppliers(suppliersData)
        setDeliveryLocation(pr.deliveryLocation || "")
        setRemark(pr.remark || "")
        setVatRate(pr.vatPercent || 7)
        setServiceTaxRate(pr.discountPercent || 0)

        // Format items
        const formattedItems: PRItem[] = (pr.items || []).map((item: any, index: number) => ({
          id: String(item.id || Date.now() + index),
          itemNo: index + 1,
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "",
          estimatedPrice: Number(item.unitPrice || item.estimatedPrice || 0),
          totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.estimatedPrice || 0))
        }))

        setItems(formattedItems)
      } catch (err) {
        console.error("Fetch error:", err)
        showModal(
          "โหลดข้อมูลไม่สำเร็จ",
          err instanceof Error ? err.message : "กรุณาลองใหม่",
          false
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [remark, setRemark] = useState("")
  const [department, setDepartment] = useState("")
  const [supplierComboId, setSupplierComboId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [planType, setPlanType] = useState<"PLAN" | "UNPLAN">(prData?.planType || "PLAN")
  const [extraCharge, setExtraCharge] = useState(false)


  useEffect(() => {
    if (prData) {
      setStatus(prData.status || "DRAFT")
      setDeliveryLocation(prData.deliveryLocation || "")
      setRemark(prData.remark || "")
      setDepartment(prData.job?.department || "")
      setSupplierComboId(prData.supplierId?.toString() || "0")
      setPaymentMethod((prData.paymentMethod as "cash" | "credit") || "cash")
      setPaymentTerms(prData.paymentTerms || "")
      setPlanType(prData.planType)
      setExtraCharge(!!prData.extraCharge)
    }
  }, [prData])

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

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateItem = (itemId: string, field: keyof PRItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
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
  const totalAmount = subtotal + vatAmount - serviceTaxAmount

  const showModal = (title: string, description: string, isSuccess: boolean) => {
    setModalContent({ title, description, isSuccess })
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    if (modalContent.isSuccess) {
      router.push("/pr")
    }
  }

  const handleSave = async () => {
    if (!prData) return

    const invalidItem = items.find(item => !item.description || !item.unit || item.estimatedPrice <= 0)
    if (invalidItem) {
      showModal("ข้อมูลไม่ครบถ้วน", "กรุณากรอกรายการสินค้าให้ครบถ้วน", false)
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        jobId: prData.jobId,
        supplierId: Number(supplierComboId) || prData.supplierId,
        deliveryLocation,
        requester: prData.requester || "",
        vatPercent: Number(vatRate),
        discountPercent: Number(serviceTaxRate),
        // paymentMethod,
        // paymentTerms,
        // remark,
        status,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.estimatedPrice)
        })),
        approvals: prData.approvals || []
      }

      const response = await fetch(`${API_BASE_URL}/pr/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "ไม่สามารถบันทึกได้")
      }

      showModal("แก้ไขสำเร็จ", `อัปเดต PR ${prData.prNumber} เรียบร้อยแล้ว`, true)
    } catch (err: any) {
      showModal("เกิดข้อผิดพลาด", err.message || "ไม่สามารถบันทึกการแก้ไขได้", false)
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
          value={supplierComboId}
          onChange={(v: string | null) => {
            setSupplierComboId(v || "")
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
              displayValue={(val: string) => {
                const supplier = suppliers.find(s => s.id.toString() === val)
                return supplier?.companyName || ""
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="--Select Suppliers--"
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
                      <span className={cn("block truncate", selected && "font-medium")}>
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
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading PR...</p>
        </div>
      </div>
    )
  }

  if (!prData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูล PR</p>
          <Button onClick={() => router.push("/pr")} className="mt-4">
            Back to PR
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full px-4 py-4 md:py-6 space-y-6 dark:bg-black">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/pr")} className="hover:bg-slate-100 cursor-pointer hover:dark:bg-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Edit PR: {prData.prNumber}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-200">Edit (PR)</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={submitting} className="bg-blue-600 hover:bg-green-600 dark:text-white cursor-pointer">
              {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>

        {/* ฟอร์มหลัก */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6 dark:bg-black border border-white-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input defaultValue={prData.job?.jobName || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select defaultValue={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue placeholder="--Select Department--" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input defaultValue={prData.requester || ""} className="h-10 text-sm" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input defaultValue={prData.jobNote || "-"} className="h-10 text-sm" />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="extraCharge"
                  checked={prData.extraCharge} // ใช้ state
                  onChange={(e) => setExtraCharge(e.target.checked)} // เปลี่ยนค่าเมื่อคลิก
                  className="h-4 w-4 rounded border-gray-300 text-blue-600
               dark:bg-black dark:border-gray-600"
                />
                <Label htmlFor="extraCharge" className="text-sm dark:text-slate-200 cursor-pointer">
                  Extra charge
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Request date</Label>
              <Input type="date" defaultValue={prData.requestDate || ""} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>ROS date</Label>
              <Input type="date" defaultValue={prData.requiredDate || ""} className="h-10" />
            </div>
          </div>

          {/* ข้อมูลจาก Job */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input defaultValue={prData.job?.trader || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input defaultValue={prData.job?.jobNo || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input defaultValue={prData.job?.ccNo || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input defaultValue={prData.job?.expteamQuotation || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input defaultValue={prData.job?.estimatedPrCost?.toLocaleString() || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input defaultValue={prData.job?.jobBalanceCost || ""} readOnly className="h-10 text-sm bg-gray-100" />
            </div>
          </div>

          {/* Supplier & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <SupplierCombobox />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Currency <span className="text-red-600">*</span></Label>
              <Input
                value={prData.currency || "-"}
                readOnly
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Distcount Type <span className="text-red-600">*</span></Label>
              <Input
                value={prData.discountType || "-"}
                readOnly
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Discount Value <span className="text-red-600">*</span></Label>
              <Input
                value={prData.discountValue || "-"}
                readOnly
                className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input
                value={deliveryLocation}
                onChange={e => setDeliveryLocation(e.target.value)}
                placeholder="สถานที่ส่งของ"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planType === "PLAN"} // ใช้ state แยก
                    onChange={() => setPlanType("PLAN")} // เปลี่ยน state เมื่อคลิก
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
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              {/* Payment Method */}
              <div className="flex items-center gap-3">
                <Label className="whitespace-nowrap">Payment Method <span className="text-red-600">*</span></Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "cash" | "credit")}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="font-normal cursor-pointer">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="credit" id="payment-credit" />
                    <Label htmlFor="payment-credit" className="font-normal cursor-pointer">
                      Credit
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Terms (อยู่ข้างหลัง) */}
              {paymentMethod === "credit" && (
                <div className="flex flex-col">
                  <Label className="whitespace-nowrap">Payment Terms</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="เช่น Net 30, COD เป็นต้น"
                    className="h-10 w-52 text-sm mt-2"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Remark */}
          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={3}
              placeholder="Remark..."
              className="resize-none text-sm"
            />
          </div>
        </div>

        {/* ตารางรายการสินค้า */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Product list</h2>
            <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-green-600 dark:text-white cursor-pointer" >
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-24 text-center">Qty</TableHead>
                  <TableHead className="w-24 text-center">UOM</TableHead>
                  <TableHead className="w-32 text-right">Unit Price</TableHead>
                  <TableHead className="w-32 text-right">Amount</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{item.itemNo}</TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                        min="1"
                        className="h-9 w-full text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={e => updateItem(item.id, "unit", e.target.value)}
                        className="h-9 w-full text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.estimatedPrice}
                        onChange={e => updateItem(item.id, "estimatedPrice", Number(e.target.value) || 0)}
                        min="0"
                        className="h-9 w-full text-sm text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {((item.quantity || 0) * (item.estimatedPrice || 0)).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
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
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">Total</span>
              <span className="font-medium w-32">{subtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">VAT ({vatRate}%)</span>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm"
                min="0"
                step="0.01"
              />
              <span className="font-medium w-32">{vatAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">หัก ณ ที่จ่าย ({serviceTaxRate}%)</span>
              <input
                type="number"
                value={serviceTaxRate}
                onChange={e => setServiceTaxRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm"
                min="0"
                step="0.01"
              />
              <span className="font-medium w-32">{serviceTaxAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center pt-2 border-t">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-xl font-bold text-green-600 w-32">{totalAmount.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {modalContent.isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <DialogTitle className={modalContent.isSuccess ? "text-green-600" : "text-red-600"}>
                {modalContent.title}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-base">
              {modalContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleModalClose} className={modalContent.isSuccess ? "bg-green-600 hover:bg-green-700 dark:text-white cursor-pointer" : "cursor-pointer hover:dark:bg-slate-400"}>
              {modalContent.isSuccess ? "Agree" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}