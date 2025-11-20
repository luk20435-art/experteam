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
import { addDays, differenceInDays } from "date-fns"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import type { PurchaseRequisition, PurchaseOrder, POItem } from "@/src/types"
import { useToast } from "@/hooks/use-toast"

// Helper แปลง number → string อย่างปลอดภัย
const toStr = (val: string | number | null | undefined): string => String(val ?? "")

export default function CreatePOPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { prs, addPO, pos, projects, traders, clients, suppliers } = useData()

  const [selectedPRId, setSelectedPRId] = useState("")
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null)

  const [traderId, setTraderId] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<POItem[]>([])

  const today = new Date().toISOString().split("T")[0]
  const [orderDate] = useState(today)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [durationDays, setDurationDays] = useState(0)

  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">("รออนุมัติ")

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

  const approvedPRs = prs.filter(pr => pr.status === "อนุมัติแล้ว" && !pr.deleted)

  // คำนวณจำนวนวันอัตโนมัติ
  useEffect(() => {
    if (orderDate && deliveryDate) {
      const days = differenceInDays(new Date(deliveryDate), new Date(orderDate))
      if (days >= 0) setDurationDays(days)
    }
  }, [orderDate, deliveryDate])

  // แก้จำนวนวัน → ปรับวันที่ส่งของ
  const handleDurationChange = (days: number) => {
    setDurationDays(days)
    if (orderDate && days >= 0) {
      const newDate = addDays(new Date(orderDate), days)
      setDeliveryDate(newDate.toISOString().split("T")[0])
    }
  }

  // เมื่อเลือก PR — ใช้ dependency แค่ selectedPRId เท่านั้น (warning หาย!)
  useEffect(() => {
    if (!selectedPRId || selectedPRId === "none") {
      setSelectedPR(null)
      setTraderId("")
      setSupplierId("")
      setSupplierName("")
      setDeliveryLocation("")
      setDescription("")
      setItems([])
      setDeliveryDate("")
      setDurationDays(0)
      setPaymentTerms("")
      setNotes("")
      setVatRate(7)
      setServiceTaxRate(0)
      setStatus("รออนุมัติ")
      setProjectInfo({
        jobNumber: "", traderName: "", ccNo: "", projectName: "", expteamQuotation: "",
        estimatedPrCost: "", jobBalanceCost: "0", requestedBy: "", department: ""
      })
      return
    }

    const pr = prs.find(p => p.id === selectedPRId)
    if (!pr) return
    setSelectedPR(pr)

    setDescription(pr.projectName || pr.purpose || "")
    setDeliveryLocation(pr.deliveryLocation || "")
    setNotes(pr.remark || "")
    setVatRate(pr.vatRate || 7)
    setServiceTaxRate(pr.serviceTaxRate || 0)
    setPaymentTerms(pr.paymentTerms || "เครดิต 30 วัน")
    if (pr.requiredDate) setDeliveryDate(pr.requiredDate)

    // Trader
    if (pr.clientId) setTraderId(pr.clientId)
    else if (pr.trader) setTraderId(pr.trader)

    // Supplier
    if (pr.supplier) {
      setSupplierId(pr.supplier)
      const sup = suppliers.find(s => s.id === pr.supplier)
      setSupplierName(sup?.name || pr.supplierName || "")
    }

    // Project Info + Balance
    let jobNo = pr.jobNo || ""
    let ccNo = pr.ccNo || ""
    let expteam = toStr(pr.expteamQuotation)
    let estimated = toStr(pr.estimatedPrCost)

    if (pr.projectId) {
      const project = projects.find(p => p.id === pr.projectId)
      if (project) {
        jobNo = jobNo || project.jobNo || project.projectNumber || ""
        ccNo = ccNo || project.ccNo || ""
        expteam = expteam || toStr(project.expteamQuotation)
        estimated = estimated || toStr(project.estimatedCost)

        const totalPOAmount = pos
          .filter(po => po.projectId === pr.projectId && po.status !== "ยกเลิก")
          .reduce((sum, po) => sum + (po.totalAmount || 0), 0)
        const totalBudget = Number(project.budget ?? project.estimatedCost ?? 0)
        const balance = (totalBudget - totalPOAmount).toFixed(2)

        setProjectInfo({
          jobNumber: jobNo,
          ccNo: ccNo,
          projectName: pr.projectName || project.name || "",
          traderName: pr.traderName || "",
          expteamQuotation: expteam,
          estimatedPrCost: estimated,
          jobBalanceCost: balance,
          requestedBy: pr.requestedBy || "",
          department: pr.department || "",
        })
      }
    } else {
      setProjectInfo({
        jobNumber: jobNo,
        ccNo: ccNo,
        projectName: pr.projectName || "",
        traderName: pr.traderName || "",
        expteamQuotation: expteam,
        estimatedPrCost: estimated,
        jobBalanceCost: "0",
        requestedBy: pr.requestedBy || "",
        department: pr.department || "",
      })
    }

    // Items จาก PR
    setItems(pr.items?.map((item, i) => ({
      id: `po-item-${Date.now()}-${i}`,
      itemNo: i + 1,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.estimatedPrice || 0,
      estimatedPrice: item.estimatedPrice || 0,
      unit: item.unit || "ชิ้น",
      totalPrice: (item.quantity || 1) * (item.estimatedPrice || 0),
    })) || [])

  }, [selectedPRId]) // ← แก้ตรงนี้แล้ว warning หายหมด!

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

  const handleSubmit = (asDraft: boolean = false) => {
    if (!asDraft) {
      setStatus("รออนุมัติ")
      if (!traderId || traderId === "none") return toast({ title: "กรุณาเลือก Trader", variant: "destructive" })
      if (!supplierId || supplierId === "none") return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })
      if (items.length === 0 || items.some(i => !i.description?.trim())) return toast({ title: "กรุณากรอกรายการสินค้าให้ครบ", variant: "destructive" })
    } else {
      setStatus("ร่าง")
    }

    if (Number(projectInfo.jobBalanceCost) < 0 && !asDraft) {
      if (!window.confirm(`ยอดคงเหลือใน Job ติดลบ ${formatCurrency(projectInfo.jobBalanceCost)}\nยังต้องการสร้าง PO หรือไม่?`)) return
    }

    const poCount = pos.length + 1
    const poNumber = `PO${new Date().getFullYear()}${String(poCount).padStart(4, "0")}`

    const traderObj = clients.find(c => c.id === traderId) || traders.find(t => t.id === traderId)
    const supplierObj = suppliers.find(s => s.id === supplierId)

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      prId: selectedPRId !== "none" ? selectedPRId : "",
      prNumber: selectedPR?.prNumber || "",
      projectId: selectedPR?.projectId || "",
      projectName: projectInfo.projectName || description,
      jobNumber: projectInfo.jobNumber,
      trader: traderId,
      traderName: traderObj?.name || projectInfo.traderName || "",
      supplier: supplierId,
      supplierName: supplierObj?.name || supplierName || "",
      ccNo: projectInfo.ccNo,
      expteamQuotation: projectInfo.expteamQuotation || "",
      estimatedPrCost: projectInfo.estimatedPrCost || "",
      jobBalanceCost: Number(projectInfo.jobBalanceCost),
      deliveryLocation,
      orderDate,
      deliveryDate: deliveryDate || orderDate,
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
      remarks: notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    }

    addPO(newPO)
    toast({
      title: asDraft ? "บันทึกร่างสำเร็จ!" : "สร้าง PO สำเร็จ!",
      description: `${poNumber} • สถานะ: ${status}`
    })
    router.push("/po")
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">

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
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">สร้าง PO ใหม่</h1>
                  <p className="text-lg text-blue-600 font-medium">Purchase Order</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSubmit(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Save className="h-4 w-4 mr-2" /> บันทึกร่าง
                </Button>
                <Button onClick={() => handleSubmit(false)} className="bg-blue-600 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" /> สร้าง PO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* เลือก PR */}
        <Card>
          <CardHeader>
            <CardTitle>เลือก PR ที่อนุมัติแล้ว</CardTitle>
            <p className="text-sm text-muted-foreground">มี {approvedPRs.length} รายการ</p>
          </CardHeader>
          <CardContent>
            <Select value={selectedPRId} onValueChange={setSelectedPRId}>
              <SelectTrigger><SelectValue placeholder="กรุณาเลือก PR (หรือสร้างว่าง)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- สร้าง PO ว่าง --</SelectItem>
                {approvedPRs.map(pr => (
                  <SelectItem key={pr.id} value={pr.id}>
                    {pr.prNumber} - {pr.projectName || pr.purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก */}
        <Card>
          <CardContent className="pt-6 space-y-8">

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={projectInfo.projectName || ""} readOnly
                  placeholder="Project Name" />
              </div>
              <div className="space-y-2">
                <Label>Requester</Label>
                <Input value={projectInfo.requestedBy || ""} readOnly
                  placeholder="Requester" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={projectInfo.department || ""} readOnly
                  placeholder="Department" />
              </div>
            </div>

            {/* วันที่ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Order Date</Label>
                <Input type="date" value={orderDate} readOnly />
              </div>
              <div className="space-y-2">
                <Label>ROS date</Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input type="number" value={durationDays} onChange={e => handleDurationChange(Number(e.target.value) || 0)} />
              </div>
            </div>

            {/* Trader + Job + CC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Trader <span className="text-red-500">*</span></Label>
                <Select value={traderId} onValueChange={setTraderId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="เลือก Trader" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- เลือก Trader --</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} (ลูกค้า)</SelectItem>)}
                    {traders.map(t => <SelectItem key={t.id} value={t.id}>{t.name} (Trader)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job No.</Label>
                <Input value={projectInfo.jobNumber || ""} readOnly
                  placeholder="Job No." />
              </div>
              <div className="space-y-2">
                <Label>C.C No.</Label>
                <Input value={projectInfo.ccNo || ""} readOnly
                  placeholder="cc No." />
              </div>
            </div>

            {/* Expteam + Estimated + Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Expteam Quotation</Label>
                <Input value={projectInfo.expteamQuotation || ""} readOnly
                  placeholder="Expteam Quotation" />
              </div>
              <div className="space-y-2">
                <Label>Estimated PR Cost</Label>
                <Input value={projectInfo.estimatedPrCost || ""} readOnly
                  placeholder="Estimated PR Cost" />
              </div>
              <div className="space-y-2">
                <Label>Job Balance Cost</Label>
                <Input value={formatCurrency(projectInfo.jobBalanceCost)} readOnly />
              </div>
            </div>

            {/* Supplier + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Supplier <span className="text-red-500">*</span></Label>
                <Select value={supplierId} onValueChange={val => { setSupplierId(val); const s = suppliers.find(x => x.id === val); setSupplierName(s?.name || "") }}>
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
                <Input value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>เงื่อนไขการชำระเงิน</Label>
                <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="เช่น เครดิต 30 วัน" />
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
              <CardTitle>รายการสินค้า</CardTitle>
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
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted/Alphaforegound">กรุณาเลือก PR หรือเพิ่มรายการสินค้า</TableCell></TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.itemNo}</TableCell>
                        <TableCell><Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} /></TableCell>
                        <TableCell><Input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="text-center" /></TableCell>
                        <TableCell><Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="text-center" /></TableCell>
                        <TableCell><Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)} className="text-right" /></TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t text-right space-y-3">
                <div className="flex justify-end gap-12 text-lg"><span className="font-medium">ยอดรวม</span><span className="font-bold w-40">{formatCurrency(subtotal)}</span></div>
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