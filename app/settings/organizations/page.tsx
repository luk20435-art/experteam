"use client"

import { useState } from "react"
import { AlertCircle, Upload, Edit2, Trash2, Plus, MapPin, Phone, Mail, Globe, FileText, Briefcase } from "lucide-react"

export default function OrganizationSettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState("/images.jpg")
  
  const [fields, setFields] = useState([
    { id: 1, key: "orgName", label: "ชื่อองค์กร", value: "Experteam Co., Ltd.", type: "text", icon: Briefcase, color: "blue", required: true },
    { id: 2, key: "orgCode", label: "ชื่อย่อ / Code", value: "EXP", type: "text", icon: Briefcase, color: "blue", required: false },
    { id: 3, key: "industry", label: "หมวดธุรกิจ", value: "manufacturing", type: "select", icon: Briefcase, color: "blue", required: false },
    { id: 4, key: "address", label: "ที่อยู่", value: "123 Sukhumvit Road, Bangkok", type: "textarea", icon: MapPin, color: "blue", required: true },
    { id: 5, key: "phone", label: "เบอร์โทร", value: "+66 2 123 4567", type: "tel", icon: Phone, color: "green", required: false },
    { id: 6, key: "email", label: "อีเมล", value: "info@experteam.com", type: "email", icon: Mail, color: "green", required: true },
    { id: 7, key: "website", label: "เว็บไซต์", value: "https://experteam.com", type: "url", icon: Globe, color: "purple", required: false },
    { id: 8, key: "taxId", label: "Tax ID / เลขผู้เสียภาษี", value: "1234567890123", type: "text", icon: FileText, color: "amber", required: false },
  ])

  const [newField, setNewField] = useState({ label: "", type: "text" })
  const [showNewFieldForm, setShowNewFieldForm] = useState(false)

  const industries = [
    { value: "manufacturing", label: "โรงงาน / Manufacturing" },
    { value: "healthcare", label: "การแพทย์ / Healthcare" },
    { value: "education", label: "การศึกษา / Education" },
    { value: "retail", label: "ค้าปลีก / Retail" },
    { value: "technology", label: "เทคโนโลยี / Technology" },
    { value: "finance", label: "การเงิน / Finance" },
  ]

  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200",
    green: "bg-green-500/10 text-green-600 border-green-200",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200",
  }

  const handleFieldChange = (id, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f))
  }

  const handleDeleteField = (id) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const handleAddField = () => {
    if (newField.label.trim()) {
      setFields([...fields, {
        id: Date.now(),
        key: `custom_${Date.now()}`,
        label: newField.label,
        value: "",
        type: newField.type,
        icon: null,
        color: "blue",
        required: false,
        custom: true
      }])
      setNewField({ label: "", type: "text" })
      setShowNewFieldForm(false)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
    }, 1000)
  }

  if (!isEditing) {
    return (
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">General information of the organization</h1>
            <p className="text-muted-foreground mt-1">จัดการข้อมูลพื้นฐานขององค์กร / บริษัท</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg text-white px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            <Edit2 className="h-4 w-4" />
            แก้ไข
          </button>
        </div>

        {/* Logo & Title */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 rounded-2xl p-8 flex gap-8 items-center">
          <div className="w-32 h-32 rounded-2xl border-2 border-primary/20 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src={logoPreview} alt="Organization Logo" className="h-full w-full object-contain p-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{fields.find(f => f.key === "orgName")?.value}</h2>
            <p className="text-lg text-muted-foreground mt-1">
              {fields.find(f => f.key === "orgCode")?.value}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {industries.find(i => i.value === fields.find(f => f.key === "industry")?.value)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(field => {
            const Icon = field.icon
            const colorClass = colorClasses[field.color]
            return (
              <div key={field.id} className={`border-2 rounded-xl p-4 ${colorClass} bg-opacity-50`}>
                <div className="flex items-start gap-3">
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold opacity-75">{field.label}</p>
                    <p className="text-lg font-bold mt-1 break-words">{field.value || "-"}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">แก้ไขข้อมูลองค์กร</h1>
          <p className="text-muted-foreground mt-1">อัปเดตข้อมูลและจัดการฟิลด์ที่ต้องการ</p>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          โลโก้องค์กร
        </h3>
        
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
            <img src={logoPreview} alt="Organization Logo" className="h-full w-full object-contain p-4" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-xs text-white font-medium">คลิกเพื่ออัปโหลด</p>
            </div>
          </div>
        </label>
        <p className="text-xs text-muted-foreground mt-2">PNG, JPG (Max 5MB)</p>
      </div>

      {/* Fields Editor */}
      <div className="space-y-3">
        {fields.map(field => (
          <div key={field.id} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {industries.map(ind => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>

              {!field.required && (
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="mt-1 p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                  title="ลบฟิลด์นี้"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Field */}
      {!showNewFieldForm ? (
        <button
          onClick={() => setShowNewFieldForm(true)}
          className="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all text-center text-muted-foreground hover:text-primary font-medium flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          เพิ่มฟิลด์ใหม่
        </button>
      ) : (
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <label className="text-sm font-semibold">ชื่อฟิลด์</label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="เช่น สถานที่ทำงานหลัก"
              className="w-full px-3 py-2 border border-border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">ประเภท</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="text">ข้อความ</option>
              <option value="email">อีเมล</option>
              <option value="tel">เบอร์โทร</option>
              <option value="url">URL</option>
              <option value="textarea">ข้อความยาว</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddField}
              className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              เพิ่มฟิลด์
            </button>
            <button
              onClick={() => setShowNewFieldForm(false)}
              className="flex-1 border border-border hover:bg-muted px-4 py-2 rounded-lg font-medium transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">เคล็ดลับการใช้งาน</p>
          <p className="text-sm text-blue-800 mt-1">
            คุณสามารถลบฟิลด์ที่ไม่ใช้ได้ (ยกเว้นฟิลด์ที่จำเป็น) หรือเพิ่มฟิลด์ใหม่ตามความต้องการ
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-border -mx-6 px-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="flex-1 border border-border hover:bg-muted px-6 py-3 rounded-lg font-medium transition-all"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  )
}