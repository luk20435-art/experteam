"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency } from "@/src/lib/utils"
import {
  FileText, ShoppingCart, Clock, DollarSign, CheckCircle,
  Wallet, Plus, AlertCircle,
} from "lucide-react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Pie, Cell, ResponsiveContainer, PieChart, Tooltip as RechartsTooltip } from "recharts"
import { useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { projects, prs, pos } = useData()

  // === ตัวเลือกปีและเดือน (ย้อนหลัง 5 ปี + ถัดไป 5 ปี) ===
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // สร้างรายการปี: ย้อนหลัง 5 ปี + ถัดไป 5 ปี
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // ชื่อเดือน
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ]

  // ฟังก์ชันกรองโครงการตามเดือน/ปี
  const filterProjectsByPeriod = (project: any) => {
    if (!project.startDate) return false
    const date = new Date(project.startDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (selectedMonth === 0) {
      // แสดงทั้งปี
      return year === selectedYear
    } else {
      // แสดงเฉพาะเดือน
      return year === selectedYear && month === selectedMonth
    }
  }

  const filteredProjects = projects.filter(filterProjectsByPeriod)

  // === สถิติโครงการ (ตามช่วงเวลา) ===
  const inProgressCount = filteredProjects.filter(p => p.status === "in_progress").length
  const completedCount = filteredProjects.filter(p => p.status === "completed").length

  // === งบประมาณ (ตามช่วงเวลา) ===
  const totalBudgetAll = filteredProjects.reduce((sum, p) => {
    const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
    return sum + budget
  }, 0)

  const totalSpentAll = filteredProjects.reduce((sum, p) => {
    const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
    return sum + spent
  }, 0)

  const inProgressBudget = filteredProjects
    .filter(p => p.status === "in_progress")
    .reduce((sum, p) => {
      const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
      return sum + budget
    }, 0)

  const inProgressSpent = filteredProjects
    .filter(p => p.status === "in_progress")
    .reduce((sum, p) => {
      const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
      return sum + spent
    }, 0)

  const completedBudget = filteredProjects
    .filter(p => p.status === "completed")
    .reduce((sum, p) => {
      const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
      return sum + budget
    }, 0)

  const completedSpent = filteredProjects
    .filter(p => p.status === "completed")
    .reduce((sum, p) => {
      const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
      return sum + spent
    }, 0)

  return (
    <div className="space-y-6">
      {/* หัวข้อ + ตัวเลือกช่วงเวลา */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมระบบจัดการ Experteam</p>
        </div>

        {/* ตัวเลือก ปี / เดือน */}
        <div className="flex gap-2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year + 543}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">ทั้งปี</SelectItem>
              {monthNames.map((name, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* แสดงช่วงเวลาที่เลือก */}
      <div className="text-sm text-muted-foreground">
        {selectedMonth === 0
          ? `ข้อมูลปี ${selectedYear + 543}`
          : `ข้อมูลเดือน ${monthNames[selectedMonth - 1]} ${selectedYear + 543}`
        }
      </div>

      {/* === 1. งบประมาณรวม === */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white/80 p-5 rounded-xl transform hover:scale-[1.02] active:scale-[0.98]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">งบประมาณรวม</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-3xl font-bold text-purple-700">{formatCurrency(totalBudgetAll)}</div>
            <p className="text-xs text-purple-600 mt-1 font-medium">จากโครงการที่เลือก</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white/80 p-5 rounded-xl transform hover:scale-[1.02] active:scale-[0.98]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-red-800">ใช้ไปแล้ว</CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-3xl font-bold text-red-700">{formatCurrency(totalSpentAll)}</div>
            <p className="text-xs text-red-600 mt-1 font-medium">
              {totalBudgetAll > 0 ? `${((totalSpentAll / totalBudgetAll) * 100).toFixed(1)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 p-5 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] ${totalBudgetAll - totalSpentAll >= 0
          ? 'border-l-green-500 bg-gradient-to-br from-green-50 to-white/80'
          : 'border-l-red-500 bg-gradient-to-br from-red-50 to-white/80'
          }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={`text-sm font-semibold ${totalBudgetAll - totalSpentAll >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>คงเหลือ</CardTitle>
            <div className={`p-2 rounded-full ${totalBudgetAll - totalSpentAll >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
              <DollarSign className={`h-5 w-5 ${totalBudgetAll - totalSpentAll >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className={`text-3xl font-bold ${totalBudgetAll - totalSpentAll >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
              {formatCurrency(totalBudgetAll - totalSpentAll)}
            </div>
            <p className={`text-xs mt-1 font-medium ${totalBudgetAll - totalSpentAll >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {totalBudgetAll > 0
                ? `${(((totalBudgetAll - totalSpentAll) / totalBudgetAll) * 100).toFixed(1)}% เหลือ`
                : "เกินงบ"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === 2. สรุปโครงการ === */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Card
          className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white/50 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => router.push('/project')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">โครงการทั้งหมด</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{filteredProjects.length}</div>
            <p className="text-xs text-purple-600 mt-1">โครงการ</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-800">กำลังดำเนินการ</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{inProgressCount}</div>
            <p className="text-xs text-green-600 mt-1">โครงการ</p>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-700">งบ:</span>
                <span className="font-semibold text-green-800">{formatCurrency(inProgressBudget)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-700">ใช้:</span>
                <span className="font-semibold text-green-900">{formatCurrency(inProgressSpent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">เสร็จสิ้น</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{completedCount}</div>
            <p className="text-xs text-blue-600 mt-1">โครงการ</p>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-700">งบ:</span>
                <span className="font-semibold text-blue-800">{formatCurrency(completedBudget)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-700">ใช้:</span>
                <span className="font-semibold text-blue-900">{formatCurrency(completedSpent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === 3. กราฟสรุป === */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* ใส่แทน SVG เดิม */}
        <div className="h-64 flex flex-col items-center justify-center">
          {/* กราฟ */}
          <div className="flex-1 flex items-center justify-center w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* วงนอก: แสดงสัดส่วน */}
                <Pie
                  data={[
                    { name: "กำลังดำเนินการ", value: inProgressCount },
                    { name: "เสร็จสิ้น", value: completedCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={450}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Pie>

                {/* Tooltip */}
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.97)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    padding: "10px 14px",
                    fontSize: "14px",
                  }}
                  itemStyle={{ color: "#1f2937", fontWeight: "600" }}
                  labelStyle={{ color: "#6b7280", fontSize: "12px", marginBottom: "4px" }}
                  formatter={(value: number) => [
                    `${value} โครงการ`,
                    `${Math.round((value / filteredProjects.length) * 100)}%`,
                  ]}
                />

                {/* ตัวเลขกลาง */}
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-4xl font-bold fill-foreground"
                >
                  {filteredProjects.length}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm fill-muted-foreground font-medium"
                >
                  โครงการ
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend ด้านล่าง */}
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">กำลังดำเนินการ ({inProgressCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">เสร็จสิ้น ({completedCount})</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">งบประมาณ (ช่วงที่เลือก)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>งบประมาณ</span>
                  <span className="font-medium">{formatCurrency(totalBudgetAll)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div className="bg-purple-600 h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-medium"
                    style={{ width: "100%" }}>100%</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ใช้ไปแล้ว</span>
                  <span className="font-medium">{formatCurrency(totalSpentAll)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-medium transition-all ${totalSpentAll / totalBudgetAll >= 0.9 ? "bg-red-500" : "bg-orange-500"
                      }`}
                    style={{ width: `${totalBudgetAll > 0 ? (totalSpentAll / totalBudgetAll) * 100 : 0}%` }}
                  >
                    {totalBudgetAll > 0 ? `${((totalSpentAll / totalBudgetAll) * 100).toFixed(0)}%` : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === 4. การแจ้งเตือน === */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              ใกล้ถึงกำหนด (7 วัน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProjects
              .filter(p => {
                if (!p.endDate || p.status === "completed") return false
                const daysLeft = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return daysLeft >= 0 && daysLeft <= 7
              })
              .slice(0, 3)
              .map(p => {
                const daysLeft = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">เหลือ {daysLeft} วัน</p>
                    </div>
                    <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>{daysLeft} วัน</Badge>
                  </div>
                )
              })}
            {filteredProjects.filter(p => {
              if (!p.endDate || p.status === "completed") return false
              const daysLeft = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return daysLeft >= 0 && daysLeft <= 7
            }).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีโครงการใกล้ถึงกำหนด</p>
              )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              เกินงบ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProjects
              .filter(p => {
                const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
                const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
                return spent > budget
              })
              .slice(0, 3)
              .map(p => {
                const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
                const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
                const over = spent - budget
                return (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-red-600">เกิน {formatCurrency(over)}</p>
                    </div>
                    <Badge variant="destructive">เกินงบ</Badge>
                  </div>
                )
              })}
            {filteredProjects.filter(p => {
              const spent = p.sections?.reduce((s, sec) => s + (sec.spent || 0), 0) || 0
              const budget = p.sections?.reduce((s, sec) => s + (sec.budget || 0), 0) || 0
              return spent > budget
            }).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ทุกโครงการอยู่ในงบ</p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}