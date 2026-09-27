export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-20 bg-[#FCE5D8] rounded-full"></div>
        <div className="h-4 w-16 bg-[#FFF7F1] rounded-lg"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded-lg"></div>
      <div className="h-4 w-1/2 bg-gray-100 rounded-lg"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-gray-100 rounded-lg"></div>
        <div className="h-3 w-4/5 bg-gray-100 rounded-lg"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-14 bg-[#FFF7F1] rounded-xl border border-[#F0D8CB]"></div>
        <div className="h-5 w-16 bg-[#FFF7F1] rounded-xl border border-[#F0D8CB]"></div>
      </div>
    </div>
  );
}
