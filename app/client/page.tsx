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
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface Trader {
  id: string
  traderCode: string
  name: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  taxId?: string
  isActive: boolean
}

export default function TraderPage() {
  const router = useRouter()
  const [traders, setTraders] = useState<Trader[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchTraders = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/api/traders", { cache: "no-store" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data || []

      const mapped: Trader[] = list.map((t: any) => ({
        id: t.id,
        traderCode: t.traderCode || "-",
        name: t.name || "ไม่มีชื่อ",
        contactPerson: t.contactPerson || "-",
        phone: t.phone || "-",
        email: t.email || "-",
        address: t.address || "-",
        taxId: t.taxId || "-",
        isActive: t.isActive ?? true
      }))
      setTraders(mapped)
    } catch (err) {
      toast({ title: "โหลดข้อมูล Trader ไม่สำเร็จ", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraders()
  }, [])

  // ค้นหา
  const filtered = useMemo(() => {
    return traders.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.traderCode.toLowerCase().includes(search.toLowerCase()) ||
      t.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search)
    )
  }, [traders, search])

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
          <p className="text-lg">กำลังโหลดข้อมูล Trader...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 dark:bg-black">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Trader</h1>
            <p className="text-muted-foreground mt-1">
              ทั้งหมด {traders.length} รายการ {search && `• พบ ${filtered.length} รายการ`}
            </p>
          </div>
          <Link href="/client/add">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto dark:text-white cursor-pointer">
              <Plus className="h-5 w-5 mr-2" />
              Add New Trader
            </Button>
          </Link>
        </div>

        {/* ค้นหา */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อ, รหัส Trader, ผู้ติดต่อ, เบอร์..."
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
            <CardTitle>List All Trader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">No.</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead className="hidden md:table-cell">Contact Number</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Registration Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        {search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มี Trader"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.id}</TableCell>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.address || "-"}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{t.contactPerson}</TableCell>
                        <TableCell className="hidden md:table-cell">{t.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell">{t.email || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">-</TableCell>
                        <TableCell className="text-center">
                          <Badge className={t.isActive ? "bg-green-600 text-white" : "bg-red-400 text-white"}>
                            {t.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/client/${t.id}`}>
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Link href={`/client/${t.id}/edit`}>
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                                <Edit className="h-4 w-4 text-yellow-600" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 cursor-pointer">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบ Trader</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณแน่ใจหรือไม่ที่จะลบ "<strong>{t.name}</strong>" นี้อย่างถาวร?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`http://localhost:3000/api/traders/${t.id}`, {
                                          method: "DELETE",
                                        })
                                        if (!res.ok) throw new Error()
                                        setTraders(prev => prev.filter(tr => tr.id !== t.id))
                                        toast({ title: "ลบ Trader สำเร็จ" })
                                      } catch {
                                        toast({ title: "ลบ Trader ไม่สำเร็จ", variant: "destructive" })
                                      }
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    ลบ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination & Page Size */}
            {totalItems > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* ซ้าย: แสดงจำนวน */}
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  แสดง {startIndex} - {endIndex} จาก {totalItems} รายการ
                </div>

                {/* ขวา: เลือกจำนวน + Pagination */}
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