"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SupplierForm {
  companyName: string
  group: string
  product: string
  contactName: string
  phone: string
  email: string
  isActive: boolean
}

export default function EditSupplierPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState<SupplierForm>({
    companyName: "",
    group: "",
    product: "",
    contactName: "",
    phone: "",
    email: "",
    isActive: true,
  })

  // โหลดข้อมูล Supplier
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3000/api/suppliers/${id}`)
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้")

        const data = await res.json()

        setForm({
          companyName: data.companyName || "",
          group: data.group || "",
          product: data.product || "",
          contactName: data.contactName || "",
          phone: data.phone || "",
          email: data.email || "",
          isActive: data.isActive !== false,
        })
      } catch (err) {
        toast({ title: "โหลดข้อมูลซัพพลายเออร์ไม่สำเร็จ", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchSupplier()
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.companyName || !form.contactName || !form.phone) {
      toast({ title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", variant: "destructive" })
      return
    }

    setShowConfirm(true)
  }

  const confirmSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:3000/api/suppliers/${id}`, {
        method: "PUT",
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
        throw new Error(error.message || "แก้ไขซัพพลายเออร์ไม่สำเร็จ")
      }

      toast({ title: "แก้ไขซัพพลายเออร์สำเร็จ!" })
      router.refresh()
      router.push(`/supplier`)
    } catch (err: any) {
      toast({ title: "แก้ไขซัพพลายเออร์ไม่สำเร็จ", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
      setShowConfirm(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-black px-6 pt-4">
      {/* Header */}
      <div className="bg-white shadow-lg dark:bg-black border border-white-700 rounded">
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 cursor-pointer "
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              แก้ไขซัพพลายเออร์
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
                    placeholder="เช่น ปูนซีเมนต์"
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
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 ">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="w-full sm:w-40 order-2 sm:order-1 dark:bg-red-600 cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-40 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 flex items-center justify-center gap-2 dark:text-white cursor-pointer"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="hidden sm:inline">กำลังบันทึก...</span>
                      <span className="sm:hidden">บันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl font-bold">
              ยืนยันการแก้ไขซัพพลายเออร์
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="text-center space-y-3 py-4">
            <div className="text-gray-700">
              คุณต้องการบันทึกการแก้ไขข้อมูลของ
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {form.companyName || "ซัพพลายเออร์นี้"}
            </div>
            <div className="text-gray-700">
              หรือไม่?
            </div>
          </div>

          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel
              disabled={saving}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>บันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>ยืนยันบันทึก</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}