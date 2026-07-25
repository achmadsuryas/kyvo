import { Skeleton } from '@/components/ui/skeleton';

export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between items-center p-4 md:p-8 font-sans">
      {/* Header Skeleton */}
      <div className="w-full max-w-md flex items-center justify-between py-2">
        <Skeleton className="h-8 w-28 rounded-xl" />
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>

      {/* Profile Card Container Skeleton */}
      <div className="w-full max-w-md my-8 rounded-3xl border-[4px] border-[#111111] bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#111111] space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />

        <div className="flex flex-col items-center text-center -mt-16 space-y-3">
          <Skeleton className="h-24 w-24 rounded-full ring-4 ring-white" />
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-12 w-64 rounded-xl" />
        </div>

        {/* Link Cards Skeletons */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <Skeleton className="h-4 w-36 rounded-lg" />
    </div>
  );
}
