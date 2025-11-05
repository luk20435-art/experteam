"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface WorkOrder {
  id: number;
  workRequestId: number;
  orderNumber: string;
  title: string;
  description: string;
  assignedTo: number;
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  completionDate: string;
  status: "Draft" | "Approved" | "In Progress" | "Completed" | "Cancelled";
  materialsCost: number;
  laborCost: number;
  totalCost: number;
}
interface WorkRequest {
  id: number;
  title: string;
}
interface Employee {
  id: number;
  name: string;
  email: string;
}

export default function EditWorkOrder() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูลทั้งหมดใน useEffect (client-side เท่านั้น)
  useEffect(() => {
    const loadData = () => {
      try {
        // โหลด work-orders
        const savedOrdersRaw = localStorage.getItem("work-orders");
        if (!savedOrdersRaw) throw new Error("ไม่พบข้อมูลคำสั่งงาน");

        const savedOrders: WorkOrder[] = JSON.parse(savedOrdersRaw);
        const found = savedOrders.find((o) => o.id === +(id as string));
        if (!found) throw new Error("ไม่พบคำสั่งงานที่ต้องการแก้ไข");

        setOrder(found);

        // โหลด work-requests
        const savedRequestsRaw = localStorage.getItem("work-requests");
        if (savedRequestsRaw) {
          setRequests(JSON.parse(savedRequestsRaw));
        }

        // โหลด employees
        const savedEmployeesRaw = localStorage.getItem("organization-employees");
        if (savedEmployeesRaw) {
          setEmployees(JSON.parse(savedEmployeesRaw));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ป้องกัน infinite loop ด้วย useCallback
  const calculateTotalCost = useCallback(() => {
    if (!order) return 0;
    return (order.materialsCost ?? 0) + (order.laborCost ?? 0);
  }, [order?.materialsCost, order?.laborCost]);

  const handleSave = useCallback(() => {
    if (!order) return;

    const totalCost = calculateTotalCost();
    const updatedOrder = { ...order, totalCost };

    try {
      const savedRaw = localStorage.getItem("work-orders") || "[]";
      const saved: WorkOrder[] = JSON.parse(savedRaw);
      const newList = saved.map((o) => (o.id === order.id ? updatedOrder : o));
      localStorage.setItem("work-orders", JSON.stringify(newList));
      router.push(`/wo/${id}`);
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  }, [order, calculateTotalCost, router, id]);

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          กลับ
        </Button>
      </div>
    );
  }

  // Not found
  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">ไม่พบคำสั่งงาน</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          กลับ
        </Button>
      </div>
    );
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
          {/* คำขอ + ผู้รับงาน */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>คำขอที่เกี่ยวข้อง</Label>
              <Select
                value={order.workRequestId ? order.workRequestId.toString() : ""}
                onValueChange={(v) => setOrder({ ...order, workRequestId: +v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคำขอ" />
                </SelectTrigger>
                <SelectContent>
                  {requests.length === 0 ? (
                    <SelectItem value="none" disabled>ไม่มีคำขอ</SelectItem>
                  ) : (
                    requests.map((r) => (
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
                onValueChange={(v) => setOrder({ ...order, assignedTo: +v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกพนักงาน" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="none" disabled>ไม่มีพนักงาน</SelectItem>
                  ) : (
                    employees.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.name} ({e.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* เลขที่ */}
          <div>
            <Label>เลขที่คำสั่งงาน</Label>
            <Input value={order.orderNumber} readOnly className="bg-muted" />
          </div>

          {/* ชื่อ */}
          <div>
            <Label>ชื่อคำสั่งงาน</Label>
            <Input
              value={order.title}
              onChange={(e) => setOrder({ ...order, title: e.target.value })}
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <Label>รายละเอียด</Label>
            <Textarea
              value={order.description || ""}
              onChange={(e) => setOrder({ ...order, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* วันที่ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>วันที่เริ่ม</Label>
              <Input
                type="date"
                value={order.startDate || ""}
                onChange={(e) => setOrder({ ...order, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>วันที่เสร็จ</Label>
              <Input
                type="date"
                value={order.completionDate || ""}
                onChange={(e) => setOrder({ ...order, completionDate: e.target.value })}
              />
            </div>
          </div>

          {/* ชั่วโมง */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ชั่วโมงประมาณ</Label>
              <Input
                type="number"
                value={order.estimatedHours ?? 0}
                onChange={(e) =>
                  setOrder({ ...order, estimatedHours: +e.target.value || 0 })
                }
              />
            </div>
            <div>
              <Label>ชั่วโมงจริง</Label>
              <Input
                type="number"
                value={order.actualHours ?? 0}
                onChange={(e) =>
                  setOrder({ ...order, actualHours: +e.target.value || 0 })
                }
              />
            </div>
          </div>

          {/* ต้นทุน */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>วัสดุ (บาท)</Label>
              <Input
                type="number"
                value={order.materialsCost ?? 0}
                onChange={(e) =>
                  setOrder({ ...order, materialsCost: +e.target.value || 0 })
                }
              />
            </div>
            <div>
              <Label>แรงงาน (บาท)</Label>
              <Input
                type="number"
                value={order.laborCost ?? 0}
                onChange={(e) =>
                  setOrder({ ...order, laborCost: +e.target.value || 0 })
                }
              />
            </div>
            <div className="flex items-end">
              <div className="w-full p-2 bg-muted rounded-md text-center font-medium">
                รวม: ฿{calculateTotalCost().toLocaleString()}
              </div>
            </div>
          </div>

          {/* สถานะ */}
          <div>
            <Label>สถานะ</Label>
            <Select
              value={order.status}
              onValueChange={(v) =>
                setOrder({ ...order, status: v as WorkOrder["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Draft", "Approved", "In Progress", "Completed", "Cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
      </div>
    </div>
  );
}