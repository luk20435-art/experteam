"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { addDays, differenceInDays, format, parseISO, isValid } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WOItem {
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

interface WOData {
  id: number
  extraCharge: boolean
  woNumber: string
  orderDate: string
  deliveryDate?: string | null
  deliveryLocation?: string
  planType: "PLAN" | "UNPLAN"
  supplier: string
  currency: string
  discountType: string
  discountValue: string
  remark?: string
  paymentTerms?: string
  status: string
  requester: string
  jobNote: string
  job?: Job
  items: WOItem[]
}

export default function WOEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [woData, setWOData] = useState<WOData | null>(null)
  const [items, setItems] = useState<WOItem[]>([])
  const [status, setStatus] = useState<string>("pending")
  const [remark, setRemark] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [supplier, setSupplier] = useState("")
  const [currency, setCurrency] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [durationDays, setDurationDays] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [planType, setPlanType] = useState<"PLAN" | "UNPLAN">()


  const parseBackendDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    return isValid(date) ? date : null
  }

  const formatDateDisplay = (date: Date | null): string => {
    if (!date || !isValid(date)) return "-"
    return format(date, "dd/MM/yyyy")
  }

  useEffect(() => {
    const fetchWO = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/wo/${id}`)
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()

        setWOData(data)
        setItems(data.items?.map((item: any, index: number) => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          unit: item.unit || "ชิ้น",
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
        })) || [])
        setStatus(data.status || "pending")
        setRemark(data.remark || "")
        setDeliveryLocation(data.deliveryLocation || "")
        setDeliveryDate(parseBackendDate(data.deliveryDate))

        const order = parseBackendDate(data.orderDate)
        const delivery = parseBackendDate(data.deliveryDate)
        if (order && delivery) {
          const days = differenceInDays(delivery, order)
          if (days >= 0) setDurationDays(days)
        }
      } catch (err) {
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchWO()
  }, [id, toast])

  useEffect(() => {
    if (woData?.orderDate && deliveryDate) {
      const order = parseBackendDate(woData.orderDate)
      if (order) {
        const days = differenceInDays(deliveryDate, order)
        if (days >= 0) setDurationDays(days)
        else setDurationDays(0)
      }
    }
  }, [deliveryDate, woData?.orderDate])

  const handleDurationChange = (days: number) => {
    setDurationDays(days)
    if (woData?.orderDate && days >= 0) {
      const order = parseBackendDate(woData.orderDate)
      if (order) {
        const newDate = addDays(order, days)
        setDeliveryDate(newDate)
      }
    }
  }

  const addItem = () => {
    setItems(prev => [...prev, {
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

  const updateItem = (index: number, field: keyof WOItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
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

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const vatAmount = subtotal * 0.07
  const totalAmount = subtotal + vatAmount

  const handleSave = () => {
    if (items.some(item => !item.description.trim())) {
      toast({ title: "กรุณากรอกรายการงานให้ครบ", variant: "destructive" })
      return
    }
    setShowConfirmModal(true)
  }

  const confirmSave = async () => {
    try {
      setSaving(true)

      const payload = {
        deliveryDate: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : null,
        deliveryLocation: deliveryLocation.trim() || null,
        remark: remark.trim() || null,
        paymentTerms: woData?.paymentTerms || "ภายใน 30 วัน",
        status: status,
        items: items.map(item => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unit: item.unit?.trim() || "ชิ้น",
          unitPrice: Number(item.unitPrice) || 0,
        })),
      }

      const res = await fetch(`${API_BASE_URL}/wo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "บันทึกไม่สำเร็จ")
      }

      toast({ title: "บันทึกสำเร็จ!", description: `WO ${woData?.woNumber} ได้รับการอัปเดตแล้ว` })
      router.push(`/wo`)
    } catch (err: any) {
      toast({ title: "บันทึกไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
      setShowConfirmModal(false)
    }
  }

  if (loading || !woData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล WO...</p>
        </div>
      </div>
    )
  }

  const job: Partial<Job> = woData.job || {}

  return (
    <div className="min-h-screen w-full space-y-6 px-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between dark:bg-black border border-white-700">
        <div className="flex items-center gap-4">
          <Link href={`/wo`}>
            <Button variant="outline" size="icon" className="dark:text-white cursor-pointer hover:dark:bg-slate-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">แก้ไข WO: {woData.woNumber}</h1>
            <p className="text-muted-foreground">Work Order</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="dark:bg-green-600 dark:text-white cursor-pointer hover:dark:bg-blue-600">
          <Save className="h-5 w-5 mr-2" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>

      {/* ฟอร์มข้อมูล */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8 dark:bg-black border border-white-700">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={job.jobName || "-"} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value="-" readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Requester</Label>
            <Input value={woData.requester} readOnly className="bg-gray-100" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Job Note</Label>
            <Input value={woData.jobNote} readOnly className="bg-gray-100" />
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="extraCharge"
                checked={woData.extraCharge}
                className="h-4 w-4 rounded border-gray-300 text-blue-600
                               dark:bg-black dark:border-gray-600"
              />
              <Label htmlFor="extraCharge" className="text-sm dark:text-slate-200 cursor-pointer">
                Extra charge
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Request Date</Label>
            <Input
              type="text"
              value={formatDateDisplay(parseBackendDate(woData.orderDate))}
              readOnly
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label>Ros Date</Label>
            <Input
              type="date"
              value={deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  const newDate = new Date(value)
                  if (isValid(newDate)) {
                    setDeliveryDate(newDate)
                  }
                } else {
                  setDeliveryDate(null)
                }
              }}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Client</Label>
            <Input value={job.trader || "-"} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Job No.</Label>
            <Input value={job.jobNo || "-"} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>CC No.</Label>
            <Input value={job.ccNo || "-"} readOnly className="bg-gray-100" />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Expteam Quotation</Label>
            <Input value={job.expteamQuotation || "-"} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <Input value={job.estimatedPrCost ? job.estimatedPrCost.toLocaleString() : "-"} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Job Balance Cost</Label>
            <Input value="-" readOnly className="bg-gray-100" />
          </div>
        </div>

        {/* Supplier, Delivery, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm">Supplier</Label>
            <Input defaultValue={supplier || "-Select Suppliers-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Currency <span className="text-red-600">*</span></Label>
            <Input
              value={currency || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Distcount Type <span className="text-red-600">*</span></Label>
            <Input
              value={discountType || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Discount Value <span className="text-red-600">*</span></Label>
            <Input
              value={discountValue || "-"}
              readOnly
              className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Delivery Location</Label>
            <Input defaultValue={deliveryLocation || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
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
            <Label className="text-sm">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 text-sm w-full dark:bg-black">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Waitong for Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
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
                  placeholder=""
                />
              </div>
            )}
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      {/* รายการงาน */}
      <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-black border border-white-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">รายการงาน</h2>
          <Button onClick={addItem} className="dark:bg-green-600 dark:text-white cursor-pointer hover:dark:bg-blue-600">
            <Plus className="h-5 w-5 mr-2" />
            เพิ่มงาน
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ลำดับ</TableHead>
                <TableHead>รายการงาน</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead className="text-center">หน่วย</TableHead>
                <TableHead className="text-right">ราคา/หน่วย</TableHead>
                <TableHead className="text-right">รวม</TableHead>
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
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>
                      <Input value={item.description} onChange={e => updateItem(index, "description", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.quantity} onChange={e => updateItem(index, "quantity", Number(e.target.value) || 0)} className="text-center" />
                    </TableCell>
                    <TableCell>
                      <Input value={item.unit} onChange={e => updateItem(index, "unit", e.target.value)} className="text-center" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.unitPrice} onChange={e => updateItem(index, "unitPrice", Number(e.target.value) || 0)} className="text-right" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" onClick={() => removeItem(index)} className="text-red-600">
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
              <div className="flex justify-end gap-12 p-3">
                <span>ยอดรวม</span>
                <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-end gap-12 p-3 rounded">
                <span>VAT (7.00%)</span>
                <span className="font-bold w-32">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold">
                <span>รวมทั้งสิ้น</span>
                <span className="w-32 text-green-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ยืนยัน */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-bold text-center">ยืนยันการบันทึก</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="text-center space-y-3 py-2">
            <div className="text-gray-700">คุณต้องการบันทึกการแก้ไขหรือไม่</div>
            <div className="text-lg font-semibold text-gray-900">WO {woData.woNumber}</div>
          </div>

          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel className="flex-1 border-2 border-gray-300 hover:bg-gray-100">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-70"
            >
              {saving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}