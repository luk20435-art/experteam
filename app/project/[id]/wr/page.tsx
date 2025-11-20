"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate } from "@/src/lib/utils"

export default function WRListPage() {
    const params = useParams()
    const projectId = params.id as string
    const { wrs = [], projectList = [] } = useData() // ป้องกัน undefined

    const [searchTerm, setSearchTerm] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")

    const currentProject = projectList.find(p => p.id === projectId)
    const projectName = currentProject?.name || "โปรเจคไม่ทราบชื่อ"

    // ป้องกัน wrs เป็น undefined
    const projectWRs = useMemo(() => {
        if (!Array.isArray(wrs)) return []
        return wrs.filter(wr => !wr.deleted && wr.projectId === projectId)
    }, [wrs, projectId])

    const filteredAndSortedWRs = useMemo(() => {
        let filtered = [...projectWRs]

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(wr =>
                (wr.wrNumber || "").toLowerCase().includes(term) ||
                (wr.projectName || "").toLowerCase().includes(term) ||
                (wr.status || "").toLowerCase().includes(term)
            )
        }

        filtered.sort((a, b) => {
            const dateA = a.requestDate ? new Date(a.requestDate).getTime() : 0
            const dateB = b.requestDate ? new Date(b.requestDate).getTime() : 0
            return sortOrder === "latest" ? dateB - dateA : dateA - dateB
        })

        return filtered
    }, [projectWRs, searchTerm, sortOrder])

    const totalItems = filteredAndSortedWRs.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const paginatedWRs = filteredAndSortedWRs.slice(startIndex, endIndex)

    useEffect(() => setCurrentPage(1), [searchTerm, sortOrder, pageSize])

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page)
    }

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "ร่าง": case "draft":
                return <Badge variant="secondary">ร่าง</Badge>
            case "รออนุมัติ": case "pending":
                return <Badge variant="outline" className="border-yellow-600 text-yellow-600">รออนุมัติ</Badge>
            case "อนุมัติ": case "approved":
                return <Badge className="bg-green-100 text-green-800">อนุมัติ</Badge>
            case "ปฏิเสธ": case "rejected":
                return <Badge variant="destructive">ปฏิเสธ</Badge>
            case "ยกเลิก": case "cancelled":
                return <Badge variant="outline" className="border-red-600 text-red-600">ยกเลิก</Badge>
            default:
                return <Badge variant="secondary">{status || "-"}</Badge>
        }
    }

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">WR - {projectName}</h1>
                    <p className="text-sm text-muted-foreground">รายการใบขอเบิกทั้งหมดในโปรเจคนี้</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportWRToCSV(filteredAndSortedWRs)}
                        className="flex-1 sm:flex-none"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Link href={`/project/${projectId}/wr/new`} className="flex-1 sm:flex-none">
                        <Button className="w-full bg-primary text-white">
                            <Plus className="mr-2 h-4 w-4" /> สร้าง WR ใหม่
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <Input
                        placeholder="ค้นหาเลขที่ WR, ชื่อโปรเจค หรือสถานะ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">เลขที่ WR</TableHead>
                                    <TableHead className="whitespace-nowrap">โครงการ</TableHead>
                                    <TableHead className="whitespace-nowrap">วันที่</TableHead>
                                    <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                                    <TableHead className="whitespace-nowrap text-right">จำนวนเงิน</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedWRs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            ไม่พบใบขอเบิกในโปรเจคนี้
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedWRs.map(wr => (
                                        <TableRow key={wr.id} className="hover:bg-muted/50 cursor-pointer">
                                            <TableCell className="font-medium">{wr.wrNumber || "-"}</TableCell>
                                            <TableCell>{wr.projectName || "-"}</TableCell>
                                            <TableCell>{wr.requestDate ? formatDate(wr.requestDate) : "-"}</TableCell>
                                            <TableCell>{getStatusBadge(wr.status)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(wr.totalAmount ?? 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-2">
                        <div className="text-sm text-muted-foreground">
                            แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
                        </div>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}