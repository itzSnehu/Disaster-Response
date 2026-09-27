import { AlertCircle } from 'lucide-react';

export function EmptyState({
  title = 'No Data Found',
  message = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  icon: Icon = AlertCircle,
}) {
  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#F0D8CB] shadow-warm-sm text-center space-y-4 max-w-md mx-auto my-6">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[#343434]">{title}</h3>
        <p className="text-xs md:text-sm text-[#8A817B]">{message}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-extrabold text-xs transition-all shadow-warm-sm"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
