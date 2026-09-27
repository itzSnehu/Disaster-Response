import { useRealtime } from '../../hooks/useRealtime';

export function RealtimeBadge({ className = '' }) {
  const { isConnected } = useRealtime();

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all border ${
        isConnected
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-gray-100 text-gray-600 border-gray-200'
      } ${className}`}
      title={isConnected ? 'Realtime Event Stream Connected' : 'Realtime Event Stream Disconnected'}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
        ></span>
      </span>

      <span className="uppercase tracking-wider">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
