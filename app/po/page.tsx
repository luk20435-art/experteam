"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency } from "@/src/lib/utils"
import { Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfDay, endOfDay } from "date-fns"

export default function POListPage() {
  const { pos, moveToTrashPO, updatePO, suppliers } = useData()

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | "ร่าง" | "กำลังดำเนินการ" | "สำเร็จ" | "รออนุมัติ" | "อนุมัติแล้ว">("all")

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const activePOs = pos.filter(po => !po.deleted)

  // สถานะสี + Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ร่าง":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">ร่าง</Badge>
      case "รออนุมัติ":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">รออนุมัติ</Badge>
      case "กำลังดำเนินการ":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">กำลังดำเนินการ</Badge>
      case "สำเร็จ":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">สำเร็จ</Badge>
      case "อนุมัติแล้ว":
        return <Badge className="bg-green-100 text-green-800 border-green-300">อนุมัติแล้ว</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // กรอง + เรียงลำดับ
  const filteredAndSortedPOs = useMemo(() => {
    return activePOs
      .filter((po) => {
        const supplier = suppliers.find((s) => s.id === po.supplierId)

        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          String(po.poNumber).toLowerCase().includes(searchLower) ||
          (supplier?.name || "").toLowerCase().includes(searchLower) ||
          (po.description || "").toLowerCase().includes(searchLower)

        const matchesStatus = statusFilter === "all" || po.status === statusFilter

        if (dateRange.from && dateRange.to) {
          const poDate = new Date(po.createdAt)
          const from = startOfDay(dateRange.from)
          const to = endOfDay(dateRange.to)
          return matchesSearch && matchesStatus && poDate >= from && poDate <= to
        }

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === "latest" ? dateB - dateA : dateA - dateB
      })
  }, [activePOs, suppliers, searchTerm, dateRange.from, dateRange.to, sortOrder, statusFilter])

  // Pagination
  const totalItems = filteredAndSortedPOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPOs = filteredAndSortedPOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateRange, sortOrder, pageSize, statusFilter])

  // ลบ PO
  const handleDelete = (id: string, poNumber: string) => {
    if (confirm(`คุณต้องการลบ PO "${poNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ" และสามารถกู้คืนได้`)) {
      moveToTrashPO(id)
    }
  }

  // อนุมัติ PO
  const handleApprove = (id: string, poNumber: string) => {
    if (confirm(`คุณต้องการอนุมัติ PO "${poNumber}" หรือไม่?\n\nสถานะจะเปลี่ยนเป็น "อนุมัติแล้ว"`)) {
      const po = pos.find(p => p.id === id)
      if (po) {
        updatePO(id, {
          ...po,
          status: "อนุมัติแล้ว",
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }

  // Export CSV
  const exportToCSV = () => {
    const headers = ["PO Number", "PR Number", "Supplier", "Description", "Status", "Total Amount", "Created Date"]
    const rows = filteredAndSortedPOs.map((po) => {
      const supplier = suppliers.find((s) => s.id === po.supplierId)
      const dateStr = format(new Date(po.createdAt), "dd/MM/yyyy")
      return [
        po.poNumber,
        po.prNumber || "",
        supplier?.name || po.supplierName || "",
        po.description || "",
        po.status || "ไม่ระบุ",
        po.totalAmount.toString(),
        `="'${dateStr}'"`,
      ]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `po-list-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Purchase Orders (PO)</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">จัดการใบสั่งซื้อทั้งหมด</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="h-9.5 flex-1 md:flex-none bg-sky-400 hover:bg-sky-400 text-white"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          <Link href="/po/new" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto bg-blue-700 hover:bg-green-600">
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
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาด้วยเลข PO, Supplier, หรือรายละเอียด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ทุกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="ร่าง">ร่าง</SelectItem>
                  <SelectItem value="รออนุมัติ">รออนุมัติ</SelectItem>
                  <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="สำเร็จ">สำเร็จ</SelectItem>
                  <SelectItem value="อนุมัติแล้ว">อนุมัติแล้ว</SelectItem>
                </SelectContent>
              </Select>

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

            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

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
          <CardTitle className="text-lg md:text-xl">รายการ PO ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">เลข PO</TableHead>
                    <TableHead className="whitespace-nowrap">เลข PR</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">Supplier</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">รายละเอียด</TableHead>
                    <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                    <TableHead className="text-right whitespace-nowrap">จำนวนเงิน</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">วันที่สร้าง</TableHead>
                    <TableHead className="text-right whitespace-nowrap">การอนุมัติ</TableHead>
                    <TableHead className="text-right whitespace-nowrap">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">ไม่พบข้อมูล PO</p>
                        <p className="text-sm mt-1">ลองเปลี่ยนตัวกรอง</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPOs.map((po) => {
                      const supplier = suppliers.find((s) => s.id === po.supplierId)
                      const canApprove = po.status === "รออนุมัติ"
                      return (
                        <TableRow key={po.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">
                            <Link href={`/po/${po.id}`} className="text-primary hover:underline">
                              {po.poNumber}
                            </Link>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {po.prNumber ? (
                              <Link href={`/pr/${po.prId}`} className="text-primary hover:underline">
                                {po.prNumber}
                              </Link>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {supplier?.name || po.supplierName || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate">
                            {po.description || "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(po.status || "ไม่ระบุ")}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatCurrency(po.totalAmount)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">
                            {new Date(po.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>

                                {/* อนุมัติ (เฉพาะรออนุมัติ) */}
                                {canApprove && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700"
                                        onClick={() => handleApprove(po.id, po.poNumber)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>อนุมัติ PO</TooltipContent>
                                  </Tooltip>
                                )}
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                {/* ดูรายละเอียด */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/po/${po.id}`}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>ดูรายละเอียด</TooltipContent>
                                </Tooltip>

                                {/* แก้ไข */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/po/${po.id}/edit`}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>แก้ไข</TooltipContent>
                                </Tooltip>

                                {/* ลบ */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700"
                                      onClick={() => handleDelete(po.id, po.poNumber)}
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
                      )
                    })
                  )}
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
        </CardContent>
      </Card>
    </div>
  )
}