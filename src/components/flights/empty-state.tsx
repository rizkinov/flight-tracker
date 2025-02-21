import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Icons.plane className="h-10 w-10 text-muted-foreground" />
        
        <h3 className="mt-4 text-lg font-semibold">No flights added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven&apos;t added any flights yet. Start tracking your travels by adding your first flight.
        </p>
        
        <Button asChild>
          <Link href="/flights">
            Add Your First Flight
          </Link>
        </Button>
      </div>
    </div>
  )
} 