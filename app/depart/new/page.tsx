"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export default function AddSupplierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    companyName: "",
    group: "",
    product: "",
    contactName: "",
    phone: "",
    email: "",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.companyName || !form.contactName || !form.phone) {
      toast({ title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          group: form.group || null,
          product: form.product || null,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email || null,
          isActive: form.isActive,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message?.join(", ") || "เพิ่มซัพพลายเออร์ไม่สำเร็จ")
      }

      toast({ title: "เพิ่มซัพพลายเออร์สำเร็จ!" })
      router.refresh()
      router.push("/supplier")
    } catch (err: any) {
      toast({ title: "เพิ่มซัพพลายเออร์ไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-black mt-4 px-6 ">
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
              เพิ่มซัพพลายเออร์ใหม่
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 sm:py-8 dark:bg-black">
        {/* Form Card - Full Width */}
        <div className="bg-white shadow-lg dark:bg-black border border-white-700 rounded">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Row 1 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="companyName" className="text-sm md:text-base font-medium">
                    Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="เช่น บริษัท ซัพพลายเออร์ จำกัด"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="group" className="text-sm md:text-base font-medium">
                    Group
                  </Label>
                  <Input
                    id="group"
                    value={form.group}
                    onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
                    placeholder="เช่น วัสดุก่อสร้าง"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="status" className="text-sm md:text-base font-medium">
                    Status
                  </Label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(value) => setForm((p) => ({ ...p, isActive: value === "active" }))}
                  >
                    <SelectTrigger id="status" className="h-10 sm:h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          ใช้งาน
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          ไม่ใช้งาน
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="product" className="text-sm md:text-base font-medium">
                    Product
                  </Label>
                  <Input
                    id="product"
                    value={form.product}
                    onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))}
                    placeholder="เช่น ปูนซีเมนต์, สายไฟ"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="contactName" className="text-sm md:text-base font-medium">
                    Contact Person <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                    placeholder="ชื่อผู้ติดต่อหลัก"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="phone" className="text-sm md:text-base font-medium">
                    Contact Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="เช่น 0812345678"
                    className="h-10 sm:h-11"
                  />
                </div>

                {/* Row 3 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@company.com"
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="w-full sm:w-40 order-2 sm:order-1 bg-red-600 text-white dark:bg-red-600 cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-40 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 flex items-center justify-center gap-2 text-white cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="hidden sm:inline">กำลังบันทึก...</span>
                      <span className="sm:hidden">บันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>บันทึกซัพพลายเออร์</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}