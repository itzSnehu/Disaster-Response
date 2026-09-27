import { AlertTriangle, X } from 'lucide-react';

export function DeleteConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-warm-lg border border-[#F0D8CB] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-[#343434] mb-2">{title || 'Delete Disaster Incident?'}</h3>
        <p className="text-sm text-[#8A817B] mb-6">
          {message || 'This action cannot be undone. Are you sure you want to permanently delete this disaster incident record?'}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm shadow-sm flex items-center"
          >
            {isDeleting ? 'Deleting...' : 'Delete Disaster'}
          </button>
        </div>
      </div>
    </div>
  );
}
