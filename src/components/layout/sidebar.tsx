"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  {
    title: "Overview",
    href: "/dashboard",
  },
  {
    title: "Add Flight",
    href: "/flights",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <aside className="hidden w-[200px] flex-col md:flex">
      <nav className="grid items-start gap-2 p-4">
        {sidebarLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => handleNavigation(link.href)}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left w-full",
              pathname === link.href
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.title}
          </button>
        ))}
      </nav>
    </aside>
  )
}
