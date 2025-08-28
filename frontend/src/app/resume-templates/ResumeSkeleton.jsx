import { Skeleton } from '@/components/ui/skeleton';

export function ResumeSkeleton({ count }) {
  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 xs:grid-cols-1 gap-6 place-items-center p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full
         h-90 p-4"
        >
          {/* Main skeleton card with shadow to match actual cards */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Main template image area */}
            <Skeleton className="h-90 w-full rounded-t-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
