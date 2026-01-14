"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, ArrowLeftCircle, Trash2, Clock, CheckCircle, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
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

const API_BASE_URL = "http://localhost:3000/api"

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

export default function TrashJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [traders, setTraders] = useState<Trader[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed">("all")
  const [filterTrader, setFilterTrader] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [jobToAction, setJobToAction] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, tradersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs`),
          fetch(`${API_BASE_URL}/traders`),
        ])

        const jobsData = await jobsRes.json()
        const tradersData = await tradersRes.json()

        const jobList = Array.isArray(jobsData) ? jobsData : jobsData.data || []
        const traderList = Array.isArray(tradersData) ? tradersData : tradersData.data || []

        setJobs(jobList)
        setTraders(traderList)
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err)
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล")
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

  const getStatusInfo = (status?: string) => {
    if (!status) return { color: "bg-gray-100 text-gray-800", text: "ไม่ระบุ", icon: null }

    const statusLower = status.toLowerCase().trim()

    if (statusLower === "in_progress" || statusLower === "in progress") {
      return { color: "bg-blue-500 text-white", text: "กำลังดำเนินการ", icon: <Clock className="h-4 w-4" /> }
    }
    if (statusLower === "completed") {
      return { color: "bg-green-600 text-white", text: "สมบูรณ์", icon: <CheckCircle className="h-4 w-4" /> }
    }

    return { color: "bg-gray-100 text-gray-800", text: status, icon: null }
  }

  // กรองเฉพาะที่ถูกลบ
  const deletedJobs = useMemo(() => jobs.filter(job => job.deleted), [jobs])

  const filteredJobs = useMemo(() => {
    return deletedJobs.filter(job => {
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
  }, [deletedJobs, searchTerm, filterStatus, filterTrader, traders])

  const totalItems = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openRestoreModal = (id: string, name: string) => {
    setJobToAction({ id, name })
    setRestoreModalOpen(true)
  }

  const openDeleteModal = (id: string, name: string) => {
    setJobToAction({ id, name })
    setDeleteModalOpen(true)
  }

  const confirmRestore = async () => {
    if (!jobToAction) return

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobToAction.id}/restore`, {
        method: "PATCH",
      })

      if (!res.ok) throw new Error("กู้คืนไม่สำเร็จ")

      setJobs(prev => prev.filter(j => j.id !== jobToAction.id))
      alert(`กู้คืน Job "${jobToAction.name}" สำเร็จ!`)
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการกู้คืน")
    } finally {
      setRestoreModalOpen(false)
      setJobToAction(null)
    }
  }

  const confirmPermanentDelete = async () => {
    if (!jobToAction) return

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobToAction.id}/force`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("ลบถาวรไม่สำเร็จ")

      setJobs(prev => prev.filter(j => j.id !== jobToAction.id))
      alert(`ลบ Job "${jobToAction.name}" ถาวรเรียบร้อย`)
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบถาวร")
    } finally {
      setDeleteModalOpen(false)
      setJobToAction(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูลถังขยะ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-600" />
              ถังขยะ - Jobs
            </h1>
            <p className="text-muted-foreground mt-2">
              Job ที่ถูกลบทั้งหมด ({deletedJobs.length} รายการ)
            </p>
          </div>
          <Link href="/project">
            <Button variant="outline" size="lg">
              <ChevronLeft className="mr-2 h-5 w-5" />
              กลับสู่รายการ Jobs
            </Button>
          </Link>
        </div>

        {/* ตัวกรอง */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา Job No., ชื่อ Job, Trader..."
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

              <Select value={filterTrader} onValueChange={setFilterTrader}>
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
              </Select>

              <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 รายการ</SelectItem>
                  <SelectItem value="20">20 รายการ</SelectItem>
                  <SelectItem value="50">50 รายการ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ตาราง */}
        <Card>
          <CardHeader>
            <CardTitle>รายการ Job ที่อยู่ในถังขยะ ({totalItems} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedJobs.length === 0 ? (
              <div className="text-center py-16">
                <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-40 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  {deletedJobs.length === 0 ? "ถังขยะว่างเปล่า" : "ไม่พบรายการที่ตรงกับการค้นหา"}
                </p>
              </div>
            ) : (
              <>
                <TooltipProvider>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-center p-4">No.</th>
                          <th className="text-left p-4">Job Number</th>
                          <th className="text-left p-4">Job Name</th>
                          <th className="text-left p-4">CC No.</th>
                          <th className="text-left p-4">Project Code</th>
                          <th className="text-left p-4">Client Name</th>
                          <th className="text-left p-4">WA Number</th>
                          <th className="text-left p-4">Expteam Quotation</th>
                          <th className="text-center p-4">Start Date</th>
                          <th className="text-center p-4">End</th>
                          <th className="text-center p-4">Status</th>
                          <th className="text-center p-4">จัดการ</th>
                        </tr>
                      </thead>
                      <TableBody>
                        {paginatedJobs.map((job) => {
                          const { color, text, icon } = getStatusInfo(job.status)

                          return (
                            <TableRow key={job.id} className="border-b hover:bg-red-50/30">
                              <TableCell className="p-4 text-center">{job.id}</TableCell>
                              <TableCell className="p-4 font-medium">{job.jobNo || "-"}</TableCell>
                              <TableCell className="p-4">
                                <div className="max-w-xs line-clamp-2">{job.jobName || "-"}</div>
                              </TableCell>
                              <TableCell className="p-4">{job.ccNo || "-"}</TableCell>
                              <TableCell className="p-4">{job.projectCode || "-"}</TableCell>
                              <TableCell className="p-4">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-slate-400" />
                                  <span>{getTraderName(job.traderId)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="p-4">{job.waNumber || "-"}</TableCell>
                              <TableCell className="p-4">{job.expteamQuotation || "-"}</TableCell>
                              <TableCell className="p-4 text-center text-sm">
                                {job.startDate ? new Date(job.startDate).toLocaleDateString("th-TH") : "-"}
                              </TableCell>
                              <TableCell className="p-4 text-center text-sm">
                                {job.endDate ? new Date(job.endDate).toLocaleDateString("th-TH") : "-"}
                              </TableCell>
                              <TableCell className="p-4 text-center">
                                <Badge className={`${color} gap-1`}>
                                  {icon}
                                  <span>{text}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="p-4">
                                <div className="flex justify-center gap-2">
                                  {/* ดูรายละเอียด */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/project/${job.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>ดูรายละเอียด</TooltipContent>
                                  </Tooltip>

                                  {/* กู้คืน */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:bg-green-50"
                                        onClick={() => openRestoreModal(job.id, job.jobName)}
                                      >
                                        <ArrowLeftCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>กู้คืน Job</TooltipContent>
                                  </Tooltip>

                                  {/* ลบถาวร */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                                        onClick={() => openDeleteModal(job.id, job.jobName)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>ลบถาวร</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </table>
                  </div>
                </TooltipProvider>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      แสดง {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} จาก {totalItems} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">หน้า {currentPage} / {totalPages}</span>
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal กู้คืน */}
        <AlertDialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>กู้คืน Job</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการกู้คืน Job "<strong>{jobToAction?.name}</strong>" กลับสู่รายการหลักหรือไม่?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">
                ยืนยันกู้คืน
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal ลบถาวร */}
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">ลบถาวร</AlertDialogTitle>
              <AlertDialogDescription>
                ⚠️ คุณแน่ใจหรือไม่ที่จะลบ Job "<strong>{jobToAction?.name}</strong>" ถาวร?<br />
                <span className="text-red-600 font-medium">ไม่สามารถกู้คืนได้อีกต่อไป</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPermanentDelete} className="bg-red-600 hover:bg-red-700">
                ยืนยันลบถาวร
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}