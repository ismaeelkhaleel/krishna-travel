import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { ErrorState } from '../components/States';
import { PageHeader, Card, Input, Select, Button, Badge } from '../components/ui';
import { CheckCircle2, User, MapPin, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', whatsapp: '', email: '',
    dob: '', gender: '', address: '', pincode: '',
    gstin: '', customerSource: 'Walk-in',
  });
  
  const [status, setStatus] = useState('idle');
  const [apiData, setApiData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetchApi('/customers/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setApiData(res.data);
      setStatus('success');
    } catch (err) {
      if (err.message === 'DUPLICATE') {
        setApiData(err.data);
        setErrorMsg(err.reason || err.originalMessage);
        setStatus(Array.isArray(err.data) ? 'conflict' : 'duplicate');
        if (Array.isArray(err.data)) {
          toast.error('Mobile and WhatsApp numbers belong to different customers.');
        } else {
          toast.error(err.reason || err.originalMessage);
        }
      } else if (err.message === 'VALIDATION_ERROR') {
        setErrorMsg('Validation failed: ' + err.errors.map(e => e.message).join(', '));
        setStatus('error');
      } else {
        setErrorMsg(err.message || 'Something went wrong');
        setStatus('error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '', dob: '', gender: '',
      address: '', pincode: '', gstin: '', customerSource: 'Walk-in',
    });
    setStatus('idle');
  };

  if (status === 'conflict') {
    return (
      <div className="w-full mt-10">
        <Card className="p-10 text-center border-red-200 shadow-md shadow-red-500/5">
          <div className="text-center mb-8 pb-8 border-b border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registration Conflict</h2>
            <p className="text-red-600 mt-2 font-semibold bg-red-50 py-3 px-4 rounded-lg inline-block border border-red-100">{errorMsg}</p>
          </div>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            The mobile number provided belongs to one existing customer, and the WhatsApp number belongs to a different customer. Both customer profiles are shown below:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
            {Array.isArray(apiData) && apiData.map((cust, idx) => (
              <div key={idx} className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/60">
                   <div>
                     <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer ID</p>
                     <p className="text-lg font-bold text-blue-700">{cust.customerId}</p>
                   </div>
                </div>
                <div className="space-y-3">
                  <div><span className="block text-xs font-medium text-gray-500">Name</span> <p className="font-semibold text-gray-900">{cust.fullName}</p></div>
                  <div><span className="block text-xs font-medium text-gray-500">Mobile</span> <p className="font-semibold text-gray-900">{cust.mobile}</p></div>
                  <div><span className="block text-xs font-medium text-gray-500">WhatsApp</span> <p className="font-semibold text-gray-900">{cust.whatsapp}</p></div>
                  <div><span className="block text-xs font-medium text-gray-500">Email</span> <p className="font-semibold text-gray-900">{cust.email || '-'}</p></div>
                  <div><span className="block text-xs font-medium text-gray-500">Address</span> <p className="font-semibold text-gray-900">{cust.address || '-'} {cust.pincode ? `- ${cust.pincode}` : ''}</p></div>
                  <div><span className="block text-xs font-medium text-gray-500">Registration Date</span> <p className="font-semibold text-gray-900">{cust.registrationDate ? new Date(cust.registrationDate).toLocaleDateString() : '-'}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => setStatus('idle')}>Edit Form</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full mt-10">
        <Card className="p-10 text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Customer Registered Successfully</h2>
          <p className="text-gray-500 mb-8">The customer profile has been created.</p>
          
          <div className="bg-gray-50/80 p-8 rounded-2xl mb-8 border border-gray-100 inline-block min-w-[300px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Customer ID</p>
            <p className="text-3xl font-mono font-bold text-blue-700">{apiData?.customerId}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="secondary" onClick={resetForm}>Register Another</Button>
            <Button onClick={() => navigate(`/sales/new?id=${apiData?.customerId}`)}>Create New Sale</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div className="w-full mt-10">
        <Card className="p-8 border-amber-200 shadow-md shadow-amber-500/5">
          <div className="text-center mb-8 pb-8 border-b border-gray-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Already Registered</h2>
            <p className="text-amber-700 font-semibold mt-4 bg-amber-50 py-2 px-4 rounded-lg inline-block border border-amber-100">{errorMsg}</p>
          </div>
          
          <div className="bg-[#F8FAFC] p-6 rounded-2xl mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200/60">
               <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer ID</p>
                 <p className="text-xl font-bold text-blue-700">{apiData?.customerId}</p>
               </div>
               <Badge status={apiData?.customerStatus} />
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div><span className="block text-xs font-medium text-gray-500 mb-1">Name</span> <p className="font-semibold text-gray-900">{apiData?.fullName}</p></div>
              <div><span className="block text-xs font-medium text-gray-500 mb-1">Mobile</span> <p className="font-semibold text-gray-900">{apiData?.mobile}</p></div>
              <div><span className="block text-xs font-medium text-gray-500 mb-1">WhatsApp</span> <p className="font-semibold text-gray-900">{apiData?.whatsapp}</p></div>
              <div><span className="block text-xs font-medium text-gray-500 mb-1">Email</span> <p className="font-semibold text-gray-900">{apiData?.email || '-'}</p></div>
              <div className="col-span-2"><span className="block text-xs font-medium text-gray-500 mb-1">Address</span> <p className="font-semibold text-gray-900">{apiData?.address || '-'} {apiData?.pincode ? `- ${apiData.pincode}` : ''}</p></div>
              <div><span className="block text-xs font-medium text-gray-500 mb-1">Registration Date</span> <p className="font-semibold text-gray-900">{apiData?.registrationDate ? new Date(apiData.registrationDate).toLocaleDateString() : '-'}</p></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="ghost" onClick={() => setStatus('idle')}>Edit Form</Button>
            <Button variant="ghost" onClick={resetForm}>Start Over</Button>
            <Button variant="secondary" onClick={() => navigate(`/customers/history?id=${apiData?.customerId}`)}>View History</Button>
            <Button onClick={() => navigate(`/sales/new?id=${apiData?.customerId}`)}>Create New Sale</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <PageHeader 
        title="Customer Registration" 
        subtitle="Create a new customer profile." 
      />

      {status === 'error' && <div className="mb-8"><ErrorState message={errorMsg} onRetry={() => setStatus('idle')} /></div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1 */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name *" required name="fullName" value={formData.fullName} onChange={handleChange} />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="Mobile Number *" required name="mobile" value={formData.mobile} onChange={handleChange} />
            <Input label="WhatsApp Number *" required name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
            <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['', 'Male', 'Female', 'Other']} />
          </div>
        </Card>

        {/* Section 2 */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-gray-900">Address Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Address" name="address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
            <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
          </div>
        </Card>

        {/* Section 3 */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-gray-900">Business Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} />
            <Select label="Customer Source *" required name="customerSource" value={formData.customerSource} onChange={handleChange} options={['Walk-in', 'WhatsApp', 'Website', 'Call', 'Referral', 'Other']} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={status === 'loading'} className="min-w-[200px]">
            {status === 'loading' ? 'Saving Profile...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
