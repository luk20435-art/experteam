// app/wo/[id]/page.tsx
"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, Edit, Trash2, Building2, Calendar, CreditCard, MapPin,
  FileText, Package, Download, Clock, CheckCircle2, Zap, AlertCircle
} from "lucide-react"

export default function WODetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const { wos = [], wrs = [], projects = [], clients = [], updateWO } = useData() || {}
  const wo = wos.find(o => o.id === id && !o.deleted)
  const wr = wo?.workRequestId ? wrs.find(w => w.id === wo.workRequestId) : null
  const project = wr?.projectId ? projects.find(p => p.id === wr.projectId) : null
  const traderName = wr?.trader || project?.trader || "ไม่ระบุ"

  if (!wo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-slate-400 opacity-50" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">ไม่พบข้อมูล Work Order</h2>
          <p className="text-slate-400">ไม่พบรายการที่ต้องการ</p>
          <Link href="/wo">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> กลับไปหน้ารายการ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const assignee = ["สมชาย", "สมนึก", "สมหญิง"].find((_, i) => i + 1 === wo.assignedTo) || "ไม่ระบุ"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "อนุมัติแล้ว": return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "รออนุมัติ": return "bg-amber-100 text-amber-800 border-amber-300"
      case "ร่าง": return "bg-slate-100 text-slate-800 border-slate-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบคำสั่งงานนี้?")) {
      updateWO?.(id, { deleted: true })
      toast({ title: "ลบสำเร็จ!" })
      router.push("/wo")
    }
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const orderDateTH = wo.createdAt
      ? new Date(wo.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
      : "-"
    const deliveryDateTH = wo.deliveryDate
      ? new Date(wo.deliveryDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
      : "-"

    const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>ใบสั่งงาน ${wo.orderNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Sarabun', sans-serif; padding: 15px; font-size: 13px; color: #000; line-height: 1.4; }
        .container { max-width: 210mm; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2c3e50; padding-bottom: 8px; margin-bottom: 10px; }
        .logo { width: 65px; height: 65px; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center; }
        .company-title { text-align: right; }
        .thai-name { font-size: 19px; font-weight: 700; color: #2c3e50; }
        .eng-name { background: #c0504d; color: white; padding: 4px 12px; font-size: 16px; font-weight: 700; margin-top: 3px; display: inline-block; }
        .info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td, .items-table th, .items-table td { border: 1px solid #000; padding: 6px 8px; }
        .header-center { background: #f0f0f0; text-align: center; font-weight: 700; font-size: 14px; }
        .text-right { text-align: right; }
        .total-box { border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
        .grand-total { font-weight: 700; font-size: 15px; }
        .note-box { border: 1px solid #000; padding: 10px; min-height: 70px; font-size: 12px; }
        .signature { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-box { text-align: center; width: 30%; }
        .sig-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 8px; }
        @page { margin: 10mm; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="https://experteam.co.th/wp-content/uploads/2020/06/logo-experteam.png" alt="Logo" style="width: 55px;">
          </div>
          <div class="company-title">
            <div class="thai-name">บริษัท เอ็กซ์เพอร์ทีม จำกัด</div>
            <div class="eng-name">EXPERTEAM COMPANY LIMITED</div>
          </div>
        </div>

        <table class="info-table">
          <tr>
            <td width="50%"><strong>ผู้รับงาน:</strong><br>${assignee}</td>
            <td width="25%"><strong>เลขที่ใบสั่งงาน</strong><br>${wo.orderNumber}</td>
            <td width="25%"><strong>วันที่:</strong><br>${orderDateTH}</td>
          </tr>
          <tr>
            <td><strong>อ้างอิง WR</strong><br>${wr?.wrNumber || "-"}</td>
            <td colspan="2" class="header-center">ใบสั่งงาน<br>WORK ORDER</td>
          </tr>
          <tr>
            <td><strong>Job No.</strong><br>${project?.jobNo || wr?.jobNumber || "-"}</td>
            <td colspan="2"><strong>วันที่ต้องการรับงาน</strong><br>${deliveryDateTH}</td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th width="50">ลำดับ</th>
              <th>รายการงาน</th>
              <th width="110">จำนวน - หน่วย</th>
              <th width="100">ราคา/หน่วย</th>
              <th width="120">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${wo.items?.map((item, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td>${item.description || ""}</td>
                <td class="text-center">${item.quantity || 0} ${item.unit || "ชิ้น"}</td>
                <td class="text-right">${formatCurrency(item.unitPrice || 0)}</td>
                <td class="text-right">${formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
              </tr>
            `).join("") || ""}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>ยอดรวม (ก่อนภาษี)</span><span>${formatCurrency(wo.subtotal || 0)}</span></div>
          <div class="total-row"><span>VAT (${wo.vatRate || 7}%)</span><span>${formatCurrency(wo.vatAmount || 0)}</span></div>
          <div class="total-row"><span>Service Tax (${wo.serviceTaxRate || 0}%)</span><span>${formatCurrency(wo.serviceTaxAmount || 0)}</span></div>
          <div class="total-row grand-total"><strong>รวมทั้งสิ้น</strong><strong>${formatCurrency(wo.totalAmount || 0)}</strong></div>
        </div>

        <div style="margin: 15px 0;">
          <strong>หมายเหตุ:</strong>
          <div class="note-box">
            ${wo.notes || "ไม่มีหมายเหตุ"}
          </div>
        </div>

        <div class="signature">
          <div class="sig-box"><div style="font-weight:600;">ผู้สั่งงาน</div><div class="sig-line"></div></div>
          <div class="sig-box"><div style="font-weight:600;">ผู้รับงาน</div><div class="sig-line"></div></div>
          <div class="sig-box"><div style="font-weight:600;">ผู้อนุมัติ</div><div class="sig-line"></div></div>
        </div>
      </div>
    </body>
    </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 md:p-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <Link href="/wo">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-full mt-0.5 flex-shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent truncate">
                    WO {wo.orderNumber}
                  </h1>
                  <Badge className={`${getStatusColor(wo.status)} font-medium px-2 sm:px-3 py-1 border text-xs sm:text-sm flex-shrink-0`}>
                    {wo.status}
                  </Badge>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-1">
                  สร้างเมื่อ {formatDate(wo.createdAt)} • {wo.items?.length || 0} รายการ
                </p>
                {wr && (
                  <p className="text-xs sm:text-sm text-blue-600 font-medium flex items-center gap-1 sm:gap-2 flex-wrap">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>อ้างอิง WR: {wr.wrNumber}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-xl text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 flex-1 sm:flex-none">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> Export PDF
              </Button>
              <Link href={`/wo/${wo.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full rounded-lg sm:rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> แก้ไข
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50 font-medium rounded-lg sm:rounded-xl text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 flex-1 sm:flex-none">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> ลบ
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* ข้อมูลหลัก */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">ข้อมูลหลัก</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                    <p className="text-xs font-medium text-slate-600 uppercase mb-1 sm:mb-2">อ้างอิง WR</p>
                    <p className="font-bold text-sm sm:text-base text-blue-700">{wr?.wrNumber || "-"}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                    <p className="text-xs font-medium text-slate-600 uppercase mb-1 sm:mb-2">Trader</p>
                    <p className="font-bold text-sm sm:text-base text-purple-700 flex items-center gap-1 sm:gap-2">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{traderName}</span>
                    </p>
                  </div>
                </div>

                <Separator className="my-1 sm:my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <p className="text-xs font-medium text-slate-600 uppercase mb-1 sm:mb-2">Job No.</p>
                    <p className="font-bold text-sm sm:text-base text-emerald-700">{project?.jobNo || wr?.jobNumber || "-"}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                    <p className="text-xs font-medium text-slate-600 uppercase mb-1 sm:mb-2">C.C. No.</p>
                    <p className="font-bold text-sm sm:text-base text-orange-700">{project?.ccNo || wr?.ccNo || "-"}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                  <p className="text-xs font-medium text-slate-600 uppercase mb-1 sm:mb-2">โครงการ</p>
                  <p className="font-bold text-sm sm:text-base text-slate-700 line-clamp-2">{project?.name || wr?.projectName || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* รายการงาน */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 pb-3 sm:pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl flex-1 min-w-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">รายการงาน</span>
                  </CardTitle>
                  <Badge variant="outline" className="bg-white flex-shrink-0 text-xs sm:text-sm">
                    {wo.items?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="overflow-x-auto">
                  <Table className="text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-center w-12">ลำดับ</TableHead>
                        <TableHead>รายการงาน</TableHead>
                        <TableHead className="text-center w-16 sm:w-20">จำนวน</TableHead>
                        <TableHead className="text-right w-20 sm:w-24">ราคา</TableHead>
                        <TableHead className="text-center w-12 sm:w-16">หน่วย</TableHead>
                        <TableHead className="text-right w-20 sm:w-24">รวม</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wo.items?.map((item, i) => (
                        <TableRow key={item.id || i} className="hover:bg-blue-50">
                          <TableCell className="text-center font-semibold">{i + 1}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-center">{item.unit}</TableCell>
                          <TableCell className="text-right font-bold text-blue-600">
                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs sm:max-w-md space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">ยอดรวม (ก่อนภาษี)</span>
                        <span className="font-bold">{formatCurrency(wo.subtotal || 0)}</span>
                      </div>
                      {wo.vatRate > 0 && (
                        <div className="flex justify-between p-2 sm:p-3 rounded-lg bg-blue-50">
                          <span>VAT {wo.vatRate}%</span>
                          <span className="font-semibold text-blue-700">{formatCurrency(wo.vatAmount || 0)}</span>
                        </div>
                      )}
                      {wo.serviceTaxRate > 0 && (
                        <div className="flex justify-between p-2 sm:p-3 rounded-lg bg-purple-50">
                          <span>Service Tax {wo.serviceTaxRate}%</span>
                          <span className="font-semibold text-purple-700">{formatCurrency(wo.serviceTaxAmount || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm sm:text-base">
                        <span className="font-bold">รวมทั้งสิ้น</span>
                        <span className="font-bold">{formatCurrency(wo.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ขวา: สรุปยอด + สถานะ */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-4 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">สรุปยอดเงิน</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-8 pb-4 sm:pb-8">
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                  <p className="text-xs opacity-90 uppercase mb-1 sm:mb-2">รวมทั้งสิ้น</p>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(wo.totalAmount || 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  สถานะ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-8 pb-4 sm:pb-8">
                <div className="flex flex-col gap-3">
                  <Badge className={`${getStatusColor(wo.status)} font-medium px-3 sm:px-4 py-2 text-center text-xs sm:text-sm border`}>
                    {wo.status}
                  </Badge>
                  <div className="text-xs text-slate-600 space-y-1.5 sm:space-y-2 bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                    <p><strong>สร้างเมื่อ:</strong> {formatDate(wo.createdAt)}</p>
                    <p><strong>ผู้รับงาน:</strong> {assignee}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}