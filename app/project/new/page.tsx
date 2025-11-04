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
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import type { Project, ProjectSection } from "@/src/types"

export default function NewProjectPage() {
  const router = useRouter()
  const { addProject, projects } = useData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planning" as Project["status"],
    totalBudget: "",
    manager: "",
    department: "",
  })

  const [sectionBudgets, setSectionBudgets] = useState({
    material: "",
    manPower: "",
    op: "",
    ie: "",
    supply: "",
    engineer: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const projectNumber = `PROJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, "0")}`

    const sections: ProjectSection[] = [
      { id: `sec-${Date.now()}-1`, name: "Material", budget: Number(sectionBudgets.material) || 0, spent: 0, progress: 0, items: [] },
      { id: `sec-${Date.now()}-2`, name: "Man Power", budget: Number(sectionBudgets.manPower) || 0, spent: 0, progress: 0, items: [] },
      { id: `sec-${Date.now()}-3`, name: "OP", budget: Number(sectionBudgets.op) || 0, spent: 0, progress: 0, items: [] },
      { id: `sec-${Date.now()}-4`, name: "IE", budget: Number(sectionBudgets.ie) || 0, spent: 0, progress: 0, items: [] },
      { id: `sec-${Date.now()}-5`, name: "Supply", budget: Number(sectionBudgets.supply) || 0, spent: 0, progress: 0, items: [] },
      { id: `sec-${Date.now()}-6`, name: "Engineer", budget: Number(sectionBudgets.engineer) || 0, spent: 0, progress: 0, items: [] },
    ]

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectNumber,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      totalBudget: Number(formData.totalBudget),
      totalSpent: 0,
      overallProgress: 0,
      sections,
      manager: formData.manager,
      department: formData.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: undefined
    }

    addProject(newProject)

    // ✅ Toast แจ้งเตือน
    toast({
      title: "สร้างโครงการสำเร็จ!",
      description: `โครงการ "${formData.name}" ถูกเพิ่มเรียบร้อยแล้ว`,
      icon: <CheckCircle2 className="text-green-500" />,
      duration: 2000,
    })

    // ✅ รอ 1 วิ แล้วกลับหน้าแรก
    setTimeout(() => {
      router.push("/project")
    }, 1000)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/project">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">สร้างโครงการใหม่</h1>
          <p className="text-sm text-muted-foreground mt-1">กรอกข้อมูลโครงการ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ส่วนข้อมูลโครงการ */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลโครงการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อโครงการ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">แผนก *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">ผู้จัดการโครงการ *</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBudget">งบประมาณรวม (บาท) *</Label>
                <Input
                  id="totalBudget"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">วันเริ่มต้น *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">วันสิ้นสุด *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">สถานะ *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* ส่วนงบประมาณแต่ละหมวด */}
        <Card>
          <CardHeader>
            <CardTitle>งบประมาณแต่ละส่วน</CardTitle>
            <p className="text-sm text-muted-foreground">กำหนดงบประมาณสำหรับแต่ละส่วนของโครงการ (ไม่บังคับ)</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(sectionBudgets).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <Input
                    id={key}
                    type="number"
                    placeholder="0"
                    value={(sectionBudgets as any)[key]}
                    onChange={(e) => setSectionBudgets({ ...sectionBudgets, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ปุ่ม */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" className="flex-1">
            สร้างโครงการ
          </Button>
          <Link href="/project" className="flex-1">
            <Button type="button" variant="outline" className="w-full bg-transparent">
              ยกเลิก
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
