"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Save, Building2, Briefcase, CreditCard, Calendar, Check, ChevronsUpDown } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, cn } from "@/src/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getDepartments } from '@/lib/storage'
import { differenceInDays, addDays } from "date-fns"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"

export default function EditPRPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const { getPR, updatePR, projects, clients, suppliers, pos } = useData()
  const pr = getPR(id as string)

  const [status, setStatus] = useState<"ร่าง" | "รออนุมัติ" | "อนุมัติแล้ว">("ร่าง")
  const [selectedProjectId, setSelectedProjectId] = useState("none")
  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [selectedClientId, setSelectedClientId] = useState("")
  const [departments, setDepartments] = useState<any[]>([])

  const [formData, setFormData] = useState({
    projectName: "",
    department: "",
    requestedBy: "",
    requestDate: "",
    requiredDate: "",
    duration: "",
    jobNo: "",
    traderId: "",
    traderName: "",
    ccNo: "",
    expteamQuotation: "",
    estimatedPrCost: "",
    jobBalanceCost: "",
    supplier: "",
    supplierName: "",
    deliveryLocation: "",
    remark: ""
  })

  const [items, setItems] = useState<any[]>([])

  // ดึงข้อมูลแผนก
  useEffect(() => {
    setDepartments(getDepartments())
  }, [])

  // โหลดข้อมูล PR ตอนเริ่ม
  useEffect(() => {
    if (!pr) return

    setStatus(pr.status || "ร่าง")
    setSelectedProjectId(pr.projectId || "none")
    setSelectedClientId(pr.traderId || "")
    setSelectedSupplierId(pr.supplier || "")

    setFormData({
      projectName: pr.projectName || "",
      department: pr.department || "",
      requestedBy: pr.requestedBy || "",
      requestDate: pr.requestDate || "",
      requiredDate: pr.requiredDate || "",
      duration: pr.duration?.toString() || "",
      jobNo: pr.jobNo || "",
      traderId: pr.traderId || "",
      traderName: pr.traderName || "",
      ccNo: pr.ccNo || "",
      expteamQuotation: pr.expteamQuotation || "",
      estimatedPrCost: pr.estimatedPrCost || "",
      jobBalanceCost: pr.jobBalanceCost || "",
      supplier: pr.supplier || "",
      supplierName: pr.supplierName || "",
      deliveryLocation: pr.deliveryLocation || "",
      remark: pr.remark || "",
    })

    setItems((pr.items || []).map((it: any, i: number) => ({
      id: it.id || `item-${i}`,
      itemNo: i + 1,
      description: it.description || "",
      quantity: it.quantity || 1,
      unit: it.unit || "ชิ้น",
      unitPrice: it.estimatedPrice || 0,
      total: (it.quantity || 1) * (it.estimatedPrice || 0)
    })))
  }, [pr])

  // คำนวณ Duration อัตโนมัติ
  useEffect(() => {
    if (formData.requestDate && formData.requiredDate) {
      const days = differenceInDays(new Date(formData.requiredDate), new Date(formData.requestDate))
      setFormData(prev => ({
        ...prev,
        duration: Math.max(0, days).toString()
      }))
    }
  }, [formData.requestDate, formData.requiredDate])

  // Auto fill จาก Project
  useEffect(() => {
    if (selectedProjectId !== "none") {
      const proj = projects.find(p => p.id === selectedProjectId)
      if (proj) {
        const traderClient = clients.find(c => c.id === proj.traderId)
        const supplierData = suppliers.find(s => s.id === proj.supplier)
        
        setFormData(prev => ({
          ...prev,
          projectName: proj.name || prev.projectName,
          jobNo: proj.jobNo || prev.jobNo,
          ccNo: proj.ccNo || prev.ccNo,
          traderId: proj.traderId || prev.traderId,
          traderName: traderClient?.name || prev.traderName,
          supplier: proj.supplier || prev.supplier,
          supplierName: supplierData?.name || prev.supplierName,
          expteamQuotation: proj.expteamQuotation || prev.expteamQuotation,
          estimatedPrCost: proj.estimatedCost || proj.prCost || prev.estimatedPrCost,
        }))
        
        setSelectedClientId(proj.traderId || "")
        setSelectedSupplierId(proj.supplier || "")
      }
    }
  }, [selectedProjectId, projects, clients, suppliers])

  // คำนวณ Job Balance Cost
  const calculatedJobBalanceCost = React.useMemo(() => {
    const selectedProjId = selectedProjectId !== "none" ? selectedProjectId : pr?.projectId
    if (!selectedProjId) return "0"
    const project = projects.find(p => p.id === selectedProjId)
    if (!project) return "0"
    const totalPO = pos
      .filter(p => p.projectId === selectedProjId && p.status !== "ยกเลิก")
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    const budget = Number(project.totalBudget) || Number(project.budget) || Number(project.estimatedCost) || 0
    return (budget - totalPO).toFixed(2)
  }, [selectedProjectId, pr?.projectId, projects, pos])

  // คำนวณยอดรวม
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat

  const handleSave = () => {
    if (!formData.projectName.trim()) {
      toast({ title: "กรุณากรอกชื่อโครงการ", variant: "destructive" })
      return
    }
    if (!formData.requestedBy.trim()) {
      toast({ title: "กรุณากรอกชื่อผู้ขอซื้อ", variant: "destructive" })
      return
    }
    if (items.length === 0 || items.some(i => !i.description.trim())) {
      toast({ title: "กรุณากรอกรายการสินค้าให้ครบ", variant: "destructive" })
      return
    }

    updatePR(id as string, {
      ...pr,
      ...formData,
      status,
      projectId: selectedProjectId !== "none" ? selectedProjectId : undefined,
      traderId: selectedClientId,
      supplier: selectedSupplierId,
      items: items.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        estimatedPrice: i.unitPrice,
      })),
      subtotal,
      totalAmount: total,
      updatedAt: new Date().toISOString(),
    })

    toast({ title: "แก้ไข PR สำเร็จ!" })
    router.push(`/pr/${id}`)
  }

  if (!pr) return <div className="p-8 text-center text-xl">ไม่พบข้อมูล PR</div>

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      itemNo: prev.length + 1,
      description: "",
      quantity: 1,
      unit: "ชิ้น",
      unitPrice: 0,
      total: 0
    }])
  }

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, itemNo: idx + 1 })))
  }

  const updateItem = (id: number, field: string, value: any) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0)
        }
        return updated
      }
      return i
    }))
  }

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function ClientCombobox() {
    const [query, setQuery] = useState("")
    const filteredClients = useMemo(() => {
      const activeClients = clients.filter(c => c.status === "active")
      if (!query.trim()) return activeClients
      return activeClients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    }, [clients, query])

    const selectedClient = clients.find(c => c.id === selectedClientId)

    return (
      <div className="relative">
        <Combobox
          value={selectedClientId}
          onChange={(v: string | null) => {
            setSelectedClientId(v ?? "")
            const selected = clients.find(c => c.id === v)
            if (selected) {
              updateForm("traderId", selected.id)
              updateForm("traderName", selected.name)
            }
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
              displayValue={() => selectedClient?.name || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เลือก Trader (ลูกค้า)"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredClients.length === 0 ? (
              <div className="px-4 py-2 text-slate-500">ไม่พบลูกค้า</div>
            ) : (
              filteredClients.map((client) => (
                <ComboboxOption
                  key={client.id}
                  value={client.id}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {client.name} {client.contactPerson && `(${client.contactPerson})`}
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

  function SupplierCombobox() {
    const [query, setQuery] = useState("")
    const filteredSuppliers = useMemo(() => {
      const activeSuppliers = suppliers.filter(s => s.status === "active")
      if (!query.trim()) return activeSuppliers
      return activeSuppliers.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    }, [suppliers, query])

    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId)

    return (
      <div className="relative">
        <Combobox
          value={selectedSupplierId}
          onChange={(v: string | null) => {
            setSelectedSupplierId(v ?? "")
            const selected = suppliers.find(s => s.id === v)
            if (selected) {
              updateForm("supplier", selected.id)
              updateForm("supplierName", selected.name)
            }
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
              displayValue={() => selectedSupplier?.name || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เลือก Supplier"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredSuppliers.length === 0 ? (
              <div className="px-4 py-2 text-slate-500">ไม่พบ Supplier</div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <ComboboxOption
                  key={supplier.id}
                  value={supplier.id}
                  className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-indigo-600 text-white" : "text-gray-900")}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn("block truncate", selected && "font-medium")}>
                        {supplier.name} {supplier.contactPerson && `(${supplier.contactPerson})`}
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full p-4 md:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href={`/pr/${id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Edit (PR)</h1>
                  <p className="text-lg text-blue-600 font-medium">{pr.prNumber}</p>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full md:w-auto bg-blue-600 hover:bg-green-600">
                <Save className="h-4 w-4 mr-2" /> บันทึกการแก้ไข
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* เลือกโครงการ */}
        <Card>
          <CardHeader className="">
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกโครงการ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">- ไม่ผูกโครงการ -</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.projectNumber} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* ฟอร์มหลัก */}
        <Card>
          <CardContent className="pt-6 space-y-8">

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Project Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.projectName}
                  onChange={e => updateForm("projectName", e.target.value)}
                  className="bg-slate-50"
                  placeholder="ชื่อโครงการ"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={v => updateForm("department", v)}>
                  <SelectTrigger className="h-10 text-sm w-full"><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Requester <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.requestedBy}
                  onChange={e => updateForm("requestedBy", e.target.value)}
                  placeholder="ชื่อผู้ขอซื้อ"
                />
              </div>
            </div>

            {/* Row 2 - วันที่ + Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Request date</Label>
                <Input
                  type="date"
                  value={formData.requestDate}
                  onChange={e => updateForm("requestDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>ROS date</Label>
                <Input
                  type="date"
                  value={formData.requiredDate}
                  onChange={e => updateForm("requiredDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (วัน)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={e => updateForm("duration", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Row 3 - Job No, Trader, C.C No */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Job No.</Label>
                <Input
                  value={formData.jobNo}
                  onChange={e => updateForm("jobNo", e.target.value)}
                  className="text-sm"
                  placeholder="เลขที่งาน"
                />
              </div>
              <div className="space-y-2">
                <Label>Trader (ลูกค้า) <span className="text-red-500">*</span></Label>
                <ClientCombobox />
              </div>
              <div className="space-y-2">
                <Label>C.C No.</Label>
                <Input
                  value={formData.ccNo}
                  onChange={e => updateForm("ccNo", e.target.value)}
                  className="text-sm"
                  placeholder="หมายเลข C.C"
                />
              </div>
            </div>

            {/* Row 4 - Expteam, Estimated, Job Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Expteam Quotation</Label>
                <Input
                  type="number"
                  value={formData.expteamQuotation}
                  onChange={e => updateForm("expteamQuotation", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated PR Cost</Label>
                <Input
                  type="number"
                  value={formData.estimatedPrCost}
                  onChange={e => updateForm("estimatedPrCost", e.target.value)}
                  className="font-bold text-green-700"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Balance Cost <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.jobBalanceCost || calculatedJobBalanceCost}
                  onChange={e => updateForm("jobBalanceCost", e.target.value)}
                  className="font-bold"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Supplier + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Supplier <span className="text-red-500">*</span></Label>
                <SupplierCombobox />
              </div>
              <div className="space-y-2">
                <Label>สถานะ <span className="text-red-500">*</span></Label>
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

            <div className="space-y-2">
              <Label>สถานที่ส่งของ</Label>
              <Input
                value={formData.deliveryLocation}
                onChange={e => updateForm("deliveryLocation", e.target.value)}
                className="h-10"
                placeholder="สถานที่ส่งของ"
              />
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label>หมายเหตุ</Label>
              <Textarea
                value={formData.remark}
                onChange={e => updateForm("remark", e.target.value)}
                rows={3}
                className="resize-none"
                placeholder="หมายเหตุเพิ่มเติม"
              />
            </div>
          </CardContent>
        </Card>

        {/* รายการสินค้า */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center gap-4">
              <CardTitle>รายการสินค้า</CardTitle>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
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
                    <TableHead className="min-w-48">รายการ</TableHead>
                    <TableHead className="w-24 text-center">จำนวน</TableHead>
                    <TableHead className="w-24 text-center">หน่วย</TableHead>
                    <TableHead className="w-32 text-right">ราคา/หน่วย</TableHead>
                    <TableHead className="w-32 text-right">รวม</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center whitespace-nowrap">{item.itemNo}</TableCell>
                      <TableCell className="min-w-48">
                        <Input
                          value={item.description}
                          onChange={e => updateItem(item.id, "description", e.target.value)}
                          className="text-sm"
                          placeholder="รายการสินค้า"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                          className="text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unit}
                          onChange={e => updateItem(item.id, "unit", e.target.value)}
                          className="text-center text-sm"
                          placeholder="ชิ้น"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                          className="text-right text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(item.total)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>ยังไม่มีรายการสินค้า กรุณาคลิก "เพิ่มรายการ" เพื่อเริ่มต้น</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-right space-y-3">
              <div className="flex justify-end gap-12 text-lg">
                <span className="font-medium">ยอดรวม</span>
                <span className="font-bold w-40 text-right">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-end gap-12 p-3 rounded-lg bg-blue-50">
                <span>VAT (7%)</span>
                <span className="font-bold text-blue-700 w-40 text-right">{formatCurrency(vat)}</span>
              </div>
              <div className="flex justify-end gap-12 pt-4 border-t text-2xl font-bold text-blue-600">
                <span>รวมทั้งสิ้น</span>
                <span className="w-40 text-right">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}