// app/client/[id]/delete/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DeleteClientPage() {
  const params = useParams()
  const router = useRouter()
  const { clients, deleteClient } = useData()
  const client = clients.find(c => c.id === params.id)

  if (!client) return <div>ไม่พบลูกค้า</div>

  const handleDelete = () => {
    deleteClient(client.id)
    toast({ title: "ลบสำเร็จ", description: `${client.name} ถูกลบแล้ว` })
    router.push("/client")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">ยืนยันการลบลูกค้า</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-lg font-medium">{client.name}</p>
            <p className="text-slate-600">Client ID: {client.clientId}</p>
          </div>
          <p className="text-slate-600">การลบนี้ไม่สามารถกู้คืนได้</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push(`/client/${client.id}`)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ยืนยันการลบ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}