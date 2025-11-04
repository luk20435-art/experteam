"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import { exportPRToCSV } from "@/src/lib/export-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfDay, endOfDay } from "date-fns"

export default function PRListPage() {
  const { prs, moveToTrashPR } = useData() // เปลี่ยนจาก deletePR → moveToTrashPR
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // ตัวกรองวันที่ + เรียงลำดับ
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  // กรองเฉพาะที่ยังไม่ถูกลบ
  const activePRs = prs.filter(pr => !pr.deleted)

  // กรอง + เรียงลำดับ
  const filteredAndSortedPRs = useMemo(() => {
    let filtered = activePRs.filter((pr) => {
      const matchesSearch =
        pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.department.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesDate = true
      if (dateRange.from && dateRange.to) {
        const prDate = new Date(pr.requestDate)
        const from = startOfDay(dateRange.from)
        const to = endOfDay(dateRange.to)
        matchesDate = prDate >= from && prDate <= to
      }

      return matchesSearch && matchesDate
    })

    filtered.sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime()
      const dateB = new Date(b.requestDate).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [activePRs, searchTerm, dateRange, sortOrder])

  // Pagination
  const totalItems = filteredAndSortedPRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPRs = filteredAndSortedPRs.slice(startIndex, endIndex)

  // รีเซ็ตหน้า
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateRange, sortOrder, pageSize])

  // แก้ handleDelete ให้ใช้ moveToTrashPR
  const handleDelete = (id: string, prNumber: string) => {
    if (confirm(`คุณต้องการลบ PR "${prNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ" และสามารถกู้คืนได้`)) {
      moveToTrashPR(id)
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
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPRToCSV(filteredAndSortedPRs)}
            className="flex-1 sm:flex-none border-success text-success hover:bg-success hover:text-white transition-colors"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline cursor-pointer">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          {/* สร้าง PR ใหม่ */}
          <Link href="/pr/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer">
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
            {/* ซ้าย: ค้นหา + วันที่ + เรียงลำดับ */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* ค้นหา */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา PR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* เรียงลำดับ */}
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

            {/* ขวา: แสดงจำนวน */}
            <div className="flex gap-2 w-full sm:w-auto">
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
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">เลขที่ PR</TableHead>
                    <TableHead className="whitespace-nowrap">หัวข้อ</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">แผนก</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">ผู้ขอ</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">วันที่ขอ</TableHead>
                    <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                    <TableHead className="text-right whitespace-nowrap">จำนวนเงิน</TableHead>
                    <TableHead className="text-right whitespace-nowrap">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPRs.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-medium whitespace-nowrap">{pr.prNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{pr.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{pr.department}</TableCell>
                      <TableCell className="hidden lg:table-cell">{pr.requestedBy}</TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">
                        {formatDate(pr.requestDate)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pr.status)}>{getStatusLabel(pr.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(pr.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/pr/${pr.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 cursor-pointer">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>ดูรายละเอียด</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/pr/${pr.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 cursor-pointer">
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
                                  className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                                  onClick={() => handleDelete(pr.id, pr.prNumber)} // ส่ง prNumber ไปด้วย
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
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
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
                </div>

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

          {filteredAndSortedPRs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">ไม่พบข้อมูล PR</p>
              <p className="text-sm mt-1">ลองเปลี่ยนตัวกรอง</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}