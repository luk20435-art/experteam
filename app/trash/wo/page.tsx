// app/trash/wo/page.tsx
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface WO {
  id: number
  woNumber: string
  requester: string
  orderDate: string
  deliveryDate: string | null
  status: string
  wr?: {
    wrNumber: string
    jobName: string
    jobNo: string
  }
}

export default function TrashWOPage() {
  const [wos, setWOs] = useState<WO[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [woToAction, setWoToAction] = useState<{ id: number; number: string } | null>(null)

  // ดึงข้อมูลจาก endpoint trash โดยตรง
  useEffect(() => {
    const fetchTrashedWOs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/wo/trash`)  // ตรงกับ @Get('trash') ใน controller
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "ไม่สามารถโหลดข้อมูลถังขยะได้")
        }
        const data: WO[] = await res.json()
        setWOs(data)
      } catch (err: any) {
        console.error(err)
        alert(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchTrashedWOs()
  }, [])

  const filteredWOs = useMemo(() => {
    return wos.filter((wo) => {
      const matchesSearch =
        wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.wr?.wrNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.wr?.jobName || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || wo.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [wos, searchTerm, statusFilter])

  const totalItems = filteredWOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedWOs = filteredWOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, pageSize])

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase()
    if (lower === "approved" || lower.includes("อนุมัติ")) return <Badge className="bg-green-600 text-white">อนุมัติแล้ว</Badge>
    if (lower === "pending" || lower.includes("รออนุมัติ")) return <Badge className="bg-yellow-500 text-white">รออนุมัติ</Badge>
    if (lower === "rejected") return <Badge className="bg-red-600 text-white">ปฏิเสธ</Badge>
    return <Badge variant="secondary">ร่าง</Badge>
  }

  const formatDateOnly = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("th-TH")
    } catch {
      return "-"
    }
  }

  const openRestoreModal = (id: number, number: string) => {
    setWoToAction({ id, number })
    setRestoreModalOpen(true)
  }

  const openDeleteModal = (id: number, number: string) => {
    setWoToAction({ id, number })
    setDeleteModalOpen(true)
  }

  const confirmRestore = async () => {
    if (!woToAction) return

    try {
      const res = await fetch(`${API_BASE_URL}/wo/${woToAction.id}/restore`, {
        method: "PATCH",
      })

      if (!res.ok) throw new Error("กู้คืนไม่สำเร็จ")

      setWOs(prev => prev.filter(wo => wo.id !== woToAction.id))
      alert(`กู้คืน WO "${woToAction.number}" สำเร็จ!`)
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการกู้คืน")
    } finally {
      setRestoreModalOpen(false)
      setWoToAction(null)
    }
  }

  const confirmPermanentDelete = async () => {
    if (!woToAction) return

    try {
      const res = await fetch(`${API_BASE_URL}/wo/${woToAction.id}/force`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("ลบถาวรไม่สำเร็จ")

      setWOs(prev => prev.filter(wo => wo.id !== woToAction.id))
      alert(`ลบ WO "${woToAction.number}" ถาวรเรียบร้อย`)
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบถาวร")
    } finally {
      setDeleteModalOpen(false)
      setWoToAction(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูลถังขยะ WO...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-600" />
              ถังขยะ - Work Order (WO)
            </h1>
            <p className="text-muted-foreground mt-2">
              ใบสั่งงานภายในที่ถูกลบทั้งหมด ({wos.length} รายการ)
            </p>
          </div>
          <Link href="/wo">
            <Button variant="outline" size="lg">
              <ChevronLeft className="mr-2 h-5 w-5" />
              กลับสู่รายการ WO
            </Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาเลขที่ WO, WR, ผู้ขอ, ชื่องาน..."
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
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  <SelectItem value="draft">ร่าง</SelectItem>
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

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการ WO ที่อยู่ในถังขยะ ({totalItems} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedWOs.length === 0 ? (
              <div className="text-center py-16">
                <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-40 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  {wos.length === 0 ? "ถังขยะว่างเปล่า" : "ไม่พบรายการที่ตรงกับการค้นหา"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {wos.length === 0 ? "ไม่มี WO ที่ถูกลบอยู่ในขณะนี้" : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
                </p>
              </div>
            ) : (
              <>
                <TooltipProvider>
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
                          <TableHead>Delivery Date</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWOs.map((wo) => (
                          <TableRow key={wo.id} className="hover:bg-red-50/30">
                            <TableCell className="font-medium">{wo.id}</TableCell>
                            <TableCell className="font-medium">{wo.woNumber}</TableCell>
                            <TableCell>{wo.wr?.jobName || "-"}</TableCell>
                            <TableCell>{wo.wr?.jobNo || "-"}</TableCell>
                            <TableCell>{wo.requester}</TableCell>
                            <TableCell>{formatDateOnly(wo.orderDate)}</TableCell>
                            <TableCell>{formatDateOnly(wo.deliveryDate)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(wo.status)}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/wo/${wo.id}`}>
                                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>ดูรายละเอียด</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:bg-green-50"
                                      onClick={() => openRestoreModal(wo.id, wo.woNumber)}
                                    >
                                      <ArrowLeftCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>กู้คืน WO</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                                      onClick={() => openDeleteModal(wo.id, wo.woNumber)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>ลบถาวร</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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
                    <div className="flex items-center gap-4">
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

                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2">หน้า {currentPage} / {totalPages}</span>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
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
              <AlertDialogTitle>กู้คืน Work Order</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการกู้คืน WO "<strong>{woToAction?.number}</strong>" กลับสู่รายการหลักหรือไม่?
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
                ⚠️ คุณแน่ใจหรือไม่ที่จะลบ WO "<strong>{woToAction?.number}</strong>" ถาวร?<br />
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