// app/client/[id]/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Building2, User, Phone, Mail, MapPin, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { clients } = useData()
  const client = clients.find(c => c.id === params.id)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 mx-auto text-slate-400 opacity-50" />
          <h2 className="text-3xl font-bold text-white">ไม่พบลูกค้า</h2>
          <p className="text-slate-400">ลูกค้าที่คุณกำลังมองหาไม่มีอยู่</p>
          <Button onClick={() => router.push("/client")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> กลับสู่หน้าลูกค้า
          </Button>
        </div>
      </div>
    )
  }

  const isActive = client.status === "active"
  const statusColor = isActive 
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : "bg-red-100 text-red-800 border-red-300"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Header Section */}
        <div className="group">
          <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Button variant="ghost" size="sm" onClick={() => router.push("/client")} className="hover:bg-slate-100 rounded-full mt-1">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {client.name}
                    </h1>
                    <Badge className={`${statusColor} font-medium px-3 py-1 border flex items-center gap-2`}>
                      {isActive ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          ใช้งาน
                        </>
                      ) : (
                        <>
                          ไม่ใช้งาน
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Client ID: {client.clientId}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                <Link href={`/client/${client.id}/edit`} className="flex-1 md:flex-none">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                    <Edit className="h-4 w-4 mr-2" /> แก้ไข
                  </Button>
                </Link>
                <Link href={`/client/${client.id}/delete`} className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 font-medium rounded-xl">
                    <Trash2 className="h-4 w-4 mr-2" /> ลบ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Information Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 pb-4">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  ข้อมูลพื้นฐาน
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client ID */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Client ID</p>
                    <p className="text-sm font-bold text-blue-700">{client.clientId}</p>
                  </div>

                  {/* Status */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">สถานะ</p>
                    <Badge className={`${statusColor} font-bold text-xs border w-fit`}>
                      {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </Badge>
                  </div>

                  {/* Registration Date */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">วันที่ลงทะเบียน</p>
                    <p className="text-sm font-bold text-amber-700">{client.registrationDate || "-"}</p>
                  </div>

                  {/* Company Type */}
                  {client.type && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">ประเภท</p>
                      <p className="text-sm font-bold text-purple-700">{client.type}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-slate-200 pb-4">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-rose-600" />
                  ข้อมูลติดต่อ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Person */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" /> ผู้ติดต่อ
                    </div>
                    <p className="text-sm font-bold text-slate-800">{client.contactPerson || "-"}</p>
                  </div>

                  {/* Phone Number */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> เบอร์โทร
                    </div>
                    <p className="text-sm font-bold text-slate-800">{client.contactNumber || "-"}</p>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 md:col-span-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> อีเมล
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">{client.contactEmail || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information Card */}
            {client.address && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200 pb-4">
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    ที่อยู่
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">{client.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(client.website || client.taxId) && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 pb-4">
                  <CardTitle className="text-xl text-slate-800">ข้อมูลเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6 px-6 space-y-3">
                  {client.website && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">เว็บไซต์</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{client.website}</p>
                    </div>
                  )}
                  {client.taxId && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">เลขประจำตัวผู้เสียภาษี</p>
                      <p className="text-sm font-bold text-slate-800">{client.taxId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">

            {/* Company Summary Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6">
                <CardTitle className="text-lg">สรุปข้อมูล</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-8 px-6 space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">ชื่อบริษัท</p>
                  <p className="text-lg font-bold text-slate-900">{client.name}</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      ลงทะเบียน
                    </span>
                    <span className="text-sm font-bold text-slate-900">{client.registrationDate || "-"}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      สถานะ
                    </span>
                    <Badge className={`${statusColor} font-bold text-xs border`}>
                      {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-600 mb-1">ผู้ติดต่อหลัก</p>
                      <p className="text-sm font-bold text-slate-900">{client.contactPerson || "-"}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-600 mb-1">เบอร์โทร</p>
                      <p className="text-sm font-bold text-slate-900">{client.contactNumber || "-"}</p>
                    </div>
                  </div>

                  {client.contactEmail && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-600 mb-1">อีเมล</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{client.contactEmail}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
                <CardTitle className="text-lg text-slate-800">การจัดการ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6 space-y-3">
                <Link href={`/client/${client.id}/edit`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg justify-center">
                    <Edit className="h-4 w-4 mr-2" /> แก้ไขข้อมูล
                  </Button>
                </Link>
                <Link href={`/client/${client.id}/delete`} className="block">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 font-medium rounded-xl justify-center">
                    <Trash2 className="h-4 w-4 mr-2" /> ลบลูกค้า
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}