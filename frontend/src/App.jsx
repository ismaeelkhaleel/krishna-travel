import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AccessDenied } from './components/States';

import Dashboard from './pages/Dashboard';
import CustomerRegister from './pages/CustomerRegister';
import CustomerCheck from './pages/CustomerCheck';
import CustomerHistory from './pages/CustomerHistory';
import NewSale from './pages/NewSale';
import SaleDetail from './pages/SaleDetail';
import { ToastProvider } from './context/ToastContext';

// We can catch access denied errors globally, or via component state.
// We'll wrap fetchApi to trigger a global event for 403.
export const GlobalContext = React.createContext();

function App() {
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const handleAccessDenied = () => setAccessDenied(true);
    window.addEventListener('access-denied', handleAccessDenied);
    return () => window.removeEventListener('access-denied', handleAccessDenied);
  }, []);

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers/register" element={<CustomerRegister />} />
            <Route path="customers/check" element={<CustomerCheck />} />
            <Route path="customers/history" element={<CustomerHistory />} />
            <Route path="sales/new" element={<NewSale />} />
            <Route path="sales/:saleId" element={<SaleDetail />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
