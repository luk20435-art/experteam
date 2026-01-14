'use client';

import { useState, useEffect } from 'react';
import {
  getEmployeePositions,
  setEmployeePositions,
  getEmployees,
  getPositions,
} from '@/lib/storage';
import { EmployeePosition } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function EmployeePositionPage() {
  const [eps, setEpsState] = useState<EmployeePosition[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // โหลดข้อมูลจาก localStorage ตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    setEpsState(getEmployeePositions());
  }, []);

  const employees = getEmployees();
  const positions = getPositions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: EmployeePosition[];

    if (editId) {
      // แก้ไข
      updated = eps.map((ep) =>
        ep.id === editId
          ? {
            ...ep,
            employeeId: Number(employeeId),
            positionId: Number(positionId),
            startDate,
          }
          : ep
      );
    } else {
      // เพิ่มใหม่
      const newId = Math.max(...eps.map((ep) => ep.id), 0) + 1;
      updated = [
        ...eps,
        {
          id: newId,
          employeeId: Number(employeeId),
          positionId: Number(positionId),
          startDate,
        },
      ];
    }

    // อัปเดต state + บันทึกลง localStorage ทันที
    setEpsState(updated);
    setEmployeePositions(updated); // บันทึกข้อมูลล่าสุด

    // รีเซ็ตฟอร์ม
    setEmployeeId('');
    setPositionId('');
    setStartDate('');
    setEditId(null);
  };

  const handleEdit = (ep: EmployeePosition) => {
    setEditId(ep.id);
    setEmployeeId(String(ep.employeeId));
    setPositionId(String(ep.positionId));
    setStartDate(ep.startDate);
  };

  const handleDelete = (id: number) => {
    if (confirm('ลบการมอบหมายตำแหน่งนี้?')) {
      const updated = eps.filter((ep) => ep.id !== id);
      setEpsState(updated);
      setEmployeePositions(updated); // บันทึกข้อมูลล่าสุด
    }
  };

  const getEmpName = (id: number) =>
    employees.find((e) => e.id === id)?.name || '-';
  const getPosName = (id: number) =>
    positions.find((p) => p.id === id)?.name || '-';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        มอบหมายตำแหน่ง (Employee Positions)
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-6 max-w-md dark:bg-black border border-whites"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editId ? 'แก้ไข' : 'เพิ่ม'} การมอบหมาย
        </h2>

        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="" className='dark:bg-black border border-whites'>เลือกพนักงาน</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id} className='dark:bg-black border border-whites'>
              {e.name}
            </option>
          ))}
        </select>

        <select
          value={positionId}
          onChange={(e) => setPositionId(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="" className='dark:bg-black border border-whites'>เลือกตำแหน่ง</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id} className='dark:bg-black border border-whites'>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

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
                setEmployeeId('');
                setPositionId('');
                setStartDate('');
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
              <th className="p-3 text-left">พนักงาน</th>
              <th className="p-3 text-left">ตำแหน่ง</th>
              <th className="p-3 text-left">เริ่ม</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {eps.map((ep) => (
              <tr
                key={ep.id}
                className="border-t hover:bg-gray-50 transition hover:dark:bg-slate-700"
              >
                <td className="p-3">{ep.id}</td>
                <td className="p-3">{getEmpName(ep.employeeId)}</td>
                <td className="p-3">{getPosName(ep.positionId)}</td>
                <td className="p-3">{ep.startDate}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(ep)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้
                    </button>

                    <button
                      onClick={() => handleDelete(ep.id)}
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