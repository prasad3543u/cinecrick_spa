export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
  );
}

export function GroundCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/55 overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/55 overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-4 w-1/4" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="flex items-center gap-1 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-0.5 flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-0.5 flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function AdminBookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/55 overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  );
}