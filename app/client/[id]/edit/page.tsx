// app/client/[id]/edit/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const { clients, updateClient } = useData()
  
  const client = clients.find(c => c.id === params.id)

  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    contactPerson: "",
    contactNumber: "",
    contactEmail: "",
    address: "",
    status: "active" as "active" | "inactive",
  })

  // โหลดข้อมูลเมื่อ client พร้อม
  useEffect(() => {
    if (client) {
      setFormData({
        clientId: client.clientId || "",
        name: client.name || "",
        contactPerson: client.contactPerson || "",
        contactNumber: client.contactNumber || "",
        contactEmail: client.contactEmail || "",
        address: client.address || "",
        status: client.status || "active",
      })
    }
  }, [client])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    const updatedClient = {
      clientId: formData.clientId,
      name: formData.name,
      contactPerson: formData.contactPerson,
      contactNumber: formData.contactNumber,
      contactEmail: formData.contactEmail || undefined,
      address: formData.address || undefined,
      status: formData.status,
    }

    updateClient(client.id, updatedClient)
    toast({ title: "แก้ไขสำเร็จ", description: "ข้อมูลลูกค้าถูกอัปเดตแล้ว" })
    router.push(`/client/${client.id}`)
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600">ไม่พบข้อมูลลูกค้า</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/client/${client.id}`)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            แก้ไขลูกค้า
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
              <CardTitle className="text-2xl">ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Client ID *</Label>
                  <Input
                    value={formData.clientId}
                    onChange={(e) => handleChange("clientId", e.target.value)}
                    required
                    placeholder="CUST-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="บริษัท ตัวอย่าง จำกัด"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => handleChange("contactPerson", e.target.value)}
                    required
                    placeholder="นาย สมชาย ใจดี"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                    required
                    placeholder="081-234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    value={formData.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    type="email"
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    placeholder="123 ถนนธุรกิจดี แขวงสำเร็จ เขตเมืองใหญ่ กรุงเทพฯ 10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" size="lg" onClick={() => router.push(`/client/${client.id}`)}>
              ยกเลิก
            </Button>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-5 w-5" />
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}