import type { PurchaseRequisition, PurchaseOrder } from "@/src/types"
import { formatCurrency, formatDate, formatDateTime } from "./utils"

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (value === null || value === undefined) return ""
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

export function exportPRToCSV(prs: PurchaseRequisition[]) {
  const data = prs.map((pr) => ({
    "เลขที่ PR": pr.prNumber,
    หัวข้อ: pr.title,
    แผนก: pr.department,
    ผู้ขอ: pr.requestedBy,
    วันที่ขอ: formatDate(pr.requestDate),
    วันที่ต้องการ: formatDate(pr.requiredDate),
    สถานะ: pr.status,
    จำนวนเงิน: pr.totalAmount,
  }))
  exportToCSV(data, `PR_${new Date().toISOString().split("T")[0]}`)
}

export function exportPOToCSV(pos: PurchaseOrder[]) {
  const data = pos.map((po) => ({
    "เลขที่ PO": po.poNumber,
    "เลขที่ PR": po.prNumber,
    ผู้ขาย: po.supplierName,
    วันที่สั่งซื้อ: formatDate(po.orderDate),
    วันที่ส่งมอบ: formatDate(po.deliveryDate),
    สถานะ: po.status,
    จำนวนเงิน: po.totalAmount,
  }))
  exportToCSV(data, `PO_${new Date().toISOString().split("T")[0]}`)
}

export function generatePRPDF(pr: PurchaseRequisition) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ใบขอซื้อ ${pr.prNumber}</title>
      <style>
        body { font-family: 'Sarabun', sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; margin-bottom: 8px; }
        .info-label { width: 150px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .text-right { text-align: right; }
        .total-section { margin-top: 20px; text-align: right; }
        .approval-section { margin-top: 30px; }
        .signature-box { display: inline-block; width: 200px; margin: 20px; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ใบขอซื้อ (Purchase Requisition)</h1>
        <p>เลขที่: ${pr.prNumber}</p>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div class="info-label">หัวข้อ:</div>
          <div>${pr.title}</div>
        </div>
        <div class="info-row">
          <div class="info-label">แผนก:</div>
          <div>${pr.department}</div>
        </div>
        <div class="info-row">
          <div class="info-label">ผู้ขอ:</div>
          <div>${pr.requestedBy}</div>
        </div>
        <div class="info-row">
          <div class="info-label">วันที่ขอ:</div>
          <div>${formatDate(pr.requestDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">วันที่ต้องการ:</div>
          <div>${formatDate(pr.requiredDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">วัตถุประสงค์:</div>
          <div>${pr.purpose}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px;">ลำดับ</th>
            <th>รายการ</th>
            <th style="width: 80px;">จำนวน</th>
            <th style="width: 80px;">หน่วย</th>
            <th style="width: 120px;">ราคาประมาณ</th>
            <th style="width: 120px;">รวม</th>
          </tr>
        </thead>
        <tbody>
          ${pr.items
            .map(
              (item) => `
            <tr>
              <td class="text-right">${item.itemNo}</td>
              <td>${item.description}${item.remarks ? `<br><small>${item.remarks}</small>` : ""}</td>
              <td class="text-right">${item.quantity}</td>
              <td>${item.unit}</td>
              <td class="text-right">${formatCurrency(item.estimatedPrice)}</td>
              <td class="text-right">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-section">
        <strong>รวมทั้งสิ้น: ${formatCurrency(pr.totalAmount)}</strong>
      </div>

      <div class="approval-section">
        <h3>ประวัติการอนุมัติ</h3>
        ${pr.approvalHistory
          .map(
            (approval) => `
          <div class="signature-box">
            <div><strong>${approval.approverRole}</strong></div>
            <div class="signature-line">${approval.approverName}</div>
            <div><small>${formatDateTime(approval.timestamp)}</small></div>
            <div><small>สถานะ: ${approval.action === "approved" ? "อนุมัติ" : approval.action === "rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"}</small></div>
          </div>
        `,
          )
          .join("")}
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

export function generatePOPDF(po: PurchaseOrder) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ใบสั่งซื้อ ${po.poNumber}</title>
      <style>
        body { font-family: 'Sarabun', sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; margin-bottom: 8px; }
        .info-label { width: 150px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .text-right { text-align: right; }
        .total-section { margin-top: 20px; text-align: right; }
        .approval-section { margin-top: 30px; }
        .signature-box { display: inline-block; width: 200px; margin: 20px; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ใบสั่งซื้อ (Purchase Order)</h1>
        <p>เลขที่: ${po.poNumber}</p>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div class="info-label">อ้างอิง PR:</div>
          <div>${po.prNumber}</div>
        </div>
        <div class="info-row">
          <div class="info-label">ผู้ขาย:</div>
          <div>${po.supplierName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">วันที่สั่งซื้อ:</div>
          <div>${formatDate(po.orderDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">วันที่ส่งมอบ:</div>
          <div>${formatDate(po.deliveryDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">เงื่อนไขการชำระ:</div>
          <div>${po.paymentTerms}</div>
        </div>
        <div class="info-row">
          <div class="info-label">ที่อยู่จัดส่ง:</div>
          <div>${po.deliveryAddress}</div>
        </div>
        ${
          po.remarks
            ? `
        <div class="info-row">
          <div class="info-label">หมายเหตุ:</div>
          <div>${po.remarks}</div>
        </div>
        `
            : ""
        }
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px;">ลำดับ</th>
            <th>รายการ</th>
            <th style="width: 80px;">จำนวน</th>
            <th style="width: 80px;">หน่วย</th>
            <th style="width: 120px;">ราคาต่อหน่วย</th>
            <th style="width: 120px;">รวม</th>
          </tr>
        </thead>
        <tbody>
          ${po.items
            .map(
              (item) => `
            <tr>
              <td class="text-right">${item.itemNo}</td>
              <td>${item.description}${item.remarks ? `<br><small>${item.remarks}</small>` : ""}</td>
              <td class="text-right">${item.quantity}</td>
              <td>${item.unit}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-section">
        <div>ยอดรวม: ${formatCurrency(po.subtotal)}</div>
        <div>ภาษี (7%): ${formatCurrency(po.tax)}</div>
        <div><strong>รวมทั้งสิ้น: ${formatCurrency(po.totalAmount)}</strong></div>
      </div>

      <div class="approval-section">
        <h3>ประวัติการอนุมัติ</h3>
        ${po.approvalHistory
          .map(
            (approval) => `
          <div class="signature-box">
            <div><strong>${approval.approverRole}</strong></div>
            <div class="signature-line">${approval.approverName}</div>
            <div><small>${formatDateTime(approval.timestamp)}</small></div>
            <div><small>สถานะ: ${approval.action === "approved" ? "อนุมัติ" : approval.action === "rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"}</small></div>
          </div>
        `,
          )
          .join("")}
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}
