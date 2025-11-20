// app/wr/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import { exportToCSV } from "@/src/lib/export-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import type { WR } from "@/src/contexts/data-context"

const STORAGE_KEY = "work-requests"

export default function WRListPage() {
  const { wrs = [], updateWR, deleteWR } = useData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedWRForApprove, setSelectedWRForApprove] = useState<WR | null>(null)

  const activeWRs = useMemo(() => {
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as WR[]
    const combined = Array.isArray(wrs) ? [...localData, ...wrs] : localData
    return Array.from(new Map(combined.map(r => [r.id, r])).values())
  }, [wrs])

  const filteredAndSortedWRs = useMemo(() => {
    if (!activeWRs?.length) return []

    const search = searchTerm.toLowerCase()

    let filtered = activeWRs.filter((wr) => {
      const wrNumber = (wr.wrNumber ?? "").toString().toLowerCase()
      const projectName = (wr.projectName ?? "").toString().toLowerCase()
      const department = (wr.department ?? "").toString().toLowerCase()

      return wrNumber.includes(search) || projectName.includes(search) || department.includes(search)
    })

    // Sort ปลอดภัย 100%
    filtered.sort((a, b) => {
      const dateA = a.requestDate ? new Date(a.requestDate) : null
      const dateB = b.requestDate ? new Date(b.requestDate) : null

      const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0
      const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0

      return sortOrder === "latest" ? timeB - timeA : timeA - timeB
    })

    return filtered
  }, [activeWRs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedWRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedWRs = filteredAndSortedWRs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const handleDelete = (id: string, wrNumber: string) => {
    if (confirm(`คุณต้องการลบ WR "${wrNumber}" หรือไม่?\n\nข้อมูลจะถูกลบถาวร`)) {
      const updated = activeWRs.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      deleteWR?.(id)
      toast({ title: "ลบสำเร็จ", description: `WR ${wrNumber} ถูกลบแล้ว` })
    }
  }

  const handleApprove = (wr: WR) => {
    setSelectedWRForApprove(wr)
    setApproveModalOpen(true)
  }

  const confirmApprove = () => {
    if (!selectedWRForApprove) return

    const updated = activeWRs.map(r =>
      r.id === selectedWRForApprove.id
        ? { ...r, status: "อนุมัติแล้ว" as const, updatedAt: new Date().toISOString() }
        : r
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    updateWR?.(selectedWRForApprove.id, { status: "อนุมัติแล้ว" })

    toast({ title: "อนุมัติสำเร็จ", description: `WR ${selectedWRForApprove.wrNumber} อนุมัติแล้ว` })
    setApproveModalOpen(false)
    setSelectedWRForApprove(null)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const exportWRToCSV = () => {
    const headers = ["เลขที่ WR", "โครงการ", "แผนก", "ผู้ขอ", "วันที่ขอ", "สถานะ", "ยอดรวม"]
    const rows = filteredAndSortedWRs.map(wr => [
      wr.wrNumber,
      wr.projectName || "-",
      wr.department || "-",
      wr.requestedBy || "-",
      formatDate(wr.requestDate), // ปลอดภัยแล้ว
      getStatusLabel(wr.status),
      wr.totalAmount?.toString() || "0"
    ])
    exportToCSV("WR_List", headers, rows)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Work Request (WR)</h1>
          <p className="text-sm md:text-base text-muted-foreground">รายการขอทำงานทั้งหมด</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportWRToCSV} className="h-9.5 flex-1 md:flex-none bg-sky-400 hover:bg-sky-400 text-white">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          <Link href="/wr/add" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto bg-blue-700 hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Create New WR
            </Button>
          </Link>
        </div>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา WR..."
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
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">รายการ WR ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่ WR</TableHead>
                  <TableHead>โครงการ</TableHead>
                  <TableHead className="hidden md:table-cell">แผนก</TableHead>
                  <TableHead className="hidden lg:table-cell">ผู้ขอ</TableHead>
                  <TableHead className="hidden sm:table-cell">วันที่ขอ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead className="text-center">การอนุมัติ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWRs.map((wr) => (
                  <TableRow key={wr.id}>
                    <TableCell className="font-medium">{wr.wrNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{wr.projectName || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{wr.department || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{wr.requestedBy || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell whitespace-nowrap">
                      {formatDate(wr.requestDate)} {/* ปลอดภัยแล้ว */}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(wr.status)}>
                        {wr.status === "อนุมัติแล้ว" && <CheckCircle className="w-3.5 h-3.5 mr-1 inline" />}
                        {getStatusLabel(wr.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(wr.totalAmount ?? 0)}</TableCell>

                    {/* การอนุมัติ */}
                    <TableCell className="text-center">
                      {wr.status === "รออนุมัติ" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(wr)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>อนุมัติ</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* จัดการ */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/wr/${wr.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>ดูรายละเอียด</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/wr/${wr.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>แก้ไข</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(wr.id, wr.wrNumber)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ลบ</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
              </div>
              <div className="flex items-center gap-1">
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
        </CardContent>
      </Card>

      {/* Modal อนุมัติ */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการอนุมัติ WR</DialogTitle>
            <DialogDescription>คุณต้องการอนุมัติใบขอทำงานนี้หรือไม่?</DialogDescription>
          </DialogHeader>
          {selectedWRForApprove && (
            <div className="space-y-3 py-4">
              <div><Label>เลขที่ WR:</Label> <span className="font-medium">{selectedWRForApprove.wrNumber}</span></div>
              <div><Label>โครงการ:</Label> <span className="font-medium">{selectedWRForApprove.projectName || "-"}</span></div>
              <div><Label>จำนวนเงิน:</Label> <span className="font-medium text-green-600">{formatCurrency(selectedWRForApprove.totalAmount ?? 0)}</span></div>
              <div><Label>ผู้ขอ:</Label> <span className="font-medium">{selectedWRForApprove.requestedBy || "-"}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>ยกเลิก</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              ยืนยันการอนุมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}