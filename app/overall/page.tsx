"use client"

import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, DollarSign, Briefcase, ShoppingCart, Package, Wrench } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Document {
  createdAt?: string
  requestDate?: string
  orderDate?: string
  status?: string
  items?: { quantity: number; unitPrice: number }[]
}

interface YearSummary {
  totalJobs: number
  totalPR: number
  totalPO: number
  totalWR: number
  totalWO: number
  totalCostPO: number
  totalCostWO: number
}

export default function DashboardPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  const [yearSummary, setYearSummary] = useState<YearSummary>({
    totalJobs: 0,
    totalPR: 0,
    totalPO: 0,
    totalWR: 0,
    totalWO: 0,
    totalCostPO: 0,
    totalCostWO: 0,
  })

  const [prStatusData, setPrStatusData] = useState<any[]>([])
  const [poStatusData, setPoStatusData] = useState<any[]>([])
  const [wrStatusData, setWrStatusData] = useState<any[]>([])
  const [woStatusData, setWoStatusData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // ปีให้เลือก: ย้อนหลัง 10 ปี + ข้างหน้า 5 ปี
  const yearOptions = []
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    yearOptions.push(y)
  }

  const isDark = theme === "dark"

  // Chart colors
  const chartColors = {
    textColor: isDark ? "#e2e8f0" : "#1f2937",
    gridColor: isDark ? "#475569" : "#e5e7eb",
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    borderColor: isDark ? "#334155" : "#e5e7eb",
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)

        const [jobRes, prRes, poRes, wrRes, woRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/jobs`),
          fetch(`${API_BASE_URL}/pr`),
          fetch(`${API_BASE_URL}/po`),
          fetch(`${API_BASE_URL}/wr`),
          fetch(`${API_BASE_URL}/wo`),
        ])

        const getData = async (res: any) => {
          if (res.status === "fulfilled" && res.value.ok) {
            return await res.value.json()
          }
          return []
        }

        const jobs = await getData(jobRes)
        const prs: Document[] = await getData(prRes)
        const pos: Document[] = await getData(poRes)
        const wrs: Document[] = await getData(wrRes)
        const wos: Document[] = await getData(woRes)

        const filterByYear = (docs: Document[]) =>
          docs.filter((doc) => {
            const dateStr = doc.createdAt || doc.requestDate || doc.orderDate
            if (!dateStr) return false
            const date = new Date(dateStr)
            return date.getFullYear() === selectedYear
          })

        const prsYear = filterByYear(prs)
        const posYear = filterByYear(pos)
        const wrsYear = filterByYear(wrs)
        const wosYear = filterByYear(wos)

        const calcTotalCost = (docs: Document[]) =>
          docs.reduce((sum, doc) => {
            if (!doc.items) return sum
            return sum + doc.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0)
          }, 0)

        const totalCostPOYear = calcTotalCost(posYear)
        const totalCostWOYear = calcTotalCost(wosYear)

        setYearSummary({
          totalJobs: jobs.filter((j: any) => {
            const dateStr = j.createdAt || j.startDate
            if (!dateStr) return false
            return new Date(dateStr).getFullYear() === selectedYear
          }).length,
          totalPR: prsYear.length,
          totalPO: posYear.length,
          totalWR: wrsYear.length,
          totalWO: wosYear.length,
          totalCostPO: totalCostPOYear,
          totalCostWO: totalCostWOYear,
        })

        const getStatusCount = (docs: Document[], status: string) =>
          docs.filter((d) => d.status?.toLowerCase() === status.toLowerCase()).length

        const createStatusData = (docs: Document[]) => [
          { name: "ร่าง", value: getStatusCount(docs, "draft"), color: "#6b7280" },
          { name: "รออนุมัติ", value: getStatusCount(docs, "pending"), color: "#f59e0b" },
          { name: "อนุมัติแล้ว", value: getStatusCount(docs, "approved"), color: "#10b981" },
        ]

        setPrStatusData(createStatusData(prsYear))
        setPoStatusData(createStatusData(posYear))
        setWrStatusData(createStatusData(wrsYear))
        setWoStatusData(createStatusData(wosYear))

        const monthsTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

        const monthlyCounts = monthsTH.map((month, index) => {
          const monthNum = index + 1

          const countByMonth = (docs: Document[]) =>
            docs.filter((doc) => {
              const dateStr = doc.createdAt || doc.requestDate || doc.orderDate
              if (!dateStr) return false
              const date = new Date(dateStr)
              return date.getFullYear() === selectedYear && date.getMonth() + 1 === monthNum
            }).length

          return {
            month,
            PR: countByMonth(prs),
            PO: countByMonth(pos),
            WR: countByMonth(wrs),
            WO: countByMonth(wos),
          }
        })

        setMonthlyData(monthlyCounts)
      } catch (err) {
        console.error("โหลดข้อมูลแดชบอร์ดไม่สำเร็จ:", err)
        toast({
          title: "โหลดข้อมูลบางส่วนไม่สำเร็จ",
          description: "แสดงเฉพาะข้อมูลที่มีอยู่",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [selectedYear, toast])

  if (!mounted) return null

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-background"} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? "border-blue-400" : "border-primary"} mx-auto mb-4`}></div>
          <p className={`text-lg ${isDark ? "text-slate-200" : "text-foreground"}`}>กำลังโหลดแดชบอร์ด...</p>
        </div>
      </div>
    )
  }

  const totalExpenses = yearSummary.totalCostPO + yearSummary.totalCostWO

  // Custom Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 rounded-lg border ${isDark ? " border-slate-600" : "bg-white border-gray-200"}`}>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{payload[0]?.name}</p>
          <p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-700"}`}>{payload[0]?.value} รายการ</p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200"}`}>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{payload[0]?.payload?.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-background"} transition-colors`}>
      <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* หัวข้อ + เลือกปี */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>System Management Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>เลือกปี:</label>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className={`w-40 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-card border-border"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className={isDark ? "text-white" : ""}>
                    {year + 543}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700 bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>All Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>{yearSummary.totalJobs}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>โครงการทั้งหมดในปี {selectedYear + 543}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700  bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>PR ทั้งหมด</CardTitle>
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>{yearSummary.totalPR}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>ใบขอซื้อทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700  bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>PO ทั้งหมด</CardTitle>
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>{yearSummary.totalPO}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>มูลค่า ฿{yearSummary.totalCostPO.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700  bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>WR ทั้งหมด</CardTitle>
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>{yearSummary.totalWR}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>ใบขอเบิกทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700  bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>WO ทั้งหมด</CardTitle>
              <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>{yearSummary.totalWO}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>มูลค่า ฿{yearSummary.totalCostWO.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDark ? "border-slate-700  bg-black" : "border-border bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-foreground"}`}>Total Expenses</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">฿{totalExpenses.toLocaleString()}</div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>รวม PO + WO ปี {selectedYear + 543}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className={isDark ? "border-slate-700  bg-black" : "border-border bg-card"}>
            <CardHeader className={`border-b ${isDark ? "border-slate-700" : "border-border"}`}>
              <CardTitle className={isDark ? "text-white" : "text-foreground"}>PR & PO ({selectedYear + 543})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div>
                <h4 className={`text-lg font-medium mb-4 text-center ${isDark ? "text-white" : "text-foreground"}`}>PR</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={prStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                      labelLine={false}
                    >
                      {prStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className={`text-lg font-medium mb-4 text-center ${isDark ? "text-white" : "text-foreground"}`}>PO</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={poStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                      labelLine={false}
                    >
                      {poStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={isDark ? "border-slate-700  bg-black" : "border-border bg-card"}>
            <CardHeader className={`border-b ${isDark ? "border-slate-700" : "border-border"}`}>
              <CardTitle className={isDark ? "text-white" : "text-foreground"}>WR & WO ({selectedYear + 543})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div>
                <h4 className={`text-lg font-medium mb-4 text-center ${isDark ? "text-white" : "text-foreground"}`}>WR</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={wrStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                      labelLine={false}
                    >
                      {wrStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className={`text-lg font-medium mb-4 text-center ${isDark ? "text-white" : "text-foreground"}`}>WO</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={woStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                      labelLine={false}
                    >
                      {woStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className={isDark ? "border-slate-700  bg-black" : "border-border bg-card"}>
          <CardHeader className={`border-b ${isDark ? "border-slate-700" : "border-border"}`}>
            <CardTitle className={isDark ? "text-white" : "text-foreground"}>จำนวนเอกสารรายเดือน ({selectedYear + 543})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke={chartColors.textColor}
                  style={{ fontSize: "14px", fontWeight: 500 }}
                  tick={{ fill: chartColors.textColor }}
                />
                <YAxis
                  stroke={chartColors.textColor}
                  style={{ fontSize: "14px", fontWeight: 500 }}
                  tick={{ fill: chartColors.textColor }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(229, 231, 235, 0.5)" }} />
                <Legend wrapperStyle={{ color: chartColors.textColor, fontSize: "14px", fontWeight: 500 }} iconType="square" />
                <Bar dataKey="PR" fill="#3b82f6" name="PR" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                <Bar dataKey="PO" fill="#10b981" name="PO" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                <Bar dataKey="WR" fill="#f59e0b" name="WR" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                <Bar dataKey="WO" fill="#8b5cf6" name="WO" radius={[8, 8, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}