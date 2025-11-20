// app/wo/[id]/delete/page.tsx
"use client"

import { useRouter } from "next/navigation"
import React from "react"

const STORAGE_KEY = "work-orders"

export default function DeleteWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = React.use(params)

  const handleDelete = () => {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    const updated = orders.map((o: any) => o.id === Number(id) ? { ...o, deleted: true, deletedAt: new Date().toISOString() } : o)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    router.push("/wo")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">ยืนยันการลบ</h2>
        <p className="text-gray-600 mb-8">
          คุณแน่ใจหรือไม่ที่จะลบคำสั่งงานนี้?<br />
          ข้อมูลจะถูกย้ายไปถังขยะ
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => router.push(`/wo/${id}`)} className="px-6 py-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
            ยกเลิก
          </button>
          <button onClick={handleDelete} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition">
            ลบถาวร
          </button>
        </div>
      </div>
    </div>
  )
}