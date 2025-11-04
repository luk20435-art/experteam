"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, User, ChevronLeft, ChevronRight } from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
}

const ITEMS_PER_PAGE = 5
const STORAGE_KEY = "users"

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isClient, setIsClient] = useState(false)

  // โหลดข้อมูลจาก localStorage เฉพาะ client
  useEffect(() => {
    setIsClient(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setUsers(JSON.parse(saved))
      } else {
        // ถ้าไม่มีข้อมูล ให้ใช้ default
        const defaultUsers: UserType[] = [
          { id: 1, name: "Admin", email: "admin@example.com" },
          { id: 2, name: "User1", email: "user1@example.com" },
        ]
        setUsers(defaultUsers)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
      }
    } catch (e) {
      console.error("Failed to load users", e)
    }
  }, [])

  // บันทึกทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (isClient && users.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      } catch (e) {
        console.error("Failed to save users", e)
      }
    }
  }, [users, isClient])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Reset page เมื่อค้นหา
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "" })
  const [editForm, setEditForm] = useState({ name: "", email: "" })

  const handleAdd = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("กรุณากรอกชื่อและอีเมล")
      return
    }
    const newId = Math.max(...users.map(u => u.id), 0) + 1
    setUsers(prev => [...prev, { id: newId, ...newUser }])
    setNewUser({ name: "", email: "" })
    setIsAddOpen(false)
  }

  const handleEditStart = (user: UserType) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingUser || !editForm.name.trim() || !editForm.email.trim()) return
    setUsers(prev => prev.map(u =>
      u.id === editingUser.id ? { ...u, ...editForm } : u
    ))
    setIsEditOpen(false)
    setEditingUser(null)
  }

  const handleDelete = (id: number) => {
    if (confirm("ลบผู้ใช้งานนี้หรือไม่?")) {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
              <p className="text-sm text-gray-600 mt-1">ทั้งหมด {users.length} คน</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg gap-2"
          >
            <Plus className="h-4 w-4" />
            เพิ่มผู้ใช้งาน
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อหรืออีเมล..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-base border-gray-300 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-xl">รายชื่อผู้ใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">ชื่อ</th>
                    <th className="text-left p-4 font-semibold text-gray-700">อีเมล</th>
                    <th className="text-center p-4 font-semibold text-gray-700">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-16 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">ไม่พบผู้ใช้งาน</p>
                        <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหา</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map(u => (
                      <tr key={u.id} className="border-b hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{u.name}</td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditStart(u)}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(u.id)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} จาก {filtered.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    ก่อนหน้า
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog: เพิ่มผู้ใช้ */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">เพิ่มผู้ใช้งานใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="add-name" className="text-base">ชื่อ</Label>
                <Input
                  id="add-name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="กรอกชื่อ"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="add-email" className="text-base">อีเมล</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="example@domain.com"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">เพิ่มผู้ใช้</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: แก้ไขผู้ใช้ */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">แก้ไขผู้ใช้งาน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name" className="text-base">ชื่อ</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-base">อีเมล</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleEditSave} className="bg-blue-600 hover:bg-blue-700">บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}