// app/trash/pr/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowLeftCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface PR {
  id: number
  prNumber: string
  requester?: string
  requestDate?: string
  deletedAt?: string | null
}

export default function TrashPRPage() {
  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/pr/trash`) // หรือ /pr?deleted=true ถ้า backend ใช้ query
        if (!res.ok) throw new Error("โหลดข้อมูลถังขยะไม่สำเร็จ")
        const data: PR[] = await res.json()
        setPRs(data)
      } catch (err: any) {
        alert(err.message || "เกิดข้อผิดพลาด")
      } finally {
        setLoading(false)
      }
    }
    fetchTrash()
  }, [])

  const filtered = useMemo(() => {
    return prs.filter(pr => 
      pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pr.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  }, [prs, searchTerm])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginated = filtered.slice(startIndex, endIndex)

  useEffect(() => setCurrentPage(1), [searchTerm, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleRestore = async (id: number, prNumber: string) => {
    if (!confirm(`กู้คืน PR "${prNumber}" หรือไม่?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/pr/${id}/restore`, { method: "PATCH" })
      if (!res.ok) throw new Error("กู้คืนไม่สำเร็จ")
      setPRs(prev => prev.filter(p => p.id !== id))
      alert("กู้คืนสำเร็จ")
    } catch {
      alert("เกิดข้อผิดพลาด")
    }
  }

  const handlePermanentDelete = async (id: number, prNumber: string) => {
    if (!confirm(`ลบ PR "${prNumber}" ถาวรหรือไม่?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/pr/${id}/force`, { method: "DELETE" })
      if (!res.ok) throw new Error("ลบถาวรไม่สำเร็จ")
      setPRs(prev => prev.filter(p => p.id !== id))
      alert("ลบถาวรสำเร็จ")
    } catch {
      alert("เกิดข้อผิดพลาด")
    }
  }

  if (loading) return <div className="flex justify-center py-20">กำลังโหลด...</div>

  return (
    <div className="min-h-screen space-y-6 py-8 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-600" />
              ถังขยะ - Purchase Requests (PR)
            </h1>
            <p className="text-muted-foreground mt-2">{prs.length} รายการ</p>
          </div>
          <Link href="/pr">
            <Button variant="outline">กลับสู่ PR</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ค้นหาเลขที่ PR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 รายการ</SelectItem>
                  <SelectItem value="20">20 รายการ</SelectItem>
                  <SelectItem value="50">50 รายการ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการ PR ที่ถูกลบ ({totalItems} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            {paginated.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">ถังขยะว่างเปล่า</p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>เลขที่ PR</TableHead>
                        <TableHead className="hidden md:table-cell">ผู้ขอ</TableHead>
                        <TableHead className="hidden lg:table-cell">วันที่ขอ</TableHead>
                        <TableHead className="text-center">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map(pr => (
                        <TableRow key={pr.id}>
                          <TableCell>{pr.id}</TableCell>
                          <TableCell className="font-medium">{pr.prNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{pr.requester || "-"}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {pr.requestDate ? new Date(pr.requestDate).toLocaleDateString("th-TH") : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="text-green-600" onClick={() => handleRestore(pr.id, pr.prNumber)}>
                                    <ArrowLeftCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>กู้คืน</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="text-red-600" onClick={() => handlePermanentDelete(pr.id, pr.prNumber)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>ลบถาวร</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TooltipProvider>
            )}

            {totalItems > 0 && (
              <div className="mt-8 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  แสดง {startIndex + 1}-{endIndex} จาก {totalItems}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}