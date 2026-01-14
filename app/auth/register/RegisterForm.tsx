// app/auth/(auth)/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {  // ใช้ proxy เดียวกับ login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "สมัครสมาชิกล้มเหลว");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">สมัครสมาชิก</h1>
            <p className="text-slate-400 text-sm">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                name="password"
                type="password"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400"
              />
            </div>

            <input
              name="username"
              placeholder="ชื่อผู้ใช้ (optional)"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                placeholder="ชื่อ"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400"
              />
              <input
                name="lastName"
                placeholder="นามสกุล"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            มีบัญชีแล้ว?{" "}
            <a href="/auth/login" className="text-green-400 font-semibold hover:underline">
              เข้าสู่ระบบ
            </a>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © 2026 All rights reserved
        </p>
      </div>
    </div>
  );
}