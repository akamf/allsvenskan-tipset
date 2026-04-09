import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 bg-[#d9cfbc]"
          />
        ))}
      </div>
      <Skeleton className="h-[520px] bg-[#d9cfbc]" />
      <Skeleton className="h-[380px] bg-[#d9cfbc]" />
    </div>
  )
}
