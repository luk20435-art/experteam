"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

interface WorkRequest { id: number; title: string }
interface Employee { id: number; name: string; email: string }

export default function AddWorkOrder() {
    const router = useRouter()
    const [requests, setRequests] = useState<WorkRequest[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])

    const [form, setForm] = useState({
        workRequestId: 0,
        orderNumber: "",
        title: "",
        description: "",
        assignedTo: 0,
        estimatedHours: 0,
        actualHours: 0,
        startDate: "",
        completionDate: "",
        status: "Draft" as const,
        materialsCost: 0,
        laborCost: 0,
    })

    useEffect(() => {
        const r = localStorage.getItem("work-requests")
        if (r) setRequests(JSON.parse(r))
        const e = localStorage.getItem("organization-employees")
        if (e) setEmployees(JSON.parse(e))
    }, [])

    const generateNumber = () => {
        const saved = localStorage.getItem("work-orders") || "[]"
        const list = JSON.parse(saved)
        return `WO-${String(list.length + 1).padStart(3, "0")}`
    }

    const handleSave = () => {
        if (!form.workRequestId || !form.assignedTo || !form.startDate) {
            alert("กรุณากรอกข้อมูลที่จำเป็น")
            return
        }

        const saved = JSON.parse(localStorage.getItem("work-orders") || "[]")
        const newId = Math.max(...saved.map((o: any) => o.id), 0) + 1
        const totalCost = form.materialsCost + form.laborCost

        const newOrder = {
            id: newId,
            ...form,
            orderNumber: form.orderNumber || generateNumber(),
            totalCost,
            createdAt: new Date().toISOString(),
            deleted: false
        }

        localStorage.setItem("work-orders", JSON.stringify([...saved, newOrder]))
        router.push("/wo")
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">สร้างคำสั่งงานใหม่</h1>
                <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>ข้อมูลคำสั่งงาน</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {/* คำขอ */}
                    <div className="space-y-2">
                        <Label>คำขอที่เกี่ยวข้อง <span className="text-red-500">*</span></Label>
                        <Select
                            value={form.workRequestId ? form.workRequestId.toString() : ""}
                            onValueChange={v => setForm({ ...form, workRequestId: +v })}
                        >
                            <SelectTrigger><SelectValue placeholder="เลือกคำขอ" /></SelectTrigger>
                            <SelectContent>
                                {requests.map(r => (
                                    <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* เลขที่ */}
                    <div className="space-y-2">
                        <Label>เลขที่คำสั่งงาน</Label>
                        <Input
                            value={form.orderNumber || generateNumber()}
                            onChange={e => setForm({ ...form, orderNumber: e.target.value })}
                            placeholder="WO-001"
                        />
                    </div>

                    {/* ชื่อ */}
                    <div className="space-y-2">
                        <Label>ชื่อคำสั่งงาน</Label>
                        <Input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="เช่น ซ่อมเครื่องจักร A"
                        />
                    </div>

                    {/* รายละเอียด */}
                    <div className="space-y-2">
                        <Label>รายละเอียด</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    {/* ผู้รับงาน */}
                    <div className="space-y-2">
                        <Label>ผู้รับงาน <span className="text-red-500">*</span></Label>
                        <Select
                            value={form.assignedTo ? form.assignedTo.toString() : ""}
                            onValueChange={v => setForm({ ...form, assignedTo: +v })}
                        >
                            <SelectTrigger><SelectValue placeholder="เลือกพนักงาน" /></SelectTrigger>
                            <SelectContent>
                                {employees.map(e => (
                                    <SelectItem key={e.id} value={e.id.toString()}>
                                        {e.name} ({e.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* วันที่ */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>วันที่เริ่ม <span className="text-red-500">*</span></Label>
                            <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>วันที่เสร็จ (ถ้ามี)</Label>
                            <Input type="date" value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} />
                        </div>
                    </div>

                    {/* ชั่วโมง */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ชั่วโมงประมาณ</Label>
                            <Input type="number" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: +e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>ชั่วโมงจริง</Label>
                            <Input type="number" value={form.actualHours} onChange={e => setForm({ ...form, actualHours: +e.target.value })} />
                        </div>
                    </div>

                    {/* ต้นทุน */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>วัสดุ (บาท)</Label>
                            <Input type="number" value={form.materialsCost} onChange={e => setForm({ ...form, materialsCost: +e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>แรงงาน (บาท)</Label>
                            <Input type="number" value={form.laborCost} onChange={e => setForm({ ...form, laborCost: +e.target.value })} />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full p-2 bg-muted rounded-md text-center font-medium">
                                รวม: ฿{(form.materialsCost + form.laborCost).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* สถานะ */}
                    <div className="space-y-2">
                        <Label>สถานะ</Label>
                        <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
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
                <Button onClick={handleSave}>บันทึกคำสั่งงาน</Button>
            </div>
        </div>
    )
}