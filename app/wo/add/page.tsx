// app/wo/add/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
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
import { ArrowLeft, Plus, Trash2, Save, Building2, Briefcase, CreditCard, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { cn } from "@/lib/utils"
import { addDays, differenceInDays } from "date-fns"
import { Department } from "@/app/lib/types"
import { getDepartments } from "@/app/lib/storage"

interface WOItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unitPrice: number
  unit: string
  totalPrice: number
}

export default function CreateWOPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { wrs, addWO, wos, projects, clients, traders, suppliers } = useData()

  const [selectedWRId, setSelectedWRId] = useState("none")
  const [selectedWR, setSelectedWR] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    department: "",
    requestedBy: "",
    deliveryLocation: "",
    description: "",
    deliveryDate: "",
    paymentTerms: "เครดิต 30 วัน",
    notes: "",
    traderId: "",
    traderName: "",
    jobNumber: "",
    ccNo: "",
    projectName: "",
    expteamQuotation: "",
    estimatedPrCost: "",
  })

  const [items, setItems] = useState<WOItem[]>([])
  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)
  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">("ร่าง")
  const [supplierId, setSupplierId] = useState("")
  const [supplierName, setSupplierName] = useState("")


  // วันที่ + จำนวนวัน
  const today = new Date().toISOString().split("T")[0]
  const [orderDate] = useState(today) // วันที่สั่งซื้อ (วันนี้)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [durationDays, setDurationDays] = useState(0)

  const employees = [
    { id: 1, name: "สมชาย" },
    { id: 2, name: "สมนึก" },
    { id: 3, name: "สมหญิง" },
  ]

  const approvedWRs = wrs.filter(wr => wr.status === "อนุมัติแล้ว" && !wr.deleted)

  useEffect(() => {
    if (orderDate && deliveryDate) {
      const days = differenceInDays(new Date(deliveryDate), new Date(orderDate))
      if (days >= 0) setDurationDays(days)
    }
  }, [orderDate, deliveryDate])

  // เมื่อแก้จำนวนวัน → คำนวณวันที่ต้องการรับของใหม่
  const handleDurationChange = (days: number) => {
    setDurationDays(days)
    if (orderDate) {
      const newDate = addDays(new Date(orderDate), days)
      setDeliveryDate(newDate.toISOString().split("T")[0])
    }
  }
  // ดึงข้อมูลจาก WR
  useEffect(() => {
    if (selectedWRId && selectedWRId !== "none") {
      const wr = wrs.find(w => w.id === selectedWRId)
      if (!wr) return

      setSelectedWR(wr)
      if (wr.requiredDate) setDeliveryDate(wr.requiredDate)

      // ดึง Trader
      let traderId = ""
      let traderName = ""
      if (wr.clientId) {
        const client = clients.find(c => c.id === wr.clientId)
        traderId = wr.clientId
        traderName = client?.name || ""
      } else if (wr.projectId) {
        const project = projects.find(p => p.id === wr.projectId)
        if (project?.trader) {
          const trader = traders.find(t => t.id === project.trader)
          traderId = project.trader
          traderName = trader?.name || ""
        }
      }

      // ดึงข้อมูลโปรเจกต์
      let jobNumber = "", ccNo = "", projectName = ""
      if (wr.projectId) {
        const project = projects.find(p => p.id === wr.projectId)
        if (project) {
          jobNumber = project.jobNo || project.projectNumber || ""
          ccNo = project.ccNo || ""
          projectName = project.name || ""
        }
      }

      let finalSupplierId = "", finalSupplierName = ""
      if (wr.supplier) {
        const supplier = suppliers.find(s => s.id === wr.supplier)
        finalSupplierId = wr.supplier
        finalSupplierName = supplier?.name || wr.supplierName || wr.supplier
      }
      if (finalSupplierId) {
        setSupplierId(finalSupplierId)
        setSupplierName(finalSupplierName)
      }

      setFormData({
        title: wr.projectName || wr.purpose || "",
        assignedTo: "",
        department: wr.department || "",
        requestedBy: wr.requestedBy || "",
        deliveryLocation: wr.deliveryLocation || "",
        description: wr.remark || "",
        deliveryDate: wr.requiredDate || "",
        paymentTerms: "เครดิต 30 วัน",
        notes: wr.remark || "",
        traderId,
        traderName,
        jobNumber: jobNumber || wr.jobNumber || "",
        ccNo: ccNo || wr.ccNo || "",
        projectName: projectName || wr.projectName || "",
        expteamQuotation: wr.expteamQuotation || "",
        estimatedPrCost: wr.estimatedPrCost || "",
      })

      setVatRate(wr.vatRate || 7)
      setServiceTaxRate(wr.serviceTaxRate || 0)

      setItems(wr.items?.map((item, i) => ({
        id: `wo-item-${Date.now()}-${i}`,
        itemNo: i + 1,
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.estimatedPrice || 0,
        unit: item.unit || "ชิ้น",
        totalPrice: (item.quantity || 1) * (item.estimatedPrice || 0),
      })) || [])

    } else {
      // Reset
      setSelectedWR(null)
      setSupplierId("")
      setSupplierName("")
      setDeliveryDate("")
      setDurationDays(0)
      setFormData({
        title: "",
        department: "",
        requestedBy: "",
        assignedTo: "",
        deliveryLocation: "",
        description: "",
        deliveryDate: "",
        paymentTerms: "เครดิต 30 วัน",
        notes: "",
        traderId: "",
        traderName: "",
        jobNumber: "",
        ccNo: "",
        projectName: "",
        expteamQuotation: "",
        estimatedPrCost: "",
      })
      setItems([])
      setVatRate(7)
      setServiceTaxRate(0)
      setStatus("ร่าง")
    }
  }, [selectedWRId, wrs, projects, clients, traders])

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      id: `wo-item-${Date.now()}`,
      itemNo: prev.length + 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
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

  const updateItem = (id: string, field: keyof WOItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = (updated.quantity || 0) * (updated.unitPrice || 0)
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
  const jobBalanceCost = (parseFloat(formData.expteamQuotation) || 0) - (parseFloat(formData.estimatedPrCost) || 0)

  const handleSubmit = () => {
    if (!supplierId || supplierId === "none") return toast({ title: "กรุณาเลือก Supplier", variant: "destructive" })
    if (selectedWRId === "none") {
      toast({ title: "กรุณาเลือก WR", variant: "destructive" })
      return
    }
    if (!formData.title.trim()) {
      toast({ title: "กรุณากรอกชื่อคำสั่งงาน", variant: "destructive" })
      return
    }
    if (items.length === 0 || items.some(i => !i.description?.trim())) {
      toast({ title: "กรุณากรอกรายการงานให้ครบ", variant: "destructive" })
      return
    }

    const woCount = wos.filter(wo => !wo.deleted).length + 1
    const woNumber = `WO${new Date().getFullYear()}${String(woCount).padStart(4, "0")}`
    const supplierObj = suppliers.find(s => s.id === supplierId)

    const newWO = {
      id: `wo-${Date.now()}`,
      orderNumber: woNumber,
      workRequestId: selectedWRId,
      wrNumber: selectedWR?.wrNumber || "",
      projectId: selectedWR?.projectId || "",
      projectName: formData.projectName || formData.title,
      department: formData.department || "",
      requestedBy: formData.requestedBy || "",
      jobNumber: formData.jobNumber,
      ccNo: formData.ccNo,
      supplier: supplierId,
      supplierName: supplierObj?.name || supplierName,
      title: formData.title.trim(),
      assignedTo: Number(formData.assignedTo),
      totalCost: totalAmount,
      status,
      items,
      description: formData.description,
      deliveryLocation: formData.deliveryLocation,
      orderDate,
      deliveryDate,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      subtotal,
      vatRate,
      vatAmount,
      serviceTaxRate,
      serviceTaxAmount,
      totalAmount,
      traderId: formData.traderId,
      traderName: formData.traderName,
      expteamQuotation: formData.expteamQuotation,
      estimatedPrCost: formData.estimatedPrCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addWO(newWO)
    toast({
      title: `สร้าง WO สำเร็จ! สถานะ: ${status}`,
      description: woNumber
    })
    router.push("/wo")
  }

  const [departments, setDepartments] = useState<Department[]>([])
  useEffect(() => {
    setDepartments(getDepartments())
  }, [])

  // Combobox สำหรับ Trader
  function TraderCombobox() {
    const [query, setQuery] = useState("")
    const filtered = useMemo(() => {
      if (!query.trim()) return clients.filter(c => c.status === "active")
      return clients
        .filter(c => c.status === "active")
        .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    }, [clients, query])

    return (
      <div className="relative">
        <Combobox
          value={formData.traderId}
          onChange={(v: string | null) => {
            const selected = clients.find(c => c.id === v)
            updateForm("traderId", v ?? "")
            updateForm("traderName", selected?.name ?? "")
          }}
          nullable
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <ComboboxInput
              className={cn(
                "pl-10 pr-10 w-full h-10 rounded-md border border-input bg-background text-sm",
                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                "placeholder:text-slate-400"
              )}
              displayValue={(id: string) => clients.find(c => c.id === id)?.name ?? formData.traderName}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เลือก Trader"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-slate-500">ไม่พบ Trader</div>
            ) : (
              filtered.map((client) => (
                <ComboboxOption
                  key={client.id}
                  value={client.id}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {client.name}
                      </span>
                      {selected && (
                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", active ? "text-white" : "text-indigo-600")}>
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 max-w-full">

        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 md:p-8 border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/wo">
                <Button variant="outline" size="sm" className="mt-3.5">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">Increase (WO)</h1>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">ดึงข้อมูลจาก WR ที่อนุมัติแล้ว</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
              <Button variant="outline"
                onClick={() => { setStatus("ร่าง"); handleSubmit(); }}
                className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-600 hover:text-white">
                <Save className="h-4 w-4 mr-1 sm:mr-2" /> บันทึกร่าง
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
                บันทึก
              </Button>
            </div>
          </div>
        </div>

        {/* Select WR */}
        <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">กรุณาเลือก WR</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              มี WR ที่อนุมัติแล้ว <span className="font-semibold text-blue-600">{approvedWRs.length}</span> รายการ
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={selectedWRId} onValueChange={setSelectedWRId}>
              <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="เลือก WR ที่อนุมัติแล้ว" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" >เลือก WR ที่อนุมัติแล้ว</SelectItem>
                {approvedWRs.map(wr => (
                  <SelectItem key={wr.id} value={wr.id}>
                    {wr.wrNumber} - {wr.projectName || wr.purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Main Form - เหมือน PO */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={formData.projectName} onChange={e => updateForm("projectName", e.target.value)} placeholder="Project Name" className="h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department} onValueChange={(v) => updateForm("department", v)}>
                <SelectTrigger className="h-10 text-sm w-full"><SelectValue placeholder="department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requester</Label>
              <Input value={formData.requestedBy} onChange={e => updateForm("requestedBy", e.target.value)} placeholder="ชื่อ-สกุล" className="h-10 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>วันที่สั่งซื้อ</Label>
              <Input type="date" value={orderDate} readOnly />
            </div>
            <div className="space-y-2">
              <Label>วันที่ต้องการรับของ <span className="text-xs text-green-600"></span></Label>
              <Input type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Duration <span className="text-xs text-green-600"></span></Label>
              <Input
                type="number"
                value={durationDays}
                onChange={e => handleDurationChange(Number(e.target.value) || 0)}
                className="h-10"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Trader</Label>
              <TraderCombobox />
            </div>
            <div className="space-y-2">
              <Label>Job No.</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 h-10 flex items-center text-slate-400" />
                <Input
                  value={formData.jobNumber} readOnly
                  className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>C.C. No.</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 h-10 flex items-center text-slate-400" />
                <Input
                  value={formData.ccNo} readOnly
                  className="h-10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Expteam Quotation</Label>
              <Input
                value={formData.expteamQuotation} readOnly
                className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Estimated PR Cost</Label>
              <Input
                value={formData.estimatedPrCost} readOnly
                className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Job Balance Cost</Label>
              <Input
                value={jobBalanceCost >= 0 ? jobBalanceCost.toLocaleString() : "0"} readOnly
                className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs md:text-sm font-medium">Supplier (ผู้ขาย) <span className="text-red-500">*</span></Label>
              <Select value={supplierId} onValueChange={(val) => {
                setSupplierId(val)
                const supplier = suppliers.find(s => s.id === val)
                setSupplierName(supplier?.name || "")
              }}>
                <SelectTrigger className="h-10 text-xs sm:text-sm w-full">
                  <SelectValue>
                    {supplierId && supplierId !== "none"
                      ? (suppliers.find(s => s.id === supplierId)?.name || "ไม่พบ Supplier")
                      : "เลือก Supplier"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- เลือก Supplier --</SelectItem>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-1">
              <Label>สถานะ</Label>
              <Select value={status} onValueChange={v => setStatus(v as any)}>
                <SelectTrigger className="h-10 text-sm w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ร่าง">ร่าง</SelectItem>
                  <SelectItem value="รออนุมัติ">รออนุมัติ</SelectItem>
                  <SelectItem value="อนุมัติแล้ว">อนุมัติแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>สถานที่ส่งของ</Label>
              <Input
                value={formData.deliveryLocation}
                onChange={e => updateForm("deliveryLocation", e.target.value)}
                placeholder="สถานที่ส่งของ"
                className="h-10 font-sm" />
            </div>
            <div className="space-y-2">
              <Label>เงื่อนไขการชำระเงิน</Label>
              <Input
                value={formData.paymentTerms}
                onChange={e => updateForm("paymentTerms", e.target.value)}
                placeholder="เครดิต 30 วัน"
                className="h-10 text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              value={formData.notes}
              onChange={e => updateForm("notes", e.target.value)} rows={2}
              className="text-sm resize-none" 
              placeholder="หมายเหตุเพิ่มติม..."/>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">รายการงาน</h2>
            <Button onClick={addItem} size="sm" className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการ
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ลำดับ</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="w-20 text-center">จำนวน</TableHead>
                  <TableHead className="w-28 text-right">ราคา/หน่วย</TableHead>
                  <TableHead className="w-20 text-center">หน่วย</TableHead>
                  <TableHead className="w-28 text-right">รวม</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemNo}</TableCell>
                    <TableCell>
                      <Input value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, "quantity", Number(e.target.value))}
                        className="h-9 text-sm text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        className="h-9 text-sm text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input value={item.unit}
                        onChange={e => updateItem(item.id, "unit", e.target.value)}
                        className="h-9 text-sm text-center"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-8 items-center">
              <span className="text-sm">ยอดรวม</span>
              <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-sm">VAT (%)</span>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm" />
              <span className="font-medium w-32">{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-end gap-8 items-center">
              <span className="text-sm">Service Tax (%)</span>
              <input
                type="number"
                value={serviceTaxRate}
                onChange={e => setServiceTaxRate(Number(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right text-sm" />
              <span className="font-medium w-32">{formatCurrency(serviceTaxAmount)}</span>
            </div>
            <div className="flex justify-end gap-8 items-center pt-2 border-t">
              <span className="text-lg font-bold">รวมทั้งสิ้น</span>
              <span className="text-xl font-bold text-blue-600 w-32">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}