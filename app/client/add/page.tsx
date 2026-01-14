"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export default function AddTraderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = format(new Date(), "yyyy-MM-dd")
  const todayTH = format(new Date(), "dd/MM/yyyy")

  const [form, setForm] = useState({
    name: "",
    traderCode: "",
    address: "",
    city: "",
    contactPerson: "",
    phone: "",
    email: "",
    taxId: "",
    registrationDate: today,
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.contactPerson || !form.phone) {
      toast({ title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/api/traders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          traderCode: form.traderCode || null,
          address: form.address || null,
          city: form.city || null,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email || null,
          taxId: form.taxId || null,
          registrationDate: form.registrationDate,
          isActive: form.isActive,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "เพิ่ม Trader ไม่สำเร็จ")
      }

      toast({ title: "เพิ่ม Trader สำเร็จ!" })
      router.refresh()
      router.push("/trader")
    } catch (err: any) {
      toast({ title: "เพิ่ม Trader ไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 dark:bg-black">
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
              เพิ่ม Trader ใหม่
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 sm:py-8 ">
        {/* Form Card - Full Width */}
        <div className="bg-white shadow-lg dark:bg-black border border-white-700 rounded">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Row 1 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base font-medium">
                    Client Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Client Name"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="traderCode" className="text-sm md:text-base font-medium">
                    Trader Code
                  </Label>
                  <Input
                    id="traderCode"
                    value={form.traderCode}
                    onChange={(e) => setForm((p) => ({ ...p, traderCode: e.target.value }))}
                    placeholder="Trader Code"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="status" className="text-sm md:text-base font-medium">
                    Status
                  </Label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setForm((p) => ({ ...p, isActive: value === "active" }))
                    }
                  >
                    <SelectTrigger id="status" className="h-10 sm:h-11">
                      <SelectValue placeholder="เลือกสถานะ" />
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
                  <Label htmlFor="contactPerson" className="text-sm md:text-base font-medium">
                    Contact Person <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    required
                    value={form.contactPerson}
                    onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))}
                    placeholder="Contact Person"
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
                    placeholder="Contact Number"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    className="h-10 sm:h-11"
                  />
                </div>

                {/* Row 3 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="address" className="text-sm md:text-base font-medium">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Address"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="city" className="text-sm md:text-base font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="taxId" className="text-sm md:text-base font-medium">
                    Tax ID
                  </Label>
                  <Input
                    id="taxId"
                    value={form.taxId}
                    onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))}
                    placeholder="Tax ID"
                    className="h-10 sm:h-11"
                  />
                </div>

                {/* Row 4 */}
                <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                  <Label htmlFor="registrationDate" className="text-sm md:text-base font-medium">
                    Registration Date
                  </Label>
                  <Input
                    id="registrationDate"
                    type="date"
                    value={form.registrationDate}
                    readOnly
                    className="h-10 sm:h-11 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Date Info */}
              <div className="bg-white shadow-lg dark:bg-black   border border-white-700 rounded p-3">
                <p className="text-sm text-white-700">
                  <span className="font-medium">วันที่บันทึกอัตโนมัติ:</span> {todayTH}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="w-full sm:w-40 order-2 sm:order-1 dark:bg-red-600 hover:dark:bg-red-800 cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-40 bg-green-600 hover:bg-blue-700 order-1 sm:order-2 flex items-center justify-center gap-2 dark:text-white cursor-pointer"
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
                      <span>บันทึก Trader</span>
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