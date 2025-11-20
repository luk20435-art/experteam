'use client';

import { useState, useEffect } from 'react';
import { getPositions, setPositions, getDepartments } from '@/lib/storage';
import { Position } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function PositionPage() {
  const [positions, setPositionsState] = useState<Position[]>([]);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // โหลดข้อมูลจาก localStorage ตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    setPositionsState(getPositions());
  }, []);

  const departments = getDepartments();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: Position[];

    if (editId) {
      // แก้ไข
      updated = positions.map(p =>
        p.id === editId
          ? { ...p, name, departmentId: Number(departmentId) }
          : p
      );
    } else {
      // เพิ่มใหม่
      const newId = Math.max(...positions.map(p => p.id), 0) + 1;
      updated = [...positions, { id: newId, name, departmentId: Number(departmentId) }];
    }

    // อัปเดต state + บันทึกลง localStorage ทันที
    setPositionsState(updated);
    setPositions(updated); // บันทึกข้อมูลล่าสุด

    // รีเซ็ตฟอร์ม
    setName('');
    setDepartmentId('');
    setEditId(null);
  };

  const handleEdit = (pos: Position) => {
    setEditId(pos.id);
    setName(pos.name);
    setDepartmentId(String(pos.departmentId));
  };

  const handleDelete = (id: number) => {
    if (confirm('ลบตำแหน่งนี้?')) {
      const updated = positions.filter(p => p.id !== id);
      setPositionsState(updated);
      setPositions(updated); // บันทึกข้อมูลล่าสุด
    }
  };

  const getDeptName = (id: number) =>
    departments.find(d => d.id === id)?.name || '-';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">จัดการตำแหน่ง (Positions)</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? 'แก้ไข' : 'เพิ่ม'} ตำแหน่ง
        </h2>

        <input
          type="text"
          placeholder="ชื่อตำแหน่ง"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="">เลือกแผนก</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
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
                setDepartmentId('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">ตำแหน่ง</th>
              <th className="p-3 text-left">แผนก</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{pos.id}</td>
                <td className="p-3">{pos.name}</td>
                <td className="p-3">{getDeptName(pos.departmentId)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(pos)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้
                    </button>

                    <button
                      onClick={() => handleDelete(pos.id)}
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