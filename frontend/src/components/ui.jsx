import React from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-[14px] shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-gray-700">{label}</label>}
      <input 
        className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-900 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ label, options, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select 
          className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-900 appearance-none pr-10 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...props}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value !== undefined ? opt.value : opt}>{opt.label || opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Button({ children, variant = 'primary', isLoading, className = '', ...props }) {
  const base = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 shadow-sm hover:shadow",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ children, status, className = '' }) {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'paid': case 'full paid': case 'completed': case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': case 'partial':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': case 'unpaid':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors()} ${className}`}>
      {children || status}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200/60">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="mt-4 md:mt-0">{action}</div>}
    </div>
  );
}

export function StatCard({ title, value, subtext, colorClass = 'bg-white border-gray-100' }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between ${colorClass}`}>
      <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}
