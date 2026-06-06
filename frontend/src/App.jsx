import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import CreateRFQ from './pages/CreateRFQ';
import VendorPortal from './pages/VendorPortal';
import QuotationComparison from './pages/QuotationComparison';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import Users from './pages/Users';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendor-portal" element={<VendorPortal />} />
        <Route path="/rfqs" element={<RFQs />} />
        <Route path="/rfqs/create" element={<CreateRFQ />} />
        <Route path="/rfqs/:id/compare" element={<QuotationComparison />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
