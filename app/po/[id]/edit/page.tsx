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
import type { PurchaseRequisition, PurchaseOrder, POItem, POHistory } from "@/src/types" // แก้ชื่อเป็น POHistory
import { useToast } from "@/hooks/use-toast"
import React from "react"

// Helper แปลง number → string อย่างปลอดภัย
const toStr = (val: string | number | null | undefined): string => String(val ?? "")

export default function EditPOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getPO, updatePO, prs, pos, projects, traders, clients, suppliers } = useData()

  const po = getPO(id)
  const pr = po?.prId ? prs.find(p => p.id === po.prId) : null

  const [traderId, setTraderId] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [description, setDescription] = useState("")
  const [expteamQuotation, setExpteamQuotation] = useState("")
  const [estimatedPrCost, setEstimatedPrCost] = useState("")
  const [items, setItems] = useState<POItem[]>([])

  const today = new Date().toISOString().split("T")[0]
  const [orderDate] = useState(today)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [durationDays, setDurationDays] = useState(0)

  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">("ร่าง")

  const [projectInfo, setProjectInfo] = useState({
    jobNumber: "",
    traderName: "",
    ccNo: "",
    projectName: "",
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "0", // ต้องเป็น string เท่านั้น
    requestedBy: "",
    department: "",
  })

  useEffect(() => {
    if (!po) return

    setStatus((po.status as any) || "ร่าง")

    // ดึงข้อมูลจาก PR เป็นหลัก
    if (pr) {
      setTraderId(pr.traderId || po.trader || "")
      setSupplierId(pr.supplier || po.supplier || "")
      const supplierData = suppliers.find(s => s.id === pr.supplier)
      setSupplierName(supplierData?.name || pr.supplierName || "")
      setDeliveryLocation(pr.deliveryLocation || po.deliveryLocation || "")
      setDeliveryDate(pr.requiredDate || po.deliveryDate || "")
      setDurationDays(Number(pr.duration) || 0)
      setPaymentTerms(po.paymentTerms || "")
      setNotes(po.remarks || "")
      setVatRate(po.vatRate || 7)
      setServiceTaxRate(po.serviceTaxRate || 0)
      setDescription(po.description || "")
      // แปลงเป็น string ทุกครั้ง
      setExpteamQuotation(toStr(po.expteamQuotation))
      setEstimatedPrCost(toStr(po.estimatedPrCost))

      const projectId = pr.projectId
      if (projectId) {
        const project = projects.find(p => p.id === projectId)
        if (project) {
          const totalPOAmount = pos
            .filter(p => p.projectId === projectId && p.status !== "ยกเลิก")
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0)
          const totalBudget = Number(project.budget ?? project.estimatedCost ?? 0)
          const balance = (totalBudget - totalPOAmount).toFixed(2)

          setProjectInfo({
            jobNumber: pr.jobNo || project.jobNo || project.projectNumber || "",
            ccNo: pr.ccNo || project.ccNo || "",
            projectName: pr.projectName || project.name || "",
            traderName: pr.traderName || "",
            expteamQuotation: toStr(pr.expteamQuotation || project.expteamQuotation),
            estimatedPrCost: toStr(pr.estimatedPrCost || project.estimatedPrCost),
            jobBalanceCost: balance, // string จาก .toFixed(2)
            requestedBy: pr.requestedBy || "",
            department: pr.department || "",
          })
        }
      } else {
        setProjectInfo(prev => ({
          ...prev,
          jobNumber: pr.jobNo || "",
          ccNo: pr.ccNo || "",
          projectName: pr.projectName || "",
          traderName: pr.traderName || "",
          expteamQuotation: toStr(pr.expteamQuotation),
          estimatedPrCost: toStr(pr.estimatedPrCost),
          jobBalanceCost: "0",
          requestedBy: pr.requestedBy || "",
          department: pr.department || "",
        }))
      }
    } else {
      // กรณีไม่มี PR
      if (po.projectId) {
        const project = projects.find(p => p.id === po.projectId)
        if (project) {
          const totalPOAmount = pos
            .filter(p => p.projectId === po.projectId && p.status !== "ยกเลิก")
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0)
          const totalBudget = Number(project.budget ?? project.estimatedCost ?? 0)
          const balance = (totalBudget - totalPOAmount).toFixed(2)

          setProjectInfo({
            jobNumber: po.jobNo || project.jobNo || project.projectNumber || "",
            ccNo: po.ccNo || project.ccNo || "",
            projectName: po.projectName || project.name || "",
            traderName: po.traderName || "",
            expteamQuotation: toStr(po.expteamQuotation || project.expteamQuotation),
            estimatedPrCost: toStr(po.estimatedPrCost || project.estimatedCost),
            jobBalanceCost: balance,
            requestedBy: "",
            department: "",
          })
        }
      } else {
        setProjectInfo({
          jobNumber: po.jobNo || "",
          ccNo: po.ccNo || "",
          projectName: po.projectName || "",
          traderName: po.traderName || "",
          expteamQuotation: toStr(po.expteamQuotation),
          estimatedPrCost: toStr(po.estimatedPrCost),
          jobBalanceCost: "0",
          requestedBy: "",
          department: "",
        })
      }
    }

    // Items
    setItems(po.items?.map((item, i) => ({
      id: `po-item-${Date.now()}-${i}`,
      itemNo: i + 1,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      estimatedPrice: item.estimatedPrice || item.unitPrice || 0,
      unit: item.unit || "ชิ้น",
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
    })) || [])
  }, [po, pr, projects, pos, suppliers])

  // ถ้าไม่มี PO
  if (!po) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">ไม่พบข้อมูล PO</h2>
        <Link href="/po">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">กลับไปหน้ารายการ PO</Button>
        </Link>
      </div>
    )
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `po-item-${Date.now()}`,
      itemNo: prev.length + 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
      estimatedPrice: 0,
      unit: "ชิ้น",
      totalPrice: 0,
    }])
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id)
      return filtered.map((item, i) => ({ ...item, itemNo: i + 1 }))
    })
  }

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = (updated.quantity || 0) * (updated.unitPrice || 0)
          if (field === "unitPrice") updated.estimatedPrice = value
        }
        return updated
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const handleSubmit = async () => {
    if (status !== "ร่าง") {
      if (!traderId) return toast({ title: "กรุณาเลือก Trader", variant: "destructive" })
      if (!supplierId) return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })
      if (items.length === 0 || items.some(i => !i.description?.trim())) return toast({ title: "กรุณากรอกรายการสินค้าให้ครบ", variant: "destructive" })
    }

    // เช็ค Job Balance
    if (Number(projectInfo.jobBalanceCost) < 0) {
      if (!window.confirm(`ยอดคงเหลือใน Job ติดลบ ${formatCurrency(projectInfo.jobBalanceCost)}\nยังต้องการบันทึกหรือไม่?`)) return
    }

    const traderObj = clients.find(c => c.id === traderId) || traders.find(t => t.id === traderId)
    const supplierObj = suppliers.find(s => s.id === supplierId)

    const newHistory: POHistory = {
      by: "ผู้ใช้ระบบ",
      action: status === "ร่าง" ? "บันทึกเป็นร่าง" : "แก้ไข PO",
      at: new Date().toISOString(),
    }

    const updatedPO: PurchaseOrder = {
      ...po,
      trader: traderId,
      traderName: traderObj?.name || po.traderName || "",
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
      history: [...(po.history || []), newHistory],
      expteamQuotation: projectInfo.expteamQuotation || expteamQuotation || "",
      estimatedPrCost: projectInfo.estimatedPrCost || estimatedPrCost || "",
      jobBalanceCost: Number(projectInfo.jobBalanceCost), // บันทึกเป็น number กลับไป (ถ้า backend ต้องการ)
    }

    try {
      updatePO(po.id, updatedPO)
      toast({ title: "บันทึกสำเร็จ!", description: `PO: ${po.poNumber}` })
      router.push("/po")
    } catch (err) {
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
                <Link href="/po">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Edit (PO)</h1>
                  <p className="text-lg text-blue-600 font-medium">PO: {po.poNumber} | PR: {po.prNumber || "-"}</p>
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
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={projectInfo.projectName} readOnly />
              </div>
              <div className="space-y-2">
                <Label>ผู้ขอซื้อ</Label>
                <Input value={projectInfo.requestedBy} readOnly />
              </div>
              <div className="space-y-2">
                <Label>แผนก</Label>
                <Input value={projectInfo.department} readOnly />
              </div>
            </div>

            {/* Row 2 - วันที่ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Order date</Label>
                <Input type="date" value={orderDate} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Date of receipt</Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>number of days</Label>
                <Input type="number" value={durationDays} readOnly />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Trader<span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                  <Select value={traderId} onValueChange={setTraderId}>
                    <SelectTrigger className="pl-10 w-full"><SelectValue placeholder="เลือก Trader" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- เลือก Trader --</SelectItem>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      {traders.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job No.</Label>
                <Input value={projectInfo.jobNumber} readOnly />
              </div>
              <div className="space-y-2">
                <Label>C.C No.</Label>
                <Input value={projectInfo.ccNo} readOnly />
              </div>
            </div>

            {/* Row 4 - Expteam, Estimated, Job Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Expteam Quotation</Label>
                <Input type="number" value={expteamQuotation} onChange={e => setExpteamQuotation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estimated PR Cost</Label>
                <Input type="number" value={estimatedPrCost} onChange={e => setEstimatedPrCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Job Balance Cost</Label>
                <Input value={formatCurrency(projectInfo.jobBalanceCost)} readOnly />
              </div>
            </div>

            {/* Supplier + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Supplier<span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                  <Select value={supplierId} onValueChange={val => {
                    setSupplierId(val)
                    const s = suppliers.find(x => x.id === val)
                    setSupplierName(s?.name || "")
                  }}>
                    <SelectTrigger className="pl-10 w-full"><SelectValue placeholder="เลือก Supplier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- เลือก Supplier --</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>สถานะ <span className="text-red-500">*</span></Label>
                <Select value={status} onValueChange={v => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>สถานที่ส่งของ</Label>
                <Input value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>เงื่อนไขการชำระเงิน</Label>
                <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="เช่น เครดิต 30 วัน" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>หมายเหตุ</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="resize-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* รายการสินค้า */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>รายการสินค้า</CardTitle>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table เนื้อหาเหมือนเดิม */}
            {/* ... (ไม่เปลี่ยนแปลงส่วนนี้) ... */}
            <div className="overflow-x-auto">
              <Table>
                {/* ... ย่อส่วนนี้เพื่อความสั้น ... */}
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
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ไม่มีรายการสินค้า</TableCell></TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.itemNo}</TableCell>
                        <TableCell><Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} /></TableCell>
                        <TableCell><Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="text-center" /></TableCell>
                        <TableCell><Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="text-center" /></TableCell>
                        <TableCell><Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)} className="text-right" /></TableCell>
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