export function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const dimensions = size === 'small' ? 'w-5 h-5 border-2' : size === 'large' ? 'w-10 h-10 border-4' : 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${dimensions} border-[#F47B4A] border-t-transparent rounded-full animate-spin mb-3`}
      ></div>
      {message && <p className="text-sm font-medium text-[#8A817B]">{message}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#F0D8CB] shadow-warm-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-[#FCE5D8] rounded-full w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-[#FCE5D8] rounded-lg w-16"></div>
        <div className="h-6 bg-[#FCE5D8] rounded-lg w-16"></div>
      </div>
    </div>
  );
}
