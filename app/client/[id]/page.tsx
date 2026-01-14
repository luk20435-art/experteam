// app/trader/[id]/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isValid } from "date-fns"

interface TraderData {
  id: number
  name: string
  traderCode: string
  address: string | null
  city: string | null
  contactPerson: string
  phone: string
  email: string | null
  taxId: string | null
  registrationDate: string
  isActive: boolean
}

export default function TraderDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [data, setData] = useState<TraderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrader = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3000/api/traders/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้")
        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTrader()
  }, [id])

  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "-"
    try {
      const date = parseISO(dateStr)
      return isValid(date) ? format(date, "dd/MM/yyyy") : "-"
    } catch {
      return "-"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">ไม่พบข้อมูล Trader</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับไป
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black px-6 mt-6">
      {/* Header */}
      <div className="bg-white shadow-lg dark:bg-black border border-white-700 rounded">
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              รายละเอียด Trader
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 sm:py-8 ">
        {/* Detail Card - Full Width */}
        <div className="bg-white shadow-lg dark:bg-black border border-white-700 rounded">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-full">
            <div className="space-y-8">
              {/* Status Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-white-900">{data.name}</h2>
                <Badge 
                  className={`text-base px-4 py-2 ${
                    data.isActive 
                      ? "bg-green-600 text-white-700" 
                      : "bg-red-600 text-white-700"
                  }`}
                >
                  {data.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Badge>
              </div>

              {/* Form Grid - Readonly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Row 1 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Client Name
                  </Label>
                  <Input
                    value={data.name}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Trader Code
                  </Label>
                  <Input
                    value={data.traderCode || "-"}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Contact Person
                  </Label>
                  <Input
                    value={data.contactPerson}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                {/* Row 2 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Contact Number
                  </Label>
                  <Input
                    value={data.phone}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Email
                  </Label>
                  <Input
                    value={data.email || "-"}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    RegistrationDate
                  </Label>
                  <Input
                    value={formatDateDisplay(data.registrationDate)}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                {/* Row 3 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Address
                  </Label>
                  <Input
                    value={data.address || "-"}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    City
                  </Label>
                  <Input
                    value={data.city || "-"}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label className="text-sm md:text-base font-medium text-white-700">
                    Tax ID
                  </Label>
                  <Input
                    value={data.taxId || "-"}
                    readOnly
                    className="bg-white shadow-lg dark:bg-black border border-white-700 rounded h-11"
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