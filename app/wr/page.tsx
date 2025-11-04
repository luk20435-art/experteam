"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Eye, Clock, CheckCircle } from "lucide-react"

interface Employee {
  id: number
  name: string
  positionId: number
  email: string
  right: string
  photo: string | null
}

interface WorkRequest {
  id: number
  title: string
  description: string
  requester: string
  assigneeId: number
  status: "Pending" | "In Progress" | "Completed"
  priority: "Low" | "Medium" | "High"
  createdAt: string
}

const ITEMS_PER_PAGE = 5
const STATUSES = ["Pending", "In Progress", "Completed"] as const
const PRIORITIES = ["Low", "Medium", "High"] as const

export default function WorkRequestManagement() {
  // โหลดข้อมูลใน useEffect (client-side only)
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    // โหลด work-requests
    const savedRequests = localStorage.getItem("work-requests")
    if (savedRequests) {
      setWorkRequests(JSON.parse(savedRequests))
    }

    // โหลด employees
    const savedEmployees = localStorage.getItem("organization-employees")
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    }
  }, [])

  // บันทึกเมื่อ workRequests เปลี่ยน
  useEffect(() => {
    if (workRequests.length > 0) {
      localStorage.setItem("work-requests", JSON.stringify(workRequests))
    }
  }, [workRequests])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<WorkRequest | null>(null)
  const [viewingRequest, setViewingRequest] = useState<WorkRequest | null>(null)

  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    requester: "",
    assigneeId: 0,
    status: "Pending" as WorkRequest["status"],
    priority: "Medium" as WorkRequest["priority"],
  })

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    requester: "",
    assigneeId: 0,
    status: "Pending" as WorkRequest["status"],
    priority: "Medium" as WorkRequest["priority"],
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredRequests = useMemo(() => {
    return workRequests.filter(req => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchTerm.toLowerCase())

      const assignee = employees.find(e => e.id === req.assigneeId)
      const matchesAssignee = assignee?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false

      const matchesStatus = statusFilter === "all" || req.status === statusFilter
      const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter

      return (matchesSearch || matchesAssignee) && matchesStatus && matchesPriority
    })
  }, [workRequests, employees, searchTerm, statusFilter, priorityFilter])

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredRequests, currentPage])

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)

  const getAssigneeName = (id: number) => employees.find(e => e.id === id)?.name || "ไม่ระบุ"

  const getStatusIcon = (status: WorkRequest["status"]) => {
    switch (status) {
      case "Pending": return <Clock className="h-4 w-4 text-yellow-600" />
      case "In Progress": return <Clock className="h-4 w-4 text-blue-600" />
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return null
    }
  }

  const handleAdd = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.requester || newRequest.assigneeId === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    const newId = Math.max(...workRequests.map(r => r.id), 0) + 1
    setWorkRequests([...workRequests, { id: newId, ...newRequest, createdAt: new Date().toISOString() }])
    setNewRequest({
      title: "",
      description: "",
      requester: "",
      assigneeId: 0,
      status: "Pending",
      priority: "Medium",
    })
    setIsAddOpen(false)
    setCurrentPage(1)
  }

  const handleEditStart = (request: WorkRequest) => {
    setEditingRequest(request)
    setEditForm({
      title: request.title,
      description: request.description,
      requester: request.requester,
      assigneeId: request.assigneeId,
      status: request.status,
      priority: request.priority,
    })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingRequest || !editForm.title || !editForm.description || !editForm.requester || editForm.assigneeId === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    setWorkRequests(workRequests.map(req =>
      req.id === editingRequest.id ? { ...req, ...editForm } : req
    ))
    setIsEditOpen(false)
    setEditingRequest(null)
  }

  const handleView = (request: WorkRequest) => {
    setViewingRequest(request)
    setIsViewOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("ยืนยันการลบคำขอนี้?")) {
      setWorkRequests(workRequests.filter(req => req.id !== id))
      setCurrentPage(1)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setCurrentPage(1)
  }

  // แสดง loading ถ้ายังไม่มีข้อมูล
  if (employees.length === 0 && workRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* หัวข้อ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">การจัดการคำขอทำงาน</h1>
          <p className="text-muted-foreground">จัดการคำขอทำงานทั้งหมดในองค์กร</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มคำขอ
        </Button>
      </div>

      {/* ค้นหาและกรอง */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อคำขอ ผู้ร้องขอ หรือผู้รับ..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setCurrentPage(1) }}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="ความสำคัญ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกความสำคัญ</SelectItem>
                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>ล้างตัวกรอง</Button>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำขอทำงาน</CardTitle>
          <CardDescription>
            พบ {filteredRequests.length} รายการจากทั้งหมด {workRequests.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อคำขอ</TableHead>
                  <TableHead>ผู้ร้องขอ</TableHead>
                  <TableHead>ผู้รับ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ความสำคัญ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      ไม่พบคำขอที่ตรงกับเงื่อนไข
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>{getAssigneeName(request.assigneeId)}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.priority === "High" ? "bg-red-100 text-red-800" :
                          request.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {request.priority}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditStart(request)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(request.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
              <p className="text-sm text-muted-foreground">
                หน้า {currentPage} จาก {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: ดูรายละเอียด */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำขอ</DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div>
                <Label>ชื่อคำขอ</Label>
                <p className="font-medium">{viewingRequest.title}</p>
              </div>
              <div>
                <Label>รายละเอียด</Label>
                <p>{viewingRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ผู้ร้องขอ</Label>
                  <p>{viewingRequest.requester}</p>
                </div>
                <div>
                  <Label>ผู้รับงาน</Label>
                  <p>{getAssigneeName(viewingRequest.assigneeId)}</p>
                </div>
                <div>
                  <Label>สถานะ</Label>
                  <p className="flex items-center gap-2">
                    {getStatusIcon(viewingRequest.status)}
                    {viewingRequest.status}
                  </p>
                </div>
                <div>
                  <Label>ความสำคัญ</Label>
                  <p className={`font-medium ${
                    viewingRequest.priority === "High" ? "text-red-600" :
                    viewingRequest.priority === "Medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {viewingRequest.priority}
                  </p>
                </div>
              </div>
              <div>
                <Label>วันที่สร้าง</Label>
                <p>{new Date(viewingRequest.createdAt).toLocaleString("th-TH")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: เพิ่มใหม่ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มคำขอทำงานใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลคำขอให้ครบถ้วน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อคำขอ <span className="text-red-500">*</span></Label>
              <Input
                value={newRequest.title}
                onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                placeholder="เช่น แก้ไขระบบเว็บไซต์"
              />
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด <span className="text-red-500">*</span></Label>
              <Textarea
                value={newRequest.description}
                onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder="อธิบายรายละเอียดงาน..."
              />
            </div>
            <div className="space-y-2">
              <Label>ผู้ร้องขอ <span className="text-red-500">*</span></Label>
              <Input
                value={newRequest.requester}
                onChange={e => setNewRequest({ ...newRequest, requester: e.target.value })}
                placeholder="ชื่อผู้ร้องขอ"
              />
            </div>
            <div className="space-y-2">
              <Label>ผู้รับงาน <span className="text-red-500">*</span></Label>
              <Select
                value={newRequest.assigneeId ? newRequest.assigneeId.toString() : ""}
                onValueChange={val => {
                  const id = parseInt(val, 10)
                  if (!isNaN(id)) setNewRequest({ ...newRequest, assigneeId: id })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้รับงาน" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="none" disabled>ไม่มีพนักงานในระบบ</SelectItem>
                  ) : (
                    employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} ({emp.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select value={newRequest.status} onValueChange={val => setNewRequest({ ...newRequest, status: val as WorkRequest["status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ความสำคัญ</Label>
                <Select value={newRequest.priority} onValueChange={val => setNewRequest({ ...newRequest, priority: val as WorkRequest["priority"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button 
              onClick={handleAdd}
              disabled={!newRequest.title || !newRequest.description || !newRequest.requester || newRequest.assigneeId === 0}
            >
              เพิ่มคำขอ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขคำขอทำงาน</DialogTitle>
          </DialogHeader>
          {editingRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ชื่อคำขอ <span className="text-red-500">*</span></Label>
                <Input
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>รายละเอียด <span className="text-red-500">*</span></Label>
                <Textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ผู้ร้องขอ <span className="text-red-500">*</span></Label>
                <Input
                  value={editForm.requester}
                  onChange={e => setEditForm({ ...editForm, requester: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ผู้รับงาน <span className="text-red-500">*</span></Label>
                <Select
                  value={editForm.assigneeId ? editForm.assigneeId.toString() : ""}
                  onValueChange={val => {
                    const id = parseInt(val, 10)
                    if (!isNaN(id)) setEditForm({ ...editForm, assigneeId: id })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกผู้รับงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>ไม่มีพนักงาน</SelectItem>
                    ) : (
                      employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} ({emp.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select value={editForm.status} onValueChange={val => setEditForm({ ...editForm, status: val as WorkRequest["status"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ความสำคัญ</Label>
                  <Select value={editForm.priority} onValueChange={val => setEditForm({ ...editForm, priority: val as WorkRequest["priority"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button 
              onClick={handleEditSave}
              disabled={!editForm.title || !editForm.description || !editForm.requester || editForm.assigneeId === 0}
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}