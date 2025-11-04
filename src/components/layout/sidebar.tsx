// components/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

const navigation = [
  {
    group: "Overview",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    group: "Management",
    items: [
      { name: "Projects", href: "/project", icon: FolderKanban },
      { name: "Purchase Requisition", href: "/pr", icon: FileText },
      { name: "Purchase Order", href: "/po", icon: ShoppingCart },
      { name: "Work Request", href: "/wr", icon: ShoppingCart },
      { name: "Work Order", href: "/wo", icon: ShoppingCart },
    ],
  },
]

const trashItems = [
  { label: "Projects", href: "/trash/project", icon: FolderKanban },
  { label: "PR", href: "/trash/pr", icon: FileText },
  { label: "PO", href: "/trash/po", icon: ShoppingCart },
  { label: "WR", href: "/trash/wr", icon: ShoppingCart },
  { label: "WO", href: "/trash/wo", icon: ShoppingCart },
]

const settingsItems = [
  { label: "Users", href: "/settings/users", icon: User },
  { label: "Positions", href: "/settings/positions", icon: MapPin },
  { label: "Organizations", href: "/settings/organizations", icon: Building2 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    setIsTrashOpen(pathname.startsWith("/trash"))
    setIsSettingsOpen(pathname.startsWith("/settings"))
  }, [pathname])

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <aside
      className={cn(
        "h-full flex flex-col border-r border-border bg-gradient-to-b from-card to-card/95 transition-all duration-300 ease-in-out shadow-lg",
        isOpen ? "w-64" : "w-0 lg:w-16",
        !isOpen && "overflow-hidden"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-border/50 px-4 md:px-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md">
            <img
              src="/images.jpg"
              alt="Experteam Logo"
              className={cn(
                "object-contain transition-all duration-300 h-6 w-6",
                !isOpen && "sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-6 lg:w-6"
              )}
            />
          </div>
          <h1
            className={cn(
              "text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300",
              !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            )}
          >
            Experteam
          </h1>
        </div>
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-6 md:px-3">
        {/* Main Navigation */}
        {navigation.map((section) => (
          <div key={section.group} className="space-y-3">
            {isOpen && (
              <h3 className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.group}
              </h3>
            )}
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:shadow-sm",
                      !isOpen && "lg:justify-center lg:px-2"
                    )}
                    title={!isOpen ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                        !isActive && "group-hover:scale-110 group-hover:text-primary"
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
            "my-4 mx-auto border-t border-border/30 transition-all duration-300",
            isOpen ? "w-3/4" : "hidden lg:block w-8"
          )}
        />

        {/* Utility Section: Trash */}
        <div className="space-y-3">
          {isOpen && (
            <h3 className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Utility
            </h3>
          )}
          <div>
            <button
              onClick={() => setIsTrashOpen(!isTrashOpen)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/trash")
                  ? "bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive hover:from-destructive/30 hover:to-destructive/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:shadow-sm",
                !isOpen && "lg:justify-center lg:px-2"
              )}
              title={!isOpen ? "Trash" : undefined}
            >
              <Trash2
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-200",
                  pathname.startsWith("/trash") ? "text-destructive" : "group-hover:scale-110"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-left whitespace-nowrap transition-opacity duration-300",
                  !isOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
              >
                Trash
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
              <div className="mt-2 space-y-1.5 pl-8 border-l-2 border-destructive/20 ml-5">
                {trashItems.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      pathname === href
                        ? "bg-destructive/10 text-destructive font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
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
            <h3 className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Configuration
            </h3>
          )}
          <div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/settings")
                  ? "bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 hover:from-blue-500/30 hover:to-blue-500/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:shadow-sm",
                !isOpen && "lg:justify-center lg:px-2"
              )}
              title={!isOpen ? "Settings" : undefined}
            >
              <Sliders
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-200",
                  pathname.startsWith("/settings") ? "text-blue-600" : "group-hover:scale-110"
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
              <div className="mt-2 space-y-1.5 pl-8 border-l-2 border-blue-500/20 ml-5">
                {settingsItems.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      pathname === href
                        ? "bg-blue-500/10 text-blue-600 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
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