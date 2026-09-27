import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ title = 'Something went wrong', message = 'Unable to load information right now.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-red-100 shadow-warm-sm text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#343434] mb-1">{title}</h3>
      <p className="text-sm text-[#8A817B] mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-medium text-sm transition-colors shadow-warm-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No disasters found', message = 'Create your first disaster incident report to get started.', icon: Icon, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-[#F0D8CB] shadow-warm-sm text-center max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#FCE5D8] flex items-center justify-center text-[#F47B4A] mb-4">
        {Icon ? <Icon className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-[#343434] mb-1">{title}</h3>
      <p className="text-sm text-[#8A817B] mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-semibold text-sm transition-colors shadow-warm-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
