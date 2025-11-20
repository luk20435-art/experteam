"use client";

import Link from "next/link"; // ✅ ต้อง import จาก next/link
import { Bell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-base md:text-lg font-semibold text-foreground"></h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* 🔔 ปุ่มแจ้งเตือน */}
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/notifications">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Link>
        </Button>

        {/* 👤 ปุ่มผู้ใช้ */}
        <Button asChild variant="ghost" size="icon">
          <Link href="/auth/login">
            <User className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
