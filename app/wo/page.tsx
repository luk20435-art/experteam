"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WorkOrder {
  id: number
  workRequestId: number
  orderNumber: string
  title: string
  assignedTo: number
  status: "Draft" | "Approved" | "In Progress" | "Completed" | "Cancelled"
  totalCost: number
  createdAt: string
  deleted?: boolean
  deletedAt?: string
}
interface WorkRequest { id: number; title: string }
interface Employee { id: number; name: string }

const ITEMS_PER_PAGE = 5
const STATUSES = ["Draft","Approved","In Progress","Completed","Cancelled"] as const

export default function WorkOrderList() {
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

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  // กรองเฉพาะที่ยังไม่ถูกลบ
  const activeOrders = useMemo(() => orders.filter(o => !o.deleted), [orders])

  const filtered = useMemo(() => {
    return activeOrders.filter(o => {
      const req = requests.find(r => r.id === o.workRequestId)
      const emp = employees.find(e => e.id === o.assignedTo)
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === "all" || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [activeOrders, requests, employees, searchTerm, statusFilter])

  const paginated = useMemo(() => {
    const s = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(s, s + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const getReqTitle = (id: number) => requests.find(r => r.id === id)?.title || "-"
  const getEmpName  = (id: number) => employees.find(e => e.id === id)?.name || "-"
  const getBadge = (s: WorkOrder["status"]) => {
    const map: Record<WorkOrder["status"], string> = {
      Draft: "bg-gray-100 text-gray-800",
      Approved: "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return <span className={`px-2 py-1 rounded-full text-xs ${map[s]}`}>{s}</span>
  }

  // ลบ → ย้ายไปถังขยะ
  const moveToTrash = (id: number, orderNumber: string) => {
    if (confirm(`คุณต้องการลบคำสั่งงาน "${orderNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ" และสามารถกู้คืนได้`)) {
      setOrders(prev => prev.map(o =>
        o.id === id
          ? { ...o, deleted: true, deletedAt: new Date().toISOString() }
          : o
      ))
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">คำสั่งงาน (Work Order)</h1>
          <p className="text-muted-foreground">จัดการคำสั่งงานทั้งหมด</p>
        </div>
        <Link href="/wo/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มคำสั่งงาน
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>ค้นหา / กรอง</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="เลขที่, ชื่อ, คำขอ, ผู้รับ..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="สถานะ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPage(1) }}>
              ล้าง
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำสั่งงาน</CardTitle>
          <CardDescription>
            พบ {filtered.length} รายการ (ทั้งหมด {activeOrders.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>คำขอ</TableHead>
                  <TableHead>ผู้รับ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ต้นทุนรวม</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell>{getReqTitle(o.workRequestId)}</TableCell>
                      <TableCell>{getEmpName(o.assignedTo)}</TableCell>
                      <TableCell>{getBadge(o.status)}</TableCell>
                      <TableCell>฿{(o.totalCost ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/wo/${o.id}`}>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          <Link href={`/wo/${o.id}/edit`}>
                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveToTrash(o.id, o.orderNumber)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">หน้า {page} / {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>ก่อนหน้า</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>ถัดไป</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}