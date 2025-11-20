"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, FileText, DollarSign, Calendar, Briefcase, Building2, Users, Mail, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Project, ProjectSection } from "@/src/types"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { cn } from "@/lib/utils"

export default function NewProjectPage() {
  const router = useRouter()
  const { addProject, projects, clients } = useData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    jobName: "",
    jobNo: "",
    projectCode: "",
    jobCode: "",
    contactNumber: "",
    ccNo: "",
    traderId: "",
    waNumber: "",
    wrPoSrRoNumber: "",
    contactPerson: "",
    contactEmail: "",
    estimatedPrCost: "",
    expteamQuotation: "",
    status: "in_progress" as Project["status"],
    startDate: "",
    endDate: "",
    description: "",
  })

  const [sectionBudgets, setSectionBudgets] = useState({
    material: "",
    manPower: "",
    op: "",
    ie: "",
    supply: "",
    engineer: "",
  })

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = endDate.getTime() - startDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  // ฟังก์ชันหลักสำหรับบันทึกโครงการ
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, saveAsDraft: boolean = false) => {
    e.preventDefault()

    // ตรวจสอบข้อมูลสำคัญ
    if (!formData.jobName?.trim()) {
      toast({ title: "กรุณากรอก Job Name", variant: "destructive" })
      return
    }
    if (!formData.jobCode?.trim()) {
      toast({ title: "กรุณากรอก Project Code", variant: "destructive" })
      return
    }

    // ตรวจสอบวันที่
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        toast({ title: "วันที่สิ้นสุดต้องไม่ก่อนวันเริ่มต้น", variant: "destructive" })
        return
      }
    }

    const projectNumber = `PROJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, "0")}`

    const sections: ProjectSection[] = [
      { id: `sec-${Date.now()}-1`, name: "Material", budget: Number(sectionBudgets.material) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-2`, name: "Man Power", budget: Number(sectionBudgets.manPower) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-3`, name: "OP", budget: Number(sectionBudgets.op) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-4`, name: "IE", budget: Number(sectionBudgets.ie) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-5`, name: "Supply", budget: Number(sectionBudgets.supply) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-6`, name: "Engineer", budget: Number(sectionBudgets.engineer) || 0, spent: 0, progress: 0, items: [], remarks: "" },
    ]

    const totalBudget = sections.reduce((sum, sec) => sum + sec.budget, 0)
    const duration = calculateDuration(formData.startDate, formData.endDate)
    const selectedClient = clients.find(c => c.id === formData.traderId)
    const traderName = selectedClient ? selectedClient.name : "ไม่ระบุ Trader"

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectNumber,
      name: formData.jobName.trim(),
      projectName: formData.jobName.trim(),
      description: formData.description || "",
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: saveAsDraft ? "ร่าง" : "รออนุมัติ",
      totalBudget,
      totalSpent: 0,
      overallProgress: 0,
      sections,
      manager: "",
      department: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: formData.jobCode.trim(),
      duration,
      jobNo: formData.jobNo,
      trader: traderName,
      ccNo: formData.ccNo,
      waNumber: formData.waNumber,
      wrPoSrRoNumber: formData.wrPoSrRoNumber,
      expteamQuotation: formData.expteamQuotation,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail,
      estimatedPrCost: formData.estimatedPrCost || "0",
      waName: formData.waNumber || "",
      paymentTerms: "",
      estimatedCost: formData.estimatedPrCost || "0",
    }

    addProject(newProject)
    toast({
      title: saveAsDraft ? "บันทึกร่างสำเร็จ!" : "ส่งโครงการสำเร็จ!",
      description: `เลขที่ ${projectNumber}`,
    })
    setTimeout(() => router.push("/project"), 1200)
  }

  const sectionLabels: { [key: string]: { label: string; icon: React.ReactNode } } = {
    material: { label: "Meterial", icon: <FileText className="w-5 h-5" /> },
    manPower: { label: "Man Power", icon: <Users className="w-5 h-5" /> },
    op: { label: "OP", icon: <Briefcase className="w-5 h-5" /> },
    ie: { label: "IE", icon: <FileText className="w-5 h-5" /> },
    supply: { label: "Supply", icon: <Building2 className="w-5 h-5" /> },
    engineer: { label: "Engineer", icon: <Users className="w-5 h-5" /> },
  }

  function TraderCombobox() {
    const [query, setQuery] = useState("")
    const filtered = query === ""
      ? clients.filter(c => c.status === "active")
      : clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

    return (
      <div className="relative">
        <Combobox
          value={formData.traderId}
          onChange={(v: string | null) => setFormData(prev => ({ ...prev, traderId: v ?? "" }))}
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
              displayValue={(id: string) => clients.find(c => c.id === id)?.name ?? ""}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="w-full px-4 py-4 md:py-6 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/project")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Increase (Job)</h1>
                <p className="text-sm text-slate-600">กรอกข้อมูลโครงการ</p>
              </div>
            </div>
            {/* ปุ่มบันทึก */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-600 hover:text-white"
                onClick={(e) => handleSubmit(e as any, true)}
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึกร่าง
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">

          {/* ข้อมูลโครงการ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Job Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Job Name"
                    value={formData.jobName}
                    onChange={e => setFormData(prev => ({ ...prev, jobName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Code <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Project Code"
                    value={formData.jobCode}
                    onChange={e => setFormData(prev => ({ ...prev, jobCode: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job No.</Label>
                  <Input
                    placeholder="Job No."
                    value={formData.jobNo}
                    onChange={e => setFormData(prev => ({ ...prev, jobNo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CC No.</Label>
                  <Input
                    placeholder="CC No."
                    value={formData.ccNo}
                    onChange={e => setFormData(prev => ({ ...prev, ccNo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WA Number</Label>
                  <Input
                    placeholder="WA Number"
                    value={formData.waNumber}
                    onChange={e => setFormData(prev => ({ ...prev, waNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WR/PO/SR/RO Number</Label>
                  <Input
                    placeholder="WR/PO/SR/RO"
                    value={formData.wrPoSrRoNumber}
                    onChange={e => setFormData(prev => ({ ...prev, wrPoSrRoNumber: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    placeholder="Contact Person"
                    value={formData.contactPerson}
                    onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    placeholder="Contact Number"
                    value={formData.contactNumber}
                    onChange={e => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.contactEmail}
                      onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trader</Label>
                  <TraderCombobox />
                </div>
                <div className="space-y-2">
                  <Label>Expteam Quotation</Label>
                  <Input
                    placeholder="Expteam Quotation"
                    value={formData.expteamQuotation}
                    onChange={e => setFormData(prev => ({ ...prev, expteamQuotation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated PR Cost</Label>
                  <Input
                    placeholder="Estimated PR Cost"
                    value={formData.estimatedPrCost}
                    onChange={e => setFormData(prev => ({ ...prev, estimatedPrCost: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 5 - วันที่ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* รายละเอียด */}
              <div className="space-y-2">
                <Label>Remark</Label>
                <Textarea
                  placeholder="รายละเอียดเพิ่มเติม..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* งบประมาณแต่ละส่วน */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                งบประมาณแต่ละส่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(sectionBudgets).map((key) => (
                  <div key={key} className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                    <Label className="flex items-center gap-2 font-medium">
                      {sectionLabels[key].icon}
                      {sectionLabels[key].label}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">฿</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={(sectionBudgets as any)[key]}
                        onChange={(e) => setSectionBudgets(prev => ({ ...prev, [key]: e.target.value }))}
                        className="pl-8 h-10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}