"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Edit, Trash2, Search, ChevronLeft, ChevronRight, Copy, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isValid } from "date-fns"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WO {
  id: number
  woNumber: string
  status: string
  wr?: {
    wrNumber: string
    requester: string
    requestDate: string
    RequierDate: string | null
    jobName: string
    jobNo: string
  }
}

export default function WOListPage() {
  const [wos, setWOs] = useState<WO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const formatDateOnly = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"
    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return "-"
      return format(date, "dd/MM/yyyy")
    } catch {
      return "-"
    }
  }

  useEffect(() => {
    const fetchWOs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/wo`)
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setWOs(data)
      } catch (err) {
        toast({ title: "โหลดข้อมูล WO ไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchWOs()
  }, [toast])

  // Filter และ Search
  const filteredWOs = useMemo(() => {
    return wos.filter((wo) => {
      const matchesSearch =
        wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.wr?.wrNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.wr?.requester.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || wo.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [wos, searchTerm, statusFilter])

  // Pagination
  const totalItems = filteredWOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  const paginatedWOs = useMemo(() => {
    return filteredWOs.slice(startIndex - 1, endIndex)
  }, [filteredWOs, currentPage, pageSize])

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase()
    if (lower === "approved" || lower.includes("อนุมัติ")) return <Badge className="bg-green-600 text-white">Approved</Badge>
    if (lower === "pending" || lower.includes("รออนุมัติ")) {
      return (
        <Badge
          className="
        bg-yellow-500 text-white
         flex-col
      "
        >
          <span>Waiting</span>
          <span>for approval</span>
        </Badge>
      )
    }

    if (lower === "rejected") return <Badge className="bg-red-600 text-white">Reject</Badge>
    if (lower === "submitted") return <Badge className="bg-red-600 text-white">Submitted</Badge>
    if (lower === "complete") return <Badge className="bg-red-600 text-white">Complete</Badge>
    return <Badge variant="secondary">Draft</Badge>
  }

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบใบสั่งงาน (WO) นี้?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/wo/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "ลบไม่สำเร็จ")
      }

      setWOs((prev) => prev.filter((wo) => wo.id !== id))
      toast({ title: "ลบ WO สำเร็จ!" })
    } catch (err: any) {
      toast({ title: "ลบ WO ไม่สำเร็จ", description: err.message, variant: "destructive" })
    }
  }

  const handleDuplicate = async (id: number, woNumber: string) => {
    if (!confirm(`คัดลอก WO "${woNumber}" เป็นฉบับร่างใหม่หรือไม่?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/wo/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "คัดลอกไม่สำเร็จ")
      }

      toast({ title: "คัดลอก WO สำเร็จ!" })
      window.location.reload()
    } catch (err: any) {
      toast({ title: err.message || "คัดลอก WO ไม่สำเร็จ", variant: "destructive" })
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Reset หน้าเมื่อ filter/search/pageSize เปลี่ยน
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, pageSize])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูล Work Order (WO)...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Work Order (WO)</h1>
              {/* <p className="text-muted-foreground mt-1">ใบสั่งงานภายใน</p> */}
            </div>
            <Link href="/wo/add">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto cursor-pointer dark:text-white">
                <Plus className="h-5 w-5 mr-2" />
                Create New WO
              </Button>
            </Link>
          </div>

          {/* Filter Bar */}
          <Card className="pt-6 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="ทุกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Waiting for Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">List All WO ({totalItems})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">No.</TableHead>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Job Number</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Request Date</TableHead>
                      {/* <TableHead>Delivery Date</TableHead> */}
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-end">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWOs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          ไม่พบข้อมูลที่ตรงตามเงื่อนไข
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedWOs.map((wo) => {
                        const isApproved = wo.status.toLowerCase() === "approved"

                        return (
                          <TableRow key={wo.id}>
                            <TableCell className="font-thin">{wo.id}</TableCell>
                            <TableCell className="font-thin">{wo.woNumber}</TableCell>
                            <TableCell className="font-thin">{wo.wr?.jobName || "-"}</TableCell>
                            <TableCell className="font-thin">{wo.wr?.jobNo || "-"}</TableCell>
                            <TableCell className="font-thin">{wo.wr?.requester}</TableCell>
                            <TableCell className="font-thin">{formatDateOnly(wo.wr?.requestDate)}</TableCell>
                            {/* <TableCell>{formatDateOnly(wo.wr?.RequierDate)}</TableCell> */}
                            <TableCell className="text-center">{getStatusBadge(wo.status)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-end gap-2">
                                <TooltipProvider>
                                  {/* ปุ่มดูรายละเอียด – แสดงเสมอ */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/wo/${wo.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                          <Eye className="h-4 w-4 text-blue-600 hover:text-blue-700" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>

                                  {/* ✅ ปุ่มแก้ไข – ซ่อนเมื่อ approved */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/wo/${wo.id}/edit`}>
                                          <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4 text-yellow-600 hover:text-yellow-700" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ✅ ปุ่มลบ – ซ่อนเมื่อ approved */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:text-red-700"
                                          onClick={() => handleDelete(wo.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ✅ ปุ่ม Duplicate – เฉพาะ draft */}
                                  {wo.status.toLowerCase() === "draft" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-indigo-600 hover:text-indigo-700"
                                          onClick={() => handleDuplicate(wo.id, wo.woNumber)}
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
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination & Page Size */}
              {totalItems > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* ซ้าย: แสดงจำนวนรายการ */}
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    แสดง {startIndex} - {endIndex} จาก {totalItems} รายการ
                  </div>

                  {/* ขวา: เลือกจำนวน + Pagination */}
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {/* เลือกจำนวนรายการต่อหน้า */}
                    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 รายการ</SelectItem>
                        <SelectItem value="20">20 รายการ</SelectItem>
                        <SelectItem value="50">50 รายการ</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Pagination */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {totalPages <= 7 ? (
                        Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))
                      ) : (
                        <>
                          <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(1)}
                          >
                            1
                          </Button>

                          {currentPage > 4 && <span className="px-3 text-muted-foreground">...</span>}

                          {Array.from({ length: 3 }, (_, i) => {
                            const pageNum = currentPage - 1 + i
                            if (pageNum <= 1 || pageNum >= totalPages) return null
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            )
                          })}

                          {currentPage < totalPages - 3 && <span className="px-3 text-muted-foreground">...</span>}

                          {totalPages > 1 && (
                            <Button
                              variant={currentPage === totalPages ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          )}
                        </>
                      )}

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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}