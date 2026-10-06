import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { PageHeader, Card, Button, Badge, Skeleton } from '../components/ui';
import { FileText, ArrowLeft, Building2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SaleDetail() {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadSale = async () => {
      try {
        const res = await fetchApi(`/sales/${saleId}`);
        setSale(res.data);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        toast.error('Failed to load sale details');
      }
    };
    loadSale();
  }, [saleId, toast]);

  if (status === 'loading') return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  if (status === 'error' || !sale) return <div className="p-8 text-red-500">Failed to load sale.</div>;

  return (
    <div className="w-full pb-10">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate(-1)} className="px-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      
      <PageHeader 
        title="Sale Details" 
        subtitle={`Invoice: ${sale.invoiceId}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-600" />
                Booking Information
              </h2>
              <Badge status={sale.bookingStatus} />
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white">
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service</p><p className="font-semibold text-gray-900">{sale.serviceType}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Type</p><p className="font-medium text-gray-900">{sale.customerType}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p><p className="font-medium text-gray-900">{new Date(sale.bookingDate).toLocaleDateString()}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Source</p><p className="font-medium text-gray-900">{sale.bookingSource}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created By</p><p className="font-medium text-gray-900">{sale.bookingCreatedBy || '-'}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Branch</p><p className="font-medium text-gray-900">{sale.branch || '-'}</p></div>
            </div>
          </Card>

          <Card className="overflow-hidden border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-3 text-indigo-600" />
                Service Details
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white">
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service Name</p><p className="font-medium text-gray-900">{sale.serviceName || '-'}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</p><p className="font-medium text-gray-900">{sale.travelDate ? new Date(sale.travelDate).toLocaleDateString() : '-'}</p></div>
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference Number</p><p className="font-medium text-gray-900">{sale.referenceNumber || '-'}</p></div>
              <div className="sm:col-span-3"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</p><p className="font-medium text-gray-900">{sale.remarks || '-'}</p></div>
            </div>
          </Card>

          <Card className="overflow-hidden border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Payment Summary</h2>
              <Badge status={sale.paymentStatus} />
            </div>
            
            <div className="p-6 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
               <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Base Amount</p><p className="font-medium text-gray-900">Rs. {sale.baseAmount}</p></div>
               <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service Charges</p><p className="font-medium text-gray-900">Rs. {sale.serviceCharges}</p></div>
               <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Discount</p><p className="font-medium text-gray-900">Rs. {sale.discount}</p></div>
               <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tax</p><p className="font-medium text-gray-900">Rs. {sale.tax}</p></div>
               <div className="col-span-2 md:col-span-4"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</p><p className="font-medium text-gray-900">{sale.paymentMethod || '-'}</p></div>
            </div>

            <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white">
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">Rs. {sale.totalSaleAmount}</p>
              </div>
              <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                <p className="text-xs font-semibold text-green-600 mb-2">Paid Amount</p>
                <p className="text-3xl font-bold text-green-700">Rs. {sale.paidAmount}</p>
              </div>
              <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                <p className="text-xs font-semibold text-red-500 mb-2">Outstanding</p>
                <p className="text-3xl font-bold text-red-600">Rs. {sale.outstandingAmount}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] bg-gradient-to-b from-blue-50/50 to-white">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-6">Customer Profile</h3>
            {sale.customer && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Customer ID</p>
                  <p className="font-bold text-gray-900">{sale.customer.customerId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-bold text-gray-900">{sale.customer.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">M: {sale.customer.mobile}</p>
                  <p className="text-sm font-medium text-gray-700">W: {sale.customer.whatsapp}</p>
                </div>
                <Button variant="secondary" className="w-full mt-2" onClick={() => navigate(`/customers/check?id=${sale.customer.customerId}`)}>
                  View Full Profile
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
