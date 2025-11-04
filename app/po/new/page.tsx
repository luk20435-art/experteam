"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency } from "@/src/lib/utils"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import type { PurchaseRequisition, PurchaseOrder, POItem } from "@/src/types"

export default function CreatePOPage() {
  const router = useRouter()
  const { prs, suppliers, addPO, pos } = useData()

  const [selectedPRId, setSelectedPRId] = useState("")
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null)
  const [supplierId, setSupplierId] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<POItem[]>([])
  const [deliveryDate, setDeliveryDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [vatRate, setVatRate] = useState(7) // Default 7%
  const [serviceTaxRate, setServiceTaxRate] = useState(0) // Default 0%

  const submittedPRs = prs.filter((pr) => pr.status === "submitted")

  useEffect(() => {
    if (selectedPRId) {
      const pr = prs.find((p) => p.id === selectedPRId)
      if (pr) {
        setSelectedPR(pr)
        setDescription(pr.title)
        // Convert PR items to PO items
        setItems(
          pr.items.map((item, index) => ({
            id: `item-${index}`,
            itemNo: index + 1,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.estimatedPrice,
            unit: item.unit,
            totalPrice: item.quantity * item.estimatedPrice,
          })),
        )
      }
    }
  }, [selectedPRId, prs])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        itemNo: items.length + 1,
        description: "",
        quantity: 1,
        unitPrice: 0,
        unit: "ชิ้น",
        totalPrice: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.totalPrice = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const handleSubmit = (status: "draft" | "submitted") => {
    if (!selectedPRId) {
      alert("กรุณาเลือก PR")
      return
    }
    if (!supplierId) {
      alert("กรุณาเลือก Supplier")
      return
    }
    if (items.length === 0) {
      alert("กรุณาเพิ่มรายการสินค้า")
      return
    }

    const poCount = pos.length + 1
    const poNumber = `PO${new Date().getFullYear()}${String(poCount).padStart(4, "0")}`

    const supplier = suppliers.find((s) => s.id === supplierId)

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      prId: selectedPRId,
      prNumber: selectedPR?.prNumber || "",
      supplierId,
      supplierName: supplier?.name || "",
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
      status,
      items,
      description,
      subtotal,
      vatRate,
      vatAmount,
      serviceTaxRate,
      serviceTaxAmount,
      totalAmount,
      paymentTerms: paymentTerms || "เครดิต 30 วัน",
      deliveryAddress: "ที่อยู่จัดส่ง",
      remarks: notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addPO(newPO)
    alert(`${status === "draft" ? "บันทึกฉบับร่าง" : "บันทึก"} PO ${poNumber} สำเร็จ`)
    router.push("/po")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/po">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">สร้าง Purchase Order ใหม่</h1>
            <p className="text-muted-foreground mt-1">สร้างใบสั่งซื้อจาก PR ที่บันทึกแล้ว หรือสร้างใหม่</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")}>
            <Save className="mr-2 h-4 w-4" />
            บันทึกร่าง
          </Button>
          <Button onClick={() => handleSubmit("submitted")}>
            <Save className="mr-2 h-4 w-4" />
            บันทึก
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูล PO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pr">เลือก PR ที่บันทึกแล้ว (ถ้ามี)</Label>
                <Select value={selectedPRId} onValueChange={setSelectedPRId}>
                  <SelectTrigger id="pr">
                    <SelectValue placeholder="เลือก PR หรือสร้างใหม่" />
                  </SelectTrigger>
                  <SelectContent>
                    {submittedPRs.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">ไม่มี PR ที่บันทึกแล้ว</div>
                    ) : (
                      submittedPRs.map((pr) => (
                        <SelectItem key={pr.id} value={pr.id}>
                          {pr.prNumber} - {pr.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="เลือก Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดการสั่งซื้อ"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">วันที่ต้องการรับสินค้า</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="เช่น เครดิต 30 วัน"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติม"
                rows={2}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ลำดับ</TableHead>
                    <TableHead>รายการ</TableHead>
                    <TableHead className="w-24">จำนวน</TableHead>
                    <TableHead className="w-32">ราคา/หน่วย</TableHead>
                    <TableHead className="w-24">หน่วย</TableHead>
                    <TableHead className="text-right w-32">รวม</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        ไม่มีรายการสินค้า กรุณาเพิ่มรายการ
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNo}</TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="รายละเอียดสินค้า"
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
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            placeholder="หน่วย"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {items.length > 0 && (
              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ยอดรวม (ก่อนภาษี)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vatRate" className="text-sm text-muted-foreground">
                      ภาษีมูลค่าเพิ่ม (VAT)
                    </Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(vatAmount)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="serviceTaxRate" className="text-sm text-muted-foreground">
                      ภาษีการบริการ
                    </Label>
                    <Input
                      id="serviceTaxRate"
                      type="number"
                      value={serviceTaxRate}
                      onChange={(e) => setServiceTaxRate(Number(e.target.value))}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(serviceTaxAmount)}</span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-semibold">รวมทั้งสิ้น</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
