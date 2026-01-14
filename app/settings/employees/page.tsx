'use client';

import { useState, useEffect } from 'react';
import { getEmployees, setEmployees, getUsers } from '@/lib/storage';
import { Employee } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function EmployeePage() {
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // โหลดข้อมูลจาก localStorage ตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    setEmployeesState(getEmployees());
  }, []);

  const users = getUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: Employee[];

    if (editId) {
      // แก้ไข
      updated = employees.map(emp =>
        emp.id === editId
          ? { ...emp, name, userId: Number(userId) }
          : emp
      );
    } else {
      // เพิ่มใหม่
      const newId = Math.max(...employees.map(e => e.id), 0) + 1;
      updated = [...employees, { id: newId, name, userId: Number(userId) }];
    }

    // อัปเดต state + บันทึกลง localStorage ทันที
    setEmployeesState(updated);
    setEmployees(updated); // บันทึกข้อมูลล่าสุด

    // รีเซ็ตฟอร์ม
    setName('');
    setUserId('');
    setEditId(null);
  };

  const handleEdit = (emp: Employee) => {
    setEditId(emp.id);
    setName(emp.name);
    setUserId(String(emp.userId));
  };

  const handleDelete = (id: number) => {
    if (confirm('ลบพนักงานนี้?')) {
      const updated = employees.filter(e => e.id !== id);
      setEmployeesState(updated);
      setEmployees(updated); // บันทึกข้อมูลล่าสุด
    }
  };

  const getUsername = (id: number) =>
    users.find(u => u.id === id)?.username || '-';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">จัดการพนักงาน (Employees)</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-md dark:bg-black border border-whites">
        <h2 className="text-xl font-semibold mb-4 ">
          {editId ? 'แก้ไข' : 'เพิ่ม'} พนักงาน
        </h2>

        <input
          type="text"
          placeholder="ชื่อพนักงาน"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="">เลือกผู้ใช้</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editId ? 'อัปเดต' : 'เพิ่ม'}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setName('');
                setUserId('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow rounded overflow-hidden dark:bg-black border border-whites">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-black border border-whites">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">ผู้ใช้</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{emp.id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{getUsername(emp.userId)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้
                    </button>

                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}