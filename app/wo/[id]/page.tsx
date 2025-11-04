"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

interface WorkOrder {
    id: number
    workRequestId: number
    orderNumber: string
    title: string
    description: string
    assignedTo: number
    estimatedHours: number
    actualHours: number
    startDate: string
    completionDate: string
    status: "Draft" | "Approved" | "In Progress" | "Completed" | "Cancelled"
    materialsCost: number
    laborCost: number
    totalCost: number
    createdAt: string
}
interface WorkRequest { id: number; title: string }
interface Employee { id: number; name: string }

export default function WorkOrderDetail() {
    const router = useRouter()
    const { id } = useParams()
    const [order, setOrder] = useState<WorkOrder | null>(null)
    const [request, setRequest] = useState<WorkRequest | null>(null)
    const [employee, setEmployee] = useState<Employee | null>(null)

    useEffect(() => {
        const savedOrders = localStorage.getItem("work-orders")
        const savedRequests = localStorage.getItem("work-requests")
        const savedEmployees = localStorage.getItem("organization-employees")

        if (savedOrders && savedRequests && savedEmployees) {
            const orders: WorkOrder[] = JSON.parse(savedOrders)
            const requests: WorkRequest[] = JSON.parse(savedRequests)
            const employees: Employee[] = JSON.parse(savedEmployees)

            const found = orders.find(o => o.id === +id!)
            if (found) {
                setOrder(found)
                setRequest(requests.find(r => r.id === found.workRequestId) || null)
                setEmployee(employees.find(e => e.id === found.assignedTo) || null)
            }
        }
    }, [id])

    // ใน handleDelete
    const handleDelete = () => {
        if (confirm(`คุณต้องการลบคำสั่งงาน "${order.orderNumber}" หรือไม่?\n\nข้อมูลจะถูกย้ายไป "ถังขยะ" และสามารถกู้คืนได้`)) {
            const saved = JSON.parse(localStorage.getItem("work-orders") || "[]")
            const updated = saved.map((o: WorkOrder) =>
                o.id === order.id
                    ? { ...o, deleted: true, deletedAt: new Date().toISOString() }
                    : o
            )
            localStorage.setItem("work-orders", JSON.stringify(updated))
            router.push("/wo")
        }
    }

    if (!order) return <div className="p-6 text-center">ไม่พบคำสั่งงาน</div>

    const getBadge = (status: WorkOrder["status"]) => {
        const colors = {
            Draft: "bg-gray-100 text-gray-800",
            Approved: "bg-blue-100 text-blue-800",
            "In Progress": "bg-yellow-100 text-yellow-800",
            Completed: "bg-green-100 text-green-800",
            Cancelled: "bg-red-100 text-red-800",
        }
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[status]}`}>{status}</span>
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> กลับ
                </Button>
                <div className="flex gap-2">
                    <Link href={`/wo/${id}/edit`}>
                        <Button className="gap-2">
                            <Edit className="h-4 w-4" /> แก้ไข
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete} className="gap-2">
                        <Trash2 className="h-4 w-4" /> ลบ
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="text-2xl">{order.orderNumber}</span>
                        {getBadge(order.status)}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">คำขอที่เกี่ยวข้อง</p>
                            <p className="font-medium">{request?.title || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ผู้รับงาน</p>
                            <p className="font-medium">{employee?.name || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">ชื่อคำสั่งงาน</p>
                        <p className="text-lg font-semibold">{order.title}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">รายละเอียด</p>
                        <p className="whitespace-pre-wrap">{order.description || "-"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">วันที่เริ่ม</p>
                            <p>{new Date(order.startDate).toLocaleDateString("th-TH")}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">วันที่เสร็จ</p>
                            <p>{order.completionDate ? new Date(order.completionDate).toLocaleDateString("th-TH") : "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">ชั่วโมงประมาณ</p>
                            <p>{order.estimatedHours} ชั่วโมง</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ชั่วโมงจริง</p>
                            <p>{order.actualHours} ชั่วโมง</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 border-t pt-4">
                        <div>
                            <p className="text-sm text-muted-foreground">ต้นทุนวัสดุ</p>
                            <p className="font-medium">฿{(order.materialsCost ?? 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ต้นทุนแรงงาน</p>
                            <p className="font-medium">฿{(order.laborCost ?? 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ต้นทุนรวม</p>
                            <p className="text-xl font-bold text-green-600">฿{(order.totalCost ?? 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        สร้างเมื่อ: {new Date(order.createdAt).toLocaleString("th-TH")}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}