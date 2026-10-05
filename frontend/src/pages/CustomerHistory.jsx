import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { ErrorState } from '../components/States';
import { PageHeader, Card, Input, Select, Button, Badge, StatCard, Skeleton } from '../components/ui';
import { Search, User } from 'lucide-react';

export default function CustomerHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  
  const [searchType, setSearchType] = useState('customerId');
  const [searchValue, setSearchValue] = useState(initialId || '');
  
  const [status, setStatus] = useState(initialId ? 'loading' : 'idle');
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchHistory = async (type, value) => {
    setStatus('loading');
    try {
      const res = await fetchApi(`/customers/history?identifier=${type}&value=${value}`);
      setData(res.data);
      setStatus('success');
    } catch (err) {
      if (err.message === 'No customer found') {
        setStatus('not-found');
        toast.warning('No customer found');
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchHistory('customerId', initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue) {
      setSearchParams({ id: searchValue });
      fetchHistory(searchType, searchValue);
    }
  };

  return (
    <div className="w-full pb-10">
      <PageHeader 
        title="Customer Sale History" 
        subtitle="Review booking records and complete financial summaries." 
      />

      <Card className="p-6 mb-8 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <Select 
              label="Search By"
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              options={[
                { value: 'customerId', label: 'Customer ID' },
                { value: 'mobile', label: 'Mobile Number' },
                { value: 'whatsapp', label: 'WhatsApp Number' }
              ]}
            />
          </div>
          <div className="w-full md:w-1/2">
            <Input 
              label="Value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter search value..."
            />
          </div>
          <Button type="submit" isLoading={status === 'loading'} className="w-full md:w-auto h-[46px] px-8">
            <Search className="w-4 h-4 mr-2" /> Find
          </Button>
        </form>
      </Card>

      {status === 'loading' && (
        <div className="space-y-6 animate-pulse">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
             {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      
      {status === 'not-found' && (
        <Card className="p-12 text-center bg-gray-50 border-gray-200 border-dashed">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500 mb-6">We could not find any history for this customer.</p>
        </Card>
      )}
      
      {status === 'error' && <ErrorState message="Failed to fetch history." />}

      {status === 'success' && data && (
        <>
          <Card className="mb-6 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-white to-gray-50">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                {data.customerSummary.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.customerSummary.fullName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 font-mono">{data.customerSummary.customerId}</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">{data.customerSummary.mobile}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge status={data.customerSummary.customerStatus} />
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <StatCard title="Bookings" value={data.customerSummary.totalBookings} />
            <StatCard title="Total Sales" value={`₹${data.customerSummary.totalSalesAmount}`} />
            <StatCard title="Total Paid" value={`₹${data.customerSummary.totalPaid}`} />
            <StatCard title="Outstanding" value={`₹${data.customerSummary.totalOutstanding}`} />
            <StatCard title="Total Refund" value={data.customerSummary.totalRefund !== null ? `₹${data.customerSummary.totalRefund}` : '-' } subtext={data.customerSummary.totalRefund === null ? "Data unavailable" : undefined} />
            <StatCard title="Total Profit" value={data.customerSummary.totalProfit !== null ? `₹${data.customerSummary.totalProfit}` : '-' } subtext={data.customerSummary.totalProfit === null ? "Data unavailable" : undefined} />
          </div>

          <Card className="overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.sales.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No sales recorded for this customer.</td></tr>
                  ) : (
                    data.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{sale.invoiceId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sale.bookingDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{sale.serviceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Rs. {sale.totalSaleAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex gap-2">
                             <Badge status={sale.paymentStatus} />
                             <Badge status={sale.bookingStatus} />
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button variant="secondary" className="px-4 py-1.5 h-auto text-xs" onClick={() => navigate(`/sales/${sale.id}`)}>Details</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
