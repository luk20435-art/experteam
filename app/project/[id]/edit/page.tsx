"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Building2, Phone, Mail, DollarSign, FileText, Hash, Tag, Clock, Users } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject, updateProject, clients } = useData()
  const { toast } = useToast()
  const project = getProject(params.id as string)

  const [formValues, setFormValues] = useState({
    jobName: "",
    jobCode: "",
    traderId: "",
    ccNo: "",
    jobNo: "",
    waNumber: "",
    wrPoSrRoNumber: "",
    expteamQuotation: "",
    contactPerson: "",
    contactEmail: "",
    estimatedPrCost: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planning" as any,
    material: "",
    manPower: "",
    op: "",
    ie: "",
    supply: "",
    engineer: "",
    contactNumber: "",

  })

  useEffect(() => {
    if (project && clients.length > 0) {
      const sectionMap: any = {}
      project.sections.forEach((sec: any) => {
        const key = sec.name.toLowerCase().replace(" ", "") as keyof typeof formValues
        sectionMap[key] = sec.budget.toString()
      })

      const traderClient = clients.find(c => c.name === project.trader)
      const traderId = traderClient ? traderClient.id : ""

      setFormValues({
        jobName: project.name || "",
        jobCode: project.code || "",
        traderId,
        ccNo: project.ccNo || "",
        jobNo: project.jobNo || "",
        waNumber: project.waNumber || "",
        wrPoSrRoNumber: project.wrPoSrRoNumber || "",
        expteamQuotation: project.expteamQuotation || "",
        contactPerson: project.contactPerson || "",
        contactEmail: project.contactEmail || "",
        estimatedPrCost: project.estimatedPrCost || "",
        contactNumber: project.contactNumber || "",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        status: project.status || "planning",
        ...sectionMap,
      })
    }
  }, [project, clients])

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-xl text-slate-900">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  const calculateDuration = () => {
    if (!formValues.startDate || !formValues.endDate) return 0
    const s = new Date(formValues.startDate)
    const e = new Date(formValues.endDate)
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const sections = [
      { id: `sec-${Date.now()}-1`, name: "Material" as const, budget: Number(formValues.material) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-2`, name: "Man Power" as const, budget: Number(formValues.manPower) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-3`, name: "OP" as const, budget: Number(formValues.op) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-4`, name: "IE" as const, budget: Number(formValues.ie) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-5`, name: "Supply" as const, budget: Number(formValues.supply) || 0, spent: 0, progress: 0, items: [], remarks: "" },
      { id: `sec-${Date.now()}-6`, name: "Engineer" as const, budget: Number(formValues.engineer) || 0, spent: 0, progress: 0, items: [], remarks: "" },
    ]

    const selectedClient = clients.find(c => c.id === formValues.traderId)
    const traderName = selectedClient ? selectedClient.name : project.trader || "ไม่ระบุ"

    const updatedProject = {
      ...project,
      name: formValues.jobName,
      code: formValues.jobCode,
      description: formValues.description,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      status: formValues.status,
      totalBudget: sections.reduce((sum, s) => sum + s.budget, 0),
      sections,
      duration: calculateDuration(),
      ccNo: formValues.ccNo,
      jobNo: formValues.jobNo,
      waNumber: formValues.waNumber,
      wrPoSrRoNumber: formValues.wrPoSrRoNumber,
      expteamQuotation: formValues.expteamQuotation,
      contactPerson: formValues.contactPerson,
      contactEmail: formValues.contactEmail,
      estimatedPrCost: formValues.estimatedPrCost,
      trader: traderName,
      traderId: formValues.traderId,
      contactNumber: formValues.contactNumber,
    }

    updateProject(project.id, updatedProject)
    toast({ title: "บันทึกสำเร็จ!", description: "ข้อมูลโครงการถูกอัปเดตแล้ว" })
    router.push(`/project/${project.id}`)
  }

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
  }

  function TraderCombobox() {
    const [query, setQuery] = useState("")
    const filtered = query === ""
      ? clients.filter(c => c.status === "active")
      : clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

    return (
      <div className="relative">
        <Combobox
          value={formValues.traderId}
          onChange={(v: string | null) => handleChange("traderId", v ?? "")}
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
                onClick={() => router.push(`/project/${project.id}`)}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Edit (Job)</h1>
                <p className="text-sm text-slate-600">รหัส: {project.projectNumber}</p>
              </div>
            </div>
            <Button type="submit" form="edit-form" 
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-green-600">
              <Save className="h-4 w-4 mr-2" />
              บันทึก
            </Button>
          </div>
        </div>

        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

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
                    value={formValues.jobName}
                    onChange={e => handleChange("jobName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Code</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.jobCode}
                      onChange={e => handleChange("jobCode", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Job No.</Label>
                  <Input
                    className=""
                    value={formValues.jobNo}
                    onChange={e => handleChange("jobNo", e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CC No.</Label>
                  <Input
                    value={formValues.ccNo}
                    onChange={e => handleChange("ccNo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WA Number</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.waNumber}
                      onChange={e => handleChange("waNumber", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>WR/PO/SR/RO Number</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.wrPoSrRoNumber}
                      onChange={e => handleChange("wrPoSrRoNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.contactPerson}
                      onChange={e => handleChange("contactPerson", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder=""
                      value={formValues.contactNumber}
                      onChange={e => handleChange("contactPerson", e.target.value)}
                      className=""
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="email"
                      className=""
                      value={formValues.contactEmail}
                      onChange={e => handleChange("contactEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trader <span className="text-red-500">*</span></Label>
                  <TraderCombobox />
                </div>
                <div className="space-y-2">
                  <Label>Expteam Quotation</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.expteamQuotation}
                      onChange={e => handleChange("expteamQuotation", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estimated PR Cost</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      className=""
                      value={formValues.estimatedPrCost}
                      onChange={e => handleChange("estimatedPrCost", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formValues.startDate}
                    onChange={e => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formValues.endDate}
                    onChange={e => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2">
                <Label>Period</Label>
                <Badge variant="secondary" className="text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {calculateDuration()} วัน
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>status</Label>
                <Select value={formValues.status} onValueChange={v => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Remark</Label>
                <Textarea
                  rows={3}
                  value={formValues.description}
                  onChange={e => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* งบประมาณ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                งบประมาณแต่ละส่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Material", "Man Power", "OP", "IE", "Supply", "Engineer"].map((name) => {
                  const key = name.toLowerCase().replace(" ", "") as keyof typeof formValues
                  return (
                    <div key={name} className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                      <Label className="font-medium">{name}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">฿</span>
                        <Input
                          type="number"
                          className="pl-8 h-10"
                          value={formValues[key] || ""}
                          onChange={e => handleChange(key, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}