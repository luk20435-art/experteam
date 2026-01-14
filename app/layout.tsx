import type React from "react"
import { Sarabun } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/layout/client-layout"
import { DataProvider } from "@/src/contexts/data-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider" // เพิ่มใหม่

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
})

export const metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: {
    default: "Proccument System",
    template: "%s | Experteam",
  },
  description: "Experteam - ระบบจัดการเอกสารภายในองค์กร",
  icons: {
    icon: ["/images/logo.jpg"],
    shortcut: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  openGraph: {
    title: "Proccument System",
    description: "ระบบจัดการเอกสารภายใน Experteam Company Limited",
    images: ["/images/logo.jpg"],
    locale: "th_TH",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.jpg" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
      </head>
      <body className={`${sarabun.className} h-full bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"     
          enableSystem
          disableTransitionOnChange 
        >
          <DataProvider>
            <ClientLayout>
              {children}
              <Toaster />
            </ClientLayout>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}