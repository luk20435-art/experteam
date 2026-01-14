// app/api/wo/route.ts  ← สำหรับดึง WO ทั้งหมด (list)

import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  let client
  try {
    client = await pool.connect()

    const result = await client.query(`
      SELECT 
        wo.id,
        wo."woNumber",
        wo.requester,
        wo."orderDate",
        wo."deliveryDate",
        wo.status,
        wr."wrNumber"
      FROM "WorkOrder" wo
      LEFT JOIN "WR" wr ON wo."wrId" = wr.id
      ORDER BY wo.id DESC
    `)

    const wos = result.rows

    // ดึง items สำหรับแต่ละ WO
    for (const wo of wos) {
      const itemsResult = await client.query(
        `SELECT description, quantity, unit, "unitPrice" 
         FROM "WorkOrderItem" 
         WHERE "workOrderId" = $1`,
        [wo.id]
      )
      wo.items = itemsResult.rows
    }

    return NextResponse.json(wos)
  } catch (error: any) {
    console.error("โหลด WO ทั้งหมดไม่ได้:", error)
    return NextResponse.json(
      { message: "โหลดข้อมูล WO ไม่สำเร็จ", error: error.message },
      { status: 500 }
    )
  } finally {
    client?.release()
  }
}