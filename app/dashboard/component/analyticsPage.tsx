"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface Props {
  theme: string | undefined
  selectedYear: number
  prStatusData: any[]
  poStatusData: any[]
  wrStatusData: any[]
  woStatusData: any[]
  monthlyData: any[]
}

export function AnalyticsPage({
  theme,
  selectedYear,
  prStatusData,
  poStatusData,
  wrStatusData,
  woStatusData,
  monthlyData,
}: Props) {
  const isDark = theme === "dark"
  const chartColors = {
    textColor: isDark ? "#e2e8f0" : "#1f2937",
    gridColor: isDark ? "#475569" : "#e5e7eb",
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 rounded-lg border ${isDark ? "border-slate-600 bg-slate-800" : "bg-white border-gray-200"}`}>
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
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Analytics</h2>
        <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>วิเคราะห์สถิติเอกสารประจำปี {selectedYear + 543}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { title: "PR Status", data: prStatusData },
          { title: "PO Status", data: poStatusData },
          { title: "WR Status", data: wrStatusData },
          { title: "WO Status", data: woStatusData },
        ].map((chart, idx) => (
          <div key={idx} className={`p-6 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{chart.title}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chart.data}
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
                  {chart.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend wrapperStyle={{ color: chartColors.textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className={`p-6 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>จำนวนเอกสารรายเดือน</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} vertical={false} />
            <XAxis dataKey="month" stroke={chartColors.textColor} style={{ fontSize: "14px" }} tick={{ fill: chartColors.textColor }} />
            <YAxis stroke={chartColors.textColor} style={{ fontSize: "14px" }} tick={{ fill: chartColors.textColor }} />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(229, 231, 235, 0.5)" }} />
            <Legend wrapperStyle={{ color: chartColors.textColor, fontSize: "14px" }} iconType="square" />
            <Bar dataKey="PR" fill="#3b82f6" name="PR" radius={[8, 8, 0, 0]} />
            <Bar dataKey="PO" fill="#10b981" name="PO" radius={[8, 8, 0, 0]} />
            <Bar dataKey="WR" fill="#f59e0b" name="WR" radius={[8, 8, 0, 0]} />
            <Bar dataKey="WO" fill="#8b5cf6" name="WO" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}