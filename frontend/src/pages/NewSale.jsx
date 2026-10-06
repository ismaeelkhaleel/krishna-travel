import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PageHeader, Card, Input, Select, Button, Badge } from '../components/ui';
import { Search, User, ChevronRight, FileText, Briefcase, CreditCard, CheckCircle } from 'lucide-react';

export default function NewSale() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(null);
  
  const [searchType, setSearchType] = useState('customerId');
  const [searchValue, setSearchValue] = useState(initialId || '');
  const [searchStatus, setSearchStatus] = useState('idle');

  const [saleData, setSaleData] = useState({
    invoiceId: '', 
    bookingDate: new Date().toISOString().split('T')[0], 
    bookingCreatedBy: '', branch: '',
    bookingSource: 'Walk-in',
    customerType: 'Retail', 
    serviceType: 'Flight', 
    
    referenceNumber: '', serviceName: '', travelDate: '', remarks: '',
    
    baseAmount: 0, serviceCharges: 0, discount: 0, tax: 0, paidAmount: 0,
    paymentMethod: 'Cash', paymentStatus: 'Unpaid', bookingStatus: 'Pending'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialId) handleCustomerSearch(null, 'customerId', initialId);
  }, [initialId]);

  const handleCustomerSearch = async (e, forceType, forceValue) => {
    if (e) e.preventDefault();
    const t = forceType || searchType;
    const v = forceValue || searchValue;
    if (!v) return;

    setSearchStatus('loading');
    try {
      const res = await fetchApi(`/customers/search?identifier=${t}&value=${v}`);
      setCustomer(res.data);
      setSearchStatus('success');
    } catch (err) {
      setSearchStatus('error');
      setCustomer(null);
      toast.warning('No customer found');
    }
  };

  const handleSaleChange = (e) => {
    const { name, value, type } = e.target;
    setSaleData({ ...saleData, [name]: type === 'number' ? Number(value) : value });
  };

  const calculatedTotal = Number(saleData.baseAmount) + Number(saleData.serviceCharges) - Number(saleData.discount) + Number(saleData.tax);
  const calculatedOutstanding = calculatedTotal - Number(saleData.paidAmount);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerSearchType: 'customerId', 
        customerSearchValue: customer.customerId,
        ...saleData
      };
      await fetchApi('/sales/new', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Sale created successfully');
      navigate(`/customers/history?id=${customer.customerId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to save sale');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRefLabel = () => {
    switch (saleData.serviceType) {
      case 'Flight': return 'PNR Number';
      case 'Train': return 'PNR Number';
      case 'Visa': return 'Application / Reference Number';
      case 'Travel Insurance': return 'Policy / Reference Number';
      default: return 'Booking Reference';
    }
  };

  const renderStepIcon = (s) => {
    if (step > s) return <CheckCircle className="w-5 h-5 text-white" />;
    return <span className={`text-sm font-bold ${step === s ? 'text-white' : 'text-gray-400'}`}>0{s}</span>;
  };

  return (
    <div className="w-full pb-10">
      <PageHeader title="New Sale Record" subtitle="Create a new booking/sale for an existing customer." />

      {/* 5-Step Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        {[
          { num: 1, label: 'Customer', icon: User },
          { num: 2, label: 'Booking', icon: FileText },
          { num: 3, label: 'Service', icon: Briefcase },
          { num: 4, label: 'Payment', icon: CreditCard },
          { num: 5, label: 'Review', icon: CheckCircle }
        ].map(s => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === s.num ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : step > s.num ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === s.num ? 'border-blue-400/30' : step > s.num ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                {renderStepIcon(s.num)}
              </div>
              <span className="text-sm font-bold hidden sm:inline-block">{s.label}</span>
            </div>
            {s.num < 5 && <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />}
          </div>
        ))}
      </div>

      <Card className="p-8 border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Select Customer</h2>
            <form onSubmit={handleCustomerSearch} className="flex gap-4 items-end">
              <div className="w-1/3">
                <Select label="Search By" value={searchType} onChange={(e) => setSearchType(e.target.value)} options={[
                  { value: 'customerId', label: 'Customer ID' },
                  { value: 'mobile', label: 'Mobile Number' },
                  { value: 'whatsapp', label: 'WhatsApp Number' }
                ]} />
              </div>
              <div className="w-1/2">
                <Input label="Enter Value" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search..." />
              </div>
              <Button type="submit" isLoading={searchStatus === 'loading'} className="h-[46px] px-8"><Search className="w-4 h-4 mr-2" /> Search</Button>
            </form>

            {customer && (
              <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-blue-50">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{customer.fullName}</h3>
                    <p className="text-sm text-gray-500 font-medium">ID: {customer.customerId} • Mobile: {customer.mobile}</p>
                  </div>
                </div>
                <Badge status={customer.customerStatus} />
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t mt-8">
              <Button onClick={() => setStep(2)} disabled={!customer}>Continue to Booking <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Invoice ID / Bill Number" name="invoiceId" value={saleData.invoiceId} onChange={handleSaleChange} required />
              <Input label="Booking Date" type="date" name="bookingDate" value={saleData.bookingDate} onChange={handleSaleChange} required />
              <Input label="Booking Created By" name="bookingCreatedBy" value={saleData.bookingCreatedBy} onChange={handleSaleChange} />
              <Input label="Branch / Office" name="branch" value={saleData.branch} onChange={handleSaleChange} />
              
              <Select label="Booking Source" name="bookingSource" value={saleData.bookingSource} onChange={handleSaleChange} options={[
                { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'Website', label: 'Website' },
                { value: 'Walk-in', label: 'Walk-in' }, { value: 'Call', label: 'Call' },
                { value: 'Referral', label: 'Referral' }, { value: 'Other', label: 'Other' }
              ]} />
              
              <Select label="Customer Type" name="customerType" value={saleData.customerType} onChange={handleSaleChange} options={[
                { value: 'Retail', label: 'Retail' }, { value: 'Corporate', label: 'Corporate' }, { value: 'Agent', label: 'Agent' }
              ]} />
            </div>
            <div className="flex justify-between pt-4 border-t mt-8">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue to Service <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Service Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Service Type" name="serviceType" value={saleData.serviceType} onChange={handleSaleChange} options={[
                { value: 'Flight', label: 'Flight' }, { value: 'Hotel', label: 'Hotel' },
                { value: 'Bus', label: 'Bus' }, { value: 'Train', label: 'Train' },
                { value: 'Cab', label: 'Cab' }, { value: 'Holiday Package', label: 'Holiday Package' },
                { value: 'Visa', label: 'Visa' }, { value: 'Travel Insurance', label: 'Travel Insurance' },
                { value: 'Other', label: 'Other' }
              ]} />
              
              <Input label={getRefLabel()} name="referenceNumber" value={saleData.referenceNumber} onChange={handleSaleChange} placeholder="e.g. ABC123" />
              <Input label="Travel Date" type="date" name="travelDate" value={saleData.travelDate} onChange={handleSaleChange} />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Input label="Service Name" name="serviceName" value={saleData.serviceName} onChange={handleSaleChange} placeholder="e.g. IndiGo 6E-1234" />
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</label>
                <textarea 
                  name="remarks" 
                  value={saleData.remarks} 
                  onChange={handleSaleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y min-h-[100px]"
                  placeholder="Enter any additional remarks..."
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t mt-8">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>Continue to Payment <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Financial & Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              <Input label="Base Amount (Rs.)" type="number" name="baseAmount" value={saleData.baseAmount} onChange={handleSaleChange} />
              <Input label="Service Charges (Rs.)" type="number" name="serviceCharges" value={saleData.serviceCharges} onChange={handleSaleChange} />
              <Input label="Discount (Rs.)" type="number" name="discount" value={saleData.discount} onChange={handleSaleChange} />
              <Input label="Tax (Rs.)" type="number" name="tax" value={saleData.tax} onChange={handleSaleChange} />
            </div>

            <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200 flex justify-between items-center mb-6">
              <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total Sale Amount</span>
              <span className="text-3xl font-bold text-gray-900">Rs. {calculatedTotal}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Input label="Amount Paid (Rs.)" type="number" name="paidAmount" value={saleData.paidAmount} onChange={handleSaleChange} />
              <Select label="Payment Status" name="paymentStatus" value={saleData.paymentStatus} onChange={handleSaleChange} options={[
                { value: 'Unpaid', label: 'Unpaid' }, { value: 'Partial', label: 'Partial' },
                { value: 'Paid', label: 'Paid' }, { value: 'Refunded', label: 'Refunded' }
              ]} />
              <Select label="Payment Method" name="paymentMethod" value={saleData.paymentMethod} onChange={handleSaleChange} options={[
                { value: 'Cash', label: 'Cash' }, { value: 'UPI', label: 'UPI' },
                { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Card', label: 'Card' }, { value: 'Other', label: 'Other' }
              ]} />
            </div>

            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex justify-between items-center">
              <span className="font-bold text-red-500 uppercase tracking-widest text-[10px]">Outstanding</span>
              <span className="text-xl font-bold text-red-700">Rs. {calculatedOutstanding}</span>
            </div>
            
            <div className="w-1/3 mt-4">
              <Select label="Booking Status" name="bookingStatus" value={saleData.bookingStatus} onChange={handleSaleChange} options={[
                { value: 'Pending', label: 'Pending' }, { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Completed', label: 'Completed' }, { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Refunded', label: 'Refunded' }
              ]} />
            </div>

            <div className="flex justify-between pt-4 border-t mt-8">
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => setStep(5)}>Review Sale <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Review Booking Details</h2>
              <p className="text-gray-500 mt-2">Please verify all information before saving the sale record.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer</h3>
                <p className="font-bold text-gray-900 mb-1">{customer?.fullName}</p>
                <p className="text-sm text-gray-600 mb-1">{customer?.customerId}</p>
                <p className="text-sm text-gray-600">Mobile: {customer?.mobile}</p>
              </div>

              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Booking</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] uppercase text-gray-500">Invoice ID</p><p className="font-semibold text-gray-900">{saleData.invoiceId}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Date</p><p className="font-semibold text-gray-900">{saleData.bookingDate}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Source</p><p className="font-semibold text-gray-900">{saleData.bookingSource}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Type</p><p className="font-semibold text-gray-900">{saleData.customerType}</p></div>
                </div>
              </div>

              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 md:col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Service</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><p className="text-[10px] uppercase text-gray-500">Service Type</p><p className="font-semibold text-gray-900">{saleData.serviceType}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">{getRefLabel()}</p><p className="font-semibold text-gray-900">{saleData.referenceNumber || '-'}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Travel Date</p><p className="font-semibold text-gray-900">{saleData.travelDate || '-'}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Service Name</p><p className="font-semibold text-gray-900">{saleData.serviceName || '-'}</p></div>
                </div>
                <div className="mt-2"><p className="text-[10px] uppercase text-gray-500">Remarks</p><p className="font-semibold text-gray-900">{saleData.remarks || '-'}</p></div>
              </div>
              
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Financials</h3>
                  <Badge status={saleData.bookingStatus} />
                </div>
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                   <div className="text-center"><p className="text-[10px] uppercase text-gray-500">Base</p><p className="font-bold">Rs. {saleData.baseAmount}</p></div>
                   <div className="text-center"><p className="text-[10px] uppercase text-gray-500">+ Charges</p><p className="font-bold">Rs. {saleData.serviceCharges}</p></div>
                   <div className="text-center"><p className="text-[10px] uppercase text-gray-500">- Discount</p><p className="font-bold">Rs. {saleData.discount}</p></div>
                   <div className="text-center"><p className="text-[10px] uppercase text-gray-500">+ Tax</p><p className="font-bold">Rs. {saleData.tax}</p></div>
                   <div className="text-center bg-gray-900 text-white px-4 py-2 rounded-lg"><p className="text-[10px] uppercase text-gray-400">Total</p><p className="font-bold">Rs. {calculatedTotal}</p></div>
                </div>
                <div className="flex justify-between items-center">
                   <div>
                     <p className="text-xs text-gray-500 mb-1">Payment Method: <span className="font-bold text-gray-900">{saleData.paymentMethod}</span></p>
                     <p className="text-xs text-gray-500">Status: <span className="font-bold text-gray-900">{saleData.paymentStatus}</span></p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-green-600 mb-1">Paid: Rs. {saleData.paidAmount}</p>
                     <p className="text-sm font-bold text-red-600">Pending: Rs. {calculatedOutstanding}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-8">
              <Button variant="secondary" onClick={() => setStep(4)}>Edit Payment</Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting} className="px-10">Confirm & Save Sale</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
