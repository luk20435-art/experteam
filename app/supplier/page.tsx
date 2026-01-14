"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
// เพิ่ม Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Supplier {
  id: string
  name: string
  group?: string
  product?: string
  contactPerson: string
  contactNumber: string
  email: string
  status: "active" | "inactive"
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/api/suppliers", { cache: "no-store" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data || []

      const mapped: Supplier[] = list.map((s: any) => ({
        id: s.id,
        name: s.companyName || "ไม่มีชื่อ",
        group: s.group || "-",
        product: s.product || "-",
        contactPerson: s.contactName || "-",
        contactNumber: s.phone || "-",
        email: s.email || "-",
        status: s.isActive ? "active" : "inactive",
      }))
      setSuppliers(mapped)
    } catch (err) {
      toast({ title: "โหลดข้อมูลซัพพลายเออร์ไม่สำเร็จ", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  // ค้นหา
  const filtered = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        s.contactNumber.includes(search)
    )
  }, [suppliers, search])

  // Pagination
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)
  const paginated = filtered.slice(startIndex - 1, endIndex)

  // Reset page เมื่อ search หรือ pageSize เปลี่ยน
  useEffect(() => {
    setCurrentPage(1)
  }, [search, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูลซัพพลายเออร์...</p>
        </div>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-700 mb-4">ยังไม่มีซัพพลายเออร์</h2>
          <p className="text-gray-600 mb-8">เริ่มต้นด้วยการเพิ่มซัพพลายเออร์แรกของคุณ</p>
          <Link href="/supplier/add">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" /> เพิ่มซัพพลายเออร์ใหม่
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Supplier</h1>
            <p className="text-muted-foreground mt-1">
              ทั้งหมด {suppliers.length} รายการ {search && `• พบ ${filtered.length} รายการ`}
            </p>
          </div>
          <Link href="/supplier/add">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto dark:text-white cursor-pointer">
              <Plus className="h-5 w-5 mr-2" />
              Add New Supplier
            </Button>
          </Link>
        </div>

        {/* ค้นหา */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อบริษัท, อีเมล, ผู้ติดต่อ, เบอร์โทร..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* ตาราง */}
        <Card>
          <CardHeader>
            <CardTitle>List All Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Group</TableHead>
                      <TableHead className="hidden md:table-cell">Product</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          {search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีซัพพลายเออร์"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.id}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{s.group}</TableCell>
                          <TableCell className="hidden md:table-cell">{s.product}</TableCell>
                          <TableCell>{s.contactPerson}</TableCell>
                          <TableCell>{s.contactNumber}</TableCell>
                          <TableCell className="hidden lg:table-cell truncate max-w-xs">{s.email}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                s.status === "active"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-400 text-white"
                              }
                            >
                              {s.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-3">
                              {/* ดูรายละเอียด */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/supplier/${s.id}`}>
                                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                                      <Eye className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>ดูรายละเอียด</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* แก้ไข */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/supplier/${s.id}/edit`}>
                                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                                      <Edit className="h-4 w-4 text-yellow-600" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>แก้ไข</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* ลบ */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>ลบซัพพลายเออร์</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>

            {/* Pagination & Page Size */}
            {totalItems > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  แสดง {startIndex} - {endIndex} จาก {totalItems} รายการ
                </div>

                <div className="flex items-center gap-4 order-1 sm:order-2">
                  <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 รายการ</SelectItem>
                      <SelectItem value="20">20 รายการ</SelectItem>
                      <SelectItem value="50">50 รายการ</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {totalPages <= 7 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                        >
                          1
                        </Button>

                        {currentPage > 4 && <span className="px-3 text-muted-foreground">...</span>}

                        {Array.from({ length: 3 }, (_, i) => {
                          const pageNum = currentPage - 1 + i
                          if (pageNum <= 1 || pageNum >= totalPages) return null
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}

                        {currentPage < totalPages - 3 && <span className="px-3 text-muted-foreground">...</span>}

                        {totalPages > 1 && (
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}