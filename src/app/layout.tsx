"use client"

import "@/styles/globals.css"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { TailwindIndicator } from "@/components/layout/tailwind-indicator"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { useAuthCookie } from "@/lib/hooks/use-auth-cookie"

interface RootLayoutProps {
  children: React.ReactNode
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  useAuthCookie()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <div className="border-b">
          <div className="container flex-1 items-start md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-6 md:py-6">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
              <Sidebar />
            </aside>
            <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr]">
              <div className="mx-auto w-full min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <RootLayoutContent>
              {children}
            </RootLayoutContent>
            <TailwindIndicator />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
