"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, FileSpreadsheet, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate } from "@/src/lib/utils"

export default function WOListPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // ดึงข้อมูลจาก context ครั้งเดียว (ถูกต้องตามโครงสร้างจริงของคุณ)
  const { getProject, projects, wos = [] } = useData()
  const project = getProject(projectId)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const projectName = project?.name || "โปรเจคไม่ทราบชื่อ"
  const projectNumber = project?.projectNumber || ""

  // กรอง WO ของโปรเจคนี้
  const projectWOs = useMemo(() => {
    return wos.filter(wo => !wo.deleted && wo.projectId === projectId)
  }, [wos, projectId])

  const filteredAndSortedWOs = useMemo(() => {
    let filtered = [...projectWOs]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(wo =>
        (wo.woNumber || "").toLowerCase().includes(term) ||
        (wo.projectName || "").toLowerCase().includes(term) ||
        (wo.status || "").toLowerCase().includes(term)
      )
    }

    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [projectWOs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedWOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedWOs = filteredAndSortedWOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // สีสถานะ WO
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ร่าง":
      case "draft":
        return <Badge variant="secondary">ร่าง</Badge>
      case "รออนุมัติ":
      case "pending":
        return <Badge variant="outline" className="border-yellow-600 text-yellow-600">รออนุมัติ</Badge>
      case "อนุมัติ":
      case "approved":
        return <Badge className="bg-green-100 text-green-800">อนุมัติ</Badge>
      case "ปฏิเสธ":
      case "rejected":
        return <Badge variant="destructive">ปฏิเสธ</Badge>
      case "ยกเลิก":
      case "cancelled":
        return <Badge variant="outline" className="border-red-600 text-red-600">ยกเลิก</Badge>
      default:
        return <Badge variant="secondary">{status || "-"}</Badge>
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-xl">กำลังโหลดโครงการ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/project/${projectId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">WO - {projectName}</h1>
            <p className="text-sm text-muted-foreground">
              รายการคำสั่งงานทั้งหมดในโปรเจคนี้ (รหัส: {projectNumber})
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* ถ้ามี export WO ให้เปิดใช้ */}
          {/* <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
          </Button> */}
          <Link href={`/project/${projectId}/wo/new`}>
            <Button className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> สร้าง WO ใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="ค้นหาเลขที่ WO, ชื่อโปรเจค หรือสถานะ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">เลขที่ WO</TableHead>
                  <TableHead className="whitespace-nowrap">โครงการ</TableHead>
                  <TableHead className="whitespace-nowrap">วันที่สร้าง</TableHead>
                  <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                  <TableHead className="whitespace-nowrap text-right">จำนวนเงิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      ไม่พบคำสั่งงานในโปรเจคนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedWOs.map((wo) => (
                    <TableRow
                      key={wo.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/project/${projectId}/wo/${wo.id}`)}
                    >
                      <TableCell className="font-medium">{wo.orderNumber || "-"}</TableCell>
                      <TableCell>{wo.projectName || "-"}</TableCell>
                      <TableCell>{wo.createdAt ? formatDate(wo.createdAt) : "-"}</TableCell>
                      <TableCell>{getStatusBadge(wo.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(wo.totalCost ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}