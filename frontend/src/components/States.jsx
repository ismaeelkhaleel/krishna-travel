import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium tracking-wide">{message}</p>
    </div>
  );
}

export function ErrorState({ title = 'Error', message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-md mx-auto shadow-sm">
      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <h3 className="text-red-900 font-bold mb-2">{title}</h3>
      <p className="text-red-600/80 mb-5 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="max-w-lg w-full bg-white shadow-xl shadow-gray-200/50 rounded-2xl p-10 text-center border-t-4 border-red-500">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Access Denied</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          This Dashboard is available only from authorized office networks. Your current IP address is not permitted to access this highly secure system.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Action Required</p>
           <p className="text-sm text-gray-700 font-medium mt-1">Please connect to the approved office VPN.</p>
        </div>
      </div>
    </div>
  );
}
