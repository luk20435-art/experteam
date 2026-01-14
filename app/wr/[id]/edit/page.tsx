"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, Plus, Trash2, Check, ChevronsUpDown, Building2 } from "lucide-react"
import { addDays, differenceInDays, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn, formatCurrency } from "@/src/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WRItem {
  id?: string
  description: string
  quantity: number
  unit?: string
  unitPrice: number
  totalPrice: number
}

interface Job {
  jobName: string
  trader?: string
  jobNo?: string
  ccNo?: string
  expteamQuotation?: string
  estimatedPrCost?: number
}

interface WRData {
  id: number
  wrNumber: string
  department: string
  requester: string
  extraCharge: boolean
  requestDate: string
  requiredDate: string
  jobBalanceCost: string
  deliveryLocation?: string
  remark?: string
  status: string
  currency: string
  discountType: string
  discountValue: string
  job?: Job
  jobNote: string
  planType: "PLAN" | "UNPLAN"
  items: WRItem[]
}

interface Supplier {
  id: number
  companyName: string
  isActive: boolean
}

export default function WREditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast() // TypeScript รู้ type อัตโนมัติจาก useToast hook

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wrData, setWRData] = useState<WRData | null>(null)
  const [items, setItems] = useState<WRItem[]>([])
  const [status, setStatus] = useState<string>("pending")
  const [remark, setRemark] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [requestDate, setRequestDate] = useState("")
  const [requiredDate, setRequiredDate] = useState("")
  const [durationDays, setDurationDays] = useState(0)
  const [department, setDepartment] = useState("")
  const [requester, setRequester] = useState("")
  const [jobNote, setJobNote] = useState("")
  const [jobBalanceCost, setJobBalanceCost] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierComboId, setSupplierComboId] = useState("")
  const [planType, setPlanType] = useState<"PLAN" | "UNPLAN">(wrData?.planType || "PLAN")
  const [extraCharge, setExtraCharge] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [wrRes, suppliersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/wr/${id}`),
          fetch(`${API_BASE_URL}/suppliers`)
        ])

        if (!wrRes.ok) throw new Error("ไม่สามารถโหลดข้อมูล WR ได้")

        const wr = await wrRes.json()
        const suppliersData = suppliersRes.ok ? await suppliersRes.json() : []

        // ===== SET WR DATA =====
        setWRData(wr)
        setSuppliers(suppliersData)
        setRequester(wr.requester || "")
        setRequiredDate(wr.requiredDate || "")
        setRequestDate(wr.requestDate || "")
        setDeliveryLocation(wr.deliveryLocation || "")
        setRemark(wr.remark || "")
        setStatus(wr.status || "pending")
        setJobNote(wr.jobNote || "")

        // ===== คำนวณระยะเวลา =====
        if (wr.requestDate && wr.requiredDate) {
          const days = differenceInDays(
            new Date(wr.requiredDate),
            new Date(wr.requestDate)
          )
          if (days >= 0) setDurationDays(days)
        }

        // ===== FORMAT ITEMS =====
        const formattedItems: WRItem[] = (wr.items || []).map(
          (item: any, index: number) => ({
            id: String(item.id || Date.now() + index),
            description: item.description || "",
            quantity: Number(item.quantity) || 1,
            unit: item.unit || "ชิ้น",
            unitPrice: Number(item.unitPrice || 0),
            totalPrice:
              (Number(item.quantity) || 1) *
              (Number(item.unitPrice) || 0),
          })
        )

        setItems(formattedItems)
      } catch (err) {
        console.error("Fetch error:", err)
        toast({
          title: "โหลดข้อมูลไม่สำเร็จ",
          description: err instanceof Error ? err.message : "กรุณาลองใหม่",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, toast])


  const handleDurationChange = (days: number) => {
    setDurationDays(days)
    if (requestDate && days >= 0) {
      const newDate = addDays(new Date(requestDate), days)
      setRequiredDate(newDate.toISOString().split("T")[0])
    } else {
      setRequiredDate("")
    }
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unit: "ชิ้น",
      unitPrice: 0,
      totalPrice: 0,
    }])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof WRItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        let updatedValue = value
        if (field === "quantity" || field === "unitPrice") {
          updatedValue = value === "" ? 0 : Number(value)
          if (isNaN(updatedValue)) updatedValue = 0
        }
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

  const confirmSave = async () => {
    try {
      setSaving(true)

      const cleanedItems = items.map(item => ({
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "ชิ้น",
        unitPrice: Number(item.unitPrice) || 0,
      }))

      const payload = {
        requester: requester.trim(),
        requiredDate: requiredDate || null,
        requestDate: requestDate || null,
        deliveryLocation: deliveryLocation.trim() || null,
        jobNote: jobNote.trim() || null,
        remark: remark.trim() || null,
        status,
        items: cleanedItems,
      }

      const res = await fetch(`${API_BASE_URL}/wr/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "บันทึกไม่สำเร็จ")
      }

      toast({ title: "บันทึกสำเร็จ!", description: `WR ${wrData?.wrNumber} ได้รับการอัปเดตแล้ว` })
      router.push(`/wr/${id}`)
    } catch (err: any) {
      toast({ title: "บันทึกไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
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

  if (loading || !wrData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล WR...</p>
        </div>
      </div>
    )
  }

  const job = (wrData.job || {}) as Job

  return (
    <div className="min-h-screen w-full space-y-6 px-6 mt-6 ">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between dark:bg-black border border-white-700">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/wr`}>
            <Button variant="outline" size="icon" className="cursor-pointer hover:dark:bg-slate-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit WR: {wrData.wrNumber}</h1>
            <p className="text-muted-foreground"></p>
          </div>
        </div>

        {/* ปุ่มบันทึก + Modal ยืนยัน */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={saving} className="bg-green-600 dark:bg-green-600 dark:text-white cursor-pointer hover:bg-blue-800 hover:dark:bg-blue-800 ">
              <Save className="h-5 w-5 mr-2 " />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการบันทึก</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการบันทึกการแก้ไข WR {wrData.wrNumber} ด้วยสถานะ <strong>
                  {status === "draft" ? "ร่าง" : status === "pending" ? "รออนุมัติ" : "อนุมัติแล้ว"}
                </strong> หรือไม่?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave} disabled={saving}>
                ยืนยันบันทึก
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ฟอร์มข้อมูล */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8 dark:bg-black border border-white-700">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={job.jobName || "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input
              value={department || "-"}
              onChange={(e) => setDepartment(e.target.value)}
              className="dark:bg-black"
            />
          </div>
          <div className="space-y-2">
            <Label>Requester</Label>
            <Input value={requester || "-"} onChange={(e) => setRequester(e.target.value)} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Job Note</Label>
            <Input
              value={jobNote || "-"}
              onChange={(e) => setJobNote(e.target.value)}
              className="h-10 text-sm dark:bg-black"
            />
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="extraCharge"
                checked={wrData.extraCharge} // ใช้ state
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
            <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Required Date</Label>
            <Input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="dark:bg-black" />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Client</Label>
            <Input value={job.trader || "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Job No.</Label>
            <Input value={job.jobNo || "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>CC No.</Label>
            <Input value={job.ccNo || "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Expteam Quotation</Label>
            <Input value={job.expteamQuotation || "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <Input value={job.estimatedPrCost ? Number(job.estimatedPrCost).toLocaleString() : "-"} readOnly className="bg-gray-50 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Job Balance Cost</Label>
            <Input
              value={jobBalanceCost || "-"}
              onChange={(e) => setJobBalanceCost(e.target.value)}
              className="dark:bg-black"
              placeholder=""
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2 ">
            <Label>Supplier</Label>
            <SupplierCombobox />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Currency <span className="text-red-600">*</span></Label>
            <Input
              value={wrData.currency || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Distcount Type <span className="text-red-600">*</span></Label>
            <Input
              value={wrData.discountType || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Discount Value <span className="text-red-600">*</span></Label>
            <Input
              value={wrData.discountValue || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label>Delivery Location</Label>
            <Input
              value={deliveryLocation || "-"}
              onChange={e => setDeliveryLocation(e.target.value)}
              placeholder=""
              className="h-10 text-sm dark:bg-black"
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
              <SelectTrigger className="w-full dark:bg-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Waiting for Apprval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
                <SelectItem value="unapproved">Unapproved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method <span className="text-red-600">*</span></Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "cash" | "credit")}
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

            {paymentMethod === "credit" && (
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="เช่น Net 30, COD เป็นต้น"
                />
              </div>
            )}
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="space-y-2">
          <Label>Remark</Label>
          <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} className="dark:bg-black" />
        </div>
      </div>

      {/* รายการขอเบิก */}
      <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-black border border-white-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">รายการขอเบิก</h2>
          <Button onClick={addItem} className="bg-green-600 dark:bg-green-600 dark:text-white cursor-pointer hover:bg-blue-800 hover:dark:bg-blue-600">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>

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
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>
                    <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} className="text-center" min="0" />
                  </TableCell>
                  <TableCell>
                    <Input value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} className="text-center" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)} className="text-right" min="0" step="0.01" />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length > 0 && (
            <div className="mt-8 pt-6 border-t text-right space-y-3">
              <div className="flex justify-end gap-12">
                <span>Total</span>
                <span className="font-normal w-32">{subtotal}</span>
              </div>
              <div className="flex justify-end gap-12 p-3 rounded dark:bg-black">
                <span>VAT (7.00%)</span>
                <span className="font-normal w-32">{vatAmount}</span>
              </div>
              <div className="flex justify-end gap-12 pt-4 border-t text-xl font-bold text-white-600">
                <span>Total Amount</span>
                <span className="w-32 dark:text-green-600">{totalAmount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}