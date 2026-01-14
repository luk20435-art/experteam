"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { addDays, differenceInDays } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface PRItem {
  description: string
  quantity: number
  unit?: string
  unitPrice: number
  totalPrice?: number
}

interface Job {
  jobName: string
  trader?: string
  jobNo?: string
  jobNote?: string
  ccNo?: string
  expteamQuotation?: string
  jobBalanceCost?: string
  estimatedPrCost?: number
}

interface PurchaseRequisition {
  id: number
  prNumber: string
  requester: string
  requestDate: string
  requiredDate: string
  duration: number
  deliveryLocation: string
  supplier?: string
  supplierId?: number | null
  remark?: string
  vatPercent: number
  discountPercent: number
  grandTotal: number
  status: string
  items: PRItem[]
  job?: Job
  approvals: any[]
}

interface POItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export default function CreatePOPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [prs, setPRs] = useState<PurchaseRequisition[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedPRId, setSelectedPRId] = useState<string>("")

  const [projectName, setProjectName] = useState("")
  const [requester, setRequester] = useState("")
  const [department, setDepartment] = useState("")
  const [traderName, setTraderName] = useState("")
  const [jobNo, setJobNo] = useState("")
  const [jobNote, setJobNote] = useState("")
  const [ccNo, setCcNo] = useState("")
  const [expteamQuotation, setExpteamQuotation] = useState("")
  const [jobBalanceCost, setJobBalanceCost] = useState("")
  const [currency, setCurrency] = useState("")
  const [distcountType, setDistcountType] = useState("")
  const [distcountValue, setDistcountValue] = useState("")
  const [estimatedPrCost, setEstimatedPrCost] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("เครดิต 30 วัน")
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [remark, setRemark] = useState(0)

  const [items, setItems] = useState<POItem[]>([])

  const today = new Date().toISOString().split("T")[0]
  const [orderDate] = useState(today)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [durationDays, setDurationDays] = useState(0)

  // สถานะ PO
  const [status, setStatus] = useState<string>("pending") // default รออนุมัติ

  // Modal ยืนยัน
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [formData, setFormData] = useState({
    jobName: "",
    jobNote: "",
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
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "",
    jobId: 0,
  })

  // ดึงข้อมูล PR
  useEffect(() => {
    const fetchPRs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/pr`)
        if (!res.ok) throw new Error("โหลด PR ไม่สำเร็จ")
        const data: PurchaseRequisition[] = await res.json()
        setPRs(data)
      } catch (err) {
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchPRs()
  }, [toast])

  const approvedPRs = prs.filter(pr => pr.status === "APPROVED")

  // คำนวณจำนวนวัน
  useEffect(() => {
    if (orderDate && deliveryDate) {
      const days = differenceInDays(new Date(deliveryDate), new Date(orderDate))
      if (days >= 0) setDurationDays(days)
    }
  }, [orderDate, deliveryDate])

  const handleDurationChange = (days: number) => {
    setDurationDays(days)
    if (orderDate && days >= 0) {
      const newDate = addDays(new Date(orderDate), days)
      setDeliveryDate(newDate.toISOString().split("T")[0])
    }
  }

  useEffect(() => {
    if (!selectedPRId || selectedPRId === "none") {
      setProjectName("")
      setRequester("")
      setDepartment("")
      setTraderName("")
      setJobNo("")
      setJobNote("")
      setCcNo("")
      setExpteamQuotation("")
      setJobBalanceCost("")
      setCurrency("")
      setDistcountType("")
      setDistcountValue("")
      setEstimatedPrCost("")
      setDeliveryLocation("")
      setSupplierName("")
      setNotes("")
      setPaymentTerms("เครดิต 30 วัน")
      setVatRate(7)
      setServiceTaxRate(0)
      setDeliveryDate("")
      setDurationDays(0)
      setItems([])
      setRemark("")
      setStatus("pending")
      return
    }

    const pr = prs.find(p => p.id.toString() === selectedPRId)
    if (!pr) return

    setProjectName(pr.job?.jobName || "")
    setRequester(pr.requester || "")
    setDepartment("")
    setTraderName(pr.job?.trader || "")
    setJobNo(pr.job?.jobNo || "")
    setJobNote(pr.job?.jobNote || "")
    setCcNo(pr.job?.ccNo || "")
    setExpteamQuotation(pr.job?.expteamQuotation || "")
    setJobBalanceCost(pr.job?.jobBalanceCost || "")
    setCurrency(pr.currency || "-")
    setDistcountType(pr.distcountType || "-")
    setDistcountValue(pr.distcountValue || "-")
    setEstimatedPrCost(pr.job?.estimatedPrCost?.toString() || "")
    setDeliveryLocation(pr.deliveryLocation || "")
    setSupplierName(pr.supplier || "")
    setNotes(pr.remark || "")
    setVatRate(pr.vatPercent || 7)
    setServiceTaxRate(pr.discountPercent || 0)
    setPaymentTerms("เครดิต 30 วัน")

    if (pr.requiredDate) {
      setDeliveryDate(pr.requiredDate)
      const days = differenceInDays(new Date(pr.requiredDate), new Date(orderDate))
      if (days >= 0) setDurationDays(days)
    }

    setItems(pr.items.map((item, i) => ({
      id: `po-item-${Date.now()}-${i}`,
      itemNo: i + 1,
      description: item.description.trim() || "รายการสินค้าจาก PR",
      quantity: item.quantity || 1,
      unit: item.unit || "ชิ้น",
      unitPrice: item.unitPrice || 0,
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
    })))
  }, [selectedPRId, prs, orderDate])

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `po-item-${Date.now()}`,
      itemNo: prev.length + 1,
      description: "รายการสินค้าใหม่",
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

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let updatedValue = value;
        if (field === "quantity" || field === "unitPrice") {
          updatedValue = Number(value) || 0;
        }
        const updated = { ...item, [field]: updatedValue }
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = (updated.quantity || 0) * (updated.unitPrice || 0)
        }
        return updated
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount - serviceTaxAmount

  const handleSave = () => {
    if (items.length === 0) {
      toast({ title: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ", variant: "destructive" })
      return
    }
    if (items.some(item => !item.description.trim())) {
      toast({ title: "กรุณากรอกรายการสินค้าให้ครบทุกบรรทัด", variant: "destructive" })
      return
    }

    setShowConfirmModal(true)
  }

  const confirmSave = async () => {
    try {
      const payload = {
        prId: selectedPRId !== "none" ? Number(selectedPRId) : null,
        orderDate,
        deliveryDate: deliveryDate || orderDate,
        remark: notes || "",
        paymentTerms: paymentTerms || "เครดิต 30 วัน",
        items: items.map(item => ({
          description: item.description.trim() || "รายการสินค้า",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "ชิ้น",
          unitPrice: Number(item.unitPrice) || 0,
        })),
        // ส่ง status เป็นตัวเล็กตรงตาม enum
        status: status, // "draft", "pending" ถูกต้องแล้ว ไม่ต้อง .toUpperCase()
      }

      const res = await fetch(`${API_BASE_URL}/po`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message || "บันทึก PO ไม่สำเร็จ")
      }

      toast({
        title: "สร้าง PO สำเร็จ!",
        description: "กลับไปหน้ารายการ PO",
      })
      router.push("/pattycash")
    } catch (err: any) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setShowConfirmModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6 dark:bg-black">

        {/* Header */}
        <Card className="border-0 shadow-lg border border-white-800 dark:bg-black">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 curser-pointer">
                <Link href="/pattycash">
                  <Button variant="outline" size="icon" className="cursor-pointer hover:dark:bg-slate-700">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Increase (PO)</h1>
                  <p className="text-lg text-slate-400 font-medium">Purchase Order</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setStatus("draft"); handleSave(); }} className="bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 hover:dark:bg-blue-700 cursor-pointer">
                  <Save className="h-4 w-4 mr-2" /> Draft
                </Button>
                <Button onClick={() => { setStatus("pending"); handleSave(); }} className="bg-blue-600 hover:bg-green-600 dark:text-white cursor-pointer">
                  <Save className="h-4 w-4 mr-2" /> Save 
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* เลือก PR ที่อนุมัติแล้ว */}
        <Card className="dark:bg-black">
          <CardHeader>
            <CardTitle>เลือก PR ที่อนุมัติแล้ว</CardTitle>
            <p className="text-sm text-muted-foreground">มี {approvedPRs.length} รายการที่อนุมัติแล้ว</p>
          </CardHeader>
          <CardContent>
            <Select value={selectedPRId} onValueChange={setSelectedPRId}>
              <SelectTrigger>
                <SelectValue placeholder="กรุณาเลือก PR ที่อนุมัติแล้ว" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- สร้าง PO ใหม่โดยไม่เลือก PR --</SelectItem>
                {approvedPRs.map(pr => (
                  <SelectItem key={pr.id} value={pr.id.toString()}>
                    {pr.prNumber} - {pr.job?.jobName || "ไม่ระบุโครงการ"} (ผู้ขอ: {pr.requester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก - ครบทุกคอลัมน์เหมือนหน้า Edit */}
        <Card className="dark:bg-black">
          <CardContent className="pt-6 space-y-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={projectName} readOnly placeholder="Project Name" className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={department || ""} readOnly placeholder="Department"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Requester</Label>
                <Input value={requester || ""} readOnly placeholder="Requester"  className="bg-gray-50 dark:bg-black" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Job Note</Label>
                <Input value={jobNote || ""} readOnly placeholder="Job Note"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Request date</Label>
                <Input type="date" value={orderDate} readOnly className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>ROS date</Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={traderName} readOnly placeholder="Client"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Job No.</Label>
                <Input value={jobNo || ""} readOnly placeholder="Job No."  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>CC No.</Label>
                <Input value={ccNo || ""} readOnly placeholder="CC No"  className="bg-gray-50 dark:bg-black" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Expteam Quotation</Label>
                <Input value={expteamQuotation || ""} readOnly placeholder="Expteam Quotation"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Estimated PR Cost</Label>
                <Input value={estimatedPrCost || ""} readOnly placeholder="Estimated PR Cost"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Job Balance Cost</Label>
                <Input value={jobBalanceCost || ""} readOnly placeholder="Job Balance Cost"  className="bg-gray-50 dark:bg-black" />
              </div>
            </div>

            {/* Row 5 - Supplier, Delivery Location, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input value={supplierName} readOnly placeholder="Supplier"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={currency} readOnly placeholder="Currency"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Input value={distcountType || ""} readOnly placeholder="Discount Type"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input value={distcountValue || ""} readOnly placeholder="Discount Value"  className="bg-gray-50 dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <Input value={deliveryLocation || ""} onChange={e => setDeliveryLocation(e.target.value)} placeholder="กรุณาเลือก PR ที่อนุมัติแล้ว"  className="dark:bg-black" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 text-sm w-full dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ร่าง</SelectItem>
                    <SelectItem value="pending">รออนุมัติ</SelectItem>
                    <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        Cash (เงินสด)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="payment-credit" />
                      <Label htmlFor="payment-credit" className="font-normal cursor-pointer">
                        Credit (เครดิต)
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
                      placeholder=""
                    />
                  </div>
                )}
              </div>
            </div>

            {/* หมายเหตุและเงื่อนไขการชำระเงิน */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 ">
              <div className="space-y-2">
                <Label>Remark</Label>
                <Textarea value={remark} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Remark..."  className="dark:bg-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* รายการสินค้า */}
        <Card className="dark:bg-black">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>รายการสินค้า</CardTitle>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-green-600 dark:text-white cursor-pointer">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ลำดับ</TableHead>
                    <TableHead>รายการ</TableHead>
                    <TableHead className="w-24 text-center">จำนวน</TableHead>
                    <TableHead className="w-24 text-center">หน่วย</TableHead>
                    <TableHead className="w-32 text-right">ราคา/หน่วย</TableHead>
                    <TableHead className="w-32 text-right">รวม</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        กรุณาเลือก PR หรือเพิ่มรายการสินค้า
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.itemNo}</TableCell>
                        <TableCell>
                          <Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="dark:bg-black" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="text-center dark:bg-black" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="text-center dark:bg-black" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)} className="text-right dark:bg-black" />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon" onClick={() => removeItem(item.id)} className="cursor-pointer hover:dark:bg-red-400">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t text-right space-y-3 ">
                <div className="flex justify-end gap-12 p-3 rounded-lg bg-blue-50 dark:bg-black">
                  <span className="font-medium">ยอดรวม</span>
                  <span className="font-bold w-40">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3 rounded-lg bg-blue-50 dark:bg-black">
                  <span>VAT ({vatRate}%)</span>
                  <span className="font-bold text-white w-40">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3 rounded-lg bg-purple-50 dark:bg-black">
                  <span>หัก ณ ที่จ่าย ({serviceTaxRate}%)</span>
                  <span className="font-bold text-white w-40">{formatCurrency(serviceTaxAmount)}</span>
                </div>
                <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold text-white">
                  <span>รวมทั้งสิ้น</span>
                  <span className="w-40 dark:text-green-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal ยืนยัน */}
        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันสร้าง PO</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการสร้าง PO ใหม่ด้วยสถานะ <strong>
                  {status === "draft" ? "ร่าง" : status === "pending" ? "รออนุมัติ" : "อนุมัติแล้ว"}
                </strong> หรือไม่?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>ยืนยัน</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}