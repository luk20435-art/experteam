"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

interface WorkOrder {
  id: number
  workRequestId: number
  orderNumber: string
  title: string
  assignedTo: number
  status: "Draft" | "Approved" | "In Progress" | "Completed" | "Cancelled"
  totalCost: number
  createdAt: string
  deleted: boolean
  deletedAt: string
}
interface WorkRequest { id: number; title: string }
interface Employee { id: number; name: string }

export default function TrashWorkOrderPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const o = localStorage.getItem("work-orders")
    if (o) setOrders(JSON.parse(o))

    const r = localStorage.getItem("work-requests")
    if (r) setRequests(JSON.parse(r))

    const e = localStorage.getItem("organization-employees")
    if (e) setEmployees(JSON.parse(e))
  }, [])

  // กรองเฉพาะที่ถูกลบ
  const deletedOrders = useMemo(() => orders.filter(o => o.deleted), [orders])

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const filteredAndSorted = useMemo(() => {
    let filtered = deletedOrders.filter(o => {
      const req = requests.find(r => r.id === o.workRequestId)
      const emp = employees.find(e => e.id === o.assignedTo)
      const searchLower = searchTerm.toLowerCase()
      return (
        o.orderNumber.toLowerCase().includes(searchLower) ||
        o.title.toLowerCase().includes(searchLower) ||
        req?.title.toLowerCase().includes(searchLower) ||
        emp?.name.toLowerCase().includes(searchLower)
      )
    })

    filtered.sort((a, b) => {
      const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0
      const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [deletedOrders, requests, employees, searchTerm, sortOrder])

  const totalItems = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginated = filteredAndSorted.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  // กู้คืน
  const handleRestore = (id: number, number: string) => {
    if (confirm(`กู้คืนคำสั่งงาน "${number}" หรือไม่?`)) {
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, deleted: false, deletedAt: "" } : o
      ))
    }
  }

  // ลบถาวร
  const handlePermanentDelete = (id: number, number: string) => {
    if (confirm(`ลบคำสั่งงาน "${number}" ถาวร 100% หรือไม่?\n\nไม่สามารถกู้คืนได้อีก`)) {
      setOrders(prev => prev.filter(o => o.id !== id))
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const getReqTitle = (id: number) => requests.find(r => r.id === id)?.title || "-"
  const getEmpName = (id: number) => employees.find(e => e.id === id)?.name || "-"

  return (
    <div className="space-y-4 md:space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-7 w-7 text-red-600" />
            ถังขยะ - คำสั่งงาน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            คำสั่งงานที่ถูกลบ ({deletedOrders.length} รายการ)
          </p>
        </div>
        <Link href="/work-order">
          <Button variant="outline" className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            กลับสู่รายการ
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
                  placeholder="ค้นหาเลขที่, ชื่อ, คำขอ, ผู้รับ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as "latest" | "oldest")}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">ลบล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">ลบเก่าก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
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
          <CardTitle className="text-lg md:text-xl">คำสั่งงานที่ถูกลบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">เลขที่</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">ชื่อ</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">คำขอ</th>
                  <th className="text-left p-3 font-semibold hidden xl:table-cell">ผู้รับ</th>
                  <th className="text-right p-3 font-semibold hidden 2xl:table-cell">ต้นทุน</th>
                  <th className="text-center p-3 font-semibold hidden lg:table-cell">วันที่ลบ</th>
                  <th className="text-right p-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">ไม่มีคำสั่งงานในถังขยะ</p>
                      <p className="text-sm mt-1">คำสั่งงานที่ถูกลบจะแสดงที่นี่</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map(o => (
                    <tr key={o.id} className="border-b hover:bg-red-50/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{o.orderNumber}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{o.title}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">{o.title}</td>
                      <td className="p-3 hidden lg:table-cell">{getReqTitle(o.workRequestId)}</td>
                      <td className="p-3 hidden xl:table-cell">{getEmpName(o.assignedTo)}</td>
                      <td className="p-3 text-right hidden 2xl:table-cell">
                        <span className="font-medium">฿{(o.totalCost ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell text-sm">
                        {o.deletedAt
                          ? format(new Date(o.deletedAt), "dd MMM yyyy", { locale: undefined })
                          : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            {/* ดู */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/work-order/${o.id}`}>
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
                                  onClick={() => handleRestore(o.id, o.orderNumber)}
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
                                  onClick={() => handlePermanentDelete(o.id, o.orderNumber)}
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
                  ))
                )}
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
        </CardContent>
      </Card>
    </div>
  )
}