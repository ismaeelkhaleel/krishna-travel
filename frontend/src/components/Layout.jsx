import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Plane } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200/60 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Plane className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Krishna Travels</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
