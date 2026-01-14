// app/api/traders/route.ts

import { NextResponse } from "next/server"
import { Pool } from "pg"

// ใส่ connection string ของคุณตรงนี้ (เหมือนที่ใช้ใน Prisma หรือ .env)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ตัวอย่าง: "postgresql://username:password@localhost:5432/your_database"
})

export async function GET() {
  let client
  try {
    client = await pool.connect()
    const result = await client.query(`
      SELECT id, name 
      FROM traders 
      ORDER BY name ASC
    `)

    // ส่งกลับแบบที่หน้าเว็บต้องการ
    return NextResponse.json({ data: result.rows })
  } catch (error: any) {
    console.error("โหลด Trader ไม่ได้:", error)
    return NextResponse.json(
      { data: [], error: error.message },
      { status: 500 }
    )
  } finally {
    client?.release()
  }
}

// ถ้าอยากให้ POST ทำงานด้วย (เหมือน Postman)
export async function POST(request: Request) {
  let client
  try {
    const body = await request.json()
    client = await pool.connect()

    const result = await client.query(
      `INSERT INTO traders (name, "contactPerson", phone, email, address, "taxId", "traderCode", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [
        body.name,
        body.contactPerson || null,
        body.phone || null,
        body.email || null,
        body.address || null,
        body.taxId || null,
        body.traderCode || null,
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  } finally {
    client?.release()
  }
}