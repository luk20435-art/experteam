"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Download, Calendar, User, Building2, Target, Truck, Package, FileText, Briefcase, MapPin, Clock, DollarSign } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getPR, projects, clients, suppliers } = useData()
  const pr = getPR(id)

  if (!pr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="text-center space-y-4 max-w-md">
          <FileText className="h-16 w-16 mx-auto text-slate-400 opacity-50" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">ไม่พบข้อมูล PR</h2>
          <p className="text-slate-400 text-sm">ขอบคุณที่ค้นหา แต่ไม่พบรายการที่ต้องการ</p>
          <Link href="/pr" className="inline-block mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> กลับไปหน้ารายการ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const project = pr.projectId ? projects.find(p => p.id === pr.projectId) : null
  const client = pr.clientId ? clients.find(c => c.id === pr.clientId) : null
  const supplier = pr.supplier ? suppliers.find(s => s.id === pr.supplier) : null

  // ดึงข้อมูลจาก Project ก่อน → ถ้าไม่มีใช้จาก PR
  const displayProjectName = project?.name || pr.projectName || "-"
  const displayJobNo = project?.jobNo || pr.jobNo || "-"
  const displayProjectNote = project?.jobNo || pr.projectNote || "-"
  const displayCcNo = project?.ccNo || pr.ccNo || "-"
  const traderName = client?.name || pr.traderName || "-"
  const supplierName = supplier?.name || pr.supplierName || pr.supplier || "-"

  const vatRate = pr.vatRate ?? 7
  const serviceTaxRate = pr.serviceTaxRate ?? 0

  const items = pr.items || []
  const subtotal = pr.items?.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0) || 0
  const vatAmount = subtotal * (vatRate / 100)
  const serviceTaxAmount = subtotal * (serviceTaxRate / 100)
  const totalAmount = subtotal + vatAmount + serviceTaxAmount

  const expteamQuotation = parseFloat(pr.expteamQuotation || project?.expteamQuotation || "0") || 0
  const estimatedPrCost = parseFloat(pr.estimatedPrCost || project?.estimatedPrCost || "0") || 0
  const jobBalanceCost = expteamQuotation - estimatedPrCost

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "อนุมัติแล้ว":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "รออนุมัติ":
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ใบคำขอซื้อ ${pr.prNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sarabun', sans-serif; padding: 20px; color: #000; font-size: 13px; }
        .header-wrapper { display: flex; align-items: flex-start; margin-bottom: 10px; border-bottom: 3px solid #2c3e50; padding-bottom: 10px; }
        .logo-section { flex: 0 0 45%; display: flex; align-items: center; gap: 10px; }
        .logo-box { width: 60px; height: 60px; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #e74c3c; }
        .cert-badges { display: flex; gap: 5px; }
        .cert-badge { width: 50px; height: 50px; border: 1px solid #333; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; }
        .title-section { flex: 1; text-align: right; }
        .title-thai { font-size: 18px; font-weight: 700; color: #2c3e50; }
        .title-eng { background-color: #c0504d; color: white; padding: 5px 10px; font-size: 16px; font-weight: 700; margin-top: 2px; }
        .company-info { text-align: center; font-size: 11px; margin-bottom: 15px; line-height: 1.4; }
        .info-grid { display: grid; grid-template-columns: 40% 20% 20% 20%; border: 1px solid black; }
        .info-row { display: contents; }
        .info-cell { border: 1px solid black; padding: 6px; }
        .section-header { grid-column: 2; grid-row: 1 / span 3; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; font-size: 14px; background-color: #f0f0f0; }
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
        .signature-section { display: flex; justify-content: space-between; margin-top: 12px; gap: 20px; }
        .signature-box { flex: 1; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
        .extra-info { margin-top: 10px; font-size: 12px; }
        @media print { body { padding: 10px; } @page { margin: 10mm; } }
      </style>
    </head>
    <body>
      <div class="header-wrapper">
        <div class="logo-section">
          <div class="logo-box">
            <img src="/images.jpg" alt="Logo" style="width:120px; height:auto;">
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
          <div class="info-cell"><div class="info-label">งาน Job:</div><div>${displayProjectName}</div></div>
          <div class="info-cell"><div class="info-label">เลขที่ใบขอซื้อ</div><div>${pr.prNumber}</div></div>
          <div class="info-cell"><div class="info-label">วันที่ Date :</div><div>${formatDate(pr.requestDate)}</div></div>
        </div>

        <div class="info-row">
          <div class="info-cell"><div class="info-label">สถานที่ ( Location )</div><div>${pr.deliveryLocation || '-'}</div></div>
          <div class="info-cell"><div class="info-label">Project code :</div><div>${displayProjectNote}</div></div>
          <div class="info-cell"><div class="info-label">C.C. No.</div><div>${displayCcNo}</div></div>
        </div>

        <div class="info-row">
          <div class="info-cell"><div class="info-label">Trader :</div><div>${traderName}</div></div>
          <div class="info-cell"><div class="info-label">Job. No.</div><div>${displayJobNo}</div></div>
          <div class="info-cell"><div class="info-label">Purchase by :</div><div>${pr.requestedBy}</div></div>
        </div>

        <div class="info-row">
          <div class="info-cell"><div class="info-label">ROS Date :</div><div>${formatDate(pr.requiredDate)}</div></div>
          <div class="info-cell"><div class="info-label">Duration :</div><div>${pr.duration || '-'} วัน</div></div>
          <div class="info-cell"><div class="info-label">Expteam Quotation :</div><div>${formatCurrency(expteamQuotation)}</div></div>
        </div>

        <div class="info-row">
          <div class="info-cell"><div class="info-label">Estimated PR Cost :</div><div>${formatCurrency(estimatedPrCost)}</div></div>
          <div class="info-cell"><div class="info-label">Job Balance Cost :</div><div>${formatCurrency(jobBalanceCost)}</div></div>
          <div class="info-cell"><div class="info-label">Supplier :</div><div>${supplierName}</div></div>
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
          ${pr.items?.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="left">${item.description}${item.remarks ? `<br><small style="color: #666">${item.remarks}</small>` : ''}</td>
              <td>${item.quantity} ${item.unit}</td>
              <td class="right">${formatCurrency(item.estimatedPrice)}</td>
              <td class="right">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row"><span>ยอดรวม (ก่อนภาษี)</span><span>${formatCurrency(subtotal)}</span></div>
        <div class="total-row"><span>VAT (${vatRate}%):</span><span>${formatCurrency(vatAmount)}</span></div>
        <div class="total-row"><span>Service Tax (${serviceTaxRate}%)</span><span>${formatCurrency(serviceTaxAmount)}</span></div>
        <div class="total-row grand-total"><strong>รวมทั้งสิ้น</strong><strong>${formatCurrency(totalAmount)}</strong></div>
      </div>

      <div class="note-section">
        <div style="margin-bottom: 2px"><strong>หมายเหตุ/เงื่อนไข:</strong></div>
        <div class="note-box">${pr.remark || 'ไม่มีหมายเหตุ'}</div>
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
    setTimeout(() => { printWindow.print() }, 250)
  }


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 max-w-full">

        {/* Header Section */}
        <div className="group px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 md:p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <Link href="/pr">
                  <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-full flex-shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent truncate">
                      PR {pr.prNumber}
                    </h1>
                    <Badge className={`${getStatusBgColor(pr.status)} font-medium px-2 sm:px-3 py-1 text-xs border flex-shrink-0`}>
                      {getStatusLabel(pr.status)}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                    {displayProjectName} • สร้างเมื่อ {formatDate(pr.requestDate)} • {pr.items?.length || 0} รายการ
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                <Button onClick={handleExportPDF} className="flex-1 md:flex-none bg-sky-400 hover:bg-blue-700 text-white">
                  <Download className="h-4 w-4 mr-1 sm:mr-2" /> Export PDF
                </Button>
                <Link href={`/pr/${pr.id}/edit`} className="flex-1 md:flex-none">
                  <Button className="w-full bg-stone-600 hover:bg-stone-300 hover:text-black">
                    <Pencil className="h-4 w-4 mr-1 sm:mr-2" /> แก้ไข
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 w-full px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-4 md:space-y-6 w-full">

            {/* Requester & Date Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex-shrink-0">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">ผู้ขอซื้อ</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{pr.requestedBy}</p>
                      {pr.department && <p className="text-xs text-slate-500 mt-1 truncate">{pr.department}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">วันที่ขอ</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(pr.requestDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex-shrink-0">
                      <Truck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">วันที่ต้องการของ</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(pr.requiredDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex-shrink-0">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-sm font-bold text-orange-700">{pr.duration || "-"} วัน</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Info Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden w-full">
              <CardHeader className="">
                <CardTitle className="text-base sm:text-lg text-slate-800 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">ข้อมูลโครงการ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-5 space-y-3 pb-4 sm:pb-5 px-4 sm:px-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl from-blue-50 to-cyan-50 border border-blue-100 min-w-0">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Job No.</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{displayJobNo}</p>
                  </div>
                  <div className="p-3 rounded-2xl from-purple-50 to-pink-50 border border-purple-100 min-w-0">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">C.C No.</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{displayCcNo}</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl  from-slate-50 to-slate-100 border border-slate-200 min-w-0">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">โครงการ</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{displayProjectName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Expteam Quotation</p>
                      <p className="text-sm font-bold text-cyan-700">{formatCurrency(expteamQuotation)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Estimated PR Cost</p>
                      <p className="text-sm font-bold text-amber-700">{formatCurrency(estimatedPrCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Job Balance Cost</p>
                      <p className="text-sm font-bold text-green-700">{formatCurrency(jobBalanceCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trader & Supplier Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex-shrink-0">
                      <Building2 className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Trader (ลูกค้า)</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{traderName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex-shrink-0">
                      <Building2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Supplier</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{supplierName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery & Remarks Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex-shrink-0">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">สถานที่ส่งของ</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{pr.deliveryLocation || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pr.remark && (
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                  <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">หมายเหตุ</p>
                        <p className="text-sm font-bold text-slate-800 line-clamp-2">{pr.remark}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4 md:space-y-6 w-full">

            {/* Amount Summary Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden sticky top-4">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-4 sm:pb-5">
                <CardTitle className="text-base">สรุปยอดเงิน</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3 pb-5 sm:pt-6 sm:pb-6">
                {/* คำนวณยอดจริงก่อนแสดง */}
                {(() => {
                  const items = Array.isArray(pr.items) ? pr.items : []
                  const subtotal = items.reduce((sum, item) =>
                    sum + (Number(item.quantity || 0) * Number(item.estimatedPrice || 0)),
                    0
                  )
                  const vatAmount = subtotal * (vatRate / 100)
                  const serviceTaxAmount = subtotal * (serviceTaxRate / 100)
                  const totalAmount = subtotal + vatAmount + serviceTaxAmount

                  return (
                    <>
                      <div>
                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                          ยอดรวม (ก่อนภาษี)
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>

                      <Separator className="my-3" />

                      {vatRate > 0 && (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-700">VAT ({vatRate}%)</span>
                            <span className="font-semibold text-blue-700 text-sm">
                              {formatCurrency(vatAmount)}
                            </span>
                          </div>
                        </div>
                      )}

                      {serviceTaxRate > 0 && (
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-700">Service Tax ({serviceTaxRate}%)</span>
                            <span className="font-semibold text-purple-700 text-sm">
                              {formatCurrency(serviceTaxAmount)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Separator className="my-3" />

                      <div className="p-3 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg">
                        <p className="text-xs font-medium opacity-90 uppercase tracking-wide mb-1">
                          รวมทั้งสิ้น
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                          {formatCurrency(totalAmount)}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Items Count Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 pb-3">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>จำนวนรายการ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 pb-5 sm:pt-6 sm:pb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">{pr.items?.length || 0}</div>
                  <p className="text-xs sm:text-sm text-slate-600">รายการสินค้า</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items Table */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden mx-3 sm:mx-4 md:mx-6 lg:mx-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>รายการสินค้า</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-white flex-shrink-0">
                {pr.items?.length || 0} รายการ
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-5 pb-5 sm:pb-6">
            {Array.isArray(pr.items) && pr.items.length > 0 ? (
              <div className="space-y-5">
                <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                        <TableHead className="w-12 text-center font-bold text-sm">ลำดับ</TableHead>
                        <TableHead className="font-bold text-sm">รายการสินค้า</TableHead>
                        <TableHead className="w-20 text-center font-bold text-sm">จำนวน</TableHead>
                        <TableHead className="w-20 text-center font-bold text-sm">หน่วย</TableHead>
                        <TableHead className="w-28 text-right font-bold text-sm">ราคา/หน่วย</TableHead>
                        <TableHead className="w-28 text-right font-bold text-sm">รวม</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pr.items.map((item, idx) => {
                        // คำนวณยอดรวมจริงของแถวนี้
                        const realTotal = Number(item.quantity || 0) * Number(item.estimatedPrice || 0)

                        return (
                          <TableRow
                            key={item.id || idx}
                            className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <TableCell className="text-center font-semibold text-slate-700 text-xs">
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-800 text-sm">{item.description}</div>
                              {item.remarks && (
                                <div className="text-sm text-slate-500 mt-1 italic">{item.remarks}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-slate-700 text-sm">
                              {item.quantity || "-"}
                            </TableCell>
                            <TableCell className="text-center text-slate-700 text-sm">
                              {item.unit || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-800 text-sm">
                              {formatCurrency(item.estimatedPrice || 0)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 text-sm">
                              {formatCurrency(realTotal)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                  <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                      {/* คำนวณยอดจริงก่อนแสดง */}
                      {(() => {
                        const items = Array.isArray(pr.items) ? pr.items : []
                        const subtotal = items.reduce((sum, item) =>
                          sum + (Number(item.quantity || 0) * Number(item.estimatedPrice || 0)),
                          0
                        )
                        const vatAmount = subtotal * (vatRate / 100)
                        const serviceTaxAmount = subtotal * (serviceTaxRate / 100)
                        const totalAmount = subtotal + vatAmount + serviceTaxAmount

                        return (
                          <>
                            {/* ยอดรวมก่อนภาษี */}
                            <div className="flex justify-between items-center text-slate-700">
                              <span className="font-medium text-xs">ยอดรวม (ก่อนภาษี)</span>
                              <span className="font-bold text-base">{formatCurrency(subtotal)}</span>
                            </div>

                            {/* VAT */}
                            {vatRate > 0 && (
                              <div className="flex justify-between items-center text-slate-700 p-2 rounded-lg bg-blue-50 border border-blue-100">
                                <span className="font-medium text-xs">VAT {vatRate}%</span>
                                <span className="font-semibold text-blue-700 text-sm">
                                  {formatCurrency(vatAmount)}
                                </span>
                              </div>
                            )}

                            {/* Service Tax */}
                            {serviceTaxRate > 0 && (
                              <div className="flex justify-between items-center text-slate-700 p-2 rounded-lg bg-purple-50 border border-purple-100">
                                <span className="font-medium text-xs">Service Tax {serviceTaxRate}%</span>
                                <span className="font-semibold text-purple-700 text-sm">
                                  {formatCurrency(serviceTaxAmount)}
                                </span>
                              </div>
                            )}

                            {/* รวมทั้งสิ้น */}
                            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-700 shadow-lg">
                              <span className="text-base font-bold tracking-wider">รวมทั้งสิ้น</span>
                              <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Package className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-base font-medium text-slate-600">ไม่มีรายการสินค้า</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}