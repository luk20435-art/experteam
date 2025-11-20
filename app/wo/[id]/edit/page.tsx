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
import { ArrowLeft, Plus, Trash2, Save, Building2 } from "lucide-react"
import type { WorkRequisition, WorkOrder, WOItem, WOHistory } from "@/src/types"
import { useToast } from "@/hooks/use-toast"
import React from "react"

// Helper แปลง number → string
const toStr = (val: string | number | null | undefined): string => String(val ?? "")

export default function EditWOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getWO, updateWO, wrs, wos, projects, traders, clients, suppliers } = useData()

  const wo = getWO(id)
  if (!wo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">ไม่พบข้อมูล Work Order</h2>
        <Link href="/wo">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">กลับไปหน้ารายการ WO</Button>
        </Link>
      </div>
    )
  }

  // หา WR จาก wo.workRequestId (หรือ field ที่คุณใช้จริง)
  const wr = wo.workRequestId ? wrs.find(w => w.id === wo.workRequestId) : null

  const [traderId, setTraderId] = useState(wo.trader || "")
  const [supplierId, setSupplierId] = useState(wo.supplier || "")
  const [supplierName, setSupplierName] = useState(wo.supplierName || "")
  const [deliveryLocation, setDeliveryLocation] = useState(wo.deliveryLocation || "")
  const [description, setDescription] = useState(wo.description || "")
  const [expteamQuotation, setExpteamQuotation] = useState(toStr(wo.expteamQuotation))
  const [estimatedPrCost, setEstimatedPrCost] = useState(toStr(wo.estimatedPrCost))
  const [items, setItems] = useState<WOItem[]>([])

  const today = new Date().toISOString().split("T")[0]
  const [orderDate] = useState(today)
  const [deliveryDate, setDeliveryDate] = useState(wo.deliveryDate || "")
  const [durationDays, setDurationDays] = useState(wo.durationDays || 0)

  const [paymentTerms, setPaymentTerms] = useState(wo.paymentTerms || "")
  const [notes, setNotes] = useState(wo.remarks || "")
  const [vatRate, setVatRate] = useState(wo.vatRate || 7)
  const [serviceTaxRate, setServiceTaxRate] = useState(wo.serviceTaxRate || 0)
  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">(wo.status || "ร่าง")

  const [projectInfo, setProjectInfo] = useState({
    jobNumber: "",
    traderName: "",
    ccNo: "",
    projectName: "",
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "0",
    requestedBy: "",
    department: "",
  })

  useEffect(() => {
    if (!wo) return

    setStatus(wo.status || "ร่าง")

    if (wr) {
      setTraderId(wr.traderId || wo.trader || "")
      setSupplierId(wr.supplier || wo.supplier || "")
      const supplierData = suppliers.find(s => s.id === (wr.supplier || wo.supplier))
      setSupplierName(supplierData?.name || wr.supplierName || wo.supplierName || "")
      setDeliveryLocation(wr.deliveryLocation || wo.deliveryLocation || "")
      setDeliveryDate(wr.requiredDate || wo.deliveryDate || "")
      setDurationDays(Number(wr.duration) || wo.durationDays || 0)
      setPaymentTerms(wo.paymentTerms || "")
      setNotes(wo.remarks || "")
      setVatRate(wo.vatRate || 7)
      setServiceTaxRate(wo.serviceTaxRate || 0)
      setDescription(wo.description || "")
      setExpteamQuotation(toStr(wo.expteamQuotation || wr.expteamQuotation))
      setEstimatedPrCost(toStr(wo.estimatedPrCost || wr.estimatedPrCost))

      const projectId = wr.projectId || wo.projectId
      if (projectId) {
        const project = projects.find(p => p.id === projectId)
        if (project) {
          const totalWOAmount = wos
            .filter(w => w.projectId === projectId && w.status !== "ยกเลิก")
            .reduce((sum, w) => sum + (w.totalAmount || 0), 0)
          const totalBudget = Number(project.budget ?? project.estimatedCost ?? 0)
          const balance = (totalBudget - totalWOAmount).toFixed(2)

          setProjectInfo({
            jobNumber: wr.jobNo || project.jobNo || project.projectNumber || wo.jobNumber || "",
            ccNo: wr.ccNo || project.ccNo || wo.ccNo || "",
            projectName: wr.projectName || project.name || wo.projectName || "",
            traderName: wr.traderName || wo.traderName || "",
            expteamQuotation: toStr(wr.expteamQuotation || project.expteamQuotation),
            estimatedPrCost: toStr(wr.estimatedPrCost || project.estimatedCost),
            jobBalanceCost: balance,
            requestedBy: wr.requestedBy || "",
            department: wr.department || "",
          })
        }
      }
    } else {
      if (wo.projectId) {
        const project = projects.find(p => p.id === wo.projectId)
        if (project) {
          const totalWOAmount = wos
            .filter(w => w.projectId === wo.projectId && w.status !== "ยกเลิก")
            .reduce((sum, w) => sum + (w.totalAmount || 0), 0)
          const totalBudget = Number(project.budget ?? project.estimatedCost ?? 0)
          const balance = (totalBudget - totalWOAmount).toFixed(2)

          setProjectInfo({
            jobNumber: wo.jobNo || project.jobNo || project.projectNumber || "",
            ccNo: wo.ccNo || project.ccNo || "",
            projectName: wo.projectName || project.name || "",
            traderName: wo.traderName || "",
            expteamQuotation: toStr(wo.expteamQuotation || project.expteamQuotation),
            estimatedPrCost: toStr(wo.estimatedPrCost || project.estimatedCost),
            jobBalanceCost: balance,
            requestedBy: wo.requestedBy || "",
            department: wo.department || "",
          })
        }
      }
    }

    setItems(
      wo.items?.map((item, i) => ({
        id: `wo-item-${Date.now()}-${i}`,
        itemNo: i + 1,
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        estimatedPrice: item.estimatedPrice || item.unitPrice || 0,
        unit: item.unit || "ชิ้น",
        totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
      })) || []
    )
  }, [wo, wr, projects, wos, suppliers])

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `wo-item-${Date.now()}`,
        itemNo: prev.length + 1,
        description: "",
        quantity: 1,
        unitPrice: 0,
        estimatedPrice: 0,
        unit: "ชิ้น",
        totalPrice: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id)
      return filtered.map((item, i) => ({ ...item, itemNo: i + 1 }))
    })
  }

  const updateItem = (id: string, field: keyof WOItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.totalPrice = (updated.quantity || 0) * (updated.unitPrice || 0)
            if (field === "unitPrice") updated.estimatedPrice = value
          }
          return updated
        }
        return item
      })
    )
  }

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const handleSubmit = () => {
    if (status !== "ร่าง") {
      if (!traderId) return toast({ title: "กรุณาเลือก Trader", variant: "destructive" })
      if (!supplierId) return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })
      if (items.length === 0 || items.some(i => !i.description?.trim()))
        return toast({ title: "กรุณากรอกรายการสินค้าให้ครบ", variant: "destructive" })
    }

    if (Number(projectInfo.jobBalanceCost) < 0) {
      if (!window.confirm(`ยอดคงเหลือใน Job ติดลบ ${formatCurrency(projectInfo.jobBalanceCost)}\nยังต้องการบันทึกหรือไม่?`))
        return
    }

    const traderObj = clients.find(c => c.id === traderId) || traders.find(t => t.id === traderId)
    const supplierObj = suppliers.find(s => s.id === supplierId)

    const newHistory: WOHistory = {
      by: "ผู้ใช้ระบบ",
      action: status === "ร่าง" ? "บันทึกเป็นร่าง" : "แก้ไข WO",
      at: new Date().toISOString(),
    }

    const updatedWO: WorkOrder = {
      ...wo,
      trader: traderId,
      traderName: traderObj?.name || wo.traderName || "",
      supplier: supplierId,
      supplierName: supplierObj?.name || supplierName || "",
      deliveryLocation,
      deliveryDate,
      paymentTerms,
      remarks: notes,
      description,
      items,
      subtotal,
      vatRate,
      vatAmount,
      serviceTaxRate,
      serviceTaxAmount,
      totalAmount,
      status,
      updatedAt: new Date().toISOString(),
      history: [...(wo.history || []), newHistory],
      expteamQuotation: projectInfo.expteamQuotation || expteamQuotation || "",
      estimatedPrCost: projectInfo.estimatedPrCost || estimatedPrCost || "",
      jobBalanceCost: Number(projectInfo.jobBalanceCost),
    }

    try {
      updateWO(wo.id, updatedWO)
      toast({ title: "บันทึกสำเร็จ!", description: `WO: ${wo.woNumber || wo.orderNumber}` })
      router.push("/wo")
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกได้", variant: "destructive" })
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/wo">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Edit (WO)</h1>
                  <p className="text-sm text-blue-600 font-medium">
                    WO: {wo.woNumber || wo.orderNumber} | WR: {wr?.wrNumber || "-"}
                  </p>
                </div>
              </div>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-green-600">
                <Save className="h-4 w-4 mr-2" /> บันทึกการแก้ไข
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก */}
        <Card>
          <CardContent className="pt-6 space-y-8">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={projectInfo.projectName || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={projectInfo.department || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Requester</Label>
                <Input value={projectInfo.requestedBy || ""} readOnly />
              </div>
            </div>

            {/* วันที่ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Order Date</Label>
                <Input type="date" value={orderDate} readOnly />
              </div>
              <div className="space-y-2">
                <Label>วันที่ส่งมอบ</Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>จำนวนวัน</Label>
                <Input type="number" value={durationDays} readOnly />
              </div>
            </div>

            {/* Trader + Job + CC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Trader</Label>
                <Select value={traderId} onValueChange={setTraderId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="เลือก Trader" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- เลือก Trader --</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    {traders.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job No.</Label>
                <Input value={projectInfo.jobNumber || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>C.C No.</Label>
                <Input value={projectInfo.ccNo || ""} readOnly />
              </div>
            </div>

            {/* Expteam + Estimated + Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Expteam Quotation</Label>
                <Input value={expteamQuotation} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Estimated PR Cost</Label>
                <Input value={estimatedPrCost} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Job Balance Cost</Label>
                <Input value={formatCurrency(projectInfo.jobBalanceCost)} readOnly />
              </div>
            </div>

            {/* Supplier + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={supplierId} onValueChange={val => {
                  setSupplierId(val)
                  const s = suppliers.find(x => x.id === val)
                  setSupplierName(s?.name || "")
                }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="เลือก Supplier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- เลือก Supplier --</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select value={status} onValueChange={v => setStatus(v as any)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ร่าง">ร่าง</SelectItem>
                    <SelectItem value="รออนุมัติ">รออนุมัติ</SelectItem>
                    <SelectItem value="อนุมัติแล้ว">อนุมัติแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>สถานที่ส่งของ</Label>
                <Input value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)}
                  className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>เงื่อนไขการชำระเงิน</Label>
                <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="เช่น เครดิต 30 วัน"
                  className="h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>หมายเหตุ</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* รายการสินค้า */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>รายการสินค้า/งาน</CardTitle>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ลำดับ</TableHead>
                    <TableHead>รายการ</TableHead>
                    <TableHead className="w-24 text-center">จำนวน</TableHead>
                    <TableHead className="w-24 text-center">หน่วย</TableHead>
                    <TableHead className="w-32 text-right">ราคา/หน่วย</TableHead>
                    <TableHead className="w-32 text-right">รวม</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        ไม่มีรายการสินค้า
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.itemNo}</TableCell>
                        <TableCell>
                          <Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="text-center" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="text-center" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)} className="text-right" />
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t text-right space-y-3">
                <div className="flex justify-end gap-12 text-lg">
                  <span className="font-medium">ยอดรวม</span>
                  <span className="font-bold w-40">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3 rounded-lg bg-blue-50">
                  <span>VAT ({vatRate}%)</span>
                  <span className="font-bold text-blue-700 w-40">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-end gap-12 p-3 rounded-lg bg-purple-50">
                  <span>Service Tax ({serviceTaxRate}%)</span>
                  <span className="font-bold text-purple-700 w-40">{formatCurrency(serviceTaxAmount)}</span>
                </div>
                <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold text-blue-600">
                  <span>รวมทั้งสิ้น</span>
                  <span className="w-40">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}