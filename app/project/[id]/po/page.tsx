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
import { exportPOToCSV } from "@/src/lib/export-utils"

export default function POListPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // ดึงข้อมูลจาก context ครั้งเดียว (ไม่ซ้ำ!)
  const { getProject, pos, projectList } = useData()
  const project = getProject(projectId)

  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

  const projectName = project?.name || "โปรเจคไม่ทราบชื่อ"

  // กรอง PO ที่เป็นของโปรเจคนี้เท่านั้น
  const projectPOs = useMemo(() => {
    return pos.filter(po => !po.deleted && po.projectId === projectId)
  }, [pos, projectId])

  // ค้นหา + เรียงลำดับ
  const filteredAndSortedPOs = useMemo(() => {
    let filtered = [...projectPOs]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(po =>
        (po.poNumber || "").toLowerCase().includes(term) ||
        (po.projectName || "").toLowerCase().includes(term) ||
        (po.status || "").toLowerCase().includes(term)
      )
    }

    filtered.sort((a, b) => {
      const dateA = a.poDate ? new Date(a.poDate).getTime() : 0
      const dateB = b.poDate ? new Date(b.poDate).getTime() : 0
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [projectPOs, searchTerm, sortOrder])

  const totalItems = filteredAndSortedPOs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPOs = filteredAndSortedPOs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // สีสถานะ
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
      default:
        return <Badge variant="secondary">{status || "-"}</Badge>
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
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
            <h1 className="text-2xl md:text-3xl font-bold">PO - {projectName}</h1>
            <p className="text-sm text-muted-foreground">รายการใบสั่งซื้อทั้งหมดในโปรเจคนี้ (รหัส: {project.projectNumber})</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPOToCSV(filteredAndSortedPOs)}
            className="flex-1 sm:flex-none"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Link href={`/project/${projectId}/po/new`} className="flex-1 sm:flex-none">
            <Button className="w-full bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> สร้าง PO ใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="ค้นหาเลขที่ PO, ชื่อโปรเจค หรือสถานะ..."
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
                  <TableHead className="whitespace-nowrap">เลขที่ PO</TableHead>
                  <TableHead className="whitespace-nowrap">โครงการ</TableHead>
                  <TableHead className="whitespace-nowrap">วันที่</TableHead>
                  <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                  <TableHead className="whitespace-nowrap text-right">จำนวนเงิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      ไม่พบใบสั่งซื้อในโปรเจคนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPOs.map((po) => (
                    <TableRow
                      key={po.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/project/${projectId}/po/${po.id}`)}
                    >
                      <TableCell className="font-medium">{po.poNumber || "-"}</TableCell>
                      <TableCell>{po.projectName || "-"}</TableCell>
                      <TableCell>{po.poDate ? formatDate(po.poDate) : "-"}</TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(po.totalAmount ?? 0)}
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