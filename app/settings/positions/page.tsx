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
  DialogDescription,
} from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2, Briefcase } from "lucide-react"

interface Position {
  id: number
  name: string
  department: string
  desc: string
}

const ITEMS_PER_PAGE = 5

// Default positions สำหรับ SSR
const defaultPositions: Position[] = [
  { id: 1, name: "Programmer", department: "ฝ่าย IT", desc: "พัฒนาและดูแลระบบ" },
  { id: 2, name: "บัญชี", department: "ฝ่ายการเงิน", desc: "จัดทำรายงานทางบัญชี" },
  { id: 3, name: "HR", department: "ฝ่ายบุคคล", desc: "ดูแลพนักงาน" },
  { id: 4, name: "Designer", department: "ฝ่ายออกแบบ", desc: "ออกแบบ UI/UX" },
  { id: 5, name: "Support", department: "ฝ่ายบริการลูกค้า", desc: "ตอบคำถามลูกค้า" },
  { id: 6, name: "Marketing", department: "ฝ่ายการตลาด", desc: "โปรโมทสินค้า" },
]

export default function PositionTable() {
  const [positions, setPositions] = useState<Position[]>(defaultPositions)
  const [isLoaded, setIsLoaded] = useState(false)

  // client-side: โหลดจาก localStorage
  useEffect(() => {
    const saved = localStorage.getItem("positions")
    if (saved) {
      setPositions(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  // client-side: save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("positions", JSON.stringify(positions))
    }
  }, [positions, isLoaded])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [newPosition, setNewPosition] = useState({ name: "", department: "", desc: "" })
  const [editForm, setEditForm] = useState({ name: "", department: "", desc: "" })

  // filter positions ตาม searchTerm
  const filtered = useMemo(() => {
    if (!searchTerm) return positions
    return positions.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [positions, searchTerm])

  // pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // handlers
  const handleAdd = () => {
    if (!newPosition.name || !newPosition.department) return
    const newId = Math.max(...positions.map(p => p.id), 0) + 1
    setPositions([...positions, { id: newId, ...newPosition }])
    setNewPosition({ name: "", department: "", desc: "" })
    setIsAddOpen(false)
    setCurrentPage(1)
  }

  const handleEditStart = (pos: Position) => {
    setEditingPosition(pos)
    setEditForm({ name: pos.name, department: pos.department, desc: pos.desc })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingPosition) return
    setPositions(positions.map(p =>
      p.id === editingPosition.id ? { ...p, ...editForm } : p
    ))
    setIsEditOpen(false)
    setEditingPosition(null)
  }

  const handleDelete = (id: number) => {
    setPositions(positions.filter(p => p.id !== id))
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black">จัดการตำแหน่งงาน</h1>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          เพิ่มตำแหน่ง
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาชื่อหรือรายละเอียด..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">ชื่อตำแหน่ง</th>
              <th className="p-3 text-left">ฝ่าย/หน่วยงาน</th>
              <th className="p-3 text-left">รายละเอียด</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  ไม่พบตำแหน่ง
                </td>
              </tr>
            ) : (
              paginated.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.department}</td>
                  <td className="p-3 text-muted-foreground">{p.desc}</td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                    >
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      {/* Dialog เพิ่ม */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มตำแหน่งใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลตำแหน่งงาน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อตำแหน่ง</Label>
              <Input
                value={newPosition.name}
                onChange={e => setNewPosition({ ...newPosition, name: e.target.value })}
                placeholder="เช่น Programmer"
              />
            </div>
            <div>
              <Label>ฝ่าย/หน่วยงาน</Label>
              <Input
                value={newPosition.department}
                onChange={e => setNewPosition({ ...newPosition, department: e.target.value })}
                placeholder="เช่น ฝ่าย IT"
              />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Input
                value={newPosition.desc}
                onChange={e => setNewPosition({ ...newPosition, desc: e.target.value })}
                placeholder="เช่น พัฒนาระบบ..."
              />
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
            <DialogTitle>แก้ไขตำแหน่ง</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อตำแหน่ง</Label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>ฝ่าย/หน่วยงาน</Label>
              <Input
                value={editForm.department}
                onChange={e => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Input
                value={editForm.desc}
                onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
              />
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
