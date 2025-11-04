"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, ChevronDown, FileText, DollarSign, Calendar, Package, User, AlertCircle } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import type { PRItem, PurchaseRequisition } from "@/src/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import SupplierCombobox from "@/components/ui/SupplierCombobox"
import JobNumberCombobox from "@/components/ui/jobNumberCombobox"

export default function NewPRPage() {
  const router = useRouter()
  const { addPR, prs } = useData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    requestedBy: "",
    requestDate: new Date().toISOString().split("T")[0],
    requiredDate: "",
    purpose: "",
    poNo: "",
    relatedPrNo: "",
    paymentType: "cash",
    creditDays: "30",
    date: "",
    rosDate: "",
    leadTime: "",
    jobNumber: "",
    jobName: "",
    jobNote: "",
    projectName: "",
    client: "",
    ccNo: "",
    supplier: "",
    currency: "THB",
    discountType: "",
    discountValue: "",
    withHoldingTax: false,
    vat: "",
    poCost: 0,
    estimatedTotalJobCost: 0,
    jobBalanceCost: 0,
    deliveryLocation: "",
    purchaseBy: "admin_expertteam admin",
    remark: "",
  })

  const [items, setItems] = useState<PRItem[]>([
    {
      id: "1",
      itemNo: 1,
      description: "",
      quantity: 1,
      unit: "",
      estimatedPrice: 0,
      totalPrice: 0,
    },
  ])

  const [vatRate, setVatRate] = useState(7)
  const [serviceTaxRate, setServiceTaxRate] = useState(0)

  const addItem = () => {
    const newItem: PRItem = {
      id: String(items.length + 1),
      itemNo: items.length + 1,
      description: "",
      quantity: 1,
      unit: "",
      estimatedPrice: 0,
      totalPrice: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof PRItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
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

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const vatAmount = (subtotal * vatRate) / 100
  const serviceTaxAmount = (subtotal * serviceTaxRate) / 100
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const handleSave = (status: "draft" | "submitted") => {
    console.log("[v0] Saving PR with status:", status)
    console.log("[v0] Form data:", formData)
    console.log("[v0] Items:", items)

    if (!formData.title) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกหัวข้อ",
        variant: "destructive",
      })
      return
    }

    if (!formData.department) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกแผนก",
        variant: "destructive",
      })
      return
    }

    if (!formData.requestedBy) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อผู้ขอ",
        variant: "destructive",
      })
      return
    }

    if (!formData.requiredDate) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกวันที่ต้องการ",
        variant: "destructive",
      })
      return
    }

    if (!formData.purpose) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกวัตถุประสงค์",
        variant: "destructive",
      })
      return
    }

    const invalidItem = items.find((item) => !item.description || !item.unit)
    if (invalidItem) {
      toast({
        title: "ข้อมูลรายการไม่ครบถ้วน",
        description: `กรุณากรอกรายการและหน่วยของรายการที่ ${invalidItem.itemNo}`,
        variant: "destructive",
      })
      return
    }

    try {
      const prCount = prs.length + 1
      const prNumber = `PR${new Date().getFullYear()}${String(prCount).padStart(4, "0")}`

      console.log("[v0] Generated PR number:", prNumber)

      const newPR: PurchaseRequisition = {
        id: `pr-${Date.now()}`,
        prNumber,
        title: formData.title,
        department: formData.department,
        requestedBy: formData.requestedBy,
        requestDate: formData.requestDate,
        requiredDate: formData.requiredDate,
        status,
        items,
        subtotal,
        vatRate,
        vatAmount,
        serviceTaxRate,
        serviceTaxAmount,
        totalAmount,
        purpose: formData.purpose,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("[v0] Creating new PR:", newPR)

      addPR(newPR)

      toast({
        title: "บันทึกสำเร็จ",
        description: `บันทึก PR ${prNumber} เป็น${status === "draft" ? "ฉบับร่าง" : "บันทึกแล้ว"}สำเร็จ`,
      })

      setTimeout(() => {
        router.push("/pr")
      }, 500)
    } catch (error) {
      console.error("[v0] Error saving PR:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึก PR ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  const SectionTitle = ({ icon: Icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
        {Icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
  )

  const InputField = ({ label, id, required, ...props }: any) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={id}
        {...props}
        className="rounded-lg border border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  )

  const SelectField = ({ label, id, required, options, ...props }: any) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          {...props}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition appearance-none bg-white"
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">สร้างใบขอซื้อใหม่</h1>
            <p className="text-slate-600 mt-1">กรอกข้อมูลใบขอซื้อ</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              className="flex items-center gap-2 rounded-lg border-2 border-slate-300 hover:bg-slate-100"
            >
              <Save className="h-4 w-4" />
              บันทึกร่าง
            </Button>
            <Button
              onClick={() => handleSave("submitted")}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Save className="h-4 w-4" />
              บันทึก
            </Button>
          </div>
        </div>

        {/* General Information Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

          <div className="p-2">
            <div className="border-t border-slate-200 my-4"></div>

            {/* Payment & Discount */}
            <div className="mb-8">
              <SectionTitle icon={<DollarSign className="w-5 h-5 text-white" />} title="Payment & Discount" />

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {['cash', 'credit'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentType"
                        value={type}
                        checked={formData.paymentType === type}
                        onChange={(e: any) => setFormData({ ...formData, paymentType: e.target.value })}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                    </label>
                  ))}
                  {formData.paymentType === 'credit' && (
                    <Input
                      value={formData.creditDays}
                      onChange={(e: any) => setFormData({ ...formData, creditDays: e.target.value })}
                      placeholder="30 days"
                      className="ml-auto w-32 rounded-lg border border-blue-300"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  label="Currency"
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e: any) => setFormData({ ...formData, currency: e.target.value })}
                  options={[
                    { value: 'THB', label: 'THB' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' }
                  ]}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <SectionTitle icon={<Calendar className="w-5 h-5 text-white" />} title="Timeline" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Date"
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
                />
                <InputField
                  label="ROS Date"
                  id="rosDate"
                  type="date"
                  value={formData.rosDate}
                  onChange={(e: any) => setFormData({ ...formData, rosDate: e.target.value })}
                />
                <InputField
                  label="Lead Time"
                  id="leadTime"
                  value={formData.leadTime}
                  onChange={(e: any) => setFormData({ ...formData, leadTime: e.target.value })}
                  placeholder="5-7 working days"
                />
              </div>
            </div>

            {/* Job Information */}
            <div className="mb-8">
              <SectionTitle icon={<Package className="w-5 h-5 text-white" />} title="Job Information" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <JobNumberCombobox
                  value={formData.jobNumber}
                  onChange={(value) => setFormData({ ...formData, jobNumber: value })}
                  required
                />
                <InputField
                  label="Job Name"
                  id="jobName"
                  value={formData.jobName}
                  onChange={(e: any) => setFormData({ ...formData, jobName: e.target.value })}
                  placeholder="Job Name"
                />
                <InputField
                  label="Job Note"
                  id="jobNote"
                  value={formData.jobNote}
                  onChange={(e: any) => setFormData({ ...formData, jobNote: e.target.value })}
                  placeholder="Job Note"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Project Name"
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e: any) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Project Name"
                />
                <InputField
                  label="Client"
                  id="client"
                  value={formData.client}
                  onChange={(e: any) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Client"
                />
                <InputField
                  label="CC No."
                  id="ccNo"
                  value={formData.ccNo}
                  onChange={(e: any) => setFormData({ ...formData, ccNo: e.target.value })}
                  placeholder="ON/475-10/2024"
                />
              </div>
            </div>

            {/* Supplier & Delivery */}
            <div className="mb-8">
              <SectionTitle icon={<User className="w-5 h-5 text-white" />} title="Supplier & Delivery" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SupplierCombobox
                  value={formData.supplier}
                  onChange={(v) => setFormData({ ...formData, supplier: v })}
                  required
                />
                <InputField
                  label="Delivery Location"
                  id="deliveryLocation"
                  required
                  value={formData.deliveryLocation}
                  onChange={(e: any) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                  placeholder="Delivery Location"
                />
              </div>
            </div>


            {/* Additional Info */}
            <div>
              <SectionTitle icon={<FileText className="w-5 h-5 text-white" />} title="Additional Information" />

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase by</label>
                <div className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300">
                  <p className="text-sm font-medium text-slate-900">{formData.purchaseBy}</p>
                </div>
              </div>

              <div>
                <label htmlFor="remark" className="block text-sm font-semibold text-slate-700 mb-2">Remark</label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e: any) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder=""
                  rows={3}
                  className="rounded-lg border border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">รายการสินค้า</h2>
              <Button
                onClick={addItem}
                size="sm"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มรายการ
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12 font-bold">ลำดับ</TableHead>
                    <TableHead className="font-bold">รายการ</TableHead>
                    <TableHead className="w-24 font-bold">จำนวน</TableHead>
                    <TableHead className="w-24 font-bold">หน่วย</TableHead>
                    <TableHead className="w-32 font-bold">ราคาประมาณ</TableHead>
                    <TableHead className="w-32 font-bold">รวม</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{item.itemNo}</TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="ระบุรายการ"
                          className="rounded-lg border border-slate-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                          min="1"
                          className="rounded-lg border border-slate-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                          placeholder="หน่วย"
                          className="rounded-lg border border-slate-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.estimatedPrice}
                          onChange={(e) => updateItem(item.id, "estimatedPrice", Number(e.target.value))}
                          min="0"
                          className="rounded-lg border border-slate-300"
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">{item.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">ยอดรวม (ก่อนภาษี)</span>
                <span className="font-bold text-slate-900">{subtotal.toLocaleString()} บาท</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <label htmlFor="vatRate" className="text-sm font-semibold text-slate-700">
                    ภาษีมูลค่าเพิ่ม (VAT)
                  </label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={vatRate}
                    onChange={(e: any) => setVatRate(Number(e.target.value))}
                    className="w-20 rounded-lg border border-blue-300"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
                <span className="font-bold text-slate-900">{vatAmount.toLocaleString()} บาท</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <label htmlFor="serviceTaxRate" className="text-sm font-semibold text-slate-700">
                    ภาษีการบริการ
                  </label>
                  <Input
                    id="serviceTaxRate"
                    type="number"
                    value={serviceTaxRate}
                    onChange={(e: any) => setServiceTaxRate(Number(e.target.value))}
                    className="w-20 rounded-lg border border-blue-300"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
                <span className="font-bold text-slate-900">{serviceTaxAmount.toLocaleString()} บาท</span>
              </div>

              <div className="flex justify-between items-center border-t-2 border-slate-300 pt-6 mt-6 bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg">
                <span className="text-lg font-bold text-slate-900">รวมทั้งสิ้น</span>
                <span className="text-3xl font-bold text-blue-600">{totalAmount.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}