"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isValid, differenceInDays } from "date-fns"
import { formatCurrency } from "@/src/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WOItem {
  description?: string
  quantity?: number
  unit?: string
  unitPrice?: number
  [key: string]: any
}

interface Job {
  id?: number
  jobName?: string
  trader?: string
  jobNo?: string
  ccNo?: string
  expteamQuotation?: string
  estimatedPrCost?: number
  projectCode?: string
  [key: string]: any
}

interface WR {
  id?: number
  wrNumber?: string
  [key: string]: any
}

interface WOData {
  id: number
  woNumber: string
  requester: string
  orderDate: string
  deliveryDate?: string | null
  deliveryLocation?: string | null
  remark?: string | null
  paymentTerms?: string | null
  status: string
  job?: Job | null
  wr?: WR | null
  items?: WOItem[]
  currency?: string
  department?: string
  [key: string]: any
}

export default function WODetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [woData, setWOData] = useState<WOData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  // แปลงวันที่จาก backend → dd/MM/yyyy
  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "-"
    try {
      const date = parseISO(dateStr)
      return isValid(date) ? format(date, "dd/MM/yyyy") : "-"
    } catch {
      return "-"
    }
  }

  // ดึงข้อมูล WO จากฐานข้อมูล
  useEffect(() => {
    const fetchWO = async () => {
      if (!id) {
        setError("ไม่พบ ID ของ WO")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const url = `${API_BASE_URL}/wo/${id}`
        console.log("Fetching from:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch {
            // ถ้า response ไม่ใช่ JSON
            const text = await response.text()
            errorMessage = text || errorMessage
          }
          throw new Error(errorMessage)
        }

        const data: WOData = await response.json()
        console.log("Fetched data:", data)

        // ตรวจสอบข้อมูลพื้นฐาน
        if (!data || typeof data !== "object") {
          throw new Error("ข้อมูล WO ไม่ถูกต้อง")
        }

        setWOData(data)
      } catch (err: any) {
        const errorMsg = err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        console.error("Fetch error:", errorMsg)
        setError(errorMsg)
        toast({
          title: "โหลดข้อมูลไม่สำเร็จ",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWO()
    }
  }, [id, toast])

  // อนุมัติ WO
  const handleApprove = async () => {
    if (!woData) return

    const confirmed = confirm(`คุณต้องการอนุมัติ WO ${woData.woNumber} หรือไม่?`)
    if (!confirmed) return

    try {
      setApproving(true)

      const response = await fetch(`${API_BASE_URL}/wo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const updated: WOData = await response.json()
      setWOData(updated)

      toast({
        title: "อนุมัติสำเร็จ!",
        description: `WO ${woData.woNumber} ได้รับการอนุมัติแล้ว`,
      })
    } catch (err: any) {
      const errorMsg = err.message || "เกิดข้อผิดพลาดในการอนุมัติ"
      setError(errorMsg)
      toast({
        title: "อนุมัติไม่สำเร็จ",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setApproving(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">กำลังโหลดข้อมูล WO...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !woData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 text-red-600 mb-4">
            <AlertCircle className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
              <p>{error || "ไม่สามารถโหลดข้อมูล WO"}</p>
            </div>
          </div>
          <Link href="/wo">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับไปยังรายการ WO
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const job = woData.job || {}

  const handleDownloadPdf = async () => {
    if (!woData) return

    try {
      setDownloading(true)
      const res = await fetch(`${API_BASE_URL}/wo/${id}/pdf`)

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "ไม่สามารถดาวน์โหลด PDF ได้")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `WO_${woData.woNumber}.pdf` // Adjust filename to match WO layout
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "ดาวน์โหลดสำเร็จ!",
        description: `PDF สำหรับ ${woData.woNumber} ถูกดาวน์โหลดแล้ว`,
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

  // ตรวจสอบสถานะ
  const normalizedStatus = woData.status?.toLowerCase().trim() || ""
  const isPending =
    normalizedStatus === "pending" ||
    normalizedStatus === "รออนุมัติ" ||
    normalizedStatus.includes("pending")

  const isApproved =
    normalizedStatus === "approved" ||
    normalizedStatus === "อนุมัติแล้ว" ||
    normalizedStatus.includes("approved")

  const statusBadge = isApproved ? (
    <Badge className="bg-green-600 text-white">approved</Badge>
  ) : isPending ? (
    <Badge className="bg-yellow-500 text-white">wait for approve</Badge>
  ) : (
    <Badge variant="secondary">ร่าง</Badge>
  )

  // คำนวณค่า
  const subtotal = (woData.items || []).reduce((sum, item) => {
    const qty = item.quantity || 0
    const price = item.unitPrice || 0
    return sum + (qty * price)
  }, 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat

  const durationDays = (woData.deliveryDate && woData.orderDate) ?
    differenceInDays(new Date(woData.deliveryDate), new Date(woData.orderDate)) :
    null

  return (
    <div className="min-h-screen w-full space-y-6 px-4">
      {/* Header */}
      <Card className="border-0 shadow-xl">
        <CardContent className="pt-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link href="/wo">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Work Order: {woData.woNumber}
                </h1>
                <div className="mt-2">{statusBadge}</div>
                {woData.wr?.wrNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {/* อ้างอิงจาก WR: {woData.wr.wrNumber} */}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {isPending && (
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[160px]"
                >
                  {approving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Approvaling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approval WO
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                size="lg"
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none min-w-[160px]"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Downloading...
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
        </CardContent>
      </Card>

      {/* ข้อมูลหลัก */}
      <Card>
        <CardContent className="pt-6 space-y-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={job?.jobName || "-"} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value="-" readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input value={woData.requester || "-"} readOnly className="bg-gray-100" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Job Note</Label>
              <Input defaultValue={woData.wr?.jobNote || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  checked={!!woData.wr?.extraCharge}
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
              <Input value={formatDateDisplay(woData.orderDate)} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>ROS Date</Label>
              <Input value={formatDateDisplay(woData.deliveryDate)} readOnly className="bg-gray-100" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={job?.trader || "-"} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <Input value={job?.jobNo || "-"} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>CC No.</Label>
              <Input value={job?.ccNo || "-"} readOnly className="bg-gray-100" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input value={job?.expteamQuotation || "-"} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input
                value={job?.estimatedPrCost ? formatCurrency(job.estimatedPrCost) : "-"}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input value="-" readOnly className="bg-gray-100" />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={woData.wr?.supplier || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={woData.wr?.currency || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Input value={woData.wr?.discountType || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input value={woData.wr?.discountValue || "-"} readOnly className="h-10 text-sm bg-gray-50 dark:bg-black" />
            </div>
            <div className="space-y-2">
              <Label>With Holding Tax</Label>
              <Input value={woData.tax || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Location</Label>
              <Input value={woData.deliveryLocation || "-"} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Plan Type</Label>
              <div className="flex items-center space-x-6 pt-1">
                {/* PLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={woData.wr?.planType === "PLAN"} // ติ๊กถ้าค่าเป็น PLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Plan</span>
                </label>

                {/* UNPLAN */}
                <label className="flex items-center space-x-2 cursor-default">
                  <input
                    type="checkbox"
                    checked={woData.wr?.planType === "UNPLAN"} // ติ๊กถ้าค่าเป็น UNPLAN
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm dark:text-slate-200">Unplan</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {woData.wr?.paymentMethod === "cash" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-normal">Cash</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {woData.wr?.paymentMethod === "credit" ? (
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

              {woData.wr?.paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <div className="text-base">
                    {woData.wr?.paymentTerms || <span className="text-gray-400">ไม่ระบุ</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* หมายเหตุ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Remark</Label>
              <Textarea value={woData.remark || "-"} readOnly rows={3} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Payment</Label>
              <Input value={woData.paymentTerms || "ภายใน 30 วัน"} readOnly className="bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* รายการงาน */}
      <Card>
        <CardHeader>
          <CardTitle>รายการงาน</CardTitle>
        </CardHeader>
        <CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {!woData.items || woData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการงาน
                    </TableCell>
                  </TableRow>
                ) : (
                  woData.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell className="text-center">{item.quantity || 0}</TableCell>
                      <TableCell className="text-center">{item.unit || "ชิ้น"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice || 0)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(((item.quantity || 0) * (item.unitPrice || 0)))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {woData.items && woData.items.length > 0 && (
              <div className="mt-8 pt-6 border-t text-right space-y-3">
                <div className="flex justify-end gap-12 p-3">
                  <span>ยอดรวม</span>
                  <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3">
                  <span>VAT (7.00%)</span>
                  <span className="font-bold-700 w-32">{formatCurrency(vat)}</span>
                </div>
                <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold">
                  <span>รวมทั้งสิ้น</span>
                  <span className="w-32 text-green-600">{formatCurrency(total)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}