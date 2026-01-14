"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Filter,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

interface Job {
  id: string
  jobName: string
  projectCode: string
  jobNo: string
  ccNo: string
  waNumber: string
  wrPoSrRoNumber: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  expteamQuotation: string
  estimatedPrCost: number
  startDate: string
  endDate: string
  remark: string
  phone: string
  traderId?: string
  status?: string
  createdAt?: string
  deleted?: boolean
  traderName?: string
}

interface Trader {
  id: string
  name: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [traders, setTraders] = useState<Trader[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed">("all")
  const [filterTrader, setFilterTrader] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, tradersRes] = await Promise.all([
          fetch("http://localhost:3000/api/jobs"),
          fetch("http://localhost:3000/api/traders"),
        ])

        const jobsData = await jobsRes.json()
        const tradersData = await tradersRes.json()

        const jobList = Array.isArray(jobsData) ? jobsData : jobsData.data || []
        const traderList = Array.isArray(tradersData) ? tradersData : tradersData.data || []

        jobList.sort((a: Job, b: Job) => Number(a.id) - Number(b.id))

        setJobs(jobList)
        setTraders(traderList)
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTraderName = (traderId?: string) => {
    if (!traderId) return "ไม่ระบุ"
    const trader = traders.find(t => t.id === traderId)
    return trader?.name || "ไม่ระบุ"
  }

  const refreshData = async () => {
    try {
      const jobsRes = await fetch("http://localhost:3000/api/jobs")
      const jobsData = await jobsRes.json()
      const jobList = Array.isArray(jobsData) ? jobsData : jobsData.data || []
      jobList.sort((a: Job, b: Job) => Number(a.id) - Number(b.id))
      setJobs(jobList)
    } catch (err) {
      console.error("โหลดข้อมูลใหม่ไม่สำเร็จ:", err)
    }
  }

  const getStatusInfo = (status?: string) => {
    if (!status) return { color: "bg-gray-100 text-gray-800", text: "ไม่ระบุ", icon: null }

    const statusLower = status.toLowerCase().trim()

    if (statusLower === "in_progress" || statusLower === "in progress") {
      return { color: "bg-blue-500 text-white", text: "in progress", icon: <Clock className="h-4 w-4" /> }
    }
    if (statusLower === "completed") {
      return { color: "bg-green-600 text-white", text: "completed", icon: <CheckCircle className="h-4 w-4" /> }
    }

    return { color: "bg-gray-100 text-gray-800", text: status, icon: null }
  }

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => !job.deleted)
      .filter(job => {
        const traderName = getTraderName(job.traderId)
        const searchLower = searchTerm.toLowerCase()

        const matchesSearch =
          job.jobName?.toLowerCase().includes(searchLower) ||
          job.jobNo?.toLowerCase().includes(searchLower) ||
          job.ccNo?.includes(searchTerm) ||
          traderName.toLowerCase().includes(searchLower)

        const matchesStatus = filterStatus === "all" || job.status === filterStatus
        const matchesTrader = filterTrader === "all" || job.traderId === filterTrader

        return matchesSearch && matchesStatus && matchesTrader
      })
  }, [jobs, searchTerm, filterStatus, filterTrader, traders])

  const totalItems = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openDeleteModal = (id: string, name: string) => {
    setJobToDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!jobToDelete) return

    try {
      await fetch(`http://localhost:3000/api/jobs/${jobToDelete.id}`, {
        method: "DELETE",
      })
      setJobs(prev => prev.filter(j => j.id !== jobToDelete.id))
      setDeleteModalOpen(false)
      setJobToDelete(null)
    } catch (err) {
      alert("ลบไม่สำเร็จ")
    }
  }

  useEffect(() => {
    const interval = setInterval(refreshData, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Jobs</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage Jobs</p>
        </div>
        <Link href="/project/new">
          <Button className="bg-blue-700 hover:bg-green-600 w-full sm:w-auto dark:text-white cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
        </Link>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา Job Name Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">สมบูรณ์</SelectItem>
              </SelectContent>
            </Select>

            {/* <Select value={filterTrader} onValueChange={setFilterTrader}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="ทุก Trader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุก Trader</SelectItem>
                {traders.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">List Jobs ({totalItems} list)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/100">
                  <th className="text-center p-4 font-sm w-20">No.</th>
                  <th className="text-left p-4 font-sm">Job Number</th>
                  <th className="text-left p-4 font-sm">Job Name</th>
                  <th className="text-left p-4 font-bold">CC No.</th>
                  <th className="text-left p-4 font-bold">Project Code</th>
                  <th className="text-left p-4 font-bold">Client Name</th>
                  <th className="text-left p-4 font-bold">WA Number</th>
                  <th className="text-left p-4 font-bold">Expteam Quotation</th>
                  <th className="text-center p-4 font-bold">Start Date</th>
                  <th className="text-center p-4 font-bold">End Date</th>
                  <th className="text-center p-4 font-bold">Status</th>
                  <th className="text-right p-4 font-bold">Manage</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-16 text-muted-foreground">
                      ไม่พบข้อมูล Job
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => {
                    const { color, text, icon } = getStatusInfo(job.status)
                    const isCompleted = job.status?.toLowerCase() === "completed"

                    return (
                      <tr key={job.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-center font-medium">
                          {job.id}
                        </td>
                        <td className="p-4 font-medium">{job.jobNo || "-"}</td>
                        <td className="p-4">
                          <div className="font-medium whitespace-normal break-words max-w-xs line-clamp-2">{job.jobName || "-"}</div>
                        </td>
                        <td className="p-4">{job.ccNo || "-"}</td>
                        <td className="p-4">{job.projectCode || "-"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span className="truncate max-w-32">{getTraderName(job.traderId)}</span>
                          </div>
                        </td>
                        <td className="p-4">{job.waNumber || "-"}</td>
                        <td className="p-4">{job.expteamQuotation || "-"}</td>
                        <td className="p-4 text-center text-sm">
                          {job.startDate ? new Date(job.startDate).toLocaleDateString("th-TH") : "-"}
                        </td>
                        <td className="p-4 text-center text-sm">
                          {job.endDate ? new Date(job.endDate).toLocaleDateString("th-TH") : "-"}
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={`${color} flex items-center gap-1 w-fit mx-auto`}>
                            {icon}
                            <span>{text}</span>
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              {/* ปุ่มดูรายละเอียด – แสดงเสมอ */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/project/${job.id}`}>
                                    <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 cursor-pointer">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>

                              {/* ✅ ปุ่มแก้ไข – ซ่อนเมื่อ completed */}
                              {!isCompleted && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/project/${job.id}/edit`}>
                                      <Button variant="outline" size="sm" className="text-yellow-600 hover:bg-yellow-50 cursor-pointer">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              )}

                              {/* ✅ ปุ่มลบ – ซ่อนเมื่อ completed */}
                              {!isCompleted && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:bg-red-50 cursor-pointer"
                                      onClick={() => openDeleteModal(job.id, job.jobName)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                แสดง {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} จาก {totalItems} รายการ
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm whitespace-nowrap">หน้า {currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 รายการ</SelectItem>
                    <SelectItem value="20">20 รายการ</SelectItem>
                    <SelectItem value="50">50 รายการ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal ลบ */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="max-w-md border-2 border-red-200">
          <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="h-10 w-10 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-red-700">
              ลบ Job นี้หรือไม่?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-center mt-3">
              ต้องการลบ Job
              <span className="font-bold text-black"> {jobToDelete?.name}</span> ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-center gap-4 pt-4">
            <AlertDialogCancel className="w-full sm:w-auto px-10 py-2.5 bg-gray-500 hover:bg-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full sm:w-auto px-10 py-2.5 bg-red-600 hover:bg-red-700"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}