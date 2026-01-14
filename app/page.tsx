// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // ตรวจสอบว่า user logged in หรือเปล่า
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      // ถ้า logged in ให้ไป dashboard
      router.push('/dashboard')
    } else {
      // ถ้ายังไม่ logged in ให้ไป login
      router.push('/auth/login')
    }
  }, [router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
        </div>
        <h1 className="text-white text-2xl font-bold">Loading...</h1>
        <p className="text-blue-100 mt-2">Redirecting...</p>
      </div>
    </div>
  )
}