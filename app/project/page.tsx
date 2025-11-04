"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/src/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfDay, endOfDay } from "date-fns"

export default function ProjectsPage() {
  const { projects, moveToTrashProject } = useData() // เปลี่ยนจาก deleteProject → moveToTrashProject

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed">("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // ตัวกรองวันที่
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [dateType, setDateType] = useState<"start" | "end">("start")

  // เรียงลำดับ
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  // กรองเฉพาะโครงการที่ยังไม่ถูกลบ
  const activeProjects = projects.filter(p => !p.deleted)

  // กรอง + เรียงลำดับ
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = activeProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || project.status === filterStatus

      let matchesDate = true
      if (dateRange.from && dateRange.to) {
        const projectDate = project[dateType === "start" ? "startDate" : "endDate"]
        if (!projectDate) return false
        const pDate = new Date(projectDate)
        const from = startOfDay(dateRange.from)
        const to = endOfDay(dateRange.to)
        matchesDate = pDate >= from && pDate <= to
      }

      return matchesSearch && matchesStatus && matchesDate
    })

    filtered.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [activeProjects, searchTerm, filterStatus, dateRange, dateType, sortOrder])

  // Pagination
  const totalItems = filteredAndSortedProjects.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedProjects = filteredAndSortedProjects.slice(startIndex, endIndex)

  // รีเซ็ตหน้าเมื่อเปลี่ยนตัวกรอง
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, dateRange, dateType, sortOrder, pageSize])

  // แก้ handleDelete ให้ใช้ moveToTrashProject
  const handleDelete = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบโครงการ "${name}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ" และสามารถกู้คืนได้`)) {
      moveToTrashProject(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-green-500 hover:bg-green-600"
      case "completed": return "bg-blue-500 hover:bg-blue-600"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress": return "กำลังดำเนินการ"
      case "completed": return "เสร็จสิ้น"
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <Clock className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diff = endDate.getTime() - startDate.getTime()
    if (diff < 0) return "-"
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} วัน`
  }

  const inProgressCount = activeProjects.filter(p => p.status === "in_progress").length
  const completedCount = activeProjects.filter(p => p.status === "completed").length

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filterStatus === "all"
              ? `จัดการโครงการทั้งหมด (${activeProjects.length} โครงการ)`
              : filterStatus === "in_progress"
                ? `โครงการกำลังดำเนินการ (${inProgressCount} โครงการ)`
                : `โครงการเสร็จสิ้น (${completedCount} โครงการ)`
            }
          </p>
        </div>
        <Link href="/project/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            สร้างโครงการใหม่
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white/50 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${filterStatus === "in_progress" ? "ring-2 ring-green-500 ring-offset-2" : ""}`} 
          onClick={() => setFilterStatus("in_progress")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-800">กำลังดำเนินการ</CardTitle>
            <div className="p-2 bg-green-100 rounded-full"><Clock className="h-5 w-5 text-green-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{inProgressCount}</div>
            <p className="text-xs text-green-600 mt-1">โครงการ</p>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white/50 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${filterStatus === "completed" ? "ring-2 ring-blue-500 ring-offset-2" : ""}`} 
          onClick={() => setFilterStatus("completed")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">เสร็จสิ้น</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full"><CheckCircle className="h-5 w-5 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{completedCount}</div>
            <p className="text-xs text-blue-600 mt-1">โครงการ</p>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white/50 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${filterStatus === "all" ? "ring-2 ring-purple-500 ring-offset-2" : ""}`} 
          onClick={() => setFilterStatus("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">โครงการทั้งหมด</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{activeProjects.length}</div>
            <p className="text-xs text-purple-600 mt-1">โครงการ</p>
          </CardContent>
        </Card>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาโครงการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "latest" | "oldest")}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">ล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">เก่าก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 รายการ</SelectItem>
                  <SelectItem value="10">10 รายการ</SelectItem>
                  <SelectItem value="20">20 รายการ</SelectItem>
                  <SelectItem value="50">50 รายการ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ตารางโครงการ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">รายการโครงการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">เลขที่โครงการ</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">ชื่อโครงการ</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">แผนก</th>
                  <th className="text-right p-3 font-semibold hidden xl:table-cell">งบประมาณ</th>
                  <th className="text-right p-3 font-semibold hidden xl:table-cell">ใช้ไป</th>
                  <th className="text-center p-3 font-semibold hidden lg:table-cell">วันที่เริ่ม</th>
                  <th className="text-center p-3 font-semibold hidden lg:table-cell">วันที่สิ้นสุด</th>
                  <th className="text-center p-3 font-semibold">Duration</th>
                  <th className="text-center p-3 font-semibold">สถานะ</th>
                  <th className="text-right p-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProjects.map((project) => {
                  const totalBudget = project.sections?.reduce((sum, s) => sum + (s.budget || 0), 0) || 0
                  const totalSpent = project.sections?.reduce((sum, s) => sum + (s.spent || 0), 0) || 0
                  const progress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

                  return (
                    <tr key={project.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-foreground">{project.projectNumber}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{project.name}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="font-medium">{project.name}</div>
                      </td>
                      <td className="p-3 hidden lg:table-cell">{project.department || "-"}</td>
                      <td className="p-3 text-right hidden xl:table-cell">
                        <div className="font-semibold text-foreground">{formatCurrency(totalBudget)}</div>
                      </td>
                      <td className="p-3 text-right hidden xl:table-cell">
                        <div className={`font-semibold ${progress >= 100 ? 'text-red-600': 'text-green-600'}`}>
                          {formatCurrency(totalSpent)}
                        </div>
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell text-sm">
                        {project.startDate 
                          ? new Date(project.startDate).toLocaleDateString("th-TH", { 
                              year: "numeric", month: "short", day: "numeric" 
                            }) 
                          : "-"}
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell text-sm">
                        {project.endDate 
                          ? new Date(project.endDate).toLocaleDateString("th-TH", { 
                              year: "numeric", month: "short", day: "numeric" 
                            }) 
                          : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm font-medium">
                          {project.startDate && project.endDate ? getDuration(project.startDate, project.endDate) : "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={`${getStatusColor(project.status)} text-white gap-1`}>
                          {getStatusIcon(project.status)}
                          <span className="hidden sm:inline">{getStatusText(project.status)}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            {/* ดูรายละเอียด */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/project/${project.id}`}>
                                  <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>ดูรายละเอียด</TooltipContent>
                            </Tooltip>

                            {/* แก้ไข */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/project/${project.id}/edit`}>
                                  <Button variant="outline" size="sm" className="text-yellow-600 hover:bg-yellow-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>แก้ไข</TooltipContent>
                            </Tooltip>

                            {/* ย้ายไปถังขยะ */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(project.id, project.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ลบ</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-sm text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => goToPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ว่างเปล่า */}
          {filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">ไม่พบข้อมูลโครงการ</p>
              <p className="text-sm mt-1">ลองเปลี่ยนตัวกรองหรือสร้างโครงการใหม่</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}