'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, Calendar, User, Edit, Trash2, Plus } from 'lucide-react'
import React from 'react';

export default function SectionDetailPage({ 
  params 
}: { 
   params: Promise<{ id: string; sectionId: string }>
}) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  // Decode the sectionId in case it contains special characters
 const decodedSectionId = decodeURIComponent(resolvedParams.sectionId)
  
  // Mock data - แทนที่ด้วยข้อมูลจริงจาก API/Database
  const section = {
    id: decodedSectionId,
    name: 'งานโครงสร้าง',
    icon: '🏗️',
    progress: 65,
    budget: 5000000,
    spent: 3250000,
    items: [
      {
        id: '1',
        name: 'เสาเข็ม',
        quantity: 50,
        unit: 'ต้น',
        unitPrice: 15000,
        totalPrice: 750000,
        spent: 750000,
        status: 'completed',
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        contractor: 'บริษัท ABC จำกัด'
      },
      {
        id: '2',
        name: 'คานและเสา',
        quantity: 200,
        unit: 'ลบ.ม.',
        unitPrice: 8500,
        totalPrice: 1700000,
        spent: 1200000,
        status: 'in-progress',
        startDate: '2025-02-01',
        endDate: '2025-03-30',
        contractor: 'บริษัท XYZ จำกัด'
      },
      {
        id: '3',
        name: 'พื้นคอนกรีต',
        quantity: 300,
        unit: 'ตร.ม.',
        unitPrice: 2500,
        totalPrice: 750000,
        spent: 500000,
        status: 'in-progress',
        startDate: '2025-03-01',
        endDate: '2025-04-15',
        contractor: 'บริษัท ABC จำกัด'
      },
      {
        id: '4',
        name: 'หลังคาเหล็ก',
        quantity: 150,
        unit: 'ตร.ม.',
        unitPrice: 3500,
        totalPrice: 525000,
        spent: 0,
        status: 'pending',
        startDate: '2025-04-01',
        endDate: '2025-05-15',
        contractor: 'บริษัท DEF จำกัด'
      },
      {
        id: '5',
        name: 'ผนังอิฐมวลเบา',
        quantity: 400,
        unit: 'ตร.ม.',
        unitPrice: 1200,
        totalPrice: 480000,
        spent: 300000,
        status: 'in-progress',
        startDate: '2025-03-15',
        endDate: '2025-05-01',
        contractor: 'บริษัท GHI จำกัด'
      }
    ]
  }

  const remaining = section.budget - section.spent
  const spentPercentage = (section.spent / section.budget) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { label: 'เสร็จสิ้น', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      'in-progress': { label: 'กำลังดำเนินการ', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      pending: { label: 'รอดำเนินการ', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    }
    const variant = variants[status as keyof typeof variants] || variants.pending
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${variant.className}`}>
        {variant.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <span className="text-3xl">{section.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{section.name}</h1>
                <p className="text-sm text-gray-500">รายละเอียดและรายการสินค้า</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            เพิ่มรายการ
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                  <circle
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - section.progress / 100)}`}
                    className="text-blue-600 transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{section.progress}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">ความคืบหน้า</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">งบประมาณทั้งหมด</p>
              <p className="text-2xl font-bold">{formatCurrency(section.budget)}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm text-gray-500">ใช้ไปแล้ว</p>
              <p className="text-2xl font-bold text-orange-500">{formatCurrency(section.spent)}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">คงเหลือ</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>

        {/* Budget Usage Overview */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">การใช้งบประมาณ</h3>
            <span className={`text-sm font-semibold ${spentPercentage > 90 ? 'text-red-500' : spentPercentage > 70 ? 'text-orange-500' : 'text-green-500'}`}>
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-4 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                spentPercentage > 90 ? 'bg-red-500' : 
                spentPercentage > 70 ? 'bg-orange-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">รายการสินค้า/งาน</h2>
            <span className="text-sm text-gray-500">{section.items.length} รายการ</span>
          </div>
          
          <div className="space-y-4">
            {section.items.map((item) => {
              const itemProgress = item.totalPrice > 0 ? (item.spent / item.totalPrice) * 100 : 0
              
              return (
                <div key={item.id} className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-500/10 p-3">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.quantity.toLocaleString()} {item.unit} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <DollarSign className="h-4 w-4" />
                          งบประมาณ
                        </div>
                        <p className="text-lg font-semibold">{formatCurrency(item.totalPrice)}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          ระยะเวลา
                        </div>
                        <p className="text-sm font-medium">
                          {new Date(item.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(item.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          ผู้รับเหมา
                        </div>
                        <p className="text-sm font-medium">{item.contractor}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-500">ความคืบหน้าการใช้งบ</span>
                        <span className="font-semibold">{formatCurrency(item.spent)} / {formatCurrency(item.totalPrice)}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            itemProgress >= 100 ? 'bg-green-500' : 
                            itemProgress > 70 ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(itemProgress, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs text-gray-500">{itemProgress.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}