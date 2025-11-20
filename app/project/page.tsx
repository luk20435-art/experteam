"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/src/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Filter,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startOfDay, endOfDay, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { projects, moveToTrashProject, clients } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed" >("all");
  const [filterTrader, setFilterTrader] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [dateType, setDateType] = useState<"start" | "end">("start");
  const [budgetRange, setBudgetRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [durationRange, setDurationRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // กรองเฉพาะที่ยังไม่ถูกลบ
  const activeProjects = projects.filter((p) => !p.deleted);

  // ฟังก์ชันคำนวณ Duration
  const getDuration = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // ดึงชื่อ Trader
  const getTraderName = (project: any) => {
    if (project.traderId) {
      const client = clients.find(c => c.id === project.traderId);
      return client ? client.name : "ไม่ระบุ";
    }
    return project.trader || "ไม่ระบุ";
  };

  // สถานะ
  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { color: "bg-gray-500", text: "ไม่ระบุ", icon: null };
    const normalized = status.toLowerCase().trim();
    if (normalized === "in_progress" || normalized.includes("In progress")) {
      return { color: "bg-blue-500 hover:bg-blue-600", text: "In progress", icon: <Clock className="h-4 w-4" /> };
    }
    if (normalized === "completed" || normalized.includes("Complete")) {
      return { color: "bg-green-500 hover:bg-green-600", text: "Complete", icon: <CheckCircle className="h-4 w-4" /> };
    }
    return { color: "bg-gray-500", text: status, icon: null };
  };

  // กรอง + เรียงลำดับ
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = activeProjects.filter((project) => {
      const traderName = getTraderName(project);
      const totalBudget = project.totalBudget || 0;
      const duration = getDuration(project.startDate, project.endDate);

      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        traderName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || getStatusInfo(project.status).text === getStatusInfo(filterStatus).text;

      const matchesTrader = filterTrader === "all" || project.trader === filterTrader;

      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const projectDate = project[dateType === "start" ? "startDate" : "endDate"];
        if (!projectDate) return false;
        const pDate = new Date(projectDate);
        const from = startOfDay(dateRange.from);
        const to = endOfDay(dateRange.to);
        matchesDate = pDate >= from && pDate <= to;
      }

      const matchesBudget =
        (!budgetRange.min || totalBudget >= Number(budgetRange.min)) &&
        (!budgetRange.max || totalBudget <= Number(budgetRange.max));

      const matchesDuration =
        (!durationRange.min || duration >= Number(durationRange.min)) &&
        (!durationRange.max || duration <= Number(durationRange.max));

      return matchesSearch && matchesStatus && matchesTrader && matchesDate && matchesBudget && matchesDuration;
    });

    filtered.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [
    activeProjects,
    searchTerm,
    filterStatus,
    filterTrader,
    dateRange,
    dateType,
    budgetRange,
    durationRange,
    sortOrder,
    clients,
  ]);

  // Pagination
  const totalItems = filteredAndSortedProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterTrader, dateRange, dateType, budgetRange, durationRange, pageSize]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบโครงการ "${name}" หรือไม่?`)) {
      moveToTrashProject(id);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems > 0 ? `มี ${totalItems} โครงการ` : "ไม่มีโครงการ"}
          </p>
        </div>
        <Link href="/project/new">
          <Button className="w-full sm:w-auto bg-blue-700 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            สร้างโครงการใหม่
          </Button>
        </Link>
      </div>

      {/* ตัวกรอง */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">ตัวกรอง</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            {/* ค้นหา */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาโครงการ, Trader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* สถานะ */}
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-40 flex-shrink-0">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>

            {/* Trader */}
            <Select value={filterTrader} onValueChange={setFilterTrader}>
              <SelectTrigger className="w-40 flex-shrink-0">
                <SelectValue placeholder="Trader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุก Trader</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* วันที่ */}
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "latest" | "oldest")}>
              <SelectTrigger className="w-40 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">ล่าสุดก่อน</SelectItem>
                <SelectItem value="oldest">เก่าก่อน</SelectItem>
              </SelectContent>
            </Select>

            {/* งบประมาณ */}
            <div className="flex gap-2 items-center flex-shrink-0">
              <Input
                type="number"
                placeholder="งบ min"
                value={budgetRange.min}
                onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                className="w-25"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="number"
                placeholder="max"
                value={budgetRange.max}
                onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                className="w-25"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ตาราง */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">รายการโครงการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold whitespace-nowrap">เลขที่โครงการ</th>
                  <th className="text-left p-3 font-semibold whitespace-nowrap">ชื่อโครงการ</th>
                  <th className="text-left p-3 font-semibold whitespace-nowrap">Trader</th>
                  <th className="text-right p-3 font-semibold whitespace-nowrap">งบประมาณ</th>
                  <th className="text-center p-3 font-semibold whitespace-nowrap">วันที่เริ่ม</th>
                  <th className="text-center p-3 font-semibold whitespace-nowrap">วันที่สิ้นสุด</th>
                  <th className="text-center p-3 font-semibold whitespace-nowrap">Duration</th>
                  <th className="text-center p-3 font-semibold whitespace-nowrap">สถานะ</th>
                  <th className="text-right p-3 font-semibold whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProjects.map((project) => {
                  const totalBudget = project.totalBudget || 0;
                  const duration = getDuration(project.startDate, project.endDate);
                  const traderName = getTraderName(project);
                  const { color, text, icon } = getStatusInfo(project.status);

                  return (
                    <tr key={project.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-medium text-foreground">{project.projectNumber}</div>
                      </td>
                      <td className="p-3 min-w-48">
                        <div className="font-medium truncate">{project.name}</div>
                      </td>
                      <td className="p-3 min-w-40">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{traderName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="font-semibold text-foreground">{formatCurrency(totalBudget)}</div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap text-sm">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "-"}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap text-sm">
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "-"}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="text-sm font-medium">{duration} วัน</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge className={`${color} text-white gap-1`}>
                          {icon}
                          <span className="hidden sm:inline">{text}</span>
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/project/${project.id}`}>
                                  <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>ดูรายละเอียด</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/project/${project.id}/edit`}>
                                  <Button variant="outline" size="sm" className="text-yellow-600 hover:bg-yellow-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>แก้ไข</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(project.id, project.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ลบ</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                แสดง {startIndex + 1}-{endIndex} จาก {totalItems} รายการ
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 รายการ</SelectItem>
                    <SelectItem value="10">10 รายการ</SelectItem>
                    <SelectItem value="20">20 รายการ</SelectItem>
                    <SelectItem value="50">50 รายการ</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-center gap-2 overflow-x-auto">
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-sm text-muted-foreground">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => goToPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ไม่พบข้อมูล */}
          {totalItems === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">ไม่พบข้อมูลโครงการ</p>
              <p className="text-sm mt-1">ลองเปลี่ยนตัวกรองหรือสร้างโครงการใหม่</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}