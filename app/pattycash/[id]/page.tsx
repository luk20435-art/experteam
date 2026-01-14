"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Loader2, CheckCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays } from "date-fns"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface POItem {
  description: string
  quantity: number
  unit?: string
  unitPrice: number
}

interface Job {
  jobName: string
  trader?: string
  jobNo?: string
  ccNo?: string
  expteamQuotation?: string
  estimatedPrCost?: number
}

interface PR {
  prNumber: string
  requester: string
  jobNote: string
  requestDate: string
  requiredDate: string
  currency: string
  discountType: string
  discountValue: string
  deliveryLocation?: string
  paymentMethod: string
  paymentTerms?: string
  job?: Job
}

interface POData {
  id: number
  poNumber: string
  prId: number | null
  pr?: PR | null
  orderDate: string
  deliveryDate?: string
  remark?: string
  supplier?: string
  status: string
  createdAt: string
  items: POItem[]
}

export default function PODetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [poData, setPoData] = useState<POData | null>(null)
  const [approving, setApproving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/po/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูล PO ได้")
        const data = await res.json()
        setPoData(data)
      } catch (err) {
        console.error(err)
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPO()
  }, [id, toast])

  const handleApprove = async () => {
    if (!poData) return

    if (!confirm(`คุณต้องการอนุมัติ PO ${poData.poNumber} หรือไม่?`)) return

    try {
      setApproving(true)

      const res = await fetch(`${API_BASE_URL}/po/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถอนุมัติ PO ได้")
      }

      const updatedPo = await res.json()
      setPoData(updatedPo)

      toast({
        title: "อนุมัติสำเร็จ!",
        description: `PO ${updatedPo.poNumber} ได้รับการอนุมัติแล้ว`,
      })
    } catch (err: any) {
      toast({
        title: "อนุมัติไม่สำเร็จ",
        description: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setApproving(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!poData) return

    try {
      setDownloading(true)
      // ✅ เปลี่ยน endpoint จาก /pr/${id}/pdf เป็น /po/${id}/pdf
      const res = await fetch(`${API_BASE_URL}/po/${id}/pdf`)

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถดาวน์โหลด PDF ได้")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PO_${poData.poNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "ดาวน์โหลดสำเร็จ!",
        description: `PDF สำหรับ ${poData.poNumber} ถูกดาวน์โหลดแล้ว`,
      })
    } catch (err: any) {
      console.error('PDF Download Error:', err)
      toast({
        title: "ดาวน์โหลดไม่สำเร็จ",
        description: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  const isPending =
    poData?.status === "PENDING" ||
    poData?.status === "pending" ||
    poData?.status === "รออนุมัติ"

  const isApproved =
    poData?.status === "APPROVED" ||
    poData?.status === "approved" ||
    poData?.status === "อนุมัติแล้ว"

  const statusText = isApproved
    ? "อนุมัติแล้ว"
    : isPending
      ? "รออนุมัติ"
      : poData?.status || "ร่าง"

  const statusColor = isApproved
    ? "text-green-600"
    : isPending
      ? "text-orange-600"
      : "text-gray-600"

  if (loading || !poData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล PO...</p>
        </div>
      </div>
    )
  }

  const items = poData.items || []
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  const withholdingTax = subtotal * 0.03
  const afterWithholding = subtotal - withholdingTax
  const vatAmount = afterWithholding * 0.07
  const totalAmount = afterWithholding + vatAmount

  const job = poData.pr?.job

  const orderDate = poData.orderDate
  const deliveryDate = poData.deliveryDate || poData.pr?.requiredDate || ""
  const durationDays = deliveryDate && orderDate
    ? differenceInDays(new Date(deliveryDate), new Date(orderDate))
    : "-"

  return (
    <div className="min-h-screen dark:bg-black">
      <div className="w-full px-4 py-4 md:py-6 space-y-6 dark:bg-black">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/pattycash")}
                className="hover:bg-slate-100 hover:dark:bg-slate-400 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  PO Detail: {poData.poNumber}
                  <span className={`ml-4 text-xl font-medium ${statusColor}`}>
                    - {statusText}
                  </span>
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isPending && (
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md cursor-pointer"
                >
                  {approving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      กำลังอนุมัติ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      อนุมัติ PO
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md cursor-pointer"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    กำลังดาวน์โหลด...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    ดาวน์โหลด PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ข้อมูล PO */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6 dark:bg-black border border-white-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input defaultValue={job?.jobName || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input defaultValue="-" readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input defaultValue={poData.pr?.requester || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input defaultValue={poData.pr?.jobNote || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Request date</Label>
              <Input defaultValue={format(new Date(orderDate), "dd/MM/yyyy")} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>ROS date</Label>
              <Input type="date" defaultValue={deliveryDate} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Trader</Label>
              <Input defaultValue={job?.trader || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input defaultValue={job?.jobNo || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input defaultValue={job?.ccNo || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input defaultValue={job?.expteamQuotation || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input defaultValue={job?.estimatedPrCost?.toLocaleString() || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input defaultValue="-" readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input defaultValue={poData.supplier || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue={poData.pr?.currency || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Input defaultValue={poData.pr?.discountType || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input defaultValue={poData.pr?.discountValue || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input defaultValue={poData.pr?.deliveryLocation || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
          </div>

          {/* Payment Method - Readonly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method <span className="text-red-600">*</span></Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {poData.pr?.paymentMethod === "cash" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-normal">Cash (เงินสด)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {poData.pr?.paymentMethod === "credit" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-normal">Credit (เครดิต)</span>
                  </div>
                </div>
              </div>

              {poData.pr?.paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <div className="text-base">
                    {poData.pr?.paymentTerms || <span className="text-gray-400">ไม่ระบุ</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={poData.remark || "-"}
              readOnly
              rows={3}
              className="resize-none text-sm bg-gray-50 dark:bg-black"
            />
          </div>
        </div>

        {/* รายการสินค้า */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-800">
          <div className="mb-4">
            <h2 className="font-bold text-lg">รายการสินค้า</h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">ลำดับ</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="w-24 text-center">จำนวน</TableHead>
                  <TableHead className="w-24 text-center">หน่วย</TableHead>
                  <TableHead className="w-32 text-right">ราคา/หน่วย</TableHead>
                  <TableHead className="w-32 text-right">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{item.unit || "-"}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">ยอดรวม</span>
              <span className="font-medium w-32">{subtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">หัก ณ ที่จ่าย (3%)</span>
              <span className="font-medium w-32">{withholdingTax.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">ยอดหลังหัก</span>
              <span className="font-medium w-32">{afterWithholding.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">VAT (7%)</span>
              <span className="font-medium w-32">{vatAmount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-end gap-8 items-center pt-2 border-t">
              <span className="text-lg font-bold">รวมทั้งสิ้น</span>
              <span className="text-xl font-bold text-blue-600 w-32">{totalAmount.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}