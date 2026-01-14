// app/admin/users/page.tsx
"use client"; // ย้ายมาเป็น Client Component เพราะต้องใช้ state + onChange + fetch interactive

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

// กำหนด type สำหรับ User (แก้ TS7006)
interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string; // หรือใช้ enum Role ถ้ามี
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users เมื่อ component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users", {
          method: "GET",
          credentials: "include", // ส่ง cookie httpOnly อัตโนมัติ
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            redirect("/auth/login");
          }
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }

        const data = await res.json();
        setUsers(data); // สมมติ response เป็น array ของ users
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ฟังก์ชันบันทึก role ใหม่
  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`ยืนยันการเปลี่ยน role ของ user ID ${userId} เป็น ${newRole}?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "เปลี่ยน role ไม่สำเร็จ");
      }

      // อัพเดท state ท้องถิ่นทันที (optimistic update)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );

      alert("เปลี่ยน role สำเร็จ!");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">จัดการผู้ใช้ (Admin Only)</h1>

      {users.length === 0 ? (
        <p className="text-center text-slate-400">ยังไม่มีผู้ใช้ในระบบ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-700">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">อีเมล</th>
                <th className="p-4 text-left">ชื่อ-นามสกุล</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4 font-medium">{user.role}</td>
                  <td className="p-4 flex items-center gap-3">
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="executive">Executive</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* ถ้าต้องการปุ่มบันทึกแยก สามารถเพิ่มได้ แต่ที่นี่ใช้ onChange บันทึกทันที */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}