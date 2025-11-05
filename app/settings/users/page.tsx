"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit, Plus, Search, User } from "lucide-react";

interface Position {
  id: number;
  name: string;
  department: string;
  desc: string;
}

interface Employee {
  id: number;
  name: string;
  positionId: number;
  email: string;
  right: string;
  photo: string | null;
}

const ITEMS_PER_PAGE = 5;

export default function EmployeeManagement() {
  // 1. โหลดข้อมูลครั้งเดียวตอน mount
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    // โหลด employees
    const savedEmployees = localStorage.getItem("organization-employees");
    if (savedEmployees) {
      try {
        setEmployees(JSON.parse(savedEmployees));
      } catch (e) {
        console.error("Parse employees failed", e);
        setEmployees([
          { id: 1, name: "สมชาย ใจดี", positionId: 1, email: "somchai@example.com", right: "IT", photo: null },
        ]);
      }
    } else {
      setEmployees([
        { id: 1, name: "สมชาย ใจดี", positionId: 1, email: "somchai@example.com", right: "IT", photo: null },
      ]);
    }

    // โหลด positions
    const savedPositions = localStorage.getItem("positions");
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch (e) {
        console.error("Parse positions failed", e);
      }
    }
  }, []); // รันแค่ครั้งเดียว

  // 2. บันทึก employees เมื่อเปลี่ยน (แยก useEffect)
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("organization-employees", JSON.stringify(employees));
    }
  }, [employees]);

  // 3. บันทึก positions เมื่อเปลี่ยน
  useEffect(() => {
    if (positions.length > 0) {
      localStorage.setItem("positions", JSON.stringify(positions));
    }
  }, [positions]);

  // UI State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    positionId: 0,
    email: "",
    right: "",
    photo: null as string | null,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    positionId: 0,
    email: "",
    right: "",
    photo: null as string | null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rightFilter, setRightFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Derived
  const rights = useMemo(() => {
    const uniq = [...new Set(employees.map((e) => e.right))];
    return uniq.sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const pos = positions.find((p) => p.id === emp.positionId);
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pos?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRight = rightFilter === "all" || emp.right === rightFilter;
      return matchesSearch && matchesRight;
    });
  }, [employees, positions, searchTerm, rightFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  const getPositionName = (id: number) => positions.find((p) => p.id === id)?.name || "ไม่ระบุ";

  // Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEdit) setEditForm({ ...editForm, photo: base64 });
      else setNewEmployee({ ...newEmployee, photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.right || newEmployee.positionId === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน และเลือกตำแหน่ง");
      return;
    }
    const newId = Math.max(...employees.map((e) => e.id), 0) + 1;
    setEmployees([...employees, { id: newId, ...newEmployee }]);
    setNewEmployee({ name: "", positionId: 0, email: "", right: "", photo: null });
    setIsAddOpen(false);
    setCurrentPage(1);
  };

  const handleEditStart = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      positionId: employee.positionId,
      email: employee.email,
      right: employee.right,
      photo: employee.photo,
    });
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingEmployee || !editForm.name || !editForm.email || !editForm.right || editForm.positionId === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน และเลือกตำแหน่ง");
      return;
    }
    setEmployees(
      employees.map((emp) =>
        emp.id === editingEmployee.id ? { ...emp, ...editForm } : emp
      )
    );
    setIsEditOpen(false);
    setEditingEmployee(null);
  };

  const handleDelete = (id: number) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRightFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">การจัดการพนักงาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพนักงานทั้งหมดในองค์กร</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มพนักงาน
        </Button>
      </div>

      {/* ค้นหาและกรอง */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อ ตำแหน่ง หรืออีเมล..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={rightFilter}
              onValueChange={(v) => {
                setRightFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="เลือกสิทธิ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสิทธิ์</SelectItem>
                {rights.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              ล้างตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle>รายการพนักงานทั้งหมด</CardTitle>
          <CardDescription>
            พบ {filteredEmployees.length} รายการจากทั้งหมด {employees.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>สิทธิ์</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      ไม่พบพนักงานที่ตรงกับเงื่อนไข
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.photo ? (
                          <img
                            src={employee.photo}
                            alt={employee.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{getPositionName(employee.positionId)}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.right}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditStart(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">หน้า {currentPage} จาก {totalPages}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* เตือนไม่มีตำแหน่ง */}
      {positions.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-yellow-800">ยังไม่มีตำแหน่งในระบบ กรุณาเพิ่มตำแหน่งก่อน</p>
            <Button size="sm" onClick={() => (window.location.href = "/settings/positions")}>
              ไปที่ตำแหน่ง
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog: เพิ่ม */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลพนักงานให้ครบถ้วน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>รูปภาพ</Label>
              <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} />
              {newEmployee.photo && (
                <img src={newEmployee.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
              )}
            </div>
            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
              <Input
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="เช่น สมชาย ใจดี"
              />
            </div>
            <div className="space-y-2">
              <Label>ตำแหน่ง <span className="text-red-500">*</span></Label>
              <Select
                value={newEmployee.positionId ? newEmployee.positionId.toString() : ""}
                onValueChange={(v) => {
                  const id = parseInt(v, 10);
                  if (!isNaN(id)) setNewEmployee({ ...newEmployee, positionId: id });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง (จำเป็น)" />
                </SelectTrigger>
                <SelectContent>
                  {positions.length === 0 ? (
                    <SelectItem value="none" disabled>ไม่มีตำแหน่งในระบบ</SelectItem>
                  ) : (
                    positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id.toString()}>
                        {pos.name} ({pos.department})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>อีเมล <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>สิทธิ์ <span className="text-red-500">*</span></Label>
              <Input
                value={newEmployee.right}
                onChange={(e) => setNewEmployee({ ...newEmployee, right: e.target.value })}
                placeholder="เช่น IT, HR"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button
              onClick={handleAdd}
              disabled={!newEmployee.name || !newEmployee.email || !newEmployee.right || newEmployee.positionId === 0}
            >
              เพิ่มพนักงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>รูปภาพ</Label>
              <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} />
              {editForm.photo && (
                <img src={editForm.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
              )}
            </div>
            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ตำแหน่ง <span className="text-red-500">*</span></Label>
              <Select
                value={editForm.positionId ? editForm.positionId.toString() : ""}
                onValueChange={(v) => {
                  const id = parseInt(v, 10);
                  if (!isNaN(id)) setEditForm({ ...editForm, positionId: id });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง (จำเป็น)" />
                </SelectTrigger>
                <SelectContent>
                  {positions.length === 0 ? (
                    <SelectItem value="none" disabled>ไม่มีตำแหน่งในระบบ</SelectItem>
                  ) : (
                    positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id.toString()}>
                        {pos.name} ({pos.department})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>อีเมล <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>สิทธิ์ <span className="text-red-500">*</span></Label>
              <Input
                value={editForm.right}
                onChange={(e) => setEditForm({ ...editForm, right: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button
              onClick={handleEditSave}
              disabled={!editForm.name || !editForm.email || !editForm.right || editForm.positionId === 0}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}