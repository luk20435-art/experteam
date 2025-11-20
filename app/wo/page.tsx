"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, CheckCircle, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import { exportToCSV } from "@/src/lib/export-utils"
import { useData } from "@/src/contexts/data-context"

const STORAGE_KEY = "work-orders"
const WR_STORAGE_KEY = "work-requests"
const STATUSES = ["ร่าง", "รออนุมัติ", "อนุมัติแล้ว", "In Progress", "Completed", "Cancelled"]
const PAGE_SIZES = [5, 10, 20, 50]

export default function WorkOrderListPage() {
  // ดึงข้อมูลจาก context ภายใน component (ถูกต้อง 100%)
  const { 
    wos = [], 
    wrs = [], 
    addWO,
    projects = [], 
    traders = [], 
    clients = [], 
    suppliers = [] 
  } = useData()

  const [orders, setOrders] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [employees] = useState([
    { id: 1, name: "สมชาย" },
    { id: 2, name: "สมนึก" },
    { id: 3, name: "สมหญิง" },
  ])

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEY)
    const savedRequests = localStorage.getItem(WR_STORAGE_KEY)

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders).filter((o: any) => !o.deleted))
    } else {
      const initial = [
        { id: 1, workRequestId: 1, orderNumber: "WO-001", title: "ติดตั้งระบบสำนักงาน", assignedTo: 1, status: "ร่าง", totalCost: 50000, createdAt: new Date().toISOString(), deleted: false },
        { id: 2, workRequestId: 1, orderNumber: "WO-002", title: "ซ่อมคอมพิวเตอร์", assignedTo: 2, status: "รออนุมัติ", totalCost: 5000, createdAt: new Date().toISOString(), deleted: false },
        { id: 3, workRequestId: 2, orderNumber: "WO-003", title: "ติดตั้งกล้องวงจรปิด", assignedTo: 3, status: "รออนุมัติ", totalCost: 35000, createdAt: new Date(Date.now() - 86400000).toISOString(), deleted: false },
        { id: 4, workRequestId: 3, orderNumber: "WO-004", title: "ปรับปรุงระบบไฟฟ้า", assignedTo: 1, status: "อนุมัติ", totalCost: 120000, createdAt: new Date(Date.now() - 172800000).toISOString(), deleted: false },
        { id: 5, workRequestId: 1, orderNumber: "WO-005", title: "ติดตั้งเครื่องปรับอากาศ", assignedTo: 2, status: "In Progress", totalCost: 85000, createdAt: new Date(Date.now() - 259200000).toISOString(), deleted: false },
        { id: 6, workRequestId: 4, orderNumber: "WO-006", title: "ซ่อมหลังคารั่ว", assignedTo: 3, status: "Cancelled", totalCost: 15000, createdAt: new Date(Date.now() - 345600000).toISOString(), deleted: false },
        { id: 7, workRequestId: 2, orderNumber: "WO-007", title: "ติดตั้งระบบ LAN", assignedTo: 1, status: "ร่าง", totalCost: 45000, createdAt: new Date(Date.now() - 432000000).toISOString(), deleted: false },
        { id: 8, workRequestId: 5, orderNumber: "WO-008", title: "ปรับปรุงห้องประชุม", assignedTo: 2, status: "Completed", totalCost: 98000, createdAt: new Date(Date.now() - 518400000).toISOString(), deleted: false },
      ]
      setOrders(initial)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    }

    if (savedRequests) {
      setRequests(JSON.parse(savedRequests))
    } else {
      const initialRequests = [
        { id: 1, title: "ขอติดตั้งอุปกรณ์สำนักงานใหม่" },
        { id: 2, title: "ขอติดตั้งระบบรักษาความปลอดภัย" },
        { id: 3, title: "ขอปรับปรุงโครงสร้างอาคาร" },
        { id: 4, title: "ขอซ่อมแซมระบบสาธารณูปโภค" },
        { id: 5, title: "ขอปรับปรุงห้องประชุม" },
      ]
      setRequests(initialRequests)
      localStorage.setItem(WR_STORAGE_KEY, JSON.stringify(initialRequests))
    }
  }, [])

  // บันทึกอัตโนมัติเมื่อ orders Deposเปลี่ยน
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    }
  }, [orders])

  const getReqTitle = (id: number) => requests.find(r => r.id === id)?.title || "ไม่ระบุ"
  const getEmpName = (id: number) => employees.find(e => e.id === id)?.name || "ยังไม่มอบหมาย"

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  // Modal อนุมัติ
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedWOForApprove, setSelectedWOForApprove] = useState<any>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const req = requests.find(r => r.id === o.workRequestId)
      const emp = employees.find(e => e.id === o.assignedTo)
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, requests, employees, searchTerm, statusFilter])

  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const handleApprove = (wo: any) => {
    setSelectedWOForApprove(wo)
    setApproveModalOpen(true)
  }

  const confirmApprove = () => {
    if (selectedWOForApprove) {
      setOrders(prev => prev.map(o =>
        o.id === selectedWOForApprove.id ? { ...o, status: "อนุมัติ" } : o
      ))
      setApproveModalOpen(false)
      setSelectedWOForApprove(null)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("คุณต้องการลบคำสั่งงานนี้หรือไม่?\n\nข้อมูลจะถูกลบอย่างถาวร")) {
      setOrders(prev => prev.filter(o => o.id !== id))
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  // รวม WO จาก localStorage + context (wos)
  const activeWOs = useMemo(() => {
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    const combined = Array.isArray(wos) ? [...localData, ...wos] : localData
    return Array.from(new Map(combined.map((r: any) => [r.id, r])).values())
  }, [wos])

  const filteredAndSortedWRs = useMemo(() => {
    if (!activeWOs?.length) return []

    const search = searchTerm.toLowerCase()

    let filtered = activeWOs.filter((wr: any) => {
      const wrNumber = (wr.wrNumber ?? "").toString().toLowerCase()
      const projectName = (wr.projectName ?? "").toString().toLowerCase()
      const department = (wr.department ?? "").toString().toLowerCase()

      return wrNumber.includes(search) || projectName.includes(search) || department.includes(search)
    })

    filtered.sort((a: any, b: any) => {
      const dateA = a.requestDate ? new Date(a.requestDate) : null
      const dateB = b.requestDate ? new Date(b.requestDate) : null

      const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0
      const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0

      return sortOrder === "latest" ? timeB - timeA : timeA - timeB
    })

    return filtered
  }, [activeWOs, searchTerm, sortOrder])

  const exportWRToCSV = () => {
    const headers = ["เลขที่ WR", "โครงการ", "แผนก", "ผู้ขอ", "วันที่ขอ", "สถานะ", "ยอดรวม"]
    const rows = filteredAndSortedWRs.map((wr: any) => [
      wr.wrNumber || "",
      wr.projectName || "-",
      wr.department || "-",
      wr.requestedBy || "-",
      formatDate(wr.requestDate),
      getStatusLabel(wr.status),
      wr.totalAmount?.toString() || "0"
    ])
    exportToCSV("WR_List", headers, rows)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Work Order (WO)</h1>
          <p className="text-sm md:text-base text-muted-foreground">จัดการคำสั่งงานทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportWRToCSV} className="h-9.5 bg-sky-400 hover:bg-sky-500 text-white">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/wo/add">
            <Button className="bg-blue-700 hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Create New WO
            </Button>
          </Link>
        </div>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาคำสั่งงาน..."
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
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>{size} รายการ</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำสั่งงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>ชื่อคำสั่งงาน</TableHead>
                  <TableHead>คำขอ</TableHead>
                  <TableHead className="hidden lg:table-cell">ผู้รับผิดชอบ</TableHead>
                  <TableHead className="hidden sm:table-cell">วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-center">การอนุมัติ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      ไม่พบรายการ
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{o.title}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{getReqTitle(o.workRequestId)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getEmpName(o.assignedTo)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {new Date(o.createdAt).toLocaleDateString("th-TH")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(o.status)}>
                          {o.status === "อนุมัติ" && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {o.status === "รออนุมัติ" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={() => handleApprove(o)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>อนุมัติคำสั่งงาน</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/wo/${o.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>ดู</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/wo/${o.id}/edit`}>
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
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleDelete(o.id)}
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
                  ))
                )}
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
            <DialogTitle>ยืนยันการอนุมัติคำสั่งงาน</DialogTitle>
            <DialogDescription>
              คุณต้องการอนุมัติคำสั่งงานนี้หรือไม่?
            </DialogDescription>
          </DialogHeader>
          {selectedWOForApprove && (
            <div className="space-y-3 py-4">
              <div><Label>เลขที่:</Label> <span className="font-medium">{selectedWOForApprove.orderNumber}</span></div>
              <div><Label>ชื่อคำสั่งงาน:</Label> <span className="font-medium">{selectedWOForApprove.title}</span></div>
              <div><Label>คำขอ:</Label> <span className="font-medium">{getReqTitle(selectedWOForApprove.workRequestId)}</span></div>
              <div><Label>ผู้รับผิดชอบ:</Label> <span className="font-medium">{getEmpName(selectedWOForApprove.assignedTo)}</span></div>
              <div><Label>ต้นทุนรวม:</Label> <span className="font-medium">฿{selectedWOForApprove.totalCost.toLocaleString()}</span></div>
              <div><Label>วันที่สร้าง:</Label> <span className="font-medium">{new Date(selectedWOForApprove.createdAt).toLocaleDateString("th-TH")}</span></div>
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