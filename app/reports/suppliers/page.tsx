"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockSuppliers, mockPOs } from "@/src/lib/mock-data"
import { formatCurrency } from "@/src/lib/utils"
import { Search, FileDown, FileText, FileSpreadsheet, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function SupplierReportPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate supplier statistics
  const supplierStats = useMemo(() => {
    return mockSuppliers.map((supplier) => {
      const supplierPOs = mockPOs.filter((po) => po.supplierId === supplier.id)
      const totalPOs = supplierPOs.length
      const totalAmount = supplierPOs.reduce((sum, po) => sum + po.totalAmount, 0)
      const completedPOs = supplierPOs.filter((po) => po.status === "completed").length
      const pendingPOs = supplierPOs.filter((po) => po.status === "pending").length
      const approvedPOs = supplierPOs.filter((po) => po.status === "approved").length

      return {
        ...supplier,
        totalPOs,
        totalAmount,
        completedPOs,
        pendingPOs,
        approvedPOs,
        avgOrderValue: totalPOs > 0 ? totalAmount / totalPOs : 0,
      }
    })
  }, [])

  const filteredSuppliers = supplierStats.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Overall statistics
  const totalSuppliers = mockSuppliers.length
  const totalPOs = mockPOs.length
  const totalAmount = mockPOs.reduce((sum, po) => sum + po.totalAmount, 0)
  const avgOrderValue = totalPOs > 0 ? totalAmount / totalPOs : 0

  // Chart data
  const chartData = supplierStats
    .filter((s) => s.totalPOs > 0)
    .map((supplier) => ({
      name: supplier.name.length > 20 ? supplier.name.substring(0, 20) + "..." : supplier.name,
      จำนวน_PO: supplier.totalPOs,
      มูลค่า: supplier.totalAmount,
    }))

  const pieData = supplierStats
    .filter((s) => s.totalAmount > 0)
    .map((supplier) => ({
      name: supplier.name.length > 15 ? supplier.name.substring(0, 15) + "..." : supplier.name,
      value: supplier.totalAmount,
    }))

  const exportToCSV = () => {
    const headers = [
      "รหัส Supplier",
      "ชื่อ Supplier",
      "ผู้ติดต่อ",
      "จำนวน PO",
      "PO ที่เสร็จสิ้น",
      "PO รออนุมัติ",
      "PO อนุมัติแล้ว",
      "มูลค่ารวม",
      "มูลค่าเฉลี่ย/PO",
    ]
    const rows = filteredSuppliers.map((supplier) => [
      supplier.code,
      supplier.name,
      supplier.contactPerson,
      supplier.totalPOs.toString(),
      supplier.completedPOs.toString(),
      supplier.pendingPOs.toString(),
      supplier.approvedPOs.toString(),
      supplier.totalAmount.toString(),
      supplier.avgOrderValue.toFixed(2),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `supplier-report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToPDF = () => {
    alert("ฟังก์ชัน Export PDF กำลังพัฒนา")
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">รายงาน Supplier</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">สรุปข้อมูลและสถิติของ Supplier ทั้งหมด</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" />
              Export รายงาน
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers ทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Suppliers ที่ใช้งานอยู่</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PO ทั้งหมด</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPOs}</div>
            <p className="text-xs text-muted-foreground">Purchase Orders ทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">มูลค่า PO ทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ย</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">มูลค่าเฉลี่ยต่อ PO</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">จำนวน PO และมูลค่าตาม Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar yAxisId="left" dataKey="จำนวน_PO" fill="#3b82f6" name="จำนวน PO" />
                <Bar yAxisId="right" dataKey="มูลค่า" fill="#10b981" name="มูลค่า (บาท)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สัดส่วนมูลค่าตาม Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg md:text-xl">รายละเอียด Supplier</CardTitle>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหา Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">รหัส</TableHead>
                    <TableHead className="whitespace-nowrap">ชื่อ Supplier</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">ผู้ติดต่อ</TableHead>
                    <TableHead className="text-center whitespace-nowrap">จำนวน PO</TableHead>
                    <TableHead className="text-center whitespace-nowrap hidden lg:table-cell">เสร็จสิ้น</TableHead>
                    <TableHead className="text-center whitespace-nowrap hidden lg:table-cell">รออนุมัติ</TableHead>
                    <TableHead className="text-right whitespace-nowrap">มูลค่ารวม</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden sm:table-cell">เฉลี่ย/PO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        ไม่พบข้อมูล Supplier
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium whitespace-nowrap">{supplier.code}</TableCell>
                        <TableCell className="whitespace-nowrap">{supplier.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{supplier.contactPerson}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{supplier.totalPOs}</Badge>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <Badge className="bg-green-500 hover:bg-green-600">{supplier.completedPOs}</Badge>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">{supplier.pendingPOs}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatCurrency(supplier.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                          {formatCurrency(supplier.avgOrderValue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
