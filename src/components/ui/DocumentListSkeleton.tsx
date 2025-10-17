interface DocumentListSkeletonProps {
  count?: number;
}

export const DocumentListSkeleton = ({ count = 10 }: DocumentListSkeletonProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
