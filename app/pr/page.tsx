"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import { exportPRToCSV } from "@/src/lib/export-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PRListPage() {
  const { prs, moveToTrashPR, approvePR } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  // Modal อนุมัติ
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedPRForApprove, setSelectedPRForApprove] = useState<any>(null)

  const activePRs = prs.filter(pr => !pr.deleted)

  const filteredAndSortedPRs = useMemo(() => {
    let filtered = activePRs.filter((pr) => {
      const matchesSearch =
        pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.department || "").toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    filtered.sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime()
      const dateB = new Date(b.requestDate).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [activePRs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedPRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPRs = filteredAndSortedPRs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const handleDelete = (id: string, prNumber: string) => {
    if (confirm(`คุณต้องการลบ PR "${prNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ"`)) {
      moveToTrashPR(id)
    }
  }

  const handleApprove = (pr: any) => {
    setSelectedPRForApprove(pr)
    setApproveModalOpen(true)
  }

  const confirmApprove = () => {
    if (selectedPRForApprove) {
      approvePR(selectedPRForApprove.id)
      setApproveModalOpen(false)
      setSelectedPRForApprove(null)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Purchase Requisition (PR)</h1>
          <p className="text-sm md:text-base text-muted-foreground">จัดการใบขอซื้อทั้งหมด</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPRToCSV(filteredAndSortedPRs)}
            className="h-9.5 flex-1 md:flex-none bg-sky-400 hover:bg-blue-700 text-white"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          <Link href="/pr/new" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto bg-blue-700 hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              สร้าง PR ใหม่
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
                  placeholder="ค้นหา PR..."
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
          <CardTitle className="text-lg md:text-xl">รายการ PR ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่ PR</TableHead>
                  <TableHead>โครงการ</TableHead>
                  <TableHead className="hidden md:table-cell">แผนก</TableHead>
                  <TableHead className="hidden lg:table-cell">ผู้ขอ</TableHead>
                  <TableHead className="hidden sm:table-cell">วันที่ขอ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead className="text-right">การอนุมัติ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPRs.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.prNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{pr.projectName || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{pr.department || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{pr.requestedBy || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell whitespace-nowrap">
                      {formatDate(pr.requestDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pr.status)}>
                        {pr.status === "อนุมัติแล้ว" && (
                          <CheckCircle className="w-3.5 h-3.5 mr-1 inline " />
                        )}
                        {getStatusLabel(pr.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(pr.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          {/* ปุ่มอนุมัติ */}
                          {pr.status === "รออนุมัติ" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={() => handleApprove(pr)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>อนุมัติ PR</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/pr/${pr.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>ดูรายละเอียด</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/pr/${pr.id}/edit`}>
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
                                onClick={() => handleDelete(pr.id, pr.prNumber)}
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
        </CardContent>
      </Card>

      {/* Modal อนุมัติ */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการอนุมัติ PR</DialogTitle>
            <DialogDescription>
              คุณต้องการอนุมัติใบขอซื้อนี้หรือไม่?
            </DialogDescription>
          </DialogHeader>
          {selectedPRForApprove && (
            <div className="space-y-3 py-4">
              <div><Label>เลขที่ PR:</Label> <span className="font-medium">{selectedPRForApprove.prNumber}</span></div>
              <div><Label>โครงการ:</Label> <span className="font-medium">{selectedPRForApprove.projectName}</span></div>
              <div><Label>จำนวนเงิน:</Label> <span className="font-medium text-green-600">{formatCurrency(selectedPRForApprove.totalAmount)}</span></div>
              <div><Label>ผู้ขอ:</Label> <span className="font-medium">{selectedPRForApprove.requestedBy}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>ยกเลิก</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              อนุมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}