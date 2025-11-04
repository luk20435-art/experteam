"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SupplierComboboxProps {
  value: string
  onChange: (value: string) => void
  suppliers?: string[]
  label?: string
  required?: boolean
}

export default function SupplierCombobox({
  value,
  onChange,
  suppliers = [
    "บริษัท ซีพี ออลล์ จำกัด (มหาชน)",
    "บริษัท ปตท. จำกัด (มหาชน)",
    "บริษัท ไทยเบฟเวอเรจ จำกัด (มหาชน)",
    "บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด (มหาชน)",
    "บริษัท กรุงเทพดรักสโตร์ จำกัด",
  ],
  label = "Supplier",
  required,
}: SupplierComboboxProps) {
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
            {value || "เลือก Supplier..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="ค้นหา Supplier..." />
            <CommandList>
              <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier}
                    onSelect={() => {
                      onChange(supplier)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === supplier ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {supplier}
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
