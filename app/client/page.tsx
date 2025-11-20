// app/client/page.tsx
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

export default function ClientsPage() {
  const { clients, deleteClient } = useData()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  // ป้องกัน error
  if (!clients || !Array.isArray(clients)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-slate-600">กำลังโหลดข้อมูลลูกค้า...</p>
        </div>
      </div>
    )
  }

  // ค้นหา
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.clientId.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      client.contactNumber.includes(search)
    )
  }, [clients, search])

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = filteredClients.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // ถ้ายังไม่มีลูกค้า
  if (clients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-slate-700 mb-4">ยังไม่มีลูกค้า</h2>
          <p className="text-slate-600 mb-8">เริ่มต้นด้วยการเพิ่มลูกค้าแรกของคุณ</p>
          <Link href="/client/add">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              เพิ่มลูกค้าใหม่
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>

      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Clients</h1>
            <p className="text-slate-600 mt-2">
              ทั้งหมด {clients.length} รายการ {search && `• พบ ${filteredClients.length} รายการ`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/client/add" className="flex-1 sm:flex-none">
              <Button className="w-full bg-blue-600 hover:bg-green-500 cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add New Clients
              </Button>
            </Link>
          </div>
        </div>

        {/* ตัวกรอง */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาชื่อ, ID, ผู้ติดต่อ, เบอร์..."
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
            <CardTitle className="text-lg md:text-xl">รายการ PO ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Client ID</TableHead>
                      <TableHead className="font-bold">ชื่อลูกค้า</TableHead>
                      <TableHead className="font-bold hidden sm:table-cell">ผู้ติดต่อ</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">เบอร์โทร</TableHead>
                      <TableHead className="font-bold hidden lg:table-cell">อีเมล</TableHead>
                      <TableHead className="font-bold text-center">สถานะ</TableHead>
                      <TableHead className="font-bold text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium">{client.clientId}</TableCell>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{client.contactPerson}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.contactNumber}</TableCell>
                        <TableCell className="hidden lg:table-cell truncate max-w-xs">
                          {client.contactEmail || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-semibold rounded-full",
                              client.status === "active"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            )}
                          >
                            {client.status === "active" ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Link href={`/client/${client.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/client/${client.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/client/${client.id}/delete`}>
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
    </>

  )
}