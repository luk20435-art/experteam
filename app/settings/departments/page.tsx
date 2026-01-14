'use client';

import { useState, useEffect } from 'react';
import { getDepartments, setDepartments } from '@/lib/storage';
import { Department } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function DepartmentPage() {
  const [departments, setDepartmentsState] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // โหลดข้อมูลจาก localStorage ตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    setDepartmentsState(getDepartments());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: Department[];

    if (editId) {
      // แก้ไข
      updated = departments.map((d) =>
        d.id === editId ? { ...d, name } : d
      );
    } else {
      // เพิ่มใหม่
      const newId = Math.max(...departments.map((d) => d.id), 0) + 1;
      updated = [...departments, { id: newId, name }];
    }

    // อัปเดต state + บันทึกลง localStorage ทันที
    setDepartmentsState(updated);
    setDepartments(updated); // บันทึกข้อมูลล่าสุด

    // รีเซ็ตฟอร์ม
    setName('');
    setEditId(null);
  };

  const handleEdit = (dept: Department) => {
    setEditId(dept.id);
    setName(dept.name);
  };

  const handleDelete = (id: number) => {
    if (confirm('ลบแผนกนี้?')) {
      const updated = departments.filter((d) => d.id !== id);
      setDepartmentsState(updated);
      setDepartments(updated); // บันทึกข้อมูลล่าสุด
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">จัดการแผนก (Departments)</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-6 max-w-md dark:bg-black border border-whites"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editId ? 'แก้ไข' : 'เพิ่ม'} แผนก
        </h2>

        <input
          type="text"
          placeholder="ชื่อแผนก"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer hover:dark:bg-green-600"
          >
            {editId ? 'อัปเดต' : 'เพิ่ม'}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setName('');
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
          <thead className="bg-gray-100 dark:bg-slate-800 border border-whites">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">ชื่อแผนก</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr
                key={d.id}
                className="border-t hover:bg-gray-50 transition hover:dark:bg-gray-700"
              >
                <td className="p-3">{d.id}</td>
                <td className="p-3">{d.name}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(d)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้
                    </button>

                    <button
                      onClick={() => handleDelete(d.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-400 hover:text-white transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
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