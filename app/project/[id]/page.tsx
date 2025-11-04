"use client"

import { useParams, useRouter } from "next/navigation"
import { useData } from "@/src/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, ArrowRight, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { useState } from "react"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject, deleteProject } = useData()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const project = getProject(params.id as string)

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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(project.id)
      router.push("/project")
    }
  }

  // Calculate totals
  const totalBudget = project.sections?.reduce((sum, section) => sum + (section.budget || 0), 0) || 0
  const totalSpent = project.sections?.reduce((sum, section) => sum + (section.spent || 0), 0) || 0
  const totalRemaining = totalBudget - totalSpent
  const overallProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500 hover:bg-green-600"
      case "planning":
        return "bg-blue-500 hover:bg-blue-600"
      case "on_hold":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "completed":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress"
      case "planning":
        return "Planning"
      case "on_hold":
        return "On Hold"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const getSectionIcon = (name: string) => {
    const icons: Record<string, string> = {
      Material: "📦",
      "Man Power": "👥",
      OP: "⚙️",
      IE: "🔧",
      Supply: "🛠️",
      Engineer: "👷",
    }
    return icons[name] || "📋"
  }

  const getProgressColor = (progress: number): string => {
    if (progress > 100) return "text-red-600"
    if (progress > 80) return "text-orange-600"
    if (progress > 70) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressBgColor = (progress: number): string => {
    if (progress > 100) return "bg-red-500"
    if (progress > 80) return "bg-orange-500"
    if (progress > 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/project")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground">Project Code: {project.projectNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/project/${project.id}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Information */}
      <Card className="p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Project Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="text-sm leading-relaxed text-foreground">{project.description || "No description"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <div>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start Date
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(project.startDate)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              End Date
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(project.endDate)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Overview Cards with Circular Progress */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Overall Progress */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                  className={`transition-all duration-300 ${overallProgress > 100 ? 'text-red-600' :
                      overallProgress >= 80 ? 'text-orange-500' :
                        overallProgress > 70 ? 'text-yellow-500' :
                          'text-green-500'
                    }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getProgressColor(overallProgress)}`}>
                  {overallProgress}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
            </div>
          </div>
        </Card>

        {/* Total Budget */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-blue-500/20 p-4">
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </Card>

        {/* Total Spent */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-orange-500/20 p-4">
              <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : "0%"}
              </p>
            </div>
          </div>
        </Card>

        {/* Remaining */}
        <Card className={`p-6 bg-gradient-to-br ${totalRemaining >= 0
            ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
            : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
          }`}>
          <div className="flex flex-col items-center gap-3">
            <div className={`rounded-full p-4 ${totalRemaining >= 0
                ? 'bg-green-500/20'
                : 'bg-red-500/20'
              }`}>
              {totalRemaining >= 0 ? (
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {totalRemaining >= 0 ? "Remaining" : "Over Budget"}
              </p>
              <p className={`text-xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalRemaining >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalRemaining))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Sections */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Project Sections</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {project.sections?.map((section) => {
            const remaining = section.budget - section.spent
            const progress = section.budget > 0 ? Math.round((section.spent / section.budget) * 100) : 0
            const isOverBudget = remaining < 0

            return (
              <Card
                key={section.id}
                className="group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary"
                onClick={() => router.push(`/project/${project.id}/sections/${section.id}`)}
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">{getSectionIcon(section.name)}</span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {section.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`group-hover:border-primary ${getProgressColor(progress)}`}>
                        {progress}%
                      </Badge>
                      {isOverBudget && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Circular Progress */}
                    <div className="flex items-center justify-center py-2">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(progress, 100) / 100)}`}
                            className={`transition-all duration-500 ${getProgressBgColor(progress).replace('bg-', 'text-')}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold ${getProgressColor(progress)}`}>
                            {progress}%
                          </span>
                          <span className="text-xs text-muted-foreground">Complete</span>
                        </div>
                      </div>
                    </div>

                    {/* Budget Info */}
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-semibold text-foreground">{formatCurrency(section.budget)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className={`font-semibold ${progress >= 100 ? 'text-red-500' : 'text-orange-500'}`}>
                          {formatCurrency(section.spent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                          {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                        </span>
                      </div>
                    </div>

                    {/* Budget Usage Bar */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget Usage</span>
                        <span className={`font-semibold ${getProgressColor(progress)}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBgColor(progress)}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {isOverBudget && (
                        <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Over budget by {formatCurrency(Math.abs(remaining))}
                        </p>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-end gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-medium">View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}