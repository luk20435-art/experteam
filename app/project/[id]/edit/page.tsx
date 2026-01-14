// app/job/[id]/edit/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react"

const BACKEND_URL = "http://localhost:3000"

interface Trader {
  id: string | number
  name: string
}

export default function EditJobPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [traders, setTraders] = useState<Trader[]>([])

  // Modal states
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!id) return

    async function fetchJob() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/jobs/${id}`)
        if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setJob(data)
      } catch (error) {
        console.error("Error fetching job:", error)
        setErrorMessage("ดึงข้อมูลงานล้มเหลว")
        setOpenError(true)
      } finally {
        setJobLoading(false)
      }
    }

    fetchJob()
  }, [id])

  useEffect(() => {
    async function fetchTraders() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/traders`, { cache: "no-store" })
        if (!res.ok) throw new Error("ดึงข้อมูลล้มเหลว")
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.data || []
        setTraders(list)
      } catch (error) {
        console.error("Error fetching traders:", error)
      }
    }

    fetchTraders()
  }, [])

  const handleSaveClick = () => {
    if (!job?.jobName?.trim()) {
      setErrorMessage("กรุณากรอกชื่องาน")
      setOpenError(true)
      return
    }
    setOpenConfirm(true)
  }

  const confirmSave = async () => {
    setLoading(true)
    setOpenConfirm(false)

    try {
      // เอาเฉพาะ field ที่ต้องการ ไม่ส่ง field ที่ไม่จำเป็น
      const payload = {
        jobName: job.jobName || "",
        projectCode: job.projectCode || null,
        jobNo: job.jobNo || null,
        ccNo: job.ccNo || null,
        waNumber: job.waNumber || null,
        wrPoSrRoNumber: job.wrPoSrRoNumber || null,
        contactPerson: job.contactPerson || null,
        contactNumber: job.contactNumber || null,
        contactEmail: job.contactEmail || null,
        traderId: job.traderId ? Number(job.traderId) : null,
        expteamQuotation: job.expteamQuotation || null,
        estimatedPrCost: job.estimatedPrCost ? Number(job.estimatedPrCost) : 0,
        startDate: job.startDate || null,
        endDate: job.endDate || null,
        remark: job.remark || null,
        budgetMaterial: job.budgetMaterial ? Number(job.budgetMaterial) : 0,
        budgetManPower: job.budgetManPower ? Number(job.budgetManPower) : 0,
        budgetOp: job.budgetOp ? Number(job.budgetOp) : 0,
        budgetIe: job.budgetIe ? Number(job.budgetIe) : 0,
        budgetSupply: job.budgetSupply ? Number(job.budgetSupply) : 0,
        budgetEngineer: job.budgetEngineer ? Number(job.budgetEngineer) : 0,
        status: job.status || "in_progress",
      }

      const res = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "แก้ไขไม่สำเร็จ")
      }

      setOpenSuccess(true)
      setTimeout(() => router.push(`/project`), 1500)
    } catch (error: any) {
      setErrorMessage(error.message || "เกิดข้อผิดพลาดในการบันทึก")
      setOpenError(true)
    } finally {
      setLoading(false)
    }
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">ไม่พบข้อมูลงาน</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Modal ยืนยัน */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm the revision.?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 py-4 text-left">
                <p><strong>jobName:</strong> {job.jobName}</p>
                <p><strong>start Date:</strong> {job.startDate ? new Date(job.startDate).toLocaleDateString("th-TH") : "-"}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer dark:bg-red-600 hover:bg-red-400 bg-red-600 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              {loading ? "Confirming..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal สำเร็จ */}
      <AlertDialog open={openSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-green-600 text-2xl">
              <CheckCircle2 className="h-8 w-8" />
              Edit success!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              กำลังพาคุณกลับไปหน้ารายละเอียด...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal ผิดพลาด */}
      <AlertDialog open={openError} onOpenChange={setOpenError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              An error occurred.
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Agree</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gray-50 dark:bg-black px-6">
        {/* Header */}
        <div className="bg-white rounded border dark:border-white-800 mt-6">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 dark:bg-black">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="flex-shrink-0 dark:bg-black border-slate-300 cursor-pointer">
                  <ArrowLeft className="h-5 sm:h-6 w-5 sm:w-6 dark:text-white " />
                </Button>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Edit Job
                </h1>
              </div>

              <Button
                onClick={handleSaveClick}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 sm:px-8 w-full sm:w-auto flex-shrink-0 cursor-pointer"
              >
                <Save className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5" />
                <span className="text-sm sm:text-base">{loading ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-0 py-6 sm:py-12">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }} className="w-full">
            <Card className="border-0 shadow-lg dark:bg-black border dark:border-white-800">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                  {/* ข้อมูลหลัก */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Job Name <span className="text-red-600">*</span></Label>
                    <Input
                      value={job.jobName || ""}
                      onChange={e => setJob({ ...job, jobName: e.target.value })}
                      required
                      className="text-sm sm:text-base  dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Job Number</Label>
                    <Input
                      value={job.jobNo || ""}
                      onChange={e => setJob({ ...job, jobNo: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Project Code</Label>
                    <Input
                      value={job.projectCode || ""}
                      onChange={e => setJob({ ...job, projectCode: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CC No.</Label>
                    <Input
                      value={job.ccNo || ""}
                      onChange={e => setJob({ ...job, ccNo: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Client</Label>
                    <Select value={String(job.traderId || "")} onValueChange={v => setJob({ ...job, traderId: v })}>
                      <SelectTrigger className="text-sm sm:text-base dark:bg-black w-full">
                        <SelectValue placeholder="เลือก Trader" />
                      </SelectTrigger>
                      <SelectContent>
                        {traders.map(t => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">WA Number</Label>
                    <Input
                      value={job.waNumber || ""}
                      onChange={e => setJob({ ...job, waNumber: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">WR/PO/SR/RO Number</Label>
                    <Input
                      value={job.wrPoSrRoNumber || ""}
                      onChange={e => setJob({ ...job, wrPoSrRoNumber: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Expteam Quotation</Label>
                    <Input
                      type="text"
                      value={job.expteamQuotation || ""}
                      onChange={e => setJob({ ...job, expteamQuotation: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Person</Label>
                    <Input
                      value={job.contactPerson || ""}
                      onChange={e => setJob({ ...job, contactPerson: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Number</Label>
                    <Input
                      value={job.contactNumber || ""}
                      onChange={e => setJob({ ...job, contactNumber: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={job.contactEmail || ""}
                      onChange={e => setJob({ ...job, contactEmail: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estimated PR Cost</Label>
                    <Input
                      type="number"
                      value={job.estimatedPrCost || ""}
                      onChange={e => setJob({ ...job, estimatedPrCost: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={job.startDate || ""}
                      onChange={e => setJob({ ...job, startDate: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={job.endDate || ""}
                      onChange={e => setJob({ ...job, endDate: e.target.value })}
                      className="text-sm sm:text-base dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={job.status || "in_progress"} onValueChange={v => setJob({ ...job, status: v })}>
                      <SelectTrigger className="text-sm sm:text-base dark:bg-black w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">in_progress</SelectItem>
                        <SelectItem value="completed">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* งบประมาณ */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-4">
                    <Label className="text-base sm:text-lg font-medium">งบประมาณ (บาท)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Material</Label>
                        <Input
                          type="number"
                          value={job.budgetMaterial || ""}
                          onChange={e => setJob({ ...job, budgetMaterial: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">ManPower</Label>
                        <Input
                          type="number"
                          value={job.budgetManPower || ""}
                          onChange={e => setJob({ ...job, budgetManPower: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">OP</Label>
                        <Input
                          type="number"
                          value={job.budgetOp || ""}
                          onChange={e => setJob({ ...job, budgetOp: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">IE</Label>
                        <Input
                          type="number"
                          value={job.budgetIe || ""}
                          onChange={e => setJob({ ...job, budgetIe: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Supply</Label>
                        <Input
                          type="number"
                          value={job.budgetSupply || ""}
                          onChange={e => setJob({ ...job, budgetSupply: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">วิศวกร</Label>
                        <Input
                          type="number"
                          value={job.budgetEngineer || ""}
                          onChange={e => setJob({ ...job, budgetEngineer: e.target.value })}
                          className="text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* หมายเหตุ */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-2">
                    <Label className="text-sm font-medium">Remark</Label>
                    <Textarea
                      rows={5}
                      value={job.remark || ""}
                      onChange={e => setJob({ ...job, remark: e.target.value })}
                      placeholder="ไม่มีหมายเหตุ"
                      className="text-sm sm:text-base resize-none dark:bg-black"
                    />
                  </div>

                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  )
}