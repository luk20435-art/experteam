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
import { Search, Plus, Edit, Trash2, User } from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
}

const ITEMS_PER_PAGE = 5
const defaultUsers: UserType[] = [
  { id: 1, name: "Admin", email: "admin@example.com" },
  { id: 2, name: "User1", email: "user1@example.com" },
]

export default function UsersPage() {
  // เริ่มด้วย default เพื่อให้ SSR-safe
  const [users, setUsers] = useState<UserType[]>(defaultUsers)
  const [isClient, setIsClient] = useState(false)

  // โหลดจาก localStorage เฉพาะ client
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("users")
    if (saved) setUsers(JSON.parse(saved))
  }, [])

  // save กลับ localStorage เฉพาะ client
  useEffect(() => {
    if (isClient) localStorage.setItem("users", JSON.stringify(users))
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

  // Add / Edit / Delete handlers
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "" })
  const [editForm, setEditForm] = useState({ name: "", email: "" })

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) return
    const newId = Math.max(...users.map(u => u.id), 0) + 1
    setUsers([...users, { id: newId, ...newUser }])
    setNewUser({ name: "", email: "" })
    setIsAddOpen(false)
    setCurrentPage(1)
  }

  const handleEditStart = (user: UserType) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingUser) return
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u))
    setIsEditOpen(false)
    setEditingUser(null)
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id))
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black">จัดการผู้ใช้งาน</h1>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> เพิ่มผู้ใช้งาน
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">อีเมล</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-muted-foreground">
                  ไม่พบผู้ใช้งาน
                </td>
              </tr>
            ) : (
              paginated.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleEditStart(u)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">หน้า {currentPage} จาก {totalPages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>ก่อนหน้า</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>ถัดไป</Button>
          </div>
        </div>
      )}

      {/* Dialog เพิ่ม */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้งาน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อ</Label>
              <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAdd}>เพิ่ม</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขผู้ใช้งาน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อ</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleEditSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
