"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Plus, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { exportPRToCSV } from "@/src/lib/export-utils"

export default function PRListPage() {
    const params = useParams()
    const projectId = params.id as string
    const { prs, projectList } = useData()
    const router = useRouter()

    const [searchTerm, setSearchTerm] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

    // ดึงข้อมูลโปรเจคปัจจุบัน
    const currentProject = projectList?.find(p => p.id === projectId)
    const projectName = currentProject?.name || "โปรเจคไม่ทราบชื่อ"

    // กรอง PR ของโปรเจคนี้เท่านั้น
    const projectPRs = useMemo(() => {
        return prs.filter(pr => !pr.deleted && pr.projectId === projectId)
    }, [prs, projectId])

    const filteredAndSortedPRs = useMemo(() => {
        let filtered = [...projectPRs]

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(pr =>
                pr.prNumber.toLowerCase().includes(term) ||
                (pr.projectName || "").toLowerCase().includes(term)
            )
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.requestDate).getTime()
            const dateB = new Date(b.requestDate).getTime()
            return sortOrder === "latest" ? dateB - dateA : dateA - dateB
        })

        return filtered
    }, [projectPRs, searchTerm, sortOrder])

    const totalItems = filteredAndSortedPRs.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const paginatedPRs = filteredAndSortedPRs.slice(startIndex, endIndex)

    useEffect(() => setCurrentPage(1), [searchTerm, sortOrder, pageSize])

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page)
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">PR - {projectName}</h1>
                    <p className="text-sm text-muted-foreground">รายการ PR ทั้งหมดในโปรเจคนี้</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportPRToCSV(filteredAndSortedPRs)}
                        className="flex-1 sm:flex-none"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Link href={`/project/${projectId}/pr/new`} className="flex-1 sm:flex-none">
                        <Button className="w-full bg-primary text-white">
                            <Plus className="mr-2 h-4 w-4" /> สร้าง PR ใหม่
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <Input
                        placeholder="ค้นหา PR..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-sm"
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
                                    <TableHead className="whitespace-nowrap">เลขที่ PR</TableHead>
                                    <TableHead className="whitespace-nowrap">โครงการ</TableHead>
                                    <TableHead className="whitespace-nowrap">วันที่</TableHead>
                                    <TableHead className="whitespace-nowrap text-right">จำนวนเงิน</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPRs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            ไม่พบ PR ในโปรเจคนี้
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPRs.map(pr => (
                                        <TableRow key={pr.id} className="hover:bg-muted/50 cursor-pointer">
                                            <TableCell className="font-medium">{pr.prNumber}</TableCell>
                                            <TableCell>{pr.projectName || "-"}</TableCell>
                                            <TableCell>{formatDate(pr.requestDate)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(pr.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-2">
                        <div className="text-sm text-muted-foreground">
                            แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
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
                </CardContent>
            </Card>
        </div>
    )
}