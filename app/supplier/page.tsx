// app/supplier/page.tsx
"use client"

import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "../lib/utils"

export default function SuppliersPage() {
  const { suppliers } = useData()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  if (!suppliers || !Array.isArray(suppliers)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-slate-600">กำลังโหลดข้อมูลซัพพลายเออร์...</p>
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.contactNumber.includes(search)
    )
  }, [suppliers, search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-slate-700 mb-4">ยังไม่มีซัพพลายเออร์</h2>
          <p className="text-slate-600 mb-8">เริ่มต้นด้วยการเพิ่มซัพพลายเออร์แรกของคุณ</p>
          <Link href="/supplier/add">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              เพิ่มซัพพลายเออร์ใหม่
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* หัวข้อ + ปุ่มเพิ่ม */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Supplier</h1>
          <p className="text-slate-600 mt-2">
            ทั้งหมด {suppliers.length} รายการ {search && `• พบ ${filtered.length} รายการ`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/supplier/add" className="flex-1 sm:flex-none">
            <Button className="w-full bg-blue-600 hover:bg-green-500 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add New Supplier
            </Button>
          </Link>
        </div>
      </div>

      {/* ค้นหา */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, อีเมล, เบอร์..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">รายการซัพพลายเออร์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <TableHead className="font-bold">ชื่อบริษัท</TableHead>
                  <TableHead className="font-bold hidden sm:table-cell">กลุ่ม</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">สินค้า</TableHead>
                  <TableHead className="font-bold">ผู้ติดต่อ</TableHead>
                  <TableHead className="font-bold hidden lg:table-cell">อีเมล</TableHead>
                  <TableHead className="font-bold text-center">สถานะ</TableHead>
                  <TableHead className="font-bold text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{s.group || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{s.product || "-"}</TableCell>
                    <TableCell>{s.contactPerson}</TableCell>
                    <TableCell className="hidden lg:table-cell truncate max-w-xs">{s.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-full",
                          s.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        )}
                      >
                        {s.status === "active" ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Link href={`/supplier/${s.id}`}>
                          <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link href={`/supplier/${s.id}/edit`}>
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Link href={`/supplier/${s.id}/delete`}>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ก่อนหน้า
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ถัดไป
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}