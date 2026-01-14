"use client"

interface Props {
  theme: string | undefined
}

export function ReportsPage({ theme }: Props) {
  const isDark = theme === "dark"

  const ReportCard = ({ title, desc, icon }) => (
    <div className={`p-6 rounded-lg border transition-shadow hover:shadow-lg cursor-pointer ${isDark ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</p>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{desc}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Reports</h2>
        <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>รายงานและสถิติข้อมูลระบบ</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard title="Monthly Report" desc="รายงานข้อมูลประจำเดือน" icon="📅" />
        <ReportCard title="Annual Report" desc="รายงานข้อมูลประจำปี" icon="📊" />
        <ReportCard title="Summary Report" desc="สรุปรายงานทั่วไป" icon="📋" />
        <ReportCard title="Export Data" desc="ส่งออกข้อมูลสำหรับการวิเคราะห์" icon="📥" />
        <ReportCard title="Financial Report" desc="รายงานการเงินและค่าใช้จ่าย" icon="💰" />
        <ReportCard title="Performance Analysis" desc="วิเคราะห์ประสิทธิภาพระบบ" icon="📈" />
      </div>

      {/* Statistics Section */}
      <div className={`p-8 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
        <h3 className={`text-xl font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>Total Documents</p>
            <p className={`text-3xl font-bold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>1,250</p>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>+12% from last month</p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>Completed Tasks</p>
            <p className={`text-3xl font-bold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>842</p>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>+8% from last month</p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>Total Expenses</p>
            <p className={`text-3xl font-bold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>฿1.37M</p>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>+5% from last month</p>
          </div>
        </div>
      </div>
    </div>
  )
}