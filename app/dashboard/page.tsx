"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/src/components/layout/sidebar"
import { DashboardOverview } from "./component/dashboardOverview"
import { AnalyticsPage } from "./component/analyticsPage"
import { ReportsPage } from "./component/reportsPage"

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("overview")
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setYearSummary({
        totalJobs: 45,
        totalPR: 120,
        totalPO: 85,
        totalWR: 95,
        totalWO: 72,
        totalCostPO: 850000,
        totalCostWO: 520000,
      })

      setPrStatusData([
        { name: "ร่าง", value: 30, color: "#6b7280" },
        { name: "รออนุมัติ", value: 50, color: "#f59e0b" },
        { name: "อนุมัติแล้ว", value: 40, color: "#10b981" },
      ])

      setPoStatusData([
        { name: "ร่าง", value: 20, color: "#6b7280" },
        { name: "รออนุมัติ", value: 30, color: "#f59e0b" },
        { name: "อนุมัติแล้ว", value: 35, color: "#10b981" },
      ])

      setWrStatusData([
        { name: "ร่าง", value: 25, color: "#6b7280" },
        { name: "รออนุมัติ", value: 40, color: "#f59e0b" },
        { name: "อนุมัติแล้ว", value: 30, color: "#10b981" },
      ])

      setWoStatusData([
        { name: "ร่าง", value: 15, color: "#6b7280" },
        { name: "รออนุมัติ", value: 28, color: "#f59e0b" },
        { name: "อนุมัติแล้ว", value: 29, color: "#10b981" },
      ])

      setMonthlyData([
        { month: "ม.ค.", PR: 10, PO: 8, WR: 9, WO: 6 },
        { month: "ก.พ.", PR: 12, PO: 7, WR: 8, WO: 5 },
        { month: "มี.ค.", PR: 11, PO: 9, WR: 10, WO: 7 },
        { month: "เม.ย.", PR: 13, PO: 8, WR: 9, WO: 6 },
        { month: "พ.ค.", PR: 9, PO: 10, WR: 8, WO: 8 },
        { month: "มิ.ย.", PR: 10, PO: 9, WR: 11, WO: 7 },
        { month: "ก.ค.", PR: 14, PO: 11, WR: 10, WO: 9 },
        { month: "ส.ค.", PR: 12, PO: 10, WR: 12, WO: 8 },
        { month: "ก.ย.", PR: 11, PO: 8, WR: 9, WO: 7 },
        { month: "ต.ค.", PR: 13, PO: 9, WR: 8, WO: 6 },
        { month: "พ.ย.", PR: 10, PO: 7, WR: 10, WO: 5 },
        { month: "ธ.ค.", PR: 12, PO: 8, WR: 9, WO: 6 },
      ])

      setLoading(false)
    }, 500)
  }, [selectedYear])

  const yearOptions = []
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    yearOptions.push(y)
  }

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "reports", label: "Reports" },
  ]

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className={`flex h-screen ${isDark ? "bg-slate-900" : ""}`}>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`border-b ${isDark ? "border-slate-800 bg-slate-950" : "border-gray-200 bg-white"} sticky top-0 z-40`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>System Management</h1>

              <div className="flex items-center gap-4">
                {/* <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className={`px-4 py-2 rounded-lg transition-colors ${isDark ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {isDark ? "☀️" : "🌙"}
                </button> */}

                <div className="flex items-center gap-2">
                  <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>ปี:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className={`px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year + 543}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-0 border-t" style={{ borderTopColor: isDark ? "#475569" : "#e5e7eb" }}>
              {navItems.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                      isActive
                        ? isDark
                          ? "border-blue-600 text-blue-400 bg-slate-800/50"
                          : "border-blue-600 text-blue-600 bg-blue-50/50"
                        : isDark
                        ? "border-transparent text-slate-300 hover:text-white hover:border-slate-700"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? "border-blue-400" : "border-blue-600"} mx-auto mb-4`}></div>
                  <p className={isDark ? "text-slate-300" : "text-gray-600"}>กำลังโหลดข้อมูล...</p>
                </div>
              </div>
            ) : (
              <>
                {currentPage === "overview" && (
                  <DashboardOverview theme={theme} selectedYear={selectedYear} yearSummary={yearSummary} />
                )}
                {currentPage === "analytics" && (
                  <AnalyticsPage
                    theme={theme}
                    selectedYear={selectedYear}
                    prStatusData={prStatusData}
                    poStatusData={poStatusData}
                    wrStatusData={wrStatusData}
                    woStatusData={woStatusData}
                    monthlyData={monthlyData}
                  />
                )}
                {currentPage === "reports" && <ReportsPage theme={theme} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}