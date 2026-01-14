// app/po/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface POItem {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

interface Job {
  jobName: string
  trader?: string
  jobNo?: string
}

interface PR {
  id: number
  prNumber: string
  supplier: string
  requester: string
  requestDate: string
  job?: Job
}

interface PO {
  id: number
  poNumber: string
  prId: number | null
  pr?: PR | null
  orderDate: string
  deliveryDate: string
  remark: string
  paymentTerms: string
  currency: string
  supplier?: string
  status: string
  createdAt: string
  items: POItem[]
  deleted?: boolean
  invoice?: string
  tax?: string
  jobNote?: string
}

export default function POListPage() {
  const [pos, setPOs] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "pending" | "approved" | "rejected" | "complete" | "submitted">("all")

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/po`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูล PO ได้")

        const data: PO[] = await res.json()
        setPOs(data)
      } catch (err) {
        console.error("โหลดข้อมูล PO ไม่สำเร็จ", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPOs()
  }, [])

  const activePOs = pos.filter(po => !po.deleted)

  const filteredAndSortedPOs = useMemo(() => {
    let filtered = activePOs.filter((po) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchLower) ||
        (po.pr?.prNumber || "").toLowerCase().includes(searchLower) ||
        (po.supplier || po.pr?.supplier || "").toLowerCase().includes(searchLower) ||
        (po.pr?.job?.jobName || "").toLowerCase().includes(searchLower) ||
        (po.remark || "").toLowerCase().includes(searchLower)

      const matchesStatus =
        filterStatus === "all" ||
        po.status.toLowerCase() === filterStatus.toLowerCase()

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id
    })

    return filtered
  }, [activePOs, searchTerm, sortOrder, filterStatus])

  const totalItems = filteredAndSortedPOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPOs = filteredAndSortedPOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize])

  const getStatusBadge = (status: string) => {
    const colorMap: { [key: string]: string } = {
      "ร่าง": "bg-gray-500 text-white",
      "draft": "bg-gray-500 text-white",
      "รออนุมัติ": "bg-yellow-500 text-dark",
      "pending": "bg-yellow-500 text-dark",
      "อนุมัติแล้ว": "bg-green-300 text-dark",
      "approved": "bg-green-300 text-dark",
      "ปฏิเสธ": "bg-red-600 text-white",
      "rejected": "bg-red-600 text-white",
      "ส่งแล้ว": "bg-sky-600 text-white",
      "submitted": "bg-sky-600 text-white",
      "สำเร็จ": "bg-green-600 text-white",
      "complete": "bg-green-600 text-white",
    }

    const displayStatus = status.toLowerCase() === "draft" ? "Draft" :
      status.toLowerCase() === "pending" ? <span>
        <span className="block">Waiting for</span>
        <span className="block">Approval</span>
      </span> :
        status.toLowerCase() === "approved" ? "Approved" :
          status.toLowerCase() === "submitted" ? "Submitted" :
            status.toLowerCase() === "complete" ? "Complete" :
              status.toLowerCase() === "rejected" ? "Rejected" : status

    return <Badge className={colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"}>{displayStatus}</Badge>
  }

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบ PO นี้หรือไม่?\n\nข้อมูลจะถูกย้ายไป \"ถังขยะ\"")) return

    try {
      const res = await fetch(`${API_BASE_URL}/po/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("ลบไม่สำเร็จ")
      setPOs(prev => prev.filter(po => po.id !== id))
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบ")
    }
  }

  const handleDuplicate = async (id: number, poNumber: string) => {
    if (!confirm(`คัดลอก PO "${poNumber}" เป็นฉบับร่างใหม่หรือไม่?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/po/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "คัดลอกไม่สำเร็จ")
      }

      alert("คัดลอก PO สำเร็จ!")
      window.location.reload()
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการคัดลอก")
      console.error("Error duplicating PO:", err)
    }
  }

  const exportToCSV = () => {
    const headers = ["No.", "PO Number", "PR Number", "Supplier", "Job Number", "Job Name", "Remark", "Status", "Total Amount"]
    const rows = filteredAndSortedPOs.map(po => {
      const total = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

      return [
        po.id.toString(),
        po.poNumber,
        po.pr?.prNumber || "-",
        po.supplier || po.pr?.supplier || "-",
        po.pr?.job?.jobNo || "-",
        po.pr?.job?.jobName || "-",
        po.remark || "-",
        po.status,
        total.toLocaleString(),
      ]
    })

    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `PO_List_${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล PO...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-4 md:space-y-6 max-w-full py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Purchase Orders (PO)</h1>
          <p className="text-sm text-muted-foreground mt-1 dark:text-white">จัดการใบสั่งซื้อทั้งหมด</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportToCSV} className="bg-sky-400 hover:bg-sky-500 text-white dark:text-white dark:bg-sky-400 hover:dark:bg-green-400 cursor-pointer">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/po/new">
            <Button className="bg-blue-700 hover:bg-green-600 dark:text-white cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create New PO
            </Button>
          </Link>
        </div>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหา PO, PR, Supplier, Job..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle>List All PO ({totalItems} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedPOs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              ไม่พบข้อมูล PO
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="hidden md:table-cell">Job Number</TableHead>
                      <TableHead className="hidden md:table-cell">Job Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Invoice No</TableHead>
                      <TableHead className="hidden lg:table-cell">Tax Inv#</TableHead>
                      <TableHead className="hidden lg:table-cell">Job Note</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPOs.map(po => {
                      const total = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
                      const isApproved = po.status.toLowerCase() === "approved"

                      return (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">
                            {po.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {po.poNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {po.supplier || po.pr?.supplier || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {po.pr?.job?.jobNo || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {po.pr?.job?.jobName || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell truncate max-w-xs">
                            {po.invoice || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell truncate max-w-xs">
                            {po.tax || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell truncate max-w-xs">
                            {po.jobNote || po.pr?.jobNote || "-"}
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(po.status)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {total.toLocaleString()} บาท
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/po/${po.id}`}>
                                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 cursor-pointer">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>View</TooltipContent>
                                </Tooltip>

                                {!isApproved && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/po/${po.id}/edit`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-yellow-600 cursor-pointer">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                )}

                                {!isApproved && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(po.id)}
                                        className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                )}

                                {po.status.toLowerCase() === "draft" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                        onClick={() => handleDuplicate(po.id, po.poNumber)}
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

              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
                  </div>
                  <div className="flex items-center gap-1">
                    <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
                      <SelectTrigger className="w-30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                        <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" className="w-9" onClick={() => goToPage(pageNum)}>
                          {pageNum}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-sm text-muted-foreground">...</span>
                        <Button variant={currentPage === totalPages ? "default" : "outline"} size="sm" className="w-9" onClick={() => goToPage(totalPages)}>
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
  )
}