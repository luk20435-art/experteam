"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface SupplierDetail {
  id: number
  companyName: string
  group?: string
  product?: string
  contactName: string
  phone: string
  email: string
  isActive: boolean
}

export default function SupplierDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [data, setData] = useState<SupplierDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3000/api/suppliers/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้")
        const supplier = await res.json()
        setData(supplier)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchSupplier()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูลซัพพลายเออร์...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">ไม่พบข้อมูลซัพพลายเออร์</p>
          <Button onClick={() => router.back()}>กลับไป</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 dark:bg-black">
      {/* Header */}
      <div className="p-4 sm:p-6 md:p-8 lg:p-2 dark:bg-black border border-white-700 rounded">
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 ">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 cursor-pointer dark:hover:bg-slate-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Supplier Details
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 sm:py-8">
        {/* Detail Card - Full Width */}
        <div className="bg-white shadow-lg dark:bg-black">
          {/* Card Header */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-6 dark:bg-black border border-white-700 rounded">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {data.companyName}
                </h2>
              </div>
              <Badge
                className={`text-base px-4 py-2 whitespace-nowrap ${
                  data.isActive
                    ? "bg-green-500 text-white-800"
                    : "bg-red-400 text-white-800"
                }`}
              >
                {data.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
              </Badge>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 dark:bg-black border border-white-700 rounded mt-4 ">
            <div className="space-y-8">
              {/* Form Grid - Readonly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Row 1 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Name
                  </Label>
                  <Input
                    value={data.companyName}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200 "
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Group
                  </Label>
                  <Input
                    value={data.group || "-"}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Product
                  </Label>
                  <Input
                    value={data.product || "-"}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200"
                  />
                </div>

                {/* Row 2 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Contact Person
                  </Label>
                  <Input
                    value={data.contactName}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Contact Number
                  </Label>
                  <Input
                    value={data.phone}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2"> 
                  <Label className="text-sm md:text-base font-medium text-gray-700 dark:text-white">
                    Email
                  </Label>
                  <Input
                    value={data.email || "-"}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}