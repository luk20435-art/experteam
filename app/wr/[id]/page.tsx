"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, CheckCircle, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { differenceInDays } from "date-fns"
import { formatCurrency } from "@/src/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
const APPROVE_EMAIL = "luk20435@gmail.com"  // เปลี่ยนเป็น email ผู้มีสิทธิ์อนุมัติจริง

interface WRData {
  id: number
  wrNumber: string
  requester: string
  department: string
  jobNote: string
  extraCharge: boolean
  requestDate: string
  requiredDate: string
  deliveryLocation?: string
  planType: "PLAN" | "UNPLAN"
  remark?: string
  status: string
  currency: string
  discountType: string
  discountValue: string
  supplierId: number | null
  supplier: string
  paymentMethod: "cash" | "credit"
  paymentTerms?: string
  vatPercent: number
  discountPercent: number
  grandTotal: number
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

export default function WRDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [wrData, setWRData] = useState<WRData | null>(null)
  const [approving, setApproving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchWR = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/wr/${id}`)
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setWRData(data)
      } catch (err) {
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchWR()
  }, [id, toast])

  const handleApprove = async () => {
    if (!wrData) return
    if (!confirm(`คุณต้องการอนุมัติ WR ${wrData.wrNumber} หรือไม่?`)) return

    try {
      setApproving(true)
      const res = await fetch(`${API_BASE_URL}/wr/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: APPROVE_EMAIL }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "อนุมัติไม่สำเร็จ")
      }

      const updated = await res.json()
      setWRData(updated)
      toast({ title: "อนุมัติสำเร็จ!", description: `WR ${wrData.wrNumber} อนุมัติแล้ว` })
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
    if (!wrData) return

    try {
      setDownloading(true)
      const res = await fetch(`${API_BASE_URL}/wr/${id}/pdf`)

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถดาวน์โหลด PDF ได้")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `WR_${wrData.wrNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "ดาวน์โหลดสำเร็จ!",
        description: `PDF สำหรับ ${wrData.wrNumber} ถูกดาวน์โหลดแล้ว`,
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">กำลังโหลดข้อมูล WR...</span>
      </div>
    )
  }

  // Error state
  if (!wrData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-xl">ไม่สามารถโหลดข้อมูล WR ได้</p>
      </div>
    )
  }

  // คำนวณยอดหลังจากแน่ใจว่า wrData มีค่า
  const items = wrData.items || []
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat
  const durationDays = differenceInDays(new Date(wrData.requiredDate), new Date(wrData.requestDate))
  const vatAmount = (subtotal * wrData.vatPercent) / 100
  const discountAmount = (subtotal * wrData.discountPercent) / 100
  const totalAmount = subtotal + vatAmount - discountAmount

  // สถานะ
  const statusLower = wrData.status.toLowerCase()
  const isPending = statusLower === "pending" || statusLower.includes("รออนุมัติ")
  const isApproved = statusLower === "approved" || statusLower.includes("อนุมัติแล้ว")

  const statusBadge = (
    <Badge
      variant={isApproved ? "default" : isPending ? "secondary" : "outline"}
      className={
        isApproved
          ? "bg-green-600 text-white"
          : isPending
            ? "bg-orange-500 text-white"
            : "bg-gray-500 text-white"
      }
    >
      {isApproved ? "Approved" : isPending ? "Wating for approval" : "Draft"}
    </Badge>
  )

  return (
    <div className="min-h-screen dark:bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <Card>
          <CardContent className="">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    WR Detail: {wrData.wrNumber}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {statusBadge}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* ปุ่มอนุมัติ - เฉพาะรออนุมัติ */}
                {isPending && (
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    {approving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approvaling...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approval WR
                      </>
                    )}
                  </Button>
                )}

                {/* ปุ่มดาวน์โหลด PDF - แสดงทุกสถานะ */}
                <Button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-50 dark:hover:bg-blue-900 dark:bg-blue-600 dark:text-white cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูล WR */}
        <Card className="dark:bg-black">
          <CardHeader>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={wrData.job?.jobName || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input value={wrData.requester || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={wrData.department || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input value={wrData.jobNote || "-"} readOnly className="bg-gray-50 dark:bg-black" />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  checked={!!wrData.extraCharge}
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
              <Input value={new Date(wrData.requestDate).toLocaleDateString("th-TH")} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Required Date</Label>
              <Input value={new Date(wrData.requiredDate).toLocaleDateString("th-TH")} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Trader</Label>
              <Input value={wrData.job?.trader || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input value={wrData.job?.jobNo || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input value={wrData.job?.ccNo || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input value={wrData.job?.expteamQuotation || "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input value={wrData.job?.estimatedPrCost ? formatCurrency(wrData.job.estimatedPrCost) : "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input value={wrData.job?.jobBalanceCost ? formatCurrency(wrData.job.estimatedPrCost) : "-"} readOnly className="bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  value={wrData.supplier || "-"}
                  readOnly
                  className="pl-10 h-10 text-sm bg-gray-50 dark:bg-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue={wrData.currency || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Input defaultValue={wrData.discountType || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input defaultValue={wrData.discountValue || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input defaultValue={wrData.deliveryLocation} readOnly className="h-10 bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={wrData.planType === "PLAN"} // ติ๊กถ้าค่าเป็น PLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

                {/* UNPLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={wrData.planType === "UNPLAN"} // ติ๊กถ้าค่าเป็น UNPLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Unplan</span>
                </label>
              </div>
            </div>
            {/* Payment Method - Readonly */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method <span className="text-red-600">*</span></Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {wrData.paymentMethod === "cash" ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="font-normal">Cash</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {wrData.paymentMethod === "credit" ? (
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

                {wrData.paymentMethod === "credit" && (
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <div className="text-base">
                      {wrData.paymentTerms || <span className="text-gray-400">ไม่ระบุ</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Remark</Label>
              <Textarea value={wrData.remark || "-"} readOnly rows={3} className="bg-gray-50 dark:bg-black" />
            </div>
          </CardContent>
        </Card>

        {/* รายการขอเบิก */}
        <Card className="dark:bg-black">
          <CardHeader>
            <CardTitle>Product list</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">UOM</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell className="text-center">{(item.quantity || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center">{item.unit || "ชิ้น"}</TableCell>
                    <TableCell className="text-right">{(item.unitPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 border-t pt-4 space-y-2 text-right">
              <div className="flex justify-end gap-8 items-center">
                <span className="text-base">Total</span>
                <span className="font-medium w-32">{subtotal.toLocaleString()} </span>
              </div>
              <div className="flex justify-end gap-8 items-center">
                <span className="text-base">VAT ({wrData.vatPercent}%)</span>
                <span className="font-medium w-32">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
              </div>
              <div className="flex justify-end gap-8 items-center">
                <span className="text-base">หัก ณ ที่จ่าย ({wrData.discountPercent}%)</span>
                <span className="font-medium w-32">{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
              </div>
              <div className="flex justify-end gap-8 items-center pt-2 border-t">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-xl font-bold text-green-600 w-32">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}