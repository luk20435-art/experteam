"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface YearSummary {
  totalJobs: number
  totalPR: number
  totalPO: number
  totalWR: number
  totalWO: number
  totalCostPO: number
  totalCostWO: number
}

interface Props {
  theme: string | undefined
  selectedYear: number
  yearSummary: YearSummary
}

export function DashboardOverview({ theme, selectedYear, yearSummary }: Props) {
  const isDark = theme === "dark"

  const chartData = [
    { month: "Jan", expense: 2.5, lumsum: 2.2, routine: 1.8, target: 3.0 },
    { month: "Feb", expense: 2.1, lumsum: 2.4, routine: 1.9, target: 2.8 },
    { month: "Mar", expense: 3.2, lumsum: 2.8, routine: 2.5, target: 3.2 },
    { month: "Apr", expense: 3.5, lumsum: 3.1, routine: 2.8, target: 3.5 },
    { month: "May", expense: 2.8, lumsum: 2.5, routine: 2.1, target: 3.0 },
    { month: "Jun", expense: 2.4, lumsum: 2.3, routine: 2.0, target: 2.9 },
    { month: "Jul", expense: 2.9, lumsum: 2.7, routine: 2.3, target: 3.1 },
    { month: "Aug", expense: 3.1, lumsum: 2.9, routine: 2.5, target: 3.2 },
    { month: "Sep", expense: 2.6, lumsum: 2.4, routine: 2.1, target: 2.9 },
    { month: "Oct", expense: 2.7, lumsum: 2.6, routine: 2.2, target: 3.0 },
    { month: "Nov", expense: 2.3, lumsum: 2.1, routine: 1.9, target: 2.8 },
    { month: "Dec", expense: 2.5, lumsum: 2.3, routine: 2.0, target: 2.9 },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div
        className={`p-3 rounded-lg border text-sm ${
          isDark
            ? "bg-slate-800 border-slate-600 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <p className="font-semibold mb-1">{payload[0].payload.month}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} style={{ color: item.color }}>
            {item.name}: {item.value}M
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-3 sm:px-6 xl:px-10 py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Dashboard Overview
        </h2>
        <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          สรุปข้อมูลประจำปี {selectedYear + 543}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 w-full">
        {/* Chart */}
        <div
          className={`xl:col-span-3 w-full rounded-lg border p-6 ${
            isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Project Expenses & Work Summary
          </h3>

          <div className="w-full h-[380px] sm:h-[440px] xl:h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#475569" : "#e5e7eb"}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: isDark ? "#e2e8f0" : "#1f2937" }}
                />
                <YAxis
                  tick={{ fill: isDark ? "#e2e8f0" : "#1f2937" }}
                  label={{
                    value: "Million ฿",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="expense"
                  fill="#9ca3af"
                  name="Total Expense"
                  radius={[8, 8, 0, 0]}
                />

                <Line
                  type="monotone"
                  dataKey="lumsum"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                  name="Lumsum (Project Work)"
                />

                <Line
                  type="monotone"
                  dataKey="routine"
                  stroke="#22c55e"
                  strokeWidth={0}
                  dot={{ r: 5, fill: "#22c55e" }}
                  name="Routine Supply"
                />

                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  strokeWidth={0}
                  dot={{ r: 5, fill: "#ef4444" }}
                  name="Target"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div
          className={`xl:col-span-3 w-full rounded-lg border p-6 ${
            isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Jan - PO Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Client</th>
                  <th className="text-right p-2">Target</th>
                  <th className="text-right p-2">Actual</th>
                  <th className="text-right p-2">Diff</th>
                  <th className="text-right p-2">%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Client A", "1,000,000", "950,000", "-50,000", "-5%", "text-red-500"],
                  ["Client B", "1,500,000", "1,500,000", "0", "0%", "text-green-500"],
                  ["Client C", "800,000", "750,000", "-50,000", "-6%", "text-red-500"],
                  ["Other", "500,000", "600,000", "100,000", "+20%", "text-green-500"],
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{row[0]}</td>
                    <td className="text-right p-2">{row[1]}</td>
                    <td className="text-right p-2">{row[2]}</td>
                    <td className="text-right p-2">{row[3]}</td>
                    <td className={`text-right p-2 ${row[5]}`}>{row[4]}</td>
                  </tr>
                ))}
                <tr className={isDark ? "bg-slate-700" : "bg-gray-100"}>
                  <td className="p-2 font-semibold">Total</td>
                  <td className="text-right p-2 font-semibold">3,800,000</td>
                  <td className="text-right p-2 font-semibold">3,800,000</td>
                  <td className="text-right p-2 font-semibold">0</td>
                  <td className="text-right p-2 font-semibold text-blue-500">0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
