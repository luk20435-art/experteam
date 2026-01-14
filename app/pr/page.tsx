"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, Loader2, Copy } from "lucide-react"
import { formatDate } from "@/src/lib/utils"
import { exportPRToCSV } from "@/src/lib/export-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PRItem {
  id: number
  description: string
  quantity: number
  unit: string
  unitPrice: string | number
  prId: number
}

interface Approval {
  id: number
  approverEmail: string
  status: string
  comment: string | null
  actionDate: string
  prId: number
}

interface Job {
  id: number
  jobName: string
  projectCode: string
  jobNo: string
  ccNo: string
  waNumber: string
  wrPoSrRoNumber: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  traderId: number
  trader: string
  expteamQuotation: string
  estimatedPrCost: number
  startDate: string
  endDate: string
  remark: string
  budgetMaterial: number
  budgetManPower: number
  budgetOp: number
  budgetIe: number
  budgetSupply: number
  budgetEngineer: number
  status: string
  isDraft: boolean
  deletedAt: string | null
  requesterId: string
  originatorId: string
  storeId: string
  approverId: string
}

interface PRData {
  id: number
  prNumber: string
  requester: string
  requestDate: string
  requiredDate: string
  duration: number
  jobBalance: string | number
  supplier: string
  supplierId: number
  deliveryLocation: string
  vatPercent: string | number
  discountPercent: string | number
  grandTotal: string | number
  status: string
  jobId: number
  job: Job
  items: PRItem[]
  approvals: Approval[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface DisplayPR extends PRData {
  totalAmount: number
  displayStatus: string
  deleted: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

const getStatusColor = (status: string): string => {
  switch (status) {
    case "APPROVED":
      return "bg-green-600 text-white"
    case "PENDING":
      return "bg-yellow-500 text-black"
    case "REJECTED":
      return "bg-red-600 text-white"
    case "DRAFT":
    default:
      return "bg-gray-500 text-white"
  }
}

const getDisplayStatus = (status: string) => {
  const statusMap: { [key: string]: React.ReactNode } = {
    DRAFT: "Draft",
    PENDING: <>Waiting for <br /> Approval</>, // JSX แทน string
    APPROVED: "Approved",
    REJECTED: "Reject",
  }
  return statusMap[status] || status
}


export default function PRListPage() {
  const [prs, setPRs] = useState<DisplayPR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "pending" | "approved" | "rejected">("all")

  useEffect(() => {
    
    const fetchPRs = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/pr?order=asc`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        

        const transformedData = data.map((pr: PRData) => {
          const totalAmount = pr.items?.reduce((sum, item) => {
            return sum + Number(item.quantity) * Number(item.unitPrice)
          }, 0) || 0

          return {
            ...pr,
            totalAmount,
            displayStatus: getDisplayStatus(pr.status),
            deleted: pr.deletedAt !== null,
          } as DisplayPR
        })

        setPRs(transformedData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch PR data"
        setError(errorMessage)
        console.error("Error fetching PRs:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPRs()
  }, [])

  

  const activePRs = prs.filter((pr) => !pr.deleted)

  const filteredAndSortedPRs = useMemo(() => {
    return activePRs.filter((pr) => {
      const matchesSearch =
        !searchTerm.trim() ||
        pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.job?.jobName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.requester || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filterStatus === "all" ||
        pr.status.toLowerCase() === filterStatus.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [activePRs, searchTerm, filterStatus])

  const totalItems = filteredAndSortedPRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPRs = filteredAndSortedPRs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize])

  const handleDelete = async (id: number, prNumber: string) => {
    if (confirm(`คุณต้องการลบ PR "${prNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ"`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/pr/${id}`, { method: "DELETE" })
        if (!response.ok) throw new Error("Failed to delete PR")

        setPRs(prs.filter((pr) => pr.id !== id))
        alert("ย้ายไปถังขยะเรียบร้อยแล้ว")
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล")
        console.error("Error deleting PR:", err)
      }
    }
  }

  const handleDuplicate = async (id: number, prNumber: string) => {
    if (!confirm(`คัดลอก PR "${prNumber}" เป็นฉบับร่างใหม่หรือไม่?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/pr/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "คัดลอกไม่สำเร็จ")
      }

      alert("คัดลอก PR สำเร็จ!")
      window.location.reload()
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการคัดลอก")
      console.error("Error duplicating PR:", err)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-2 space-y-6">
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">เกิดข้อผิดพลาด: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Purchase Requisition (PR)</h1>
            {/* <p className="text-sm md:text-base text-muted-foreground">Manage purchase requisitions</p> */}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPRToCSV(filteredAndSortedPRs as any)}
              className="h-9.5 flex-1 md:flex-none bg-sky-400 hover:bg-sky-500 text-white dark:bg-sky-400 cursor-pointer"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>

            <Link href="/pr/new" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto bg-blue-700 hover:bg-green-600 dark:text-white cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Create New PR
              </Button>
            </Link>
          </div>
        </div>

        {/* ตัวกรอง */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full bg-card border-border"
                  />
                </div>

                {/* Filter Status */}
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="approved">approved</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ตาราง */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground text-lg md:text-sm">List all PR ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedPRs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ไม่พบข้อมูล PR
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border">
                        <TableHead className="pl-6">No.</TableHead>
                        <TableHead className="pl-4">PR Number</TableHead>
                        <TableHead>Job Name</TableHead>
                        <TableHead className="hidden md:table-cell">Job Number</TableHead>
                        <TableHead className="hidden md:table-cell">Job Note</TableHead>
                        <TableHead className="hidden sm:table-cell">Request date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-6">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPRs.map((pr) => {
                        const isApproved = pr.status === "APPROVED"

                        return (
                          <TableRow key={pr.id} className="border-border hover:bg-muted/50">
                            <TableCell className="font-thin pl-6">{pr.id}</TableCell>
                            <TableCell className="font-thin pl-4">{pr.prNumber}</TableCell>
                            <TableCell className="max-w-[200px] truncate font-thin">{pr.job?.jobName || "-"}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-[150px] truncate font-thin">{pr.job?.jobNo || "-"}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-[150px] truncate font-thin">{pr.job?.jobNote || "-"}</TableCell>
                            <TableCell className="hidden sm:table-cell whitespace-nowrap font-thin">
                              {new Date(pr.requestDate).toLocaleDateString("th-TH", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }).replace(/(\d+)\/(\d+)\/(\d+)/, "$1/$2/$3")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={getStatusColor(pr.status)}>
                                {pr.displayStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-end gap-2 pr-4">
                                <TooltipProvider>
                                  {/* ปุ่มดูรายละเอียด */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/pr/${pr.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:bg-muted cursor-pointer">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>

                                  {/* ปุ่มแก้ไข – ซ่อนเมื่อ APPROVED */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/pr/${pr.id}/edit`}>
                                          <Button variant="outline" size="icon" className="h-8 w-8 text-yellow-600 hover:bg-muted cursor-pointer">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ปุ่มลบ – ซ่อนเมื่อ APPROVED */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:bg-muted cursor-pointer"
                                          onClick={() => handleDelete(pr.id, pr.prNumber)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ปุ่ม Duplicate – เฉพาะ DRAFT */}
                                  {pr.status === "DRAFT" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-indigo-600 hover:bg-muted cursor-pointer"
                                          onClick={() => handleDuplicate(pr.id, pr.prNumber)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Duplicate</TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-card">
                    <div className="text-sm text-muted-foreground">
                      แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                        <SelectTrigger className="w-32 bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 รายการ</SelectItem>
                          <SelectItem value="10">10 รายการ</SelectItem>
                          <SelectItem value="20">20 รายการ</SelectItem>
                          <SelectItem value="50">50 รายการ</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
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
                      <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}