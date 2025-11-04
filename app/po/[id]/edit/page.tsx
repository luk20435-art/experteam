"use client"

import { use, useState, useEffect } from "react"
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
import { mockSuppliers } from "@/src/lib/mock-data"
import { formatCurrency } from "@/src/lib/utils"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface POItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
  total: number
}

export default function EditPOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getPO, updatePO } = useData()
  const po = getPO(id)

  const [supplierId, setSupplierId] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<POItem[]>([])
  const [deliveryDate, setDeliveryDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)

  useEffect(() => {
    if (po) {
      setSupplierId(po.supplier?.id || "")
      setDescription(po.description || "")
      setDeliveryDate(po.deliveryDate || "")
      setPaymentTerms(po.paymentTerms || "")
      setNotes(po.notes || "")
      setItems(
        (po.items || []).map((item) => ({
          id: Math.random().toString(36).substr(2, 9),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          total: item.quantity * item.unitPrice,
        }))
      )
    }
  }, [po])

  if (!po) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูล PO</h2>
        <Link href="/po">
          <Button>กลับไปหน้ารายการ PO</Button>
        </Link>
      </div>
    )
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        description: "",
        quantity: 1,
        unitPrice: 0,
        unit: "ชิ้น",
        total: 0,
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
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    )
  }

  // ✅ คำนวณยอด
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const grandTotal = subtotal + vatAmount + serviceTaxAmount

  const handleSubmit = (status: "draft" | "pending") => {
    if (!supplierId) {
      alert("กรุณาเลือก Supplier")
      return
    }
    if (items.length === 0) {
      alert("กรุณาเพิ่มรายการสินค้า")
      return
    }

    const supplier = mockSuppliers.find((s) => s.id === supplierId)
    if (!supplier) {
      alert("ไม่พบข้อมูล Supplier")
      return
    }

    updatePO(po.id, {
      supplier,
      description,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
      })),
      totalAmount: grandTotal,
      deliveryDate: deliveryDate || undefined,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
      status,
    })

    alert(`${status === "draft" ? "บันทึกฉบับร่าง" : "อัพเดท"} PO ${po.poNumber} สำเร็จ`)
    router.push(`/po/${po.id}`)
  }

  return (
    <div className="space-y-6">
      {/* ปุ่มย้อนกลับ + หัวข้อ */}
      <div className="flex items-center gap-4">
        <Link href="/po">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้า PO
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">แก้ไข PO: {po.poNumber}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">แก้ไขข้อมูล Purchase Order</p>
        </div>
      </div>

      {/* ข้อมูลทั่วไป */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล PO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>เลข PO</Label>
              <Input value={po.poNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label>เลข PR</Label>
              <Input value={po.prNumber} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="เลือก Supplier" />
              </SelectTrigger>
              <SelectContent>
                {mockSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* รายการสินค้า */}
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
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รายการ</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>ราคา/หน่วย</TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead className="text-right">รวม</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        ไม่มีรายการสินค้า กรุณาเพิ่มรายการ
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
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
                            onChange={(e) =>
                              updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            placeholder="หน่วย"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {items.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">
                        รวมทั้งหมด:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatCurrency(subtotal)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ปุ่มบันทึก */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link href={`/po/${po.id}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full bg-transparent cursor-pointer">
            ยกเลิก
          </Button>
        </Link>
        <Button onClick={() => handleSubmit("pending")} className="w-full sm:w-auto cursor-pointer">
          บันทึกการแก้ไข
        </Button>
      </div>
    </div>
  )
}
