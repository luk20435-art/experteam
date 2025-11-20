"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Phone, Mail, Building2, Users, FileText, Hash, Tag, Clock, TrendingUp, Briefcase } from "lucide-react"
import { formatCurrency, formatDate } from "@/src/lib/utils"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject, moveToTrashProject, clients } = useData()

  const project = getProject(params.id as string)

  

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-lg">
          <Briefcase className="h-16 w-16 mx-auto text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-900">ไม่พบโครงการ</h2>
          <p className="text-slate-600">โครงการที่คุณกำลังมองหาไม่มีอยู่</p>
          <Button onClick={() => router.push("/project")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> กลับสู่หน้าโครงการ
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบโครงการนี้?")) {
      moveToTrashProject(project.id)
      router.push("/project")
    }
  }

  const duration = project.duration || 0
  const traderClient = clients.find(c => c.id === project.trader) || null
  const clientName = traderClient ? traderClient.name : (project.trader || "ไม่ระบุลูกค้า")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "completed": return "bg-purple-100 text-purple-800 border-purple-300"
      default: return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress": return "กำลังดำเนินการ"
      case "completed": return "เสร็จสิ้น"
      default: return status
    }
  }

  const budgetSpent = project.totalSpent || 0
  const budgetRemaining = project.totalBudget - budgetSpent
  const budgetUsagePercent = project.totalBudget > 0 ? Math.round((budgetSpent / project.totalBudget) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="w-full px-4 py-4 md:py-6 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/project")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{project.name}</h1>
                  <Badge className={`${getStatusColor(project.status)} font-medium px-3 py-1 border`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Project: {project.projectNumber} • Client: {clientName}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => router.push(`/project/${project.id}/edit`)}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" /> แก้ไข
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" /> ลบ
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* ข้อมูลหลัก */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  ข้อมูลหลัก
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Job No.</p>
                    <p className="font-bold text-blue-700">{project.jobNo || "-"}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Project Code</p>
                    <p className="font-bold text-purple-700">{project.code || "-"}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">C.C No.</p>
                    <p className="font-bold text-emerald-700">{project.ccNo || "-"}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">WR/PO/SR/RO</p>
                    <p className="font-bold text-orange-700">{project.wrPoSrRoNumber || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลลูกค้า */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  ข้อมูลลูกค้า (Trader)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Trader Name</p>
                    <p className="font-bold text-slate-800">{clientName}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Contact Person</p>
                    <p className="font-bold text-slate-800">{project.contactPerson || "-"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> WhatsApp
                    </p>
                    <p className="font-bold text-slate-800">{project.waNumber || "-"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </p>
                    <p className="font-bold text-slate-800 truncate">{project.contactEmail || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ตารางเวลา */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  ตารางเวลา
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">วันเริ่มต้น</span>
                      <span className="font-bold text-blue-700">{formatDate(project.startDate)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">วันสิ้นสุด</span>
                      <span className="font-bold text-emerald-700">{formatDate(project.endDate)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">ระยะเวลา</span>
                      <Badge className="bg-purple-600 text-white">{duration} วัน</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* งบประมาณ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  งบประมาณ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Quotation</p>
                    <p className="font-bold text-slate-800">{project.expteamQuotation || "-"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Est. PR Cost</p>
                    <p className="font-bold text-slate-800">{project.estimatedPrCost || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* รายละเอียด */}
            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    รายละเอียด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* สรุปงบประมาณ */}
            <Card className="sticky top-6">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="text-lg">สรุปงบประมาณ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">งบประมาณรวม PR Cost</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(project.totalBudget)}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">ใช้ไปแล้ว</span>
                    <span className="text-sm font-bold text-orange-600">{formatCurrency(budgetSpent)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{budgetUsagePercent}%</p>
                </div>
                <Separator />
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">คงเหลือ</p>
                  <p className={`text-xl font-bold ${budgetRemaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(Math.abs(budgetRemaining))}
                  </p>
                  {budgetRemaining < 0 && <p className="text-xs text-red-600 mt-1">เกินงบประมาณ</p>}
                </div>
              </CardContent>
            </Card>

            {/* ความคืบหน้า */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  ความคืบหน้า
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="url(#grad)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - (project.overallProgress || 0) / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-700">
                        {project.overallProgress || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">ความคืบหน้าโครงการ</p>
                </div>
              </CardContent>
            </Card>
            {/* ปุ่มไปยังหน้าต่าง ๆ ของโครงการ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  เอกสารของโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push(`/project/${project.id}/pr`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  PR
                </Button>
                <Button
                  onClick={() => router.push(`/project/${project.id}/po`)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  PO
                </Button>
                <Button
                  onClick={() => router.push(`/project/${project.id}/wr`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  WR
                </Button>
                <Button
                  onClick={() => router.push(`/project/${project.id}/wo`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  WO
                </Button>
              </CardContent>
            </Card>

          </div>


        </div>

        {/* ส่วนงาน */}
        {project.sections && project.sections.length > 0 && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                ส่วนงานของโครงการ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.sections.map((section) => {
                  const progress = section.budget > 0 ? Math.round((section.spent / section.budget) * 100) : 0
                  return (
                    <div
                      key={section.id}
                      onClick={() => router.push(`/project/${project.id}/sections/${section.id}`)}
                      className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-800">{section.name}</h4>
                        <Badge className="bg-indigo-600 text-white">{progress}%</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">งบ</span>
                          <span className="font-bold">{formatCurrency(section.budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">ใช้แล้ว</span>
                          <span className="font-bold text-orange-600">{formatCurrency(section.spent)}</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}