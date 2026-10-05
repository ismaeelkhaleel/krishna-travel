import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Search, History, FilePlus, Plane, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers/register', label: 'Registration', icon: UserPlus },
    { to: '/customers/check', label: 'Directory Check', icon: Search },
    { to: '/customers/history', label: 'Sale History', icon: History },
    { to: '/sales/new', label: 'New Sale Record', icon: FilePlus },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-[280px] bg-[#F1F5F9] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:static lg:w-[260px] lg:border-r lg:border-gray-200/80 lg:shadow-none lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200/60">
          <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">KRISHNA</h1>
              <h2 className="text-[11px] font-semibold tracking-[0.2em] text-gray-500 uppercase">Travels</h2>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar">
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-[14px] font-medium transition-all duration-200 rounded-xl ${
                      isActive
                        ? 'bg-white shadow-sm text-blue-700'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px] mr-3 transition-colors" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200/60">
          <div className="flex items-center gap-3 cursor-pointer group p-3 hover:bg-white rounded-xl transition-colors">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold border border-blue-100 shadow-sm">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">Staff Agent</p>
              <p className="text-xs text-gray-500 truncate">Operations</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
