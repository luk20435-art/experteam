// src/app/register/page.tsx
import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">สมัครสมาชิก</h1>
        <RegisterForm />
        <p className="text-center text-sm mt-4 text-gray-600">
          มีบัญชีแล้ว?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
