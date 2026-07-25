import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 pt-8 space-y-8 w-full">
      {/* Top Banner Header Skeleton */}
      <Skeleton className="h-36 w-full rounded-3xl" />

      {/* Main 2-Column Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8 w-full">
          {/* Account Info Card Skeleton */}
          <div className="rounded-3xl border-[3px] border-[#111111] bg-white p-6 space-y-6 shadow-[6px_6px_0px_0px_#111111]">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>

          {/* User Badges Equipment Skeleton */}
          <div className="rounded-3xl border-[3px] border-[#111111] bg-white p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111]">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </div>

          {/* Link Manager Skeleton */}
          <div className="rounded-3xl border-[3px] border-[#111111] bg-white p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111]">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>

        {/* Right Column (Ad Banner Skeleton) */}
        <div className="lg:col-span-5 space-y-8 w-full">
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
