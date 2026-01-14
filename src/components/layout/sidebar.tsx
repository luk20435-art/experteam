// components/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  FolderKanban,
  Trash2,
  ChevronDown,
  Sliders,
  User,
  MapPin,
  Building2,
  Wrench,
  ClipboardList,
  Building,
  FolderTree,
  UserCheck,
  UserCog,
  Briefcase,
  Users,
  Store,
  Handshake,
} from "lucide-react"
import { ALL } from "dns"

const navigation = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Over all", href: "/overall", icon: LayoutDashboard },
    ],
  },
  {
    group: "PR-PO",
    items: [
      { name: "Jobs", href: "/project", icon: FolderKanban },
      { name: "Purchase Requisition", href: "/pr", icon: FileText },
      { name: "Purchase Order", href: "/po", icon: ShoppingCart },
      { name: "Petty Cash", href: "/pattycash", icon: ShoppingCart },
    ],
  },
  {
    group: "WR-WO",
    items: [
      { name: "Work Request", href: "/wr", icon: Wrench },
      { name: "Work Order", href: "/wo", icon: ClipboardList },
    ],
  },
  {
    group: "Manage",
    items: [
      { name: "Clients", href: "/client", icon: Handshake },
      { name: "Suppliers", href: "/supplier", icon: Handshake },
      { name: "Depart", href: "/depart", icon: Handshake },
    ],
  },
]

const trashItems = [
  { label: "Jobs", href: "/trash/project", icon: FolderKanban },
  { label: "PR", href: "/trash/pr", icon: FileText },
  { label: "PO", href: "/trash/po", icon: ShoppingCart },
  { label: "WR", href: "/trash/wr", icon: Wrench },
  { label: "WO", href: "/trash/wo", icon: ClipboardList },
]

const settingsItems = [
  {
    label: "Users",
    href: "/settings/users",
    icon: Users,
  },
  {
    label: "Positions",
    href: "/settings/positions",
    icon: Briefcase,
  },
  {
    label: "Employees",
    href: "/settings/employees",
    icon: UserCog,
  },
  {
    label: "Employee Positions",
    href: "/settings/employee_positions",
    icon: UserCheck,
  },
  {
    label: "Departments",
    href: "/settings/departments",
    icon: FolderTree,
  },
  {
    label: "Organizations",
    href: "/settings/organizations",
    icon: Building,
  },
];

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsTrashOpen(pathname.startsWith("/trash"))
    setIsSettingsOpen(pathname.startsWith("/settings"))
  }, [pathname])

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <aside
      className={cn(
        "h-full flex flex-col border-r-2 transition-all duration-300 ease-in-out shadow-xl",
        isDark
          ? "dark:bg-black via-slate-900 to-slate-800"
          : "bg-black",
        isOpen ? "w-64" : "w-0 lg:w-16",
        !isOpen && "overflow-hidden"
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-16 items-center border-b-2 px-4 md:px-6 transition-all duration-300",
          isDark
            ? "border-slate-700 to-slate-800"
            : "border-gray-400 bg-gradient-to-r from-sky-700 to-sky-800"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white shadow-lg">
            {/* <img
              src="/images/logo.jpg"
              alt="Experteam Logo"
              className={cn(
                "object-contain transition-all duration-300 h-6 w-6",
                !isOpen && "sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-6 lg:w-6"
              )}
            /> */}
          </div>
          <h1
            className={cn(
              "text-lg font-bold text-white whitespace-nowrap transition-all duration-300",
              !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            )}
          >
            Proccument System
          </h1>
        </div>
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-0 py-6">
        {/* Main Navigation */}
        {navigation.map((section) => (
          <div key={section.group} className="space-y-3">
            {isOpen && (
              <div
                className={cn(
                  "px-4 py-2.5",
                  isDark ? "bg-sky-900 dark:bg-sky-900" : "bg-sky-800"
                )}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm">
                  {section.group}
                </h3>
              </div>
            )}
            <div className="space-y-2 px-3">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                        : isDark
                          ? "text-slate-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md"
                          : "text-gray-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md",
                      !isOpen && "lg:justify-center lg:px-3"
                    )}
                    title={!isOpen ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                        isActive && "text-gray-900",
                        !isActive && isDark
                          ? "text-white-400 group-hover:scale-125 group-hover:text-gray-900"
                          : "text-white dark:text-black group-hover:scale-125 group-hover:text-gray-900"
                      )}
                    />
                    <span
                      className={cn(
                        "whitespace-nowrap transition-opacity duration-300",
                        !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div
          className={cn(
            "my-4 mx-0 border-t-2 transition-all duration-300",
            isDark ? "border-slate-700" : "border-gray-700",
            isOpen ? "w-full" : "hidden lg:block w-8"
          )}
        />

        {/* Utility Section: Trash */}
        <div className="space-y-3">
          {isOpen && (
            <div
              className={cn(
                "px-4 py-2.5",
                isDark ? "bg-sky-900 dark:bg-sky-900" : "bg-sky-800"
              )}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm">
                Utility
              </h3>
            </div>
          )}
          <div className="px-3">
            <button
              onClick={() => setIsTrashOpen(!isTrashOpen)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                pathname.startsWith("/trash")
                  ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                  : isDark
                    ? "text-slate-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md"
                    : "text-gray-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md",
                !isOpen && "lg:justify-center lg:px-3"
              )}
              title={!isOpen ? "Trash" : undefined}
            >
              <Trash2
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-200",
                  pathname.startsWith("/trash")
                    ? "text-gray-900"
                    : isDark
                      ? "text-slate-400 group-hover:scale-125 group-hover:text-gray-900"
                      : "text-gray-400 group-hover:scale-125 group-hover:text-gray-900"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-left whitespace-nowrap transition-opacity duration-300",
                  !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
              >
                Restore
              </span>
              {isOpen && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 flex-shrink-0",
                    isTrashOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Trash Dropdown Items */}
            {isOpen && isTrashOpen && (
              <div
                className={cn(
                  "mt-2 space-y-1.5 pl-4 border-l-4 ml-2",
                  isDark ? "border-slate-600" : "border-gray-600"
                )}
              >
                {trashItems.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      pathname === href
                        ? "bg-yellow-300 text-gray-900 font-bold"
                        : isDark
                          ? "text-slate-400 hover:text-gray-900 hover:bg-yellow-300"
                          : "text-gray-400 hover:text-gray-900 hover:bg-yellow-300"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-125" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section: Settings */}
        <div className="space-y-3">
          {isOpen && (
            <div
              className={cn(
                "px-4 py-2.5",
                isDark ? "bg-sky-900 dark:bg-sky-900" : "bg-sky-800"
              )}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm">
                Configuration
              </h3>
            </div>
          )}
          <div className="px-3">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                pathname.startsWith("/settings")
                  ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                  : isDark
                    ? "text-slate-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md"
                    : "text-gray-300 hover:bg-yellow-400 hover:text-gray-900 hover:shadow-md",
                !isOpen && "lg:justify-center lg:px-3"
              )}
              title={!isOpen ? "Settings" : undefined}
            >
              <Sliders
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-200",
                  pathname.startsWith("/settings")
                    ? "text-gray-900"
                    : isDark
                      ? "text-slate-400 group-hover:scale-125 group-hover:text-gray-900"
                      : "text-gray-400 group-hover:scale-125 group-hover:text-gray-900"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-left whitespace-nowrap transition-opacity duration-300",
                  !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
              >
                Settings
              </span>
              {isOpen && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 flex-shrink-0",
                    isSettingsOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Settings Dropdown Items */}
            {isOpen && isSettingsOpen && (
              <div
                className={cn(
                  "mt-2 space-y-1.5 pl-4 border-l-4 ml-2",
                  isDark ? "border-slate-600" : "border-gray-600"
                )}
              >
                {settingsItems.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      pathname === href
                        ? "bg-yellow-300 text-gray-900 font-bold"
                        : isDark
                          ? "text-slate-400 hover:text-gray-900 hover:bg-yellow-300"
                          : "text-gray-400 hover:text-gray-900 hover:bg-yellow-300"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-125" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  )
}