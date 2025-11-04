// app/layout.tsx
import type React from "react"
import { Sarabun } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/layout/client-layout"
import { DataProvider } from "@/src/contexts/data-context"
import { Toaster } from "@/components/ui/toaster"

// ใช้ Sarabun แทน Inter
const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
})

export const metadata = {
  title: "Experteam",
  description: "Experteam",
  generator: "Experteam",
  icons: {
    icon: "/images.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="h-full">
      <body className={`${sarabun.className} h-full bg-background antialiased`}>
        <DataProvider>
          <ClientLayout>
            {children}
            <Toaster />
          </ClientLayout>
        </DataProvider>
      </body>
    </html>
  )
}