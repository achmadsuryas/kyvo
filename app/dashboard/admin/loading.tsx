import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 pt-8 space-y-8 w-full">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-3xl" />

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>

      {/* User Directory Table Skeleton */}
      <div className="rounded-3xl border-[3px] border-[#111111] bg-white p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-56 rounded-lg" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
