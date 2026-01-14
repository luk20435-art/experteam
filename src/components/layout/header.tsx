"use client"

import Link from "next/link"
import { Bell, User, Menu, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // ป้องกัน hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-sky-800 dark:bg-black px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="outline" size="icon" onClick={onMenuClick} className="cursor-pointer">
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-base md:text-lg font-semibold text-foreground"></h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* 🌙 ปุ่มสลับ Dark Mode */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative text-white cursor-pointer"
          >
            <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">สลับโหมดมืด/สว่าง</span>
          </Button>
        )}

        {/* 🔔 ปุ่มแจ้งเตือน */}
        <Button asChild variant="ghost" size="icon" className="relative text-white">
          <Link href="/notifications">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Link>
        </Button>

        {/* 👤 ปุ่มผู้ใช้ */}
        <Button asChild variant="ghost" size="icon" className="text-white">
          <Link href="/auth/login">
            <User className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}