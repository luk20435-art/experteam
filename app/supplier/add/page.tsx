// app/supplier/add/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

export default function AddSupplierPage() {
  const router = useRouter()
  const { addSupplier } = useData()

  const [formData, setFormData] = useState({
    name: "", group: "", type: "", product: "", address: "", email: "", secondaryEmail: "", contactNumber: "", contactPerson: "", status: "active"
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSupplier = {
      id: Date.now().toString(),
      registrationDate: new Date().toISOString().split("T")[0],
      ...formData,
      secondaryEmail: formData.secondaryEmail || undefined,
    }
    addSupplier(newSupplier as any)
    toast({ title: "เพิ่มสำเร็จ", description: `${formData.name} ถูกเพิ่มแล้ว` })
    router.push("/supplier")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/supplier")}><ArrowLeft className="h-6 w-6" /></Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">เพิ่มซัพพลายเออร์ใหม่</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>ชื่อบริษัท *</Label><Input value={formData.name} onChange={e => handleChange("name", e.target.value)} required /></div>
              <div className="space-y-2"><Label>กลุ่ม</Label><Input value={formData.group} onChange={e => handleChange("group", e.target.value)} /></div>
              <div className="space-y-2"><Label>ประเภท</Label><Input value={formData.type} onChange={e => handleChange("type", e.target.value)} /></div>
              <div className="space-y-2"><Label>สินค้า/บริการ</Label><Input value={formData.product} onChange={e => handleChange("product", e.target.value)} /></div>
              <div className="space-y-2 md:col-span-2"><Label>ที่อยู่</Label><Textarea value={formData.address} onChange={e => handleChange("address", e.target.value)} rows={3} /></div>
              <div className="space-y-2"><Label>อีเมลหลัก *</Label><Input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} required /></div>
              <div className="space-y-2"><Label>อีเมลสำรอง</Label><Input type="email" value={formData.secondaryEmail} onChange={e => handleChange("secondaryEmail", e.target.value)} /></div>
              <div className="space-y-2"><Label>เบอร์ติดต่อ *</Label><Input value={formData.contactNumber} onChange={e => handleChange("contactNumber", e.target.value)} required /></div>
              <div className="space-y-2"><Label>ผู้ติดต่อ *</Label><Input value={formData.contactPerson} onChange={e => handleChange("contactPerson", e.target.value)} required /></div>
              <div className="space-y-2"><Label>สถานะ</Label>
                <Select value={formData.status} onValueChange={v => handleChange("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">ใช้งาน</SelectItem>
                    <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" size="lg" onClick={() => router.push("/supplier")}>ยกเลิก</Button>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700"><Save className="mr-2 h-5 w-5" /> บันทึก</Button>
          </div>
        </form>
      </div>
    </div>
  )
}