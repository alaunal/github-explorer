import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded h-4 w-3/4 mb-2" />
      <div className="bg-muted rounded h-3 w-1/2" />
    </div>
  )
}

export function RepositoryCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="animate-pulse">
          <div className="bg-muted rounded h-6 w-3/4 mb-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="bg-muted rounded h-4 w-full" />
          <div className="bg-muted rounded h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-muted rounded-full h-3 w-3" />
          <div className="animate-pulse bg-muted rounded h-3 w-16" />
          <div className="animate-pulse bg-muted rounded h-3 w-8" />
        </div>
        <div className="animate-pulse bg-muted rounded h-3 w-24" />
      </CardContent>
    </Card>
  )
}

export function UserProfileSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-muted rounded-full h-16 w-16" />
          <div className="space-y-2 flex-1">
            <div className="animate-pulse bg-muted h-6 w-48 rounded" />
            <div className="animate-pulse bg-muted h-4 w-32 rounded" />
            <div className="animate-pulse bg-muted h-4 w-64 rounded" />
          </div>
          <div className="animate-pulse bg-muted h-10 w-24 rounded" />
        </div>
      </CardHeader>
    </Card>
  )
}
