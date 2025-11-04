"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

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
}
interface WorkRequest { id: number; title: string }
interface Employee { id: number; name: string; email: string }

export default function EditWorkOrder() {
    const router = useRouter()
    const { id } = useParams()
    const [order, setOrder] = useState<WorkOrder | null>(null)
    const [requests, setRequests] = useState<WorkRequest[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedOrders = localStorage.getItem("work-orders")
        const savedRequests = localStorage.getItem("work-requests")
        const savedEmployees = localStorage.getItem("organization-employees")

        if (savedOrders && savedRequests && savedEmployees) {
            const orders: WorkOrder[] = JSON.parse(savedOrders)
            const found = orders.find(o => o.id === +id!)
            if (found) {
                setOrder(found)
            }
            setRequests(JSON.parse(savedRequests))
            setEmployees(JSON.parse(savedEmployees))
        }
        setIsLoading(false)
    }, [id])

    // แสดง loading
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
        )
    }

    // ไม่พบคำสั่งงาน
    if (!order) {
        return (
            <div className="p-6 text-center">
                <p className="text-destructive">ไม่พบคำสั่งงาน</p>
            </div>
        )
    }

    const handleSave = () => {
        const totalCost = (order.materialsCost ?? 0) + (order.laborCost ?? 0)
        const updated = { ...order, totalCost }

        const saved = JSON.parse(localStorage.getItem("work-orders") || "[]")
        const newList = saved.map((o: WorkOrder) => o.id === order.id ? updated : o)
        localStorage.setItem("work-orders", JSON.stringify(newList))

        router.push(`/wo/${id}`)
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> กลับ
                </Button>
                <h1 className="text-2xl font-bold">แก้ไขคำสั่งงาน</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>แก้ไขข้อมูล</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>คำขอที่เกี่ยวข้อง</Label>
                            <Select
                                value={order.workRequestId ? order.workRequestId.toString() : ""}
                                onValueChange={v => setOrder({ ...order, workRequestId: +v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกคำขอ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {requests.length === 0 ? (
                                        <SelectItem value="none" disabled>ไม่มีคำขอ</SelectItem>
                                    ) : (
                                        requests.map(r => (
                                            <SelectItem key={r.id} value={r.id.toString()}>
                                                {r.title}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>ผู้รับงาน</Label>
                            <Select
                                value={order.assignedTo ? order.assignedTo.toString() : ""}
                                onValueChange={v => setOrder({ ...order, assignedTo: +v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกพนักงาน" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.length === 0 ? (
                                        <SelectItem value="none" disabled>ไม่มีพนักงาน</SelectItem>
                                    ) : (
                                        employees.map(e => (
                                            <SelectItem key={e.id} value={e.id.toString()}>
                                                {e.name} ({e.email})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>เลขที่คำสั่งงาน</Label>
                        <Input value={order.orderNumber} readOnly className="bg-muted" />
                    </div>

                    <div>
                        <Label>ชื่อคำสั่งงาน</Label>
                        <Input
                            value={order.title}
                            onChange={e => setOrder({ ...order, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>รายละเอียด</Label>
                        <Textarea
                            value={order.description || ""}
                            onChange={e => setOrder({ ...order, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>วันที่เริ่ม</Label>
                            <Input
                                type="date"
                                value={order.startDate || ""}
                                onChange={e => setOrder({ ...order, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>วันที่เสร็จ</Label>
                            <Input
                                type="date"
                                value={order.completionDate || ""}
                                onChange={e => setOrder({ ...order, completionDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>ชั่วโมงประมาณ</Label>
                            <Input
                                type="number"
                                value={order.estimatedHours ?? 0}
                                onChange={e => setOrder({ ...order, estimatedHours: +e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>ชั่วโมงจริง</Label>
                            <Input
                                type="number"
                                value={order.actualHours ?? 0}
                                onChange={e => setOrder({ ...order, actualHours: +e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>วัสดุ (บาท)</Label>
                            <Input
                                type="number"
                                value={order.materialsCost ?? 0}
                                onChange={e => setOrder({ ...order, materialsCost: +e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>แรงงาน (บาท)</Label>
                            <Input
                                type="number"
                                value={order.laborCost ?? 0}
                                onChange={e => setOrder({ ...order, laborCost: +e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full p-2 bg-muted rounded-md text-center font-medium">
                                รวม: ฿{((order.materialsCost ?? 0) + (order.laborCost ?? 0)).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>สถานะ</Label>
                        <Select
                            value={order.status}
                            onValueChange={v => setOrder({ ...order, status: v as WorkOrder["status"] })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["Draft", "Approved", "In Progress", "Completed", "Cancelled"].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
                <Button onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
            </div>
        </div>
    )
}