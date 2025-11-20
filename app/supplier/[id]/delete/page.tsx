// app/supplier/[id]/delete/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export default function DeleteSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const { suppliers, deleteSupplier } = useData()
  const supplier = suppliers.find(s => s.id === params.id)
  const [open, setOpen] = useState(true)

  const handleDelete = () => {
    if (!supplier) return
    deleteSupplier(supplier.id)
    toast({ title: "ลบสำเร็จ", description: `${supplier.name} ถูกลบแล้ว` })
    router.push("/supplier")
  }

  if (!supplier) return <div className="p-8 text-center">ไม่พบข้อมูล</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/supplier/${supplier.id}`)}><ArrowLeft /></Button>
          <h1 className="text-3xl font-bold">ลบซัพพลายเออร์</h1>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณแน่ใจหรือไม่ที่จะลบ <strong>{supplier.name}</strong>?<br />
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="mr-2 h-4 w-4" /> ลบถาวร
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}