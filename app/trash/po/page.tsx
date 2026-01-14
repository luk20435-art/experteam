// app/trash/po/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, ArrowLeftCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

export default function TrashPOPage() {
  const [pos, setPOs] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "pending" | "approved" | "rejected">("all")

  // ดึงข้อมูลเฉพาะ PO ที่อยู่ในถังขยะ
  useEffect(() => {
    const fetchTrashedPOs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/po/trash`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "ไม่สามารถโหลดข้อมูลถังขยะได้")
        }

        const data: PO[] = await res.json()
        setPOs(data)
      } catch (err: any) {
        console.error(err)
        alert(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchTrashedPOs()
  }, [])

  // กรองตามค้นหาและสถานะ
  const filteredPOs = useMemo(() => {
    return pos.filter((po) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchLower) ||
        (po.pr?.prNumber || "").toLowerCase().includes(searchLower) ||
        (po.supplier || "").toLowerCase().includes(searchLower) ||
        (po.pr?.job?.jobName || "").toLowerCase().includes(searchLower) ||
        (po.remark || "").toLowerCase().includes(searchLower)

      const matchesStatus =
        filterStatus === "all" ||
        po.status.toLowerCase() === filterStatus.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [pos, searchTerm, filterStatus])

  const totalItems = filteredPOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPOs = filteredPOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize, filterStatus])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    const colorMap: { [key: string]: string } = {
      draft: "bg-gray-500 text-white",
      pending: "bg-yellow-400 text-black",
      approved: "bg-green-600 text-white",
      rejected: "bg-red-600 text-white",
    }

    const displayStatus = status.toLowerCase() === "draft" ? "ร่าง" :
      status.toLowerCase() === "pending" ? "รออนุมัติ" :
        status.toLowerCase() === "approved" ? "อนุมัติแล้ว" :
          status.toLowerCase() === "rejected" ? "ปฏิเสธ" : status

    return <Badge className={colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"}>{displayStatus}</Badge>
  }

  // กู้คืน PO
  const handleRestore = async (id: number, poNumber: string) => {
    if (!confirm(`กู้คืน PO "${poNumber}" กลับสู่รายการหลักหรือไม่?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/po/${id}/restore`, {
        method: "PATCH",
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "กู้คืนไม่สำเร็จ")
      }

      setPOs(prev => prev.filter(po => po.id !== id))
      alert(`กู้คืน PO "${poNumber}" สำเร็จ!`)
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการกู้คืน")
    }
  }

  // ลบถาวร
  const handlePermanentDelete = async (id: number, poNumber: string) => {
    if (!confirm(`⚠️ ลบ PO "${poNumber}" ถาวร 100% หรือไม่?\n\nไม่สามารถกู้คืนได้อีกต่อไป`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/po/${id}/force`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "ลบถาวรไม่สำเร็จ")
      }

      setPOs(prev => prev.filter(po => po.id !== id))
      alert(`ลบ PO "${poNumber}" ถาวรเรียบร้อย`)
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบถาวร")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูลถังขยะ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-4 md:space-y-6 max-w-full py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 dark:text-white">
            <Trash2 className="h-8 w-8 text-red-600" />
            ถังขยะ - Purchase Orders (PO)
          </h1>
          <p className="text-sm text-muted-foreground mt-1 dark:text-white">
            PO ที่ถูกลบทั้งหมด ({pos.length} รายการ)
          </p>
        </div>
        <Link href="/po">
          <Button variant="outline" size="lg">
            <ChevronLeft className="mr-2 h-5 w-5" />
            กลับสู่รายการ PO
          </Button>
        </Link>
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
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="draft">ร่าง</SelectItem>
                <SelectItem value="pending">รออนุมัติ</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
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
          <CardTitle>รายการ PO ที่อยู่ในถังขยะ ({totalItems} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedPOs.length === 0 ? (
            <div className="text-center py-16">
              <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-40 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {pos.length === 0 ? "ถังขยะว่างเปล่า" : "ไม่พบรายการที่ตรงกับการค้นหา"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {pos.length === 0 ? "ไม่มี PO ที่ถูกลบอยู่ในขณะนี้" : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
              </p>
            </div>
          ) : (
            <>
              <TooltipProvider>
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
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead className="text-center">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPOs.map(po => {
                        const total = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

                        return (
                          <TableRow key={po.id} className="hover:bg-red-50/30 dark:hover:bg-red-950/20">
                            <TableCell className="font-medium">{po.id}</TableCell>
                            <TableCell className="font-medium">{po.poNumber}</TableCell>
                            <TableCell>{po.supplier || "-"}</TableCell>
                            <TableCell className="hidden md:table-cell">{po.pr?.job?.jobNo || "-"}</TableCell>
                            <TableCell className="hidden md:table-cell">{po.pr?.job?.jobName || "-"}</TableCell>
                            <TableCell className="hidden lg:table-cell">{po.invoice || "-"}</TableCell>
                            <TableCell className="hidden lg:table-cell">{po.tax || "-"}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(po.status)}</TableCell>
                            <TableCell className="text-right font-medium">{total.toLocaleString()} บาท</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                {/* ดูรายละเอียด */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/po/${po.id}`}>
                                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>ดูรายละเอียด</TooltipContent>
                                </Tooltip>

                                {/* กลับสู่รายการหลัก (กู้คืน) */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:bg-green-50"
                                      onClick={() => handleRestore(po.id, po.poNumber)}
                                    >
                                      <ArrowLeftCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>กลับสู่รายการหลัก (กู้คืน)</TooltipContent>
                                </Tooltip>

                                {/* ลบถาวร */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                                      onClick={() => handlePermanentDelete(po.id, po.poNumber)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>ลบถาวร (ไม่สามารถกู้คืนได้)</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TooltipProvider>

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1} - {endIndex} จาก {totalItems} รายการ
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {totalPages <= 7 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <Button key={i + 1} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => goToPage(i + 1)}>
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      <>
                        <Button variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => goToPage(1)}>1</Button>
                        {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
                        {Array.from({ length: 3 }, (_, i) => {
                          const page = currentPage - 1 + i
                          if (page <= 1 || page >= totalPages) return null
                          return (
                            <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => goToPage(page)}>
                              {page}
                            </Button>
                          )
                        })}
                        {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                        <Button variant={currentPage === totalPages ? "default" : "outline"} size="sm" onClick={() => goToPage(totalPages)}>
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