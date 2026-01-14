"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building2, Loader2, CheckCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Job {
  id: number
  jobName: string
  trader: string
  jobNo: string
  ccNo: string
  projectCode: string
  estimatedPrCost: number
  expteamQuotation: string
}

interface PRData {
  id: number
  prNumber: string
  jobId: number
  department: string
  jobNote: string
  extraCharge: boolean
  requester: string
  requestDate: string
  requiredDate: string
  duration: number
  currency: string
  discountType: string
  discountValue: string
  deliveryLocation: string
  planType: "PLAN" | "UNPLAN"
  supplierId: number | null
  supplier: string
  remark?: string
  jobBalance: string
  vatPercent: number
  discountPercent: number
  grandTotal: number
  status: string
  paymentMethod: "cash" | "credit" // เพิ่ม field นี้
  paymentTerms?: string // เพิ่ม field นี้ (สำหรับ credit)
  items: Array<{
    description: string
    quantity: number
    unit?: string
    unitPrice: number
    totalPrice?: number
  }>
  approvals: Array<{
    approverEmail: string
    status: string
    comment?: string
    actionDate?: string
  }>
  job?: Job
}

export default function PRDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [prData, setPrData] = useState<PRData | null>(null)
  const [approving, setApproving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchPR = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/pr/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูล PR ได้")
        const data = await res.json()
        setPrData(data)
      } catch (err) {
        console.error(err)
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPR()
  }, [id, toast])

  const handleApprove = async () => {
    if (!prData) return

    if (!confirm(`คุณต้องการอนุมัติ PR ${prData.prNumber} หรือไม่?`)) return

    try {
      setApproving(true)

      const res = await fetch(`${API_BASE_URL}/pr/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถอนุมัติ PR ได้")
      }

      const updatedPr = await res.json()
      setPrData(updatedPr)

      toast({
        title: "อนุมัติสำเร็จ!",
        description: `PR ${updatedPr.prNumber} ได้รับการอนุมัติแล้ว`,
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
    if (!prData) return

    try {
      setDownloading(true)
      const res = await fetch(`${API_BASE_URL}/pr/${id}/pdf`)

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถดาวน์โหลด PDF ได้")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PR_${prData.prNumber}.pdf` // แก้จาก WO เป็น PR
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "ดาวน์โหลดสำเร็จ!",
        description: `PDF สำหรับ ${prData.prNumber} ถูกดาวน์โหลดแล้ว`,
      })
    } catch (err: any) {
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
    prData?.status === "PENDING" ||
    prData?.status === "pending" ||
    prData?.status === "รออนุมัติ"

  const isApproved =
    prData?.status === "APPROVED" ||
    prData?.status === "approved" ||
    prData?.status === "อนุมัติแล้ว"

  const statusText = isApproved
    ? "อนุมัติแล้ว"
    : isPending
      ? "รออนุมัติ"
      : prData?.status || "ร่าง"

  const statusColor = isApproved
    ? "text-green-600"
    : isPending
      ? "text-orange-600"
      : "text-gray-600"

  if (loading || !prData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">กำลังโหลด PR...</p>
        </div>
      </div>
    )
  }

  const items = prData.items || []
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  const vatAmount = (subtotal * prData.vatPercent) / 100
  const discountAmount = (subtotal * prData.discountPercent) / 100
  const totalAmount = subtotal + vatAmount - discountAmount

  return (
    <div className="min-h-screen dark:bg-black">
      <div className="w-full px-4 py-4 md:py-6 space-y-6 dark:bg-black">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/pr")}
                className="hover:bg-slate-400 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  PR Detail: {prData.prNumber}
                </h1>
              </div>
            </div>

            <div className="flex gap-2">
              {isPending ? (
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
                      Approve PR
                    </>
                  )}
                </Button>
              ) : null}

              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                size="lg"
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium dark:bg-blue-700 cursor-pointer hover:dark:bg-sky-400"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    กำลังดาวน์โหลด...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ข้อมูล PR */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6 dark:bg-black border border-white-200">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input defaultValue={prData.job?.jobName || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input defaultValue={prData.department || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input defaultValue={prData.requester} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              {/* Job Note */}
              <div className="space-y-2">
                <Label>Job Note</Label>
                <Input
                  value={prData.jobNote ?? "-"}
                  readOnly
                  className="h-10 text-sm bg-gray-50 dark:bg-black dark:text-slate-100"
                />
              </div>

              {/* Extra charge checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  checked={!!prData.extraCharge}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-blue-600
                     dark:bg-black dark:border-gray-600"
                />
                <Label htmlFor="extraCharge" className="text-sm dark:text-slate-200 cursor-default">
                  Extra charge
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Request Date</Label>
              <Input type="date" defaultValue={prData.requestDate} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>ROS Date</Label>
              <Input type="date" defaultValue={prData.requiredDate} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input defaultValue={prData.job?.trader || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input defaultValue={prData.job?.jobNo || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input defaultValue={prData.job?.ccNo || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input defaultValue={prData.job?.expteamQuotation || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input defaultValue={prData.job?.estimatedPrCost?.toLocaleString() || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input defaultValue={prData.jobBalance} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  value={prData.supplier || "-"}
                  readOnly
                  className="pl-10 h-10 text-sm bg-gray-50 dark:bg-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue={prData.currency || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Input defaultValue={prData.discountType || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input defaultValue={prData.discountValue || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input defaultValue={prData.deliveryLocation} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={prData.planType === "PLAN"} // ติ๊กถ้าค่าเป็น PLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

                {/* UNPLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={prData.planType === "UNPLAN"} // ติ๊กถ้าค่าเป็น UNPLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Unplan</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 mt-7">
              <span className={`ml-4 text-xl font-bold ${statusColor} dark:text-white`}>
                - {statusText}
              </span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method <span className="text-red-600">*</span></Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {prData.paymentMethod === "cash" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-normal">Cash</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {prData.paymentMethod === "credit" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-normal">Credit</span>
                  </div>
                </div>
              </div>

              {prData.paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <div className="text-base">
                    {prData.paymentTerms || <span className="text-gray-400">ไม่ระบุ</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={prData.remark || "-"}
              readOnly
              rows={3}
              className="resize-none text-sm bg-gray-50 dark:bg-black"
            />
          </div>
        </div>

        {/* รายการสินค้า */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 dark:bg-black border border-white-200">
          <div className="mb-4">
            <h2 className="font-bold text-lg dark:text-white">Product list</h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center dark:text-white">No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-24 text-center dark:text-white">Qty</TableHead>
                  <TableHead className="w-24 text-center dark:text-white">UOM</TableHead>
                  <TableHead className="w-32 text-right dark:text-white">Unit Price</TableHead>
                  <TableHead className="w-32 text-right dark:text-white">Amount</TableHead>
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
                    <TableCell className="text-right font-medium">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">Total</span>
              <span className="font-medium w-32">{subtotal.toLocaleString()} </span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">VAT ({prData.vatPercent}%)</span>
              <span className="font-medium w-32">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-base">หัก ณ ที่จ่าย ({prData.discountPercent}%)</span>
              <span className="font-medium w-32">{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
            </div>
            <div className="flex justify-end gap-8 items-center pt-2 border-t">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-xl font-bold text-green-600 w-32">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}