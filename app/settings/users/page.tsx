'use client';

import { useState, useEffect } from 'react';
import { getUsers, setUsers } from '@/lib/storage';
import { User } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function UserPage() {
  const [users, setUsersState] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // โหลดข้อมูลจาก localStorage ตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    setUsersState(getUsers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: User[];

    if (editId) {
      // แก้ไข
      updated = users.map(u =>
        u.id === editId ? { ...u, username, email } : u
      );
    } else {
      // เพิ่มใหม่
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      updated = [...users, { id: newId, username, email }];
    }

    // อัปเดต state + บันทึกลง localStorage ทันที
    setUsersState(updated);
    setUsers(updated); // บันทึกข้อมูลล่าสุด

    // รีเซ็ตฟอร์ม
    setUsername('');
    setEmail('');
    setEditId(null);
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setUsername(user.username);
    setEmail(user.email);
  };

  const handleDelete = (id: number) => {
    if (confirm('ลบผู้ใช้นี้?')) {
      const updated = users.filter(u => u.id !== id);
      setUsersState(updated);
      setUsers(updated); // บันทึกข้อมูลล่าสุด
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">จัดการผู้ใช้ (Users)</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-md dark:bg-black border border-whites">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? 'แก้ไข' : 'เพิ่ม'} ผู้ใช้
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
                setUsername('');
                setEmail('');
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
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50 transition hover:dark:bg-slate-700">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้ไข
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
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