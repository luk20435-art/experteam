// app/trash/pr/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/src/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

export default function TrashPRPage() {
  const { prs, restorePR, permanentlyDeletePR } = useData()

  // กรองเฉพาะที่ถูกลบ
  const deletedPRs = prs.filter(p => p.deleted)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const filteredAndSortedPRs = useMemo(() => {
    let filtered = deletedPRs.filter((pr) => {
      const matchesSearch =
        pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [deletedPRs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedPRs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPRs = filteredAndSortedPRs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const handleRestore = (id: string, number: string) => {
    if (confirm(`กู้คืน PR ${number} หรือไม่?`)) {
      restorePR(id)
    }
  }

  const handlePermanentDelete = (id: string, number: string) => {
    if (confirm(`ลบ PR ${number} ถาวรหรือไม่?`)) {
      permanentlyDeletePR(id)
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
            ถังขยะ - WR
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            WP ที่ถูกลบ ({deletedPRs.length} รายการ)
          </p>
        </div>
        <Link href="/wr">
          <Button variant="outline" className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            กลับสู่ WR
          </Button>
        </Link>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา WR ที่ถูกลบ..."
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
        <CardHeader><CardTitle>รายการ WR ที่ถูกลบ</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">เลขที่ WR</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">ชื่อเรื่อง</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">แผนก</th>
                  <th className="text-right p-3 font-semibold hidden xl:table-cell">จำนวนเงิน</th>
                  <th className="text-center p-3 font-semibold hidden lg:table-cell">วันที่สร้าง</th>
                  <th className="text-right p-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPRs.map((pr) => (
                  <tr key={pr.id} className="border-b hover:bg-red-50/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{pr.prNumber}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{pr.title}</div>
                    </td>
                    <td className="p-3 hidden md:table-cell"><div className="font-medium">{pr.title}</div></td>
                    <td className="p-3 hidden lg:table-cell">{pr.department || "-"}</td>
                    <td className="p-3 text-right hidden xl:table-cell">
                      <div className="font-semibold text-foreground">{formatCurrency(pr.totalAmount || 0)}</div>
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell text-sm">
                      {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/pr/${pr.id}`}>
                                <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
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
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleRestore(pr.id, pr.prNumber)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>กู้คืน</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handlePermanentDelete(pr.id, pr.prNumber)}
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

          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ</div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" className="w-9" onClick={() => goToPage(pageNum)}>{pageNum}</Button>
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-sm text-muted-foreground">...</span>
                      <Button variant={currentPage === totalPages ? "default" : "outline"} size="sm" className="w-9" onClick={() => goToPage(totalPages)}>{totalPages}</Button>
                    </>
                  )}
                </div>
                <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {deletedPRs.length === 0 && (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">ไม่มี WR ในถังขยะ</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}