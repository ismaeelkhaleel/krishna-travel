import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', message }) => {
    // Basic deduplication for fast consecutive same messages
    setToasts((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].message === message) {
        return prev;
      }
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      
      setTimeout(() => {
        removeToast(id);
      }, 2000);

      return [...prev, { id, type, message }];
    });
  }, [removeToast]);

  const toast = {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    warning: (message) => addToast({ type: 'warning', message }),
    info: (message) => addToast({ type: 'info', message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getStyle = () => {
    switch (toast.type) {
      case 'success': return { bg: 'bg-green-50 border-green-200 shadow-green-100', icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: 'text-green-800', role: 'status' };
      case 'error': return { bg: 'bg-red-50 border-red-200 shadow-red-100', icon: <AlertCircle className="w-5 h-5 text-red-500" />, text: 'text-red-800', role: 'alert' };
      case 'warning': return { bg: 'bg-amber-50 border-amber-200 shadow-amber-100', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, text: 'text-amber-800', role: 'status' };
      case 'info':
      default: return { bg: 'bg-blue-50 border-blue-200 shadow-blue-100', icon: <Info className="w-5 h-5 text-blue-500" />, text: 'text-blue-800', role: 'status' };
    }
  };

  const style = getStyle();

  return (
    <div 
      role={style.role} 
      aria-live={style.role === 'alert' ? 'assertive' : 'polite'}
      className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-sm transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'} ${style.bg} ${style.shadow}`}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">{style.icon}</div>
      <div className={`flex-1 text-sm font-semibold tracking-wide ${style.text}`}>{toast.message}</div>
      <button onClick={onClose} className={`ml-3 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ${style.text}`} aria-label="Close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
