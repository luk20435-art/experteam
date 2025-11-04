"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, FileDown, Building2, User, Calendar, CreditCard, Package, FileText, Phone, Mail, MapPin } from "lucide-react"
import { useData } from "@/src/contexts/data-context"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/src/lib/utils"
import type { POItem, PurchaseOrder } from "@/src/types"

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getPO } = useData()
  const po = getPO(id)

  if (!po) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-6xl">📋</div>
          <div className="text-xl font-semibold text-gray-700">ไม่พบข้อมูล PO</div>
          <Link href="/po">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้ารายการ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ใบสั่งซื้อ ${po.poNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Sarabun', sans-serif; 
          padding: 20px;
          color: #000;
          font-size: 13px;
        }
        
        .header-wrapper {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 10px;
        }
        .logo-section {
          flex: 0 0 45%;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-box {
          width: 60px;
          height: 60px;
          border: 2px solid #e74c3c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #e74c3c;
        }
        .cert-badges {
          display: flex;
          gap: 5px;
        }
        .cert-badge {
          width: 50px;
          height: 50px;
          border: 1px solid #333;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
        }
        .title-section {
          flex: 1;
          text-align: right;
        }
        .title-thai {
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
        }
        .title-eng {
          background-color: #c0504d;
          color: white;
          padding: 5px 10px;
          font-size: 16px;
          font-weight: 700;
          margin-top: 2px;
        }
        
        .company-info {
          text-align: center;
          font-size: 11px;
          margin-bottom: 15px;
          line-height: 1.4;
        }
        
        .info-grid {
          display: table;
          width: 100%;
          border: 1px solid #000;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .info-row {
          display: table-row;
        }
        .info-cell {
          display: table-cell;
          border: 1px solid #000;
          padding: 6px 8px;
          vertical-align: top;
        }
        .info-label {
          font-weight: 600;
          min-width: 100px;
        }
        .section-header {
          background-color: #f0f0f0;
          font-weight: 700;
          text-align: center;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 6px;
          text-align: center;
        }
        .items-table th {
          background-color: #f0f0f0;
          font-weight: 700;
          font-size: 12px;
        }
        .items-table td {
          font-size: 12px;
        }
        .items-table td.left {
          text-align: left;
        }
        .items-table td.right {
          text-align: right;
        }
        
        .total-section {
          border-top: 1px solid #000;
          padding: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .grand-total {
          font-weight: 700;
          font-size: 14px;
        }
        
        .note-section {
          margin: 15px 0;
          font-size: 12px;
        }
        .note-box {
          border: 1px solid #000;
          padding: 8px;
          min-height: 40px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          gap: 20px;
        }
        .signature-box {
          flex: 1;
          text-align: center;
        }
        .signature-label {
          font-weight: 600;
          margin-bottom: 5px;
          text-decoration: underline;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 50px;
          padding-top: 5px;
        }
        
        .footer {
          margin-top: 20px;
          text-align: right;
          font-size: 11px;
        }
        
        @media print {
          body { padding: 10px; }
          @page { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="header-wrapper">
        <div class="logo-section">
          <div class="logo-box">
            <img src="/images.jpg" alt="Logo" style="width:120px; height:auto;">
          </div>
          <div class="cert-badges">
            <div class="cert-badge">
              <div>ISO 9001</div>
              <div style="font-size:8px">Management</div>
            </div>
            <div class="cert-badge">
              <div>ISO 14001</div>
              <div style="font-size:8px">Environment</div>
            </div>
            <div class="cert-badge">
              <div>ISO 45001</div>
              <div style="font-size:8px">Safety</div>
            </div>
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
        <div class="info-row">
          <div class="info-cell" style="width: 50%">
            <div style="margin-bottom: 4px"><span class="info-label">Supplier:</span></div>
            <div>${po.supplier?.name || '-'}</div>
          </div>
          <div class="info-cell" style="width: 25%">
            <div class="info-label">เลขที่เอกสาร</div>
            <div>${po.poNumber}</div>
          </div>
          <div class="info-cell" style="width: 25%">
            <div class="info-label">วันที่ Date :</div>
            <div>${po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString("th-TH") : "-"}</div>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">เลข PR</div>
            <div>${po.prNumber}</div>
          </div>
          <div class="info-cell section-header" colspan="2">
            ใบสั่งซื้อ<br>PURCHASE ORDER
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">เงื่อนไขการชำระเงิน</div>
            <div>${po.paymentTerms || '-'}</div>
          </div>
          <div class="info-cell" colspan="2">
            <div class="info-label">วันที่ต้องการรับสินค้า</div>
            <div>${po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString("th-TH") : "-"}</div>
          </div>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50px">ลำดับ<br>ITEM</th>
            <th>รายการสินค้า<br>DESCRIPTION</th>
            <th style="width: 100px">จำนวน - หน่วย<br>QUANTITY UNIT</th>
            <th style="width: 100px">หน่วยละ<br>UNIT PRICE</th>
            <th style="width: 120px">ราคารวม<br>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="left">${item.description}</td>
              <td>${item.quantity} ${item.unit}</td>
              <td class="right">${formatCurrency(item.unitPrice)}</td>
              <td class="right">${formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          `).join('')}
          ${Array.from({ length: Math.max(0, 5 - po.items.length) }).map(() => `
            <tr>
              <td>&nbsp;</td>
              <td class="left">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <span>ยอดรวม (ก่อนภาษี)</span>
          <span>${formatCurrency(po.subtotal || 0)}</span>
        </div>
        <div class="total-row">
          <span>VAT (${po.vatRate ?? 0}%)</span>
          <span>${formatCurrency(po.vatAmount || 0)}</span>
        </div>
        <div class="total-row">
          <span>Service Tax (${po.serviceTaxRate ?? 0}%)</span>
          <span>${formatCurrency(po.serviceTaxAmount || 0)}</span>
        </div>
        <div class="total-row grand-total">
          <strong>รวมทั้งสิ้น</strong>
          <strong>${formatCurrency(po.totalAmount || 0)}</strong>
        </div>
      </div>

      <div class="note-section">
        <div style="margin-bottom: 4px"><strong>หมายเหตุ/เงื่อนไข:</strong></div>
        <div class="note-box">
          ${po.notes || '-'}
        </div>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-label">ผู้ขอซื้อ</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div class="signature-label">Project / Originator</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div class="signature-label">ผู้อนุมัติ</div>
          <div class="signature-line"></div>
        </div>
      </div>
      
      <div class="footer">
        Page 1/1<br>
        FP-PU01-006_PO/01/072012_Rev00
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link href="/po">
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-900">{po.poNumber}</h1>
                  <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                    Purchase Order
                  </Badge>
                </div>
                <p className="text-lg text-slate-600">รายละเอียดใบสั่งซื้อ</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportPDF} className="shadow-sm">
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </Button>
              <Link href={`/po/${po.id}/edit`}>
                <Button className="shadow-sm bg-purple-600 hover:bg-purple-700">
                  <Edit className="mr-2 h-4 w-4" /> แก้ไข
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PO Number */}
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-500 mb-1">เลข PO</div>
                  <div className="text-lg font-semibold text-slate-900 truncate">{po.poNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PR Number */}
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-500 mb-1">เลข PR</div>
                  <div className="text-lg font-semibold text-slate-900 truncate">{po.prNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Date */}
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-500 mb-1">วันที่ต้องการรับ</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {po.deliveryDate ? formatDate(po.deliveryDate) : "-"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-500 mb-1">เงื่อนไขชำระเงิน</div>
                  <div className="text-lg font-semibold text-slate-900 truncate">
                    {po.paymentTerms || "-"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier & Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplier Info */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-xl">ข้อมูล Supplier</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {po.supplier?.name || "-"}
                  </div>
                  <div className="text-lg text-slate-600">
                    {po.supplier?.contactPerson || "-"}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500">อีเมล</div>
                      <div className="font-medium text-slate-900">
                        {po.supplier?.email || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500">เบอร์โทร</div>
                      <div className="font-medium text-slate-900">
                        {po.supplier?.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {po.supplier?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500">ที่อยู่</div>
                      <div className="font-medium text-slate-900">
                        {po.supplier.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes & Created Date */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
              <CardTitle className="text-lg">รายละเอียดเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-500 mb-2">วันที่สร้าง</div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(po.createdAt)}
                </div>
              </div>

              {po.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-2">หมายเหตุ</div>
                    <div className="bg-slate-50 rounded-lg p-3 text-slate-900">
                      {po.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Items Section */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-xl">รายการสินค้า</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-16">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">รายการ</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-24">จำนวน</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-24">หน่วย</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 w-32">ราคา/หน่วย</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 w-32">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {po.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-600">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">{item.unit}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {po.items.map((item, index) => (
                  <Card key={index} className="shadow-sm border-slate-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">ลำดับ {index + 1}</div>
                          <div className="font-semibold text-slate-900">{item.description}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div>
                          <div className="text-xs text-slate-500">จำนวน</div>
                          <div className="font-medium">{item.quantity} {item.unit}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">ราคา/หน่วย</div>
                          <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">รวม</span>
                          <span className="text-lg font-bold text-slate-900">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-6 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">ยอดรวม (ก่อนภาษี)</span>
                    <span className="text-lg font-semibold">{formatCurrency(po.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">ภาษีมูลค่าเพิ่ม (VAT {po.vatRate ?? 0}%)</span>
                    <span className="text-lg font-semibold">{formatCurrency(po.vatAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">ภาษีบริการ ({po.serviceTaxRate ?? 0}%)</span>
                    <span className="text-lg font-semibold">{formatCurrency(po.serviceTaxAmount || 0)}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-900">รวมทั้งสิ้น</span>
                      <span className="text-3xl font-bold text-purple-600">
                        {formatCurrency(po.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}