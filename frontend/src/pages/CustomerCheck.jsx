import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { ErrorState } from '../components/States';
import { PageHeader, Card, Input, Select, Button, Badge } from '../components/ui';
import { Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CustomerCheck() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchType, setSearchType] = useState('mobile');
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue) return;
    
    setStatus('loading');
    setError('');
    
    try {
      const res = await fetchApi(`/customers/search?identifier=${searchType}&value=${searchValue}`);
      setCustomer(res.data);
      setStatus('success');
    } catch (err) {
      if (err.message.includes('No customer found') || err.message === 'No customer found') {
        setStatus('not-found');
        toast.warning('No customer found');
      } else {
        setError(err.message || 'Search failed');
        setStatus('error');
      }
    }
  };

  return (
    <div className="w-full pb-10">
      <PageHeader 
        title="Customer Check" 
        subtitle="Find a customer using their ID or contact information." 
      />

      <Card className="p-8 mb-8 border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="w-full md:w-1/3">
            <Select 
              label="Search By"
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              options={[
                { value: 'mobile', label: 'Mobile Number' },
                { value: 'whatsapp', label: 'WhatsApp Number' },
                { value: 'customerId', label: 'Customer ID' }
              ]}
            />
          </div>
          <div className="w-full md:w-1/2">
            <Input 
              label="Enter Value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="e.g. 9876543210 or KT-XXXXXX"
            />
          </div>
          <Button type="submit" isLoading={status === 'loading'} className="w-full md:w-auto h-[46px] px-8">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </Card>
      
      {status === 'not-found' && (
        <Card className="p-12 text-center bg-gray-50 border-gray-200 border-dashed">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No customer found</h3>
          <p className="text-gray-500 mb-6">Try searching with a different Customer ID or phone number.</p>
          <Button variant="secondary" onClick={() => navigate('/customers/register')}>
            Register a new customer
          </Button>
        </Card>
      )}

      {status === 'error' && <ErrorState message={error} />}

      {status === 'success' && customer && (
        <Card className="overflow-hidden shadow-sm">
          <div className="p-8 border-b border-gray-100 flex justify-between items-start">
            <div className="flex gap-5 items-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold border border-blue-100">
                {customer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{customer.customerId}</p>
                <h2 className="text-2xl font-bold text-gray-900">{customer.fullName}</h2>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <Badge status={customer.customerStatus} />
              <p className="text-xs text-gray-500 mt-2 font-medium">Customer since {new Date(customer.registrationDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mobile</span> <p className="font-semibold text-gray-900">{customer.mobile}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">WhatsApp</span> <p className="font-semibold text-gray-900">{customer.whatsapp}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</span> <p className="font-semibold text-gray-900">{customer.email || '-'}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date of Birth</span> <p className="font-medium text-gray-900">{customer.dob ? new Date(customer.dob).toLocaleDateString() : '-'}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</span> <p className="font-medium text-gray-900">{customer.gender || '-'}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Source</span> <p className="font-medium text-gray-900">{customer.customerSource}</p></div>
            <div><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GSTIN</span> <p className="font-medium text-gray-900">{customer.gstin || '-'}</p></div>
            <div className="md:col-span-2"><span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</span> <p className="font-medium text-gray-900">{customer.address || '-'} {customer.pincode && `- ${customer.pincode}`}</p></div>
          </div>
          
          <div className="bg-gray-50 px-8 py-5 flex gap-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => navigate(`/customers/history?id=${customer.customerId}`)}>
              View Sale History
            </Button>
            <Button onClick={() => navigate(`/sales/new?id=${customer.customerId}`)}>
              Create New Sale
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
