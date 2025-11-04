"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import type { PRItem } from "@/src/types"

export default function EditPRPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { getPR, updatePR } = useData()
  const pr = getPR(id)

  const [formData, setFormData] = useState({
    title: pr ? pr.title : "",
    department: pr ? pr.department : "",
    requestedBy: pr ? pr.requestedBy : "",
    requestDate: pr ? pr.requestDate.split("T")[0] : "",
    requiredDate: pr ? pr.requiredDate.split("T")[0] : "",
    purpose: pr ? pr.purpose : "",
  })

  const [items, setItems] = useState<PRItem[]>(pr ? pr.items : [])

  const addItem = () => {
    const newItem: PRItem = {
      id: String(Date.now()),
      itemNo: items.length + 1,
      description: "",
      quantity: 1,
      unit: "",
      estimatedPrice: 0,
      totalPrice: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const updateItem = (itemId: string, field: keyof PRItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "estimatedPrice") {
            updated.totalPrice = updated.quantity * updated.estimatedPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const handleSave = () => {
    if (
      !formData.title ||
      !formData.department ||
      !formData.requestedBy ||
      !formData.requiredDate ||
      !formData.purpose
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    if (items.some((item) => !item.description || !item.unit)) {
      alert("กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วน")
      return
    }

    updatePR(id, {
      title: formData.title,
      department: formData.department,
      requestedBy: formData.requestedBy,
      requestDate: formData.requestDate,
      requiredDate: formData.requiredDate,
      purpose: formData.purpose,
      items,
      totalAmount,
    })

    alert("บันทึกการแก้ไข PR สำเร็จ")
    router.push(`/pr/${id}`)
  }

  if (!pr) {
    return <div>ไม่พบข้อมูล PR</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/pr/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">แก้ไขใบขอซื้อ</h1>
            <p className="text-muted-foreground">{pr.prNumber}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          บันทึก
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลทั่วไป</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">แผนก *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedBy">ผู้ขอ *</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestDate">วันที่ขอ *</Label>
              <Input
                id="requestDate"
                type="date"
                value={formData.requestDate}
                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredDate">วันที่ต้องการ *</Label>
            <Input
              id="requiredDate"
              type="date"
              value={formData.requiredDate}
              onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">วัตถุประสงค์ *</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายการสินค้า</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรายการ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ลำดับ</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead className="w-24">จำนวน</TableHead>
                <TableHead className="w-24">หน่วย</TableHead>
                <TableHead className="w-32">ราคาประมาณ</TableHead>
                <TableHead className="w-32">รวม</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemNo}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.estimatedPrice}
                      onChange={(e) => updateItem(item.id, "estimatedPrice", Number(e.target.value))}
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">รวมทั้งสิ้น</div>
              <div className="text-2xl font-bold">{totalAmount.toLocaleString()} บาท</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
