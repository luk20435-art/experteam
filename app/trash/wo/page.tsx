// app/trash/po/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/src/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

export default function TrashPOPage() {
  const { pos, restorePO, permanentlyDeletePO } = useData()

  // กรองเฉพาะ PO ที่ถูกลบ
  const deletedPOs = pos.filter(p => p.deleted)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const filteredAndSortedPOs = useMemo(() => {
    let filtered = deletedPOs.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.title.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [deletedPOs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedPOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPOs = filteredAndSortedPOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const handleRestore = (id: string, number: string) => {
    if (confirm(`กู้คืน PO "${number}" หรือไม่?`)) {
      restorePO(id)
    }
  }

  const handlePermanentDelete = (id: string, number: string) => {
    if (confirm(`ลบ PO "${number}" ถาว 100% หรือไม่?\n\n⚠️ ไม่สามารถกู้คืนได้อีก`)) {
      permanentlyDeletePO(id)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-7 w-7 text-red-600" />
            ถังขยะ - PO
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PO ที่ถูกลบ ({deletedPOs.length} รายการ)
          </p>
        </div>
        <Link href="/po">
          <Button variant="outline" className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            กลับสู่ PO
          </Button>
        </Link>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* ค้นหา */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา PO ที่ถูกลบ..."
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

            {/* แสดงจำนวน */}
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
          <CardTitle className="text-lg md:text-xl">รายการ PO ที่ถูกลบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">เลขที่ PO</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">ชื่อเรื่อง</th>
                  <th className="text-right p-3 font-semibold hidden xl:table-cell">จำนวนเงิน</th>
                  <th className="text-center p-3 font-semibold hidden lg:table-cell">วันที่สร้าง</th>
                  <th className="text-right p-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPOs.map((po) => (
                  <tr key={po.id} className="border-b hover:bg-red-50/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{po.poNumber}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{po.title}</div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="font-medium">{po.title}</div>
                    </td>
                    <td className="p-3 text-right hidden xl:table-cell">
                      <div className="font-semibold text-foreground">{formatCurrency(po.totalAmount || 0)}</div>
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell text-sm">
                      {po.createdAt 
                        ? new Date(po.createdAt).toLocaleDateString("th-TH", { 
                            year: "numeric", month: "short", day: "numeric" 
                          }) 
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          {/* ดูรายละเอียด */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/po/${po.id}`}>
                                <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>ดูรายละเอียด</TooltipContent>
                          </Tooltip>

                          {/* กู้คืน */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleRestore(po.id, po.poNumber)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>กู้คืน</TooltipContent>
                          </Tooltip>

                          {/* ลบถาวร */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handlePermanentDelete(po.id, po.poNumber)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ลบถาวร</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* ว่างเปล่า */}
          {deletedPOs.length === 0 && (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">ไม่มี PO ในถังขยะ</p>
              <p className="text-sm mt-1">PO ที่ถูกลบจะแสดงที่นี่</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}