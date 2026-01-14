"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"

const BACKEND_URL = "http://localhost:3000"

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`${BACKEND_URL}/api/jobs/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setJob(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-12 text-center text-2xl">กำลังโหลดข้อมูล...</div>
  if (!job) return <div className="p-12 text-center text-2xl text-red-600">ไม่พบข้อมูลงาน</div>

  const formatNumber = (num: number | null) => num ? new Intl.NumberFormat("th-TH").format(num) : "0"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 dark:bg-black">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button variant="outline" size="icon" onClick={() => router.back()} className="flex-shrink-0 cursor-pointer">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words dark:text-white">
                  {job.jobName || "ไม่มีชื่อ"}
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-white">
                    เลขที่งาน: <strong className="text-gray-900 dark:text-white">{job.jobNo || "-"}</strong>
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      job.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-300 px-3 sm:px-4 py-1 text-xs sm:text-base dark:bg-green-400 dark:text-white"
                        : "bg-blue-100 text-blue-700 border-blue-300 px-3 sm:px-4 py-1 text-xs sm:text-base dark:bg-blue-700 dark:text-white"
                    }
                  >
                    {job.status === "completed" ? "สมบูรณ์" : "กำลังดำเนินการ"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12 dark:bg-black">
        <Card className="shadow-lg dark:bg-black dark:border-white-700">
          <CardContent className="p-4 sm:p-6 lg:p-8 dark:bg-black">
            {/* Main Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ">

              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Name</Label>
                <Input value={job.jobName || "-"} readOnly
                  className="bg-gray-50 text-sm sm:text-base dark:bg-black " />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Number</Label>
                <Input value={job.jobNo || "-"} readOnly className="bg-gray-50 font-medium text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Code</Label>
                <Input value={job.projectCode || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">CC No.</Label>
                <Input value={job.ccNo || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Client Name</Label>
                <div className="bg-gray-100 border rounded-lg px-4 py-2  text-sm sm:text-sm font-medium dark:bg-black">
                  {job.trader || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">WA Number</Label>
                <Input value={job.waNumber || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">WR/PO/SR/RO Number</Label>
                <Input value={job.wrPoSrRoNumber || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Expteam Quotation</Label>
                <Input value={job.expteamQuotation || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Contact Person</Label>
                <Input value={job.contactPerson || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

               <div className="space-y-2">
                <Label className="text-sm font-medium">Contact Number</Label>
                <Input value={job.contactNumber || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input type="email" value={job.contactEmail || "-"} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Estimated PR Cost</Label>
                <Input
                  type="text"
                  value={formatNumber(job.estimatedPrCost)}
                  readOnly
                  className="text-sm sm:text-base dark:bg-black"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <Input type="date" value={job.startDate || ""} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <Input type="date" value={job.endDate || ""} readOnly className="bg-gray-50 text-sm sm:text-base dark:bg-black" />
              </div>

              {/* Budget Section */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-4">
                <Label className="text-base sm:text-lg font-medium block">งบประมาณ (บาท)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {["Material", "ManPower", "OP", "IE", "Supply", "วิศวกร"].map((label, i) => {
                    const key = ["budgetMaterial", "budgetManPower", "budgetOp", "budgetIe", "budgetSupply", "budgetEngineer"][i] as keyof typeof job
                    return (
                      <div key={label} className="space-y-2">
                        <Label className="text-xs sm:text-sm text-muted-foreground">{label}</Label>
                        <Input
                          type="text"
                          value={formatNumber(job[key] as number)}
                          readOnly
                          className="bg-gray-50 text-center font-medium text-xs sm:text-sm dark:bg-black"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Remark Section */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-2">
                <Label className="text-sm font-medium">Remark</Label>
                <Textarea
                  rows={5}
                  value={job.remark || ""}
                  readOnly
                  className="bg-gray-50 resize-none text-sm sm:text-base dark:bg-black"
                  placeholder="ไม่มีหมายเหตุ"
                />
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}