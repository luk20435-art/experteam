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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WR {
  id: number
  wrNumber: string
  requester: string
  requestDate: string
  requiredDate: string | null
  status: string
  job?: {
    jobName: string
    jobNo: string
    jobNote?: string
  }
}

export default function WRListPage() {
  const [wrs, setWRs] = useState<WR[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "pending" | "approved" | "rejected" | "unapproved">("all")

  useEffect(() => {
    const fetchWRs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/wr`)
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setWRs(data)
      } catch (err) {
        toast({ title: "โหลดข้อมูล WR ไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchWRs()
  }, [toast])

  // กรองทั้ง search และ status
  const filteredWRs = useMemo(() => {
    return wrs.filter((wr) => {
      const matchesSearch =
        !searchTerm.trim() ||
        wr.wrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wr.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wr.job?.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesStatus =
        filterStatus === "all" ||
        wr.status.toLowerCase() === filterStatus.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [wrs, searchTerm, filterStatus])

  // Pagination
  const totalItems = filteredWRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedWRs = filteredWRs.slice(startIndex, endIndex)

  // Reset หน้าเมื่อ search หรือเปลี่ยน page size (ไม่รวม filterStatus เพื่อหลีกเลี่ยง error dependency)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize])

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase()
    if (lower === "approved") return <Badge className="bg-green-600 text-white">Approved</Badge>
    if (lower === "pending") return <Badge className="bg-yellow-500 text-white">Waiting for <br/> approval</Badge>
    if (lower === "rejected") return <Badge className="bg-red-600 text-white">Rejected</Badge>
    if (lower === "unapproved") return <Badge className="bg-red-600 text-white">Unapproved</Badge>
    return <Badge className="bg-gray-500 text-white">Draft</Badge>
  }

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ WR นี้?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/wr/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("ลบไม่สำเร็จ")

      setWRs((prev) => prev.filter((wr) => wr.id !== id))
      toast({ title: "ลบ WR สำเร็จ!" })
    } catch (err) {
      toast({ title: "ลบ WR ไม่สำเร็จ", variant: "destructive" })
    }
  }

  const handleDuplicate = async (id: number, wrNumber: string) => {
    if (!confirm(`คัดลอก WR "${wrNumber}" เป็นฉบับร่างใหม่หรือไม่?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/wr/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "คัดลอกไม่สำเร็จ")
      }

      toast({ title: "คัดลอก WR สำเร็จ!" })
      window.location.reload()
    } catch (err: any) {
      toast({ title: err.message || "คัดลอก WR ไม่สำเร็จ", variant: "destructive" })
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูล WR...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen dark:bg-black">
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-2 dark:bg-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Work Requisition (WR)</h1>
              {/* <p className="text-muted-foreground mt-1">ใบขอเบิกงาน/วัสดุภายใน</p> */}
            </div>
            <Link href="/wr/add">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto dark:text-white hover:dark:bg-green-600 cursor-pointer">
                <Plus className="h-5 w-5 mr-2" />
                Create New WR
              </Button>
            </Link>
          </div>

          {/* Filter Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Waiting for approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="unapproved">Unapproved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">List all WR ({totalItems} )</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>No.</TableHead>
                      <TableHead>WR Number</TableHead>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Job Number</TableHead>
                      <TableHead>Job Note</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWRs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          {searchTerm || filterStatus !== "all" ? "ไม่พบข้อมูลที่ตรงตามเงื่อนไข" : "ยังไม่มี WR"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedWRs.map((wr) => {
                        const isApproved = wr.status.toLowerCase() === "approved"

                        return (
                          <TableRow key={wr.id}>
                            <TableCell className="font-thin">{wr.id}</TableCell>
                            <TableCell className="font-thin">{wr.wrNumber}</TableCell>
                            <TableCell className="font-thin">{wr.job?.jobName || "-"}</TableCell>
                            <TableCell className="font-thin">{wr.job?.jobNo || "-"}</TableCell>
                            <TableCell className="font-thin">{wr.job?.jobNote || "-"}</TableCell>
                            <TableCell className="font-thin">{wr.requestDate}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(wr.status)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-end  gap-2">
                                <TooltipProvider>
                                  {/* ปุ่มดูรายละเอียด */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/wr/${wr.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 cursor-pointer">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>

                                  {/* ปุ่มแก้ไข – ซ่อนเมื่อ approved */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/wr/${wr.id}/edit`}>
                                          <Button variant="outline" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 cursor-pointer">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ปุ่มลบ – ซ่อนเมื่อ approved */}
                                  {!isApproved && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                                          onClick={() => handleDelete(wr.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* ปุ่ม Duplicate – เฉพาะ draft */}
                                  {wr.status.toLowerCase() === "draft" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                          onClick={() => handleDuplicate(wr.id, wr.wrNumber)}
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

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-sm text-muted-foreground">
                     {startIndex + 1} to {endIndex} of {totalItems} list
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="w-30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 รายการ</SelectItem>
                        <SelectItem value="20">20 รายการ</SelectItem>
                        <SelectItem value="50">50 รายการ</SelectItem>
                        <SelectItem value="100">100 รายการ</SelectItem>
                      </SelectContent>
                    </Select>
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
                        {currentPage > 3 && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
                              1
                            </Button>
                            <span className="px-2 text-muted-foreground">...</span>
                          </>
                        )}

                        {Array.from({ length: 3 }, (_, i) => {
                          const page = currentPage - 1 + i
                          if (page < 1 || page > totalPages) return null
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}

                        {currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2 text-muted-foreground">...</span>
                            <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
                              {totalPages}
                            </Button>
                          </>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}