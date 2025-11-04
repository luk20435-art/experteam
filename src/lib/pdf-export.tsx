import type { PurchaseOrder, Supplier } from "@/src/types"

export function generatePOPDF(po: PurchaseOrder, supplier: Supplier | undefined) {
  // Create a simple HTML template for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Purchase Order - ${po.poNumber}</title>
      <style>
        body {
          font-family: 'Sarabun', Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-box {
          width: 48%;
        }
        .info-box h3 {
          margin-top: 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-row {
          margin: 8px 0;
        }
        .info-label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .summary {
          margin-top: 20px;
          float: right;
          width: 300px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          margin-top: 10px;
        }
        .footer {
          margin-top: 60px;
          clear: both;
        }
        .signature-section {
          display: flex;
          justify-content: space-around;
          margin-top: 40px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 60px;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ใบสั่งซื้อ (Purchase Order)</h1>
        <p>เลขที่: ${po.poNumber}</p>
      </div>

      <div class="info-section">
        <div class="info-box">
          <h3>ข้อมูลผู้ขาย</h3>
          <div class="info-row">
            <span class="info-label">ชื่อ:</span>
            <span>${supplier?.name || po.supplierName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ที่อยู่:</span>
            <span>${supplier?.address || "-"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span>${supplier?.phone || "-"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tax ID:</span>
            <span>${supplier?.taxId || "-"}</span>
          </div>
        </div>

        <div class="info-box">
          <h3>ข้อมูลการสั่งซื้อ</h3>
          <div class="info-row">
            <span class="info-label">วันที่สั่งซื้อ:</span>
            <span>${new Date(po.orderDate).toLocaleDateString("th-TH")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่ต้องการรับ:</span>
            <span>${new Date(po.deliveryDate).toLocaleDateString("th-TH")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">เงื่อนไขชำระเงิน:</span>
            <span>${po.paymentTerms}</span>
          </div>
          <div class="info-row">
            <span class="info-label">PR Number:</span>
            <span>${po.prNumber}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 50px;">ลำดับ</th>
            <th>รายการ</th>
            <th class="text-center" style="width: 80px;">จำนวน</th>
            <th class="text-center" style="width: 80px;">หน่วย</th>
            <th class="text-right" style="width: 120px;">ราคา/หน่วย</th>
            <th class="text-right" style="width: 120px;">รวม</th>
          </tr>
        </thead>
        <tbody>
          ${po.items
            .map(
              (item) => `
            <tr>
              <td class="text-center">${item.itemNo}</td>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-center">${item.unit}</td>
              <td class="text-right">${item.unitPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
              <td class="text-right">${item.totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>ยอดรวม (ก่อนภาษี):</span>
          <span>${po.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
        </div>
        <div class="summary-row">
          <span>ภาษีมูลค่าเพิ่ม (${po.vatRate}%):</span>
          <span>${po.vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
        </div>
        ${
          po.serviceTaxRate > 0
            ? `
        <div class="summary-row">
          <span>ภาษีการบริการ (${po.serviceTaxRate}%):</span>
          <span>${po.serviceTaxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
        </div>
        `
            : ""
        }
        <div class="summary-row total">
          <span>รวมทั้งสิ้น:</span>
          <span>${po.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
        </div>
      </div>

      <div class="footer">
        ${po.remarks ? `<p><strong>หมายเหตุ:</strong> ${po.remarks}</p>` : ""}
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">ผู้สั่งซื้อ</div>
            <p>วันที่: _______________</p>
          </div>
          <div class="signature-box">
            <div class="signature-line">ผู้อนุมัติ</div>
            <p>วันที่: _______________</p>
          </div>
          <div class="signature-box">
            <div class="signature-line">ผู้ขาย</div>
            <p>วันที่: _______________</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  // Open print dialog with the HTML content
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
