// app/wr/[id]/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, Building2, Briefcase, CreditCard, Calendar, User, FileText, CheckCircle2, Clock, AlertCircle, Flag, Download } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"  
import { th } from "date-fns/locale"

export default function ViewWorkRequestPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { wrs = [], clients = [], suppliers = [], projects = [], deleteWR } = useData() || {}
  const { toast } = useToast()

  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const found = wrs.find((r: any) => r.id === id)
    setRequest(found)
    setIsLoading(false)
  }, [id, wrs])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!request) notFound()

  const project = request.projectId ? projects.find(p => p.id === request.projectId) : null
  const client = request.clientId ? clients.find(c => c.id === request.clientId) : null
  const supplier = request.supplier ? suppliers.find(s => s.id === request.supplier) : null

  const createdDate = new Date(request.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 border-gray-300"
      case "รออนุมัติ": return "bg-amber-100 text-amber-800 border-amber-300"
      case "อนุมัติ": return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "ปฏิเสธ": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "อนุมัติ": return <CheckCircle2 className="h-5 w-5" />
      case "รออนุมัติ": return <Clock className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบ WR นี้?")) {
      if (deleteWR) {
        deleteWR(id as string)
      }
      toast({ title: "ลบ WR สำเร็จ!", description: `เลขที่ ${request.wrNumber}` })
      router.push("/wr")
    }
  }

  const subtotal = request.subtotal || 0
  const vatAmount = request.vatAmount || 0
  const serviceTaxAmount = request.serviceTaxAmount || 0
  const totalAmount = request.totalAmount || 0
  const jobBalanceCost = (parseFloat(request.expteamQuotation || "0") - parseFloat(request.estimatedPrCost || "0"))

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({ title: "ไม่สามารถเปิดหน้าต่างใหม่ได้", variant: "destructive" })
      return
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "-"
      return format(new Date(dateStr), "dd/MM/yyyy")
    }

    const formatCurrency = (val: any) => {
      const num = Number(val || 0)
      return num.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const subtotal = request.subtotal || 0
    const vatRate = request.vatRate || 0
    const serviceTaxRate = request.serviceTaxRate || 0
    const vatAmount = subtotal * vatRate / 100
    const serviceTaxAmount = subtotal * serviceTaxRate / 100
    const totalAmount = subtotal + vatAmount + serviceTaxAmount

    const expteamQuotation = Number(request.expteamQuotation || 0)
    const estimatedPrCost = Number(request.estimatedPrCost || 0)
    const jobBalanceCost = expteamQuotation - estimatedPrCost

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>ใบคำขอซื้อ ${request.wrNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sarabun', sans-serif; padding: 20px; color: #000; font-size: 13px; line-height: 1.4; }
    .header-wrapper { display: flex; align-items: flex-start; margin-bottom: 10px; border-bottom: 3px solid #2c3e50; padding-bottom: 10px; }
    .logo-section { flex: 0 0 45%; display: flex; align-items: center; gap: 10px; }
    .logo-box { width: 60px; height: 60px; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #e74c3c; font-size: 24px; }
    .cert-badges { display: flex; gap: 5px; }
    .cert-badge { width: 50px; height: 50px; border: 1px solid #333; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; }
    .title-section { flex: 1; text-align: right; }
    .title-thai { font-size: 18px; font-weight: 700; color: #2c3e50; }
    .title-eng { background-color: #c0504d; color: white; padding: 5px 10px; font-size: 16px; font-weight: 700; margin-top: 2px; display: inline-block; }
    .company-info { text-align: center; font-size: 11px; margin-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 40% 20% 20% 20%; border: 1px solid black; margin-bottom: 10px; }
    .info-row { display: contents; }
    .info-cell { border: 1px solid black; padding: 6px; }
    .section-header { grid-column: 2 / span 3; grid-row: 1 / span 3; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; font-size: 14px; background-color: #f0f0f0; }
    .info-label { font-weight: bold; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
    .items-table th { background-color: #f0f0f0; font-weight: 700; }
    .items-table td.left { text-align: left; }
    .items-table td.right { text-align: right; }
    .total-section { padding: 10px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .grand-total { font-weight: 700; font-size: 14px; }
    .note-section { margin: 4px; font-size: 12px; }
    .note-box { border: 1px solid #000; padding: 8px; min-height: 40px; }
    .signature-section { display: flex; justify-content: space-between; margin-top: 20px; gap: 20px; }
    .signature-box { flex: 1; text-align: center; }
    .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
    @media print { body { padding: 10px; } @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header-wrapper">
    <div class="logo-section">
      <div class="logo-box">
        <img src="/logo.png" alt="Logo" style="max-width:100%; max-height:100%;">
      </div>
      <div class="cert-badges">
        <div class="cert-badge"><div>ISO 9001</div><div style="font-size:8px">Management</div></div>
        <div class="cert-badge"><div>ISO 14001</div><div style="font-size:8px">Environment</div></div>
        <div class="cert-badge"><div>ISO 45001</div><div style="font-size:8px">Safety</div></div>
      </div>
    </div>
    <div class="title-section">
      <div class="title-thai">บริษัท เอ็กซ์เพอร์ทีม จำกัด</div>
      <div class="title-eng">EXPERTEAM COMPANY LIMITED</div>
    </div>
  </div>

  <div class="company-info">
    สำนักงานใหญ่ 110,112,114 ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150<br>
    โทรศัพท์ 02-8986001, โทรสาร 02-8986451 Email: extec@experteam.co.th, Website: www.experteam.co.th
  </div>

  <div class="info-grid">
    <div class="info-cell section-header">ใบคำขอซื้อ<br />PURCHASE REQUISITION</div>

    <div class="info-row">
      <div class="info-cell"><div class="info-label">งาน Job:</div><div>${request.projectName || "-"}</div></div>
      <div class="info-cell"><div class="info-label">เลขที่ใบขอซื้อ</div><div>${request.wrNumber}</div></div>
      <div class="info-cell"><div class="info-label">วันที่ Date :</div><div>${formatDate(request.requestDate)}</div></div>
    </div>

    <div class="info-row">
      <div class="info-cell"><div class="info-label">สถานที่ ( Location )</div><div>${request.deliveryLocation || "-"}</div></div>
      <div class="info-cell"><div class="info-label">Project code :</div><div>${request.projectNote || "-"}</div></div>
      <div class="info-cell"><div class="info-label">C.C. No.</div><div>${request.ccNo || "-"}</div></div>
    </div>

    <div class="info-row">
      <div class="info-cell"><div class="info-label">Trader :</div><div>${client?.name || request.clientName || "-"}</div></div>
      <div class="info-cell"><div class="info-label">Job. No.</div><div>${request.jobNumber || "-"}</div></div>
      <div class="info-cell"><div class="info-label">Purchase by :</div><div>${request.requestedBy}</div></div>
    </div>

    <div class="info-row">
      <div class="info-cell"><div class="info-label">ROS Date :</div><div>${formatDate(request.requiredDate)}</div></div>
      <div class="info-cell"><div class="info-label">Duration :</div><div>${request.duration || "-"} วัน</div></div>
      <div class="info-cell"><div class="info-label">Expteam Quotation :</div><div>${formatCurrency(expteamQuotation)}</div></div>
    </div>

    <div class="info-row">
      <div class="info-cell"><div class="info-label">Estimated PR Cost :</div><div>${formatCurrency(estimatedPrCost)}</div></div>
      <div class="info-cell"><div class="info-label">Job Balance Cost :</div><div>${formatCurrency(jobBalanceCost)}</div></div>
      <div class="info-cell"><div class="info-label">Supplier :</div><div>${supplier?.name || request.supplierName || "-"}</div></div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>ลำดับ<br>ITEM</th>
        <th>รายการสินค้า<br>DESCRIPTION</th>
        <th>จำนวน - หน่วย<br>QUANTITY UNIT</th>
        <th>หน่วยละ<br>UNIT PRICE</th>
        <th>ราคารวม<br>AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${request.items?.map((item: any, idx: number) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="left">${item.description}${item.remarks ? `<br><small style="color:#666">${item.remarks}</small>` : ""}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td class="right">${formatCurrency(item.estimatedPrice)}</td>
          <td class="right">${formatCurrency(item.totalPrice)}</td>
        </tr>
      `).join("") || ""}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row"><span>ยอดรวม (ก่อนภาษี)</span><span>${formatCurrency(subtotal)}</span></div>
    <div class="total-row"><span>VAT (${vatRate}%):</span><span>${formatCurrency(vatAmount)}</span></div>
    ${serviceTaxRate > 0 ? `<div class="total-row"><span>Service Tax (${serviceTaxRate}%):</span><span>${formatCurrency(serviceTaxAmount)}</span></div>` : ""}
    <div class="total-row grand-total"><strong>รวมทั้งสิ้น</strong><strong>${formatCurrency(totalAmount)}</strong></div>
  </div>

  <div class="note-section">
    <div style="margin-bottom: 2px"><strong>หมายเหตุ/เงื่อนไข:</strong></div>
    <div class="note-box">${request.remark || "ไม่มีหมายเหตุ"}</div>
  </div>

  <div class="signature-section">
    <div class="signature-box"><div class="signature-line"></div><div>ผู้ขอซื้อ</div></div>
    <div class="signature-box"><div class="signature-line"></div><div>Project / Originator</div></div>
    <div class="signature-box"><div class="signature-line"></div><div>ผู้อนุมัติ</div></div>
  </div>
</body>
</html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 max-w-full">

        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 md:p-8 border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/wr")}
                className="hover:bg-slate-100 rounded-full flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent truncate">
                    {request.wrNumber}
                  </h1>
                  <Badge className={`${getStatusColor(request.status)} font-medium px-2 sm:px-3 py-1 text-xs border flex items-center gap-1 flex-shrink-0`}>
                    {getStatusIcon(request.status)}
                    <span className="line-clamp-1">{request.status}</span>
                  </Badge>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                  {request.projectName} • สร้างเมื่อ {createdDate}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
              <Button onClick={handleExportPDF} className="flex-1 md:flex-none bg-sky-400 hover:bg-blue-700 text-white">
                  <Download className="h-4 w-4 mr-2" /> Export PDF
                </Button>
              <Link href={`/wr/${id}/edit`} className="flex-1 md:flex-none">
                <Button className="w-full bg-stone-600 hover:bg-stone-300 hover:text-black">
                  <Edit className="h-4 w-4 mr-1 sm:mr-2" /> แก้ไข
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 w-full">

          {/* Left Column */}
          <div className="xl:col-span-2 space-y-4 md:space-y-6 w-full">

            {/* Project Info */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-3">
                <CardTitle className="text-base sm:text-lg text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  ข้อมูลโปรเจกต์
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 px-4 sm:px-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Project Name</p>
                    <p className="font-bold text-slate-900">{request.projectName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Job No.</p>
                    <p className="font-bold text-slate-900">{request.projectNote || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">C.C. No.</p>
                    <p className="font-bold text-slate-900">{request.ccNo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Trader</p>
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {client?.name || request.clientName || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b pb-3">
                <CardTitle className="text-base sm:text-lg text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  สรุปต้นทุน
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 px-4 sm:px-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Expteam Quotation</p>
                    <p className="font-bold text-slate-900">{parseFloat(request.expteamQuotation || "0").toLocaleString()} บาท</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Estimated PR Cost</p>
                    <p className="font-bold text-slate-900">{parseFloat(request.estimatedPrCost || "0").toLocaleString()} บาท</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-600">Job Balance Cost</p>
                    <p className={`font-bold ${jobBalanceCost >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {jobBalanceCost >= 0 ? jobBalanceCost.toLocaleString() : "0"} บาท
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b pb-3">
                <CardTitle className="text-base sm:text-lg text-slate-800">รายการสินค้า/งาน</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ลำดับ</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead className="text-center">จำนวน</TableHead>
                        <TableHead className="text-center">หน่วย</TableHead>
                        <TableHead className="text-right">ราคา/หน่วย</TableHead>
                        <TableHead className="text-right">รวม</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {request.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-center">{item.itemNo}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.unit}</TableCell>
                          <TableCell className="text-right">{item.estimatedPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">{item.totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Total Summary */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardContent className="pt-4 space-y-2 px-4 sm:px-5 text-right">
                <div className="flex justify-end gap-8 items-center">
                  <span className="text-sm">ยอดรวม</span>
                  <span className="font-medium w-32">{subtotal.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-end gap-8 items-center">
                  <span className="text-sm">VAT ({request.vatRate}%)</span>
                  <span className="font-medium w-32">{vatAmount.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-end gap-8 items-center">
                  <span className="text-sm">Service Tax ({request.serviceTaxRate}%)</span>
                  <span className="font-medium w-32">{serviceTaxAmount.toLocaleString()} บาท</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-end gap-8 items-center pt-2">
                  <span className="text-lg font-bold">รวมทั้งสิ้น</span>
                  <span className="text-xl font-bold text-blue-600 w-32">{totalAmount.toLocaleString()} บาท</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6 w-full">

            {/* Basic Info */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
                <CardTitle className="text-base">ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 px-4 sm:px-5">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">ผู้ขอ</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {request.requestedBy}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">แผนก</p>
                  <p className="font-bold text-slate-900">{request.department}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Supplier</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {supplier?.name || request.supplierName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">สถานที่ส่งของ</p>
                  <p className="font-bold text-slate-900">{request.deliveryLocation || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b pb-3">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  ข้อมูลเวลา
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 px-4 sm:px-5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex justify-between">
                  <span className="text-xs font-medium text-slate-700">วันที่ขอ</span>
                  <span className="text-xs font-bold text-blue-700">
                    {new Date(request.requestDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between">
                  <span className="text-xs font-medium text-slate-700">ROS Date</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {request.requiredDate ? new Date(request.requiredDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex justify-between">
                  <span className="text-xs font-medium text-slate-700">Duration</span>
                  <span className="text-xs font-bold text-amber-700">{request.duration ? `${request.duration} วัน` : "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Remark */}
            {request.remark && (
              <Card className="border-0 shadow-md rounded-2xl sm:rounded-3xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b pb-3">
                  <CardTitle className="text-base text-slate-800">หมายเหตุ</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 sm:px-5">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.remark}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}