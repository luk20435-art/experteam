"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, cn } from "@/src/lib/utils"
import { differenceInDays } from "date-fns"
import {
  ArrowLeft, Download, Edit, Building2, Calendar, CreditCard,
  MapPin, FileCheck, Package, Clock, AlertCircle,
  Handshake
} from "lucide-react"
import type { PurchaseOrder } from "@/src/types"

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getPO, prs, pos, projects, clients, traders, suppliers } = useData()
  const po = getPO(id)

  if (!po) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="text-center space-y-4">
          <FileCheck className="h-16 w-16 mx-auto text-slate-400 opacity-50" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">ไม่พบข้อมูล PO</h2>
          <Link href="/po">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> กลับไปหน้ารายการ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const linkedPR = po.prId ? prs.find(p => p.id === po.prId) : null
  const project = po.projectId ? projects.find(p => p.id === po.projectId) : null

  const traderName = po.traderName ||
    clients.find(c => c.id === po.trader)?.name ||
    traders.find(t => t.id === po.trader)?.name ||
    "ไม่ระบุ"

  let supplierName = po.supplierName || "ไม่ระบุ"
  if (!po.supplierName && po.supplier) supplierName = suppliers.find(s => s.id === po.supplier)?.name || po.supplier
  if (!po.supplierName && !po.supplier && linkedPR?.supplier) supplierName = suppliers.find(s => s.id === linkedPR.supplier)?.name || linkedPR.supplier
  if (!po.supplierName && !po.supplier && !linkedPR?.supplier && project?.supplier) supplierName = suppliers.find(s => s.id === project.supplier)?.name || project.supplier

  // ดึงข้อมูลจาก PR ก่อน → fallback Project
  const jobNumber = (linkedPR?.jobNumber || linkedPR?.jobNo || "") || po.jobNumber || project?.jobNo || project?.projectNumber || "-"
  const ccNo = linkedPR?.ccNo || po.ccNo || project?.ccNo || "-"
  const expteamQuotation = linkedPR?.expteamQuotation || po.expteamQuotation || project?.expteamQuotation || ""
  const estimatedPrCost = linkedPR?.estimatedPrCost || po.estimatedPrCost || project?.estimatedCost || ""

  // คำนวณ Job Balance Cost
  let jobBalanceCost = "0"
  if (po.projectId && project) {
    const totalPOAmount = pos
      .filter(p => p.projectId === po.projectId && p.status !== "ยกเลิก")
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    const totalBudget = Number(project.budget) || Number(project.estimatedCost) || 0
    jobBalanceCost = (totalBudget - totalPOAmount).toFixed(2)
  }

  // วันที่ + จำนวนวัน
  const orderDate = po.orderDate || po.createdAt.split("T")[0]
  const deliveryDate = po.deliveryDate || linkedPR?.requiredDate || ""
  const durationDays = deliveryDate && orderDate ? differenceInDays(new Date(deliveryDate), new Date(orderDate)) : 0

  const subtotal = po.subtotal || 0
  const vatAmount = po.vatAmount || 0
  const serviceTaxAmount = po.serviceTaxAmount || 0
  const totalAmount = po.totalAmount || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "อนุมัติแล้ว": return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "รออนุมัติ": return "bg-amber-100 text-amber-800 border-amber-300"
      case "ร่าง": return "bg-slate-100 text-slate-800 border-slate-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const orderDateTH = new Date(orderDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
    const deliveryDateTH = deliveryDate ? new Date(deliveryDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }) : "-"

    const html = `<!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>ใบสั่งซื้อ ${po.poNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sarabun', sans-serif; padding: 15px; font-size: 13px; color: #000; line-height: 1.4; }
        .container { max-width: 210mm; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2c3e50; padding-bottom: 8px; margin-bottom: 10px; }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo { width: 65px; height: 65px; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 28px; color: #e74c3c; }
        .certs { display: flex; gap: 6px; }
        .cert { width: 48px; height: 48px; border: 1.5px solid #333; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; text-align: center; line-height: 1.1; }
        .company-title { text-align: right; }
        .thai-name { font-size: 19px; font-weight: 700; color: #2c3e50; }
        .eng-name { background: #c0504d; color: white; padding: 4px 12px; font-size: 16px; font-weight: 700; margin-top: 3px; display: inline-block; }
        .company-info { text-align: center; font-size: 11px; margin: 12px 0; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
        .label { font-weight: 700; }
        .header-center { background: #f0f0f0; text-align: center; font-weight: 700; font-size: 14px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .items-table th { border: 1px solid #000; background: #f0f0f0; padding: 6px; text-align: center; font-weight: 700; font-size: 12px; }
        .items-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-box { border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
        .grand-total { font-weight: 700; font-size: 15px; }
        .note-box { border: 1px solid #000; padding: 10px; min-height: 70px; font-size: 12px; }
        .signature { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-box { text-align: center; width: 30%; }
        .sig-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 8px; }
        .footer { text-align: right; font-size: 10px; margin-top: 20px; }
        @page { margin: 10mm; }
        @media print { body { padding: 5mm; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-section">
            <div class="logo">
              <img src="https://experteam.co.th/wp-content/uploads/2020/06/logo-experteam.png" alt="Logo" style="width: 55px; height: auto;">
            </div>
            <div class="certs">
              <div class="cert">ISO<br>9001<br><span style="font-size:7px">Management</span></div>
              <div class="cert">ISO<br>14001<br><span style="font-size:7px">Environment</span></div>
              <div class="cert">ISO<br>45001<br><span style="font-size:7px">Safety</span></div>
            </div>
          </div>
          <div class="company-title">
            <div class="thai-name">บริษัท เอ็กซ์เพอร์ทีม จำกัด</div>
            <div class="eng-name">EXPERTEAM COMPANY LIMITED</div>
          </div>
        </div>

        <div class="company-info">
          สำนักงานใหญ่ 110,112,114 ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150<br>
          โทรศัพท์ 02-8986001, โทรสาร 02-8986451 Email: extec@experteam.co.th, Website: www.experteam.co.th
        </div>

        <table class="info-table">
          <tr>
            <td width="50%">
              <span class="label">Supplier:</span><br>
              ${supplierName}
            </td>
            <td width="25%">
              <span class="label">เลขที่ใบสั่งซื้อ</span><br>
              ${po.poNumber}
            </td>
            <td width="25%">
              <span class="label">วันที่ Date :</span><br>
              ${orderDateTH}
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">เลข PR</span><br>
              ${po.prNumber || "-"}
            </td>
            <td colspan="2" class="header-center">
              ใบสั่งซื้อ<br>PURCHASE ORDER
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">เงื่อนไขการชำระเงิน</span><br>
              ${po.paymentTerms || "เครดิต 30 วัน"}
            </td>
            <td colspan="2">
              <span class="label">วันที่ต้องการรับสินค้า</span><br>
              ${deliveryDateTH}
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th width="50">ลำดับ<br>ITEM</th>
              <th>รายการสินค้า<br>DESCRIPTION</th>
              <th width="110">จำนวน - หน่วย<br>QUANTITY UNIT</th>
              <th width="100">หน่วยละ<br>UNIT PRICE</th>
              <th width="120">ราคารวม<br>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${po.items?.map((item, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td class="text-left">${item.description || ""}</td>
                <td class="text-center">${item.quantity || 0} ${item.unit || "ชิ้น"}</td>
                <td class="text-right">${formatCurrency(item.unitPrice || 0)}</td>
                <td class="text-right">${formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
              </tr>
            `).join("") || ""}
            ${Array.from({ length: Math.max(0, 8 - (po.items?.length || 0)) }).map(() => `
              <tr>
                <td>&nbsp;</td>
                <td class="text-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>ยอดรวม (ก่อนภาษี)</span><span>${formatCurrency(subtotal)}</span></div>
          <div class="total-row"><span>VAT (${po.vatRate || 0}%)</span><span>${formatCurrency(vatAmount)}</span></div>
          <div class="total-row"><span>Service Tax (${po.serviceTaxRate || 0}%)</span><span>${formatCurrency(serviceTaxAmount)}</span></div>
          <div class="total-row grand-total"><strong>รวมทั้งสิ้น</strong><strong>${formatCurrency(totalAmount)}</strong></div>
        </div>

        <div style="margin: 15px 0;">
          <strong>หมายเหตุ/เงื่อนไข:</strong>
          <div class="note-box">
            1) โปรดระบุเลขที่ใบสั่งซื้อ ใบเสร็จรับเงิน/ใบกำกับภาษี หรือ ใบเสนอราคา ทุกครั้งเพื่อสะดวกในการอ้างอิงและชำระเงิน<br>
            2) เมื่อรับใบสั่งซื้อถือว่ายอมรับเงื่อนไขข้างต้น และเงื่อนไขที่แนบมาด้วย<br>
            3) โปรดแนบใบสั่งซื้อ สำเนา เมื่อมาวางบิลเรียกเก็บเงิน<br>
            ${po.remarks ? "<br><br>หมายเหตุเพิ่มเติม: " + po.remarks : ""}
          </div>
        </div>

        <div class="signature">
          <div class="sig-box">
            <div style="font-weight:600; text-decoration:underline;">ผู้ขอซื้อ</div>
            <div class="sig-line"></div>
          </div>
          <div class="sig-box">
            <div style="font-weight:600; text-decoration:underline;">Project / Originator</div>
            <div class="sig-line"></div>
          </div>
          <div class="sig-box">
            <div style="font-weight:600; text-decoration:underline;">ผู้อนุมัติ</div>
            <div class="sig-line"></div>
          </div>
        </div>

        <div class="footer">
          Page 1/1<br>
          FP-PU01-006_PO/01/072012_Rev00
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
      {/* ทำให้เต็มหน้าจอ ไม่มีช่องว่างข้าง ๆ */}
      <div className="w-full">

        {/* Header */}
        <div className="bg-white shadow-lg border-b border-slate-200">
          <div className="px-4 py-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Link href="/po">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
                      PO {po.poNumber}
                    </h1>
                    <Badge className={`${getStatusColor(po.status)} px-4 py-1.5 text-sm font-medium`}>
                      {po.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>สร้างเมื่อ {new Date(po.createdAt).toLocaleDateString("th-TH")}</span>
                    <span>•</span>
                    <span>{po.items?.length || 0} รายการ</span>
                    {po.prNumber && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">PR: {po.prNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" /> Export PDF
                </Button>
                <Link href={`/po/${po.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" /> แก้ไข
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6">

          {/* ข้อมูลหลัก + สรุปยอด (2 คอลัมน์) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ซ้าย - ข้อมูลหลัก */}
            <div className="lg:col-span-2 space-y-6">

              {/* PR + Supplier + Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <FileCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">PR ที่อ้างอิง</p>
                        <p className="text-lg font-bold text-blue-700">{linkedPR?.prNumber || "-"}</p>
                        <p className="text-sm text-slate-600 mt-1">{linkedPR?.projectName || linkedPR?.purpose || ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Supplier (ผู้ขาย)</p>
                          <p className="text-lg font-bold text-purple-700">{supplierName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Handshake className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">trader</p>
                          <p className="text-lg font-bold text-purple-700">{traderName}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job No. + C.C No. + Project Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Job No.</p>
                    <p className="text-2xl font-bold text-emerald-700">{jobNumber}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">C.C No.</p>
                    <p className="text-2xl font-bold text-orange-700">{ccNo}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-slate-50 to-slate-100">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">โครงการ</p>
                    <p className="text-lg font-bold text-slate-700">{project?.name || po.projectName || "-"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Expteam + Estimated + Job Balance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Expteam Quotation</p>
                    <p className="text-2xl font-bold text-blue-700">{expteamQuotation ? formatCurrency(expteamQuotation) : "-"}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Estimated PR Cost</p>
                    <p className="text-2xl font-bold text-purple-700">{estimatedPrCost ? formatCurrency(estimatedPrCost) : "-"}</p>
                  </CardContent>
                </Card>
                <Card className={cn(
                  "border-0 shadow-md rounded-3xl overflow-hidden text-center",
                  Number(jobBalanceCost) >= 0 ? "bg-gradient-to-br from-green-50 to-emerald-50" : "bg-gradient-to-br from-red-50 to-rose-50 animate-pulse"
                )}>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Job Balance Cost</p>
                    <p className={cn("text-3xl font-bold", Number(jobBalanceCost) >= 0 ? "text-green-700" : "text-red-700")}>
                      {formatCurrency(jobBalanceCost)}
                    </p>
                    {Number(jobBalanceCost) < 0 && (
                      <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                        <AlertCircle className="h-4 w-4" /> ยอดเกินงบ
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* วันที่ + จำนวนวัน */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">วันที่สั่งซื้อ</p>
                    <p className="text-xl font-bold text-blue-700">{new Date(orderDate).toLocaleDateString("th-TH")}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">วันที่ต้องการรับของ</p>
                    <p className="text-xl font-bold text-emerald-700">{deliveryDate ? new Date(deliveryDate).toLocaleDateString("th-TH") : "-"}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                  <CardContent className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">จำนวนวัน</p>
                    <p className="text-4xl font-bold text-purple-700">{durationDays}</p>
                    <p className="text-sm text-slate-600">วัน</p>
                  </CardContent>
                </Card>
              </div>

              {/* รายการสินค้า */}
              <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" /> รายการสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-16 text-center">ลำดับ</TableHead>
                          <TableHead>รายการ</TableHead>
                          <TableHead className="w-24 text-center">จำนวน</TableHead>
                          <TableHead className="w-32 text-right">ราคา/หน่วย</TableHead>
                          <TableHead className="w-24 text-center">หน่วย</TableHead>
                          <TableHead className="w-32 text-right">รวม</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(!po.items || po.items.length === 0) ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                              <Package className="h-8 w-8 mx-auto opacity-50 mb-2" />
                              <p>ไม่มีรายการสินค้า</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          po.items.map((item, i) => (
                            <TableRow key={i} className="hover:bg-blue-50 transition-colors">
                              <TableCell className="text-center font-semibold">{i + 1}</TableCell>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-center">{item.unit}</TableCell>
                              <TableCell className="text-right font-bold text-blue-600">
                                {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {po.items && po.items.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="flex justify-end">
                        <div className="w-full max-w-md space-y-3">
                          <div className="flex justify-between text-lg">
                            <span className="font-medium">ยอดรวม (ก่อนภาษี)</span>
                            <span className="font-bold">{formatCurrency(subtotal)}</span>
                          </div>
                          {po.vatRate > 0 && (
                            <div className="flex justify-between p-2 rounded-lg bg-blue-50">
                              <span>VAT {po.vatRate}%</span>
                              <span className="font-semibold text-blue-700">{formatCurrency(vatAmount)}</span>
                            </div>
                          )}
                          {po.serviceTaxRate > 0 && (
                            <div className="flex justify-between p-2 rounded-lg bg-purple-50">
                              <span>Service Tax {po.serviceTaxRate}%</span>
                              <span className="font-semibold text-purple-700">{formatCurrency(serviceTaxAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-2xl font-bold text-white p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
                            <span>รวมทั้งสิ้น</span>
                            <span>{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ขวา - สรุปยอดเงิน */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md rounded-3xl overflow-hidden sticky top-6">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="text-lg">สรุปยอดเงิน</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="text-4xl font-bold text-slate-900">{formatCurrency(totalAmount)}</div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">ก่อนภาษี</span><span>{formatCurrency(subtotal)}</span></div>
                    {po.vatRate > 0 && <div className="flex justify-between"><span className="text-slate-600">VAT {po.vatRate}%</span><span>{formatCurrency(vatAmount)}</span></div>}
                    {po.serviceTaxRate > 0 && <div className="flex justify-between"><span className="text-slate-600">Service Tax</span><span>{formatCurrency(serviceTaxAmount)}</span></div>}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" /> สถานะ
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Badge className={`${getStatusColor(po.status)} w-full py-3 text-center text-base font-medium`}>
                    {po.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}