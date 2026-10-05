import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Overview';
    if (location.pathname.includes('/customers/register')) return 'Customer Registration';
    if (location.pathname.includes('/customers/check')) return 'Customer Directory';
    if (location.pathname.includes('/customers/history')) return 'Sale History';
    if (location.pathname.includes('/sales/new')) return 'New Sale Workflow';
    if (location.pathname.includes('/sales/')) return 'Sale Details';
    return 'Dashboard';
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 z-10 sticky top-0 border-b border-gray-200/50">
      <div className="flex items-center">
        <button className="lg:hidden text-gray-500 hover:text-gray-900 mr-4 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">{getPageTitle()}</h2>
      </div>
    </header>
  );
}
