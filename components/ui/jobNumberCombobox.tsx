"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface JobOption {
  value: string
  label: string
}

interface JobNumberComboboxProps {
  value: string
  onChange: (value: string) => void
  jobOptions?: JobOption[]
  label?: string
  required?: boolean
}

export default function JobNumberCombobox({
  value,
  onChange,
  jobOptions = [
    { value: "O475-PTT-001", label: "O475 - PTT - สิ่งก่อสร้างหินกรวดศิลาเมือง..." },
    { value: "O476-BCP-002", label: "O476 - BCP - โครงการท่อส่งก๊าซ" },
    { value: "O477-SCG-003", label: "O477 - SCG - โรงงานปูนซีเมนต์" },
    { value: "O478-TRUE-004", label: "O478 - TRUE - โครงการ 5G Tower" },
    { value: "O479-CP-005", label: "O479 - CP - โรงงานผลิตอาหาร" },
  ],
  label = "Job Number",
  required,
}: JobNumberComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            {value ? jobOptions.find((job) => job.value === value)?.label : "เลือก Job Number..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="ค้นหา Job Number..." />
            <CommandList>
              <CommandEmpty>ไม่พบ Job Number</CommandEmpty>
              <CommandGroup>
                {jobOptions.map((job) => (
                  <CommandItem
                    key={job.value}
                    onSelect={() => {
                      onChange(job.value)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === job.value ? "opacity-100" : "opacity-0")} />
                    {job.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
