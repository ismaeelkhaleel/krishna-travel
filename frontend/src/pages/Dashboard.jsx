import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, History, FilePlus, ArrowRight, BarChart3, Users, IndianRupee } from 'lucide-react';
import { PageHeader, Card, StatCard, Skeleton } from '../components/ui';
import { fetchApi } from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetchApi('/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const modules = [
    { title: 'Customer Registration', description: 'Register a new customer', icon: UserPlus, to: '/customers/register', accent: 'bg-blue-600 text-white', bg: 'bg-blue-50/50', borderHover: 'group-hover:border-blue-200 shadow-blue-500/5' },
    { title: 'Customer Check', description: 'Search and view customer details', icon: Search, to: '/customers/check', accent: 'bg-indigo-600 text-white', bg: 'bg-indigo-50/50', borderHover: 'group-hover:border-indigo-200 shadow-indigo-500/5' },
    { title: 'Customer Sale History', description: 'Review bookings and sales', icon: History, to: '/customers/history', accent: 'bg-violet-600 text-white', bg: 'bg-violet-50/50', borderHover: 'group-hover:border-violet-200 shadow-violet-500/5' },
    { title: 'New Sale Record', description: 'Create a new booking or sale', icon: FilePlus, to: '/sales/new', accent: 'bg-sky-600 text-white', bg: 'bg-sky-50/50', borderHover: 'group-hover:border-sky-200 shadow-sky-500/5' },
  ];

  return (
    <div className="w-full pb-10">
      <PageHeader 
        title="Welcome to Krishna Travels" 
        subtitle="Manage customers, bookings and sales from one central place." 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.title} to={m.to} className="group block focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-[14px]">
              <div className={`h-full p-6 flex flex-col justify-between border border-transparent rounded-[14px] shadow-sm hover:shadow-md ${m.bg} ${m.borderHover} group-hover:-translate-y-1 transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex-shrink-0 ${m.accent} p-3 rounded-xl shadow-sm transition-shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{m.title}</h3>
                  <p className="mt-1.5 text-xs text-gray-600 font-medium leading-relaxed">{m.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-gray-400"/> Business Overview</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Total Customers" value={analytics?.stats?.totalCustomers || 0} colorClass="bg-blue-50/40 border-blue-100/60" />
            <StatCard title="Total Bookings" value={analytics?.stats?.totalBookings || 0} colorClass="bg-indigo-50/40 border-indigo-100/60" />
            <StatCard title="Total Revenue" value={`Rs. ${(analytics?.stats?.totalRevenue || 0).toLocaleString()}`} colorClass="bg-emerald-50/40 border-emerald-100/60" />
            <StatCard title="Outstanding" value={`Rs. ${(analytics?.stats?.totalOutstanding || 0).toLocaleString()}`} colorClass="bg-amber-50/40 border-amber-100/60" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-slate-50 border-slate-200/60">
           <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center"><IndianRupee className="w-4 h-4 mr-2 text-green-500"/> Revenue Trend (Last 6 Months)</h3>
           {loading ? <Skeleton className="h-64" /> : (
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analytics?.salesTrend || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `Rs. ${val/1000}k`} />
                   <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           )}
        </Card>

        <Card className="p-6 bg-slate-50 border-slate-200/60">
           <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-500"/> Customer Growth (Last 6 Months)</h3>
           {loading ? <Skeleton className="h-64" /> : (
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analytics?.customerGrowth || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                   <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Area type="monotone" dataKey="customers" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCust)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}
        </Card>
      </div>
    </div>
  );
}
