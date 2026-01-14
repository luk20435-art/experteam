// app/api/traders/route.ts

import { NextResponse } from "next/server";
import { Pool } from "pg";

// Debug env variables ก่อนสร้าง pool (ดูใน terminal ที่รัน next dev)
console.log("=== TRADERS API ENV DEBUG ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "มีค่า (ซ่อนเพื่อความปลอดภัย)" : "ไม่มีค่า");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=================================");

// พยายามใช้ connectionString ก่อน (แนะนำ)
let poolConfig: any = {};

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  };
} else {
  // Fallback ใช้ config แยก field (จาก .env.local เดิมของคุณ)
  console.warn("DATABASE_URL ไม่มี → ใช้ config แยก field แทน");
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "425007", // fallback ค่าเดิมของคุณ
    database: process.env.DB_NAME || "experteam",
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT id, name 
      FROM traders 
      ORDER BY name ASC
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error("โหลด Trader ไม่ได้ (GET):", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { data: [], error: error.message || "ไม่สามารถโหลดข้อมูล Trader ได้" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();

    // Validate ข้อมูลพื้นฐาน (optional แต่แนะนำ)
    if (!body.name) {
      return NextResponse.json({ error: "ต้องระบุชื่อ Trader" }, { status: 400 });
    }

    client = await pool.connect();

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
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("สร้าง Trader ไม่ได้ (POST):", error.message);
    return NextResponse.json(
      { error: error.message || "ไม่สามารถสร้าง Trader ได้" },
      { status: 400 }http://localhost:3001/pattycash
    );
  } finally {
    if (client) client.release();
  }
}