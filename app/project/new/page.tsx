// app/job/new/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Moon, Sun } from "lucide-react"

interface Trader {
  id: number
  name: string
}

export default function NewJobPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [traders, setTraders] = useState<Trader[]>([])

  const [openConfirm, setOpenConfirm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [saveAsDraft, setSaveAsDraft] = useState(false)

  const [form, setForm] = useState({
    jobName: "",
    projectCode: "",
    jobNo: "",
    ccNo: "",
    waNumber: "",
    wrPoSrRoNumber: "",
    contactPerson: "",
    contactNumber: "",
    contactEmail: "",
    traderId: "",
    expteamQuotation: "",
    estimatedPrCost: "",
    startDate: "",
    endDate: "",
    remark: "",
    budgetMaterial: "",
    budgetManPower: "",
    budgetOp: "",
    budgetIe: "",
    budgetSupply: "",
    budgetEngineer: "",
    status: "in_progress" as "in_progress" | "completed",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch("http://localhost:3000/api/traders", { cache: "no-store" })
      .then(r => r.json())
      .then(res => {
        const list = Array.isArray(res) ? res : res.data || []
        setTraders(list)
      })
      .catch(() => {})
  }, [])

  const selectedTrader = traders.find(t => t.id === Number(form.traderId))

  const validate = (strict: boolean = true) => {
    if (strict) {
      if (!form.jobName.trim()) return "กรุณากรอกชื่องาน"
      if (!form.traderId) return "กรุณาเลือก Trader / Client"
      if (!form.startDate) return "กรุณาเลือกวันที่เริ่ม"
      if (!form.estimatedPrCost || Number(form.estimatedPrCost) <= 0) return "กรุณากรอก Estimated PR Cost ให้มากกว่า 0"
    }
    return null
  }

  const handleSave = (asDraft: boolean) => {
    const error = validate(!asDraft)
    if (error) {
      setErrorMessage(error)
      setOpenError(true)
      return
    }
    setSaveAsDraft(asDraft)
    setOpenConfirm(true)
  }

  const confirmSave = async () => {
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobName: form.jobName.trim(),
          projectCode: form.projectCode || null,
          jobNo: form.jobNo || null,
          ccNo: form.ccNo || null,
          waNumber: form.waNumber || null,
          wrPoSrRoNumber: form.wrPoSrRoNumber || null,
          contactPerson: form.contactPerson || null,
          contactNumber: form.contactNumber || null,
          contactEmail: form.contactEmail || null,
          traderId: form.traderId ? Number(form.traderId) : null,
          expteamQuotation: form.expteamQuotation || null,
          estimatedPrCost: Number(form.estimatedPrCost) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          remark: form.remark || null,
          budgetMaterial: Number(form.budgetMaterial) || 0,
          budgetManPower: Number(form.budgetManPower) || 0,
          budgetOp: Number(form.budgetOp) || 0,
          budgetIe: Number(form.budgetIe) || 0,
          budgetSupply: Number(form.budgetSupply) || 0,
          budgetEngineer: Number(form.budgetEngineer) || 0,
          status: form.status,
          requesterId: "USR001",
          originatorId: "USR002",
          storeId: "ST001",
          approverId: "USR003",
          isDraft: saveAsDraft,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "สร้างงานไม่สำเร็จ")
      }

      setOpenConfirm(false)
      setOpenSuccess(true)
      setTimeout(() => router.push("/project"), 1500)
    } catch (err: any) {
      setOpenConfirm(false)
      setErrorMessage(err.message || "เกิดข้อผิดพลาด")
      setOpenError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      {/* Modals */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-slate-100">{saveAsDraft ? "Confirm draft record.?" : "Confirm the creation of a new job.?"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 py-4 text-left dark:text-slate-300">
                <p><strong>Job Name :</strong> {form.jobName}</p>
                <p><strong>Trader :</strong> {selectedTrader?.name || "-"}</p>
                <p><strong>Estimated PR Cost :</strong> {Number(form.estimatedPrCost).toLocaleString()} บาท</p>
                <p><strong>Start Date :</strong> {form.startDate}</p>
                {saveAsDraft && <p className="text-yellow-600 dark:text-yellow-400 font-medium">This work will be saved as a draft.</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:hover:bg-red-400 dark:text-slate-100 dark:border-slate-700 cursor-pointer dark:bg-red-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 cursor-pointer dark:text-white">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openSuccess}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-green-600 dark:text-green-400 text-2xl">
              <CheckCircle2 className="h-8 w-8" />
              {saveAsDraft ? "บันทึกร่างสำเร็จ!" : "สร้างงานสำเร็จ!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg dark:text-slate-300">
              กำลังพาคุณกลับไปหน้ารายการ...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openError} onOpenChange={setOpenError}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              เกิดข้อผิดพลาด
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base dark:text-slate-300">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="dark:bg-green-800 dark:text-white cursor-pointer dark:hover:bg-slate-700">ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <div className="bg-white dark:bg-black shadow-sm border-b dark:border-white-700 sticky top-0 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="flex-shrink-0 dark:hover:bg-slate-800 cursor-pointer">
                  <ArrowLeft className="h-5 sm:h-6 w-5 sm:w-6 dark:text-slate-400  cursor-pointer" />
                </Button>
                <h1 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Create New Job
                </h1>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="h-9.5 flex-1 sm:flex-initial dark:bg-yellow-500 bg-yellow-500 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100 cursor-pointer"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Draft
                </Button>

                <Button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium flex-1 sm:flex-initial cursor-pointer"
                >
                  <Save className="mr-2 h-5 w-5" />
                  <span className="text-sm sm:text-base">{loading ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12 ">
          <Card className="dark:bg-black dark:border-white-800">
           

            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Job Name <span className="text-red-600">*</span></Label>
                  <Input
                    placeholder="Job Name "
                    value={form.jobName}
                    onChange={e => setForm({ ...form, jobName: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Job Number<span className="text-red-600">*</span></Label>
                  <Input
                    placeholder="Job Number"
                    value={form.jobNo}
                    onChange={e => setForm({ ...form, jobNo: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Project Code <span className="text-red-600">*</span></Label>
                  <Input
                    placeholder="Project Code"
                    value={form.projectCode}
                    onChange={e => setForm({ ...form, projectCode: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">CC No.<span className="text-red-600">*</span></Label>
                  <Input
                    placeholder="CC No."
                    value={form.ccNo}
                    onChange={e => setForm({ ...form, ccNo: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Client Name <span className="text-red-600">*</span></Label>
                  <Select value={form.traderId} onValueChange={v => setForm({ ...form, traderId: v })}>
                    <SelectTrigger className="w-full text-sm sm:text-base dark:bg-slate-950 dark:bg-black dark:border-white-800">
                      <SelectValue placeholder="Client Name" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                      {traders.map(t => (
                        <SelectItem key={t.id} value={String(t.id)} className="dark:text-slate-100">{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">WA Number</Label>
                  <Input
                    placeholder="WA Number"
                    value={form.waNumber}
                    onChange={e => setForm({ ...form, waNumber: e.target.value })}
                    className="text-sm sm:text-base dark:bg-slate-950 dark:bg-black dark:border-white-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">WR/PO/SR/RO Number</Label>
                  <Input
                    placeholder="WR/PO/SR/RO"
                    value={form.wrPoSrRoNumber}
                    onChange={e => setForm({ ...form, wrPoSrRoNumber: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Expteam Quotation</Label>
                  <Input
                    placeholder="Expteam Quotation"
                    value={form.expteamQuotation}
                    onChange={e => setForm({ ...form, expteamQuotation: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Contact Person</Label>
                  <Input
                    placeholder="Contact Person"
                    value={form.contactPerson}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Contact Number</Label>
                  <Input
                    placeholder="Contact Number"
                    value={form.contactNumber}
                    onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Contact Email</Label>
                  <Input
                    placeholder="Contact Email"
                    type="email"
                    value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Estimated PR Cost</Label>
                  <Input
                    placeholder="Estimated PR Cost"
                    type="number"
                    value={form.estimatedPrCost}
                    onChange={e => setForm({ ...form, estimatedPrCost: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Start Date <span className="text-red-600">*</span></Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">End Date<span className="text-red-600">*</span></Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="text-sm sm:text-base dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Status<span className="text-red-600">*</span></Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                    <SelectTrigger className="w-full h-14 dark:bg-black dark:border-white-800 dark:text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                      <SelectItem value="in_progress" className="dark:text-slate-100">In Progress</SelectItem>
                      <SelectItem value="completed" className="dark:text-slate-100">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* หมายเหตุ */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-2">
                  <Label className="text-sm font-medium dark:text-slate-200">Remark</Label>
                  <Textarea
                    rows={4}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    value={form.remark}
                    onChange={e => setForm({ ...form, remark: e.target.value })}
                    className="text-sm sm:text-base resize-none dark:bg-black dark:border-white-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}