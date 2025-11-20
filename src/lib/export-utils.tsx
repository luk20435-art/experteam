// src/lib/export-utils.tsx
import type { PurchaseRequisition, PurchaseOrder } from "@/src/types"
import { formatCurrency, formatDate, formatDateTime } from "./utils"

/**
 * ฟังก์ชันหลักสำหรับ export CSV
 * รับ data เป็น array ของ object หรือ array ของ array ก็ได้
 */
export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("exportToCSV: ไม่มีข้อมูลให้ export")
    return
  }

  const escapeCsv = (value: any): string => {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvRows = [
    headers.join(","), // Header
    ...rows.map(row => row.map(cell => escapeCsv(cell)).join(","))
  ]

  const csvContent = csvRows.join("\r\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export PR
export function exportPRToCSV(prs: PurchaseRequisition[]) {
  if (!Array.isArray(prs) || prs.length === 0) return

  const headers = [
    "เลขที่ PR",
    "หัวข้อ",
    "แผนก",
    "ผู้ขอ",
    "วันที่ขอ",
    "วันที่ต้องการ",
    "สถานะ",
    "จำนวนเงิน"
  ]

  const rows = prs.map(pr => [
    pr.prNumber || "",
    pr.projectName || "",
    pr.department || "",
    pr.requestedBy || "",
    formatDate(pr.requestDate),
    formatDate(pr.requiredDate),
    pr.status || "",
    formatCurrency(pr.totalAmount)
  ])

  exportToCSV("PR_List", headers, rows)
}

// Export PO
export function exportPOToCSV(pos: PurchaseOrder[]) {
  if (!Array.isArray(pos) || pos.length === 0) return

  const headers = [
    "เลขที่ PO",
    "เลขที่ PR",
    "ผู้ขาย",
    "วันที่สั่งซื้อ",
    "วันที่ส่งมอบ",
    "สถานะ",
    "จำนวนเงิน"
  ]

  const rows = pos.map(po => [
    po.poNumber || "",
    po.prNumber || "",
    po.supplierName || "",
    formatDate(po.orderDate),
    formatDate(po.deliveryDate),
    po.status || "",
    formatCurrency(po.totalAmount)
  ])

  exportToCSV("PO_List", headers, rows)
}

// Generate PR PDF (แบบ print window)
export function generatePRPDF(pr: PurchaseRequisition) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("กรุณาอนุญาต Pop-up เพื่อพิมพ์ PDF")
    return
  }

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>ใบขอซื้อ ${pr.prNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Sarabun', sans-serif; padding: 40px; font-size: 14px; color: #000; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 4px double #000; padding-bottom: 20px; }
    .header h1 { font-size: 28px; margin: 0; }
    .header p { font-size: 18px; margin: 10px 0 0; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; font-size: 13px; }
    .info-cell { border: 1px solid #000; padding: 8px; }
    .info-label { font-weight: bold; background: #f0f0f0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .total-section { text-align: right; margin-top: 20px; font-size: 16px; }
    .signature-section { display: flex; justify-content: space-around; margin-top: 50px; font-size: 14px; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #000; margin: 60px 0 10px; }
    @page { margin: 1cm; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>ใบขอซื้อ (Purchase Requisition)</h1>
    <p>เลขที่: ${pr.prNumber}</p>
  </div>

  <div class="info-grid">
    <div class="info-cell info-label">หัวข้อโครงการ</div>
    <div class="info-cell" colspan="3">${pr.projectName || "-"}</div>
    
    <div class="info-cell info-label">แผนก</div>
    <div class="info-cell">${pr.department || "-"}</div>
    <div class="info-cell info-label">ผู้ขอ</div>
    <div class="info-cell">${pr.requestedBy || "-"}</div>
    
    <div class="info-cell info-label">วันที่ขอ</div>
    <div class="info-cell">${formatDate(pr.requestDate)}</div>
    <div class="info-cell info-label">วันที่ต้องการ</div>
    <div class="info-cell">${formatDate(pr.requiredDate)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th width="5%">ลำดับ</th>
        <th width="40%" class="text-left">รายการ</th>
        <th width="10%">จำนวน</th>
        <th width="10%">หน่วย</th>
        <th width="15%">ราคาต่อหน่วย</th>
        <th width="20%">จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>
      ${pr.items?.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td class="text-left">${item.description}<br><small>${item.remarks || ""}</small></td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
          <td class="text-right">${formatCurrency(item.estimatedPrice)}</td>
          <td class="text-right">${formatCurrency(item.totalPrice)}</td>
        </tr>
      `).join("") || ""}
    </tbody>
  </table>

  <div class="total-section">
    <strong style="font-size: 18px;">รวมทั้งสิ้น: ${formatCurrency(pr.totalAmount)} บาท</strong>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>(ผู้ขอซื้อ)</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>(ผู้อนุมัติ)</div>
    </div>
  </div>
</body>
</html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

// Generate PO PDF
export function generatePOPDF(po: PurchaseOrder) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("กรุณาอนุญาต Pop-up เพื่อพิมพ์ PDF")
    return
  }

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>ใบสั่งซื้อ ${po.poNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Sarabun', sans-serif; padding: 40px; font-size: 14px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 4px double #000; padding-bottom: 20px; }
    .header h1 { font-size: 28px; margin: 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-cell { border: 1px solid #000; padding: 10px; }
    .info-label { font-weight: bold; background: #f0f0f0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
    th { background-color: #f0f0f0; }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .total-section { text-align: right; margin-top: 20px; font-size: 16px; }
    @page { margin: 1cm; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ใบสั่งซื้อ (Purchase Order)</h1>
    <p style="font-size: 20px;">เลขที่: ${po.poNumber}</p>
  </div>

  <div class="info-grid">
    <div class="info-cell"><span class="info-label">อ้างอิง PR:</span> ${po.prNumber}</div>
    <div class="info-cell"><span class="info-label">ผู้ขาย:</span> ${po.supplierName}</div>
    <div class="info-cell"><span class="info-label">วันที่สั่งซื้อ:</span> ${formatDate(po.orderDate)}</div>
    <div class="info-cell"><span class="info-label">วันที่ส่งมอบ:</span> ${formatDate(po.deliveryDate)}</div>
    <div class="info-cell"><span class="info-label">เงื่อนไขชำระเงิน:</span> ${po.paymentTerms || "-"}</div>
    <div class="info-cell"><span class="info-label">ที่อยู่จัดส่ง:</span> ${po.deliveryLocation || "-"}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ลำดับ</th>
        <th class="text-left">รายการ</th>
        <th>จำนวน</th>
        <th>หน่วย</th>
        <th>ราคาต่อหน่วย</th>
        <th>จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>
      ${po.items?.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td class="text-left">${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.totalPrice)}</td>
        </tr>
      `).join("") || ""}
    </tbody>
  </table>

  <div class="total-section">
    <div>ยอดรวม: ${formatCurrency(po.subtotal)}</div>
    <div>VAT (7%): ${formatCurrency(po.vatAmount)}</div>
    <div><strong style="font-size: 20px;">รวมทั้งสิ้น: ${formatCurrency(po.totalAmount)} บาท</strong></div>
  </div>
</body>
</html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}