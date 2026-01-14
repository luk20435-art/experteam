"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays } from "date-fns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface POItem {
  description: string
  quantity: number
  unit?: string
  unitPrice: number
}

interface Job {
  jobName: string
  trader: string
  jobNo: string
  ccNo: string
  expteamQuotation: string
  estimatedPrCost: number
}

interface POData {
  id: number
  poNumber: string
  status: string
  pr?: {
    requester: string
    requestDate: string
    requiredDate: string
    deliveryLocation?: string
    jobNote: string
    extraCharge: boolean
    trader: string
    supplierId: number
    discountType: string
    discountValue: string
    currency: string
    paymentMethod: string
    paymentTerms: string
    planType: "PLAN" | "UNPLAN"
    job?: Job
  }
  items: POItem[]
}

const statusDisplayMap: Record<string, string> = {
  draft: "ร่าง",
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
}

export default function POEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [poData, setPoData] = useState<POData | null>(null)
  const [items, setItems] = useState<POItem[]>([])
  const [status, setStatus] = useState<string>("draft")
  const [jobNote, setJobNote] = useState("")
  const [extraCharge, setExtraCharge] = useState("")
  const [remark, setRemark] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">()
  const [paymentTerms, setPaymentTerms] = useState("")
  const [planType, setPlanType] = useState<"PLAN" | "UNPLAN">()

  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/po/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูล PO ได้")
        const data = await res.json()

        setPoData(data)
        setItems(data.items || [])
        setStatus(data.status || "draft")
        setRemark(data.remark || "")
        setDeliveryDate(data.deliveryDate || data.pr?.requiredDate || "")
      } catch (err) {
        console.error(err)
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPO()
  }, [id, toast])

  const addItem = () => {
    setItems(prev => [...prev, {
      description: "",
      quantity: 1,
      unit: "ชิ้น",
      unitPrice: 0
    }])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    setItems(prev => prev.map((item, i) =>
      i === index
        ? {
          ...item,
          [field]: field === "quantity" || field === "unitPrice"
            ? (value === "" || value === null || isNaN(value) ? 0 : Number(value))
            : value
        }
        : item
    ))
  }

  const handleConfirmSave = async () => {
    if (!poData) return

    if (items.length === 0) {
      toast({ title: "ต้องมีอย่างน้อย 1 รายการสินค้า", variant: "destructive" })
      setConfirmOpen(false)
      return
    }

    if (items.some(item => !item.description.trim())) {
      toast({ title: "กรุณากรอกรายการสินค้าให้ครบ", variant: "destructive" })
      setConfirmOpen(false)
      return
    }

    try {
      setSaving(true)
      setConfirmOpen(false)

      const payload = {
        deliveryDate: deliveryDate || null,
        remark: remark.trim() || null,
        status: status,
        items: items.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity) || 0,
          unit: item.unit?.trim() || "ชิ้น",
          unitPrice: Number(item.unitPrice) || 0
        }))
      }

      const res = await fetch(`${API_BASE_URL}/po/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "บันทึกไม่สำเร็จ")
      }

      toast({
        title: "บันทึกสำเร็จ!",
        description: `PO ${poData.poNumber} ได้รับการอัปเดตแล้ว`,
      })

      router.push(`/po/${id}`)
    } catch (err: any) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveClick = () => {
    setConfirmOpen(true)
  }

  if (loading || !poData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  const vatAmount = subtotal * 0.07
  const totalAmount = subtotal + vatAmount

  const job = poData.pr?.job

  const durationDays = poData.pr?.requiredDate && poData.pr?.requestDate
    ? differenceInDays(new Date(poData.pr?.requiredDate), new Date(poData.pr?.requestDate))
    : "-"

  const displayStatus = statusDisplayMap[status] || "ร่าง"

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-900 ">
        <div className="px-6 sm:px- lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/po`)}
              className="hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Edit PO: {poData.poNumber}</h1>
              {/* <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">แก้ไขใบสั่งซื้อ</p> */}
            </div>
          </div>
          <Button
            onClick={handleSaveClick}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap ml-4 cursor-pointer hover:dark:bg-green-600"
          >
            <Save className="h-4 w-5 mr-2 hidden sm:block" />
            <span className="text-sm sm:text-base">{saving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Form Section */}
          <div className="bg-white dark:bg-black rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-900">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm">Project Name</Label>
                <Input defaultValue={job?.jobName || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Department</Label>
                <Input defaultValue="" className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Requester</Label>
                <Input defaultValue={poData.pr?.requester || ""} className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Job Note</Label>
                <Input defaultValue={poData.pr?.jobNote || "-"} readOnly className="h-10 text-sm bg-gray-100" />
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="extraCharge"
                    checked={poData.pr?.extraCharge}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600
                               dark:bg-black dark:border-gray-600"
                  />
                  <Label htmlFor="extraCharge" className="text-sm dark:text-slate-200 cursor-pointer">
                    Extra charge
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Request date</Label>
                <Input
                  defaultValue={
                    poData.pr?.requestDate
                      ? format(new Date(poData.pr.requestDate), "dd/MM/yyyy")
                      : "-"
                  }
                  readOnly
                  className="h-10 bg-gray-100 dark:bg-black"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">ROS date</Label>
                <Input
                  defaultValue={
                    poData.pr?.requiredDate
                      ? format(new Date(poData.pr.requiredDate), "dd/MM/yyyy")
                      : "-"
                  }
                  readOnly
                  className="h-10 bg-gray-100 dark:bg-black"
                />
              </div>

            </div>

            {/* Job Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm">client</Label>
                <Input defaultValue={poData.pr?.trader || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Job No.</Label>
                <Input defaultValue={job?.jobNo || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">CC No.</Label>
                <Input defaultValue={job?.ccNo || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Expteam Quotation</Label>
                <Input defaultValue={job?.expteamQuotation || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Estimated PR Cost</Label>
                <Input defaultValue={job?.estimatedPrCost?.toLocaleString() || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Job Balance Cost</Label>
                <Input defaultValue="-" readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
            </div>

            {/* Supplier, Delivery, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm">Supplier</Label>
                <Input defaultValue={poData.pr?.supplierId || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-200">Currency <span className="text-red-600">*</span></Label>
                <Input
                  value={poData.pr?.currency || "-"}
                  readOnly
                  className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400 bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-200">Distcount Type <span className="text-red-600">*</span></Label>
                <Input
                  value={poData.pr?.discountType || "-"}
                  readOnly
                  className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400 bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-200">Discount Value <span className="text-red-600">*</span></Label>
                <Input
                  value={poData.pr?.discountValue || "-"}
                  readOnly
                  className="h-10 text-sm dark:bg-black dark:border-white-700 dark:text-slate-400 bg-gray-100 mt-1.5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Delivery Location</Label>
                <Input defaultValue={poData.pr?.deliveryLocation || "-"} readOnly className="h-10 text-sm bg-gray-100 dark:bg-black" />
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
                    <SelectItem value="draft">ร่าง</SelectItem>
                    <SelectItem value="pending">รออนุมัติ</SelectItem>
                    <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="mt-2">
                  Payment Method <span className="text-red-600">*</span>
                </Label>

                <div className="flex items-center gap-6 mt-4">
                  {/* Radio */}
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "cash" | "credit")}
                    className="flex items-center gap-4"
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

                  {/* Payment Terms (แสดงเมื่อเลือก Credit) */}
                  {paymentMethod === "credit" && (
                    <div className="flex items-center gap-2">
                      <Label className="whitespace-nowrap">Payment Terms</Label>
                      <Input
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="h-9 w-40"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label className="text-sm">Remark</Label>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                placeholder="หมายเหตุเพิ่มเติม..."
                className="resize-none text-sm dark:bg-black"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white dark:bg-black rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-800 ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold">Product list</h2>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto hover:dark:bg-green-600">
                <Plus className="h-4 w-5 mr-2" />
                <span className="text-sm sm:text-base cursor-pointer">Add Product</span>
              </Button>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-slate-700">
                      <TableHead className="text-center text-xs sm:text-sm">No.</TableHead>
                      <TableHead className="text-xs sm:text-sm">Item</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">Qty</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">UOM</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Unit Price</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index} className="">
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            placeholder="รายการสินค้า"
                            className="text-xs sm:text-sm h-9 sm:h-10 dark:bg-blac"
                          />
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="text-center text-xs sm:text-sm h-9 sm:h-10 dark:bg-blac"
                          />
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Input
                            value={item.unit || ""}
                            onChange={(e) => updateItem(index, "unit", e.target.value)}
                            className="text-center text-xs sm:text-sm h-9 sm:h-10 dark:bg-blac"
                            placeholder="ชิ้น"
                          />
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                            className="text-right text-xs sm:text-sm h-9 sm:h-10 dark:bg-blac"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium text-xs sm:text-sm py-3 sm:py-4 whitespace-nowrap">
                          {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center py-3 sm:py-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-end gap-4 sm:gap-12">
                <span className="text-sm sm:text-base">ยอดรวม</span>
                <span className="font-medium w-24 sm:w-32 text-right text-sm sm:text-base">{subtotal.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-end gap-4 sm:gap-12 p-3 dark:bg-black rounded">
                <span className="text-sm sm:text-base">VAT (7.00%)</span>
                <span className="font-medium w-24 sm:w-32 text-right text-sm sm:text-base">{vatAmount.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-end gap-4 sm:gap-12">
                <span className="text-sm sm:text-base">หัก ณ ที่จ่าย (0.00%)</span>
                <span className="w-24 sm:w-32 text-right text-sm sm:text-base">0 บาท</span>
              </div>
              <div className="flex justify-end gap-4 sm:gap-12 pt-4 border-t border-gray-200 dark:border-slate-700 text-xl sm:text-2xl font-bold text-blue-600">
                <span>รวมทั้งสิ้น</span>
                <span className="w-24 sm:w-32 text-right">{totalAmount.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการบันทึก</DialogTitle>
            <DialogDescription>
              คุณต้องการบันทึกการแก้ไข PO {poData.poNumber} หรือไม่?<br />
              สถานะที่จะบันทึก: <strong>{statusDisplayMap[status] || status}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}