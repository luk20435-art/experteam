"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import type { Project, ProjectSection } from "@/src/types"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject, updateProject } = useData()

  const project = getProject(params.id as string)

  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    code: "",
    description: "",
    startDate: "",
    endDate: "",
    sections: [],
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.projectNumber,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        sections: project.sections,
      })
    }
  }, [project])

  if (!project) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Project not found</h2>
          <p className="mt-2 text-muted-foreground">The project you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/project")} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.code || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields")
      return
    }

    updateProject(project.id, formData)
    router.push(`/project/${project.id}`)
  }

  const handleSectionChange = (index: number, field: keyof ProjectSection, value: string | number) => {
    const updatedSections = [...(formData.sections || [])]
    const currentSection = updatedSections[index]

    // Update the field
    updatedSections[index] = {
      ...currentSection,
      [field]: value,
    }

    // Auto-calculate progress based on budget and spent
    if (field === "budget" || field === "spent") {
      const budget = field === "budget" ? Number(value) : currentSection.budget
      const spent = field === "spent" ? Number(value) : currentSection.spent

      if (budget > 0) {
        const calculatedProgress = Math.min(Math.round((spent / budget) * 100), 100)
        updatedSections[index].progress = calculatedProgress
      } else {
        updatedSections[index].progress = 0
      }
    }

    setFormData({ ...formData, sections: updatedSections })
  }

  const calculateProgress = (budget: number, spent: number): number => {
    if (budget <= 0) return 0
    return Math.min(Math.round((spent / budget) * 100), 100)
  }

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return "text-red-600"
    if (progress >= 80) return "text-orange-600"
    if (progress >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressBgColor = (progress: number): string => {
    if (progress > 100) return "bg-red-600"
    if (progress > 80) return "bg-orange-100"
    if (progress > 70) return "bg-yellow-100"
    return "bg-green-100"
  }

  // Calculate overall project statistics
  const totalBudget = formData.sections?.reduce((sum, s) => sum + (s.budget || 0), 0) || 0
  const totalSpent = formData.sections?.reduce((sum, s) => sum + (s.spent || 0), 0) || 0
  const overallProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/project/${project.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
          <p className="text-muted-foreground">Update project information and sections</p>
        </div>
      </div>

      {/* Overall Project Stats */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Overall Project Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold text-foreground">฿{totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground">฿{totalSpent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ฿{(totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className={`text-2xl font-bold ${getProgressColor(overallProgress)}`}>
              {overallProgress}%
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Project Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., PROJ-001"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        {/* Project Sections */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Project Sections</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Progress auto-calculates from Budget/Spent</span>
            </div>
          </div>

          <div className="space-y-4">
            {formData.sections?.map((section, index) => {
              const progress = calculateProgress(section.budget, section.spent)
              const remaining = section.budget - section.spent
              const isOverBudget = remaining < 0

              return (
                <div key={section.id} className={`rounded-lg border-2 p-5 transition-all hover:shadow-md ${getProgressBgColor(progress)} border-gray-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{section.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getProgressColor(progress)}`}>
                        Progress: {progress}%
                      </span>
                      {isOverBudget && (
                        <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          Over Budget!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${progress > 100 ? 'bg-red-600' :
                          progress > 80 ? 'bg-orange-500' :
                            progress > 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                        }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor={`budget-${index}`} className="font-semibold">
                        Budget (฿)
                      </Label>
                      <Input
                        id={`budget-${index}`}
                        type="number"
                        value={section.budget}
                        onChange={(e) => handleSectionChange(index, "budget", Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        className="font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`spent-${index}`} className="font-semibold">
                        Spent (฿)
                      </Label>
                      <Input
                        id={`spent-${index}`}
                        type="number"
                        value={section.spent}
                        onChange={(e) => handleSectionChange(index, "spent", Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        className="font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Remaining (฿)
                      </Label>
                      <div className={`flex h-10 items-center rounded-md border px-3 py-2 text-sm font-bold ${isOverBudget ? 'bg-red-50 text-red-600 border-red-300' : 'bg-green-50 text-green-600 border-green-300'
                        }`}>
                        {isOverBudget ? '-' : ''}฿{Math.abs(remaining).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Progress (%)
                      </Label>
                      <div className={`flex h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-bold ${progress >= 100 ? 'bg-red-50 text-red-600 border-red-300' :
                          progress >= 75 ? 'bg-orange-50 text-orange-600 border-orange-300' :
                            progress >= 50 ? 'bg-yellow-50 text-yellow-600 border-yellow-300' :
                              'bg-green-50 text-green-600 border-green-300'
                        }`}>
                        {progress}%
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/project/${project.id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}