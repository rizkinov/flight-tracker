import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">No flights added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven&apos;t added any flights yet. Add your first flight to start tracking.
        </p>
        <Link href="/flights">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add your first flight
          </Button>
        </Link>
      </div>
    </div>
  )
} 