import { Skeleton } from '@/components/ui/skeleton';

export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 space-y-12 max-w-7xl mx-auto">
      {/* Navbar Skeleton */}
      <div className="w-full flex items-center justify-between py-4">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-16 w-full max-w-lg rounded-2xl" />
          <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <Skeleton className="h-[480px] w-[320px] rounded-3xl" />
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    </div>
  );
}
