import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import OAuthCallback from './pages/OAuthCallback';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import AccountsDashboard from './pages/dashboards/AccountsDashboard';
import SalesDashboard from './pages/dashboards/SalesDashboard';
import CollectionsDashboard from './pages/dashboards/CollectionsDashboard';
import ViewerDashboard from './pages/dashboards/ViewerDashboard';
import SalesmanDashboard from './pages/dashboards/SalesmanDashboard';
import WarehouseDashboard from './pages/dashboards/WarehouseDashboard';
import DeliveryDashboard from './pages/dashboards/DeliveryDashboard';
import ComplianceDashboard from './pages/dashboards/ComplianceDashboard';

import Customers from './pages/Customers';
import Ledger from './pages/Ledger';
import Statement from './pages/Statement';
import Aging from './pages/Aging';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SalesOrders from './pages/SalesOrders';
import Targets from './pages/Targets';
import Inventory from './pages/Inventory';
import Dispatch from './pages/Dispatch';
import DeliveryRoutes from './pages/DeliveryRoutes';
import ProofOfDelivery from './pages/ProofOfDelivery';
import KycVerification from './pages/KycVerification';
import RiskAlerts from './pages/RiskAlerts';

function Protected({ children }) {
  const { user } = useAuth();
  return (
    <>
      {children}
    </>
  );
}

function RoleProtectedRoute({ allowedRoles, children, ...props }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/register" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return React.cloneElement(children, props);
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/register" replace />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin-dashboard" replace />;
    case 'finance_manager': return <Navigate to="/finance-dashboard" replace />;
    case 'accounts_executive': return <Navigate to="/accounts-dashboard" replace />;
    case 'collection_officer': return <Navigate to="/collections-dashboard" replace />;
    case 'sales_executive': return <Navigate to="/sales-dashboard" replace />;
    case 'viewer': return <Navigate to="/viewer-dashboard" replace />;
    default: return <Navigate to="/register" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
      
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route index element={<RootRedirect />} />
        
        {/* Role-Specific Dashboards */}
        <Route path="/admin-dashboard" element={
          <RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>
        } />
        <Route path="/finance-dashboard" element={
          <RoleProtectedRoute allowedRoles={['finance_manager']}><AccountsDashboard /></RoleProtectedRoute>
        } />
        <Route path="/accounts-dashboard" element={
          <RoleProtectedRoute allowedRoles={['accounts_executive']}><AccountsDashboard /></RoleProtectedRoute>
        } />
        <Route path="/collections-dashboard" element={
          <RoleProtectedRoute allowedRoles={['collection_officer']}><CollectionsDashboard /></RoleProtectedRoute>
        } />
        <Route path="/sales-dashboard" element={
          <RoleProtectedRoute allowedRoles={['sales_executive']}><SalesmanDashboard /></RoleProtectedRoute>
        } />
        <Route path="/viewer-dashboard" element={
          <RoleProtectedRoute allowedRoles={['viewer']}><ViewerDashboard /></RoleProtectedRoute>
        } />

        {/* Protected Feature Routes */}
        <Route path="/customers" element={
          <RoleProtectedRoute allowedRoles={['admin', 'sales_executive', 'viewer', 'finance_manager']}><Customers /></RoleProtectedRoute>
        } />
        <Route path="/ledger" element={
          <RoleProtectedRoute allowedRoles={['admin', 'accounts_executive', 'finance_manager']}><Ledger /></RoleProtectedRoute>
        } />
        <Route path="/statement" element={
          <RoleProtectedRoute allowedRoles={['admin', 'accounts_executive', 'finance_manager', 'viewer']}><Statement /></RoleProtectedRoute>
        } />
        <Route path="/aging" element={
          <RoleProtectedRoute allowedRoles={['admin', 'finance_manager', 'collection_officer', 'viewer']}><Aging /></RoleProtectedRoute>
        } />
        
        {/* Newly Built Features */}
        <Route path="/orders" element={<RoleProtectedRoute allowedRoles={['admin', 'sales_executive', 'finance_manager']}><SalesOrders /></RoleProtectedRoute>} />
        <Route path="/targets" element={<RoleProtectedRoute allowedRoles={['admin', 'sales_executive']}><Targets /></RoleProtectedRoute>} />
        
        <Route path="/inventory" element={<RoleProtectedRoute allowedRoles={['admin', 'warehouse_staff', 'sales_executive']}><Inventory /></RoleProtectedRoute>} />
        <Route path="/dispatch" element={<RoleProtectedRoute allowedRoles={['admin', 'warehouse_staff', 'delivery_coordinator']}><Dispatch /></RoleProtectedRoute>} />
        
        <Route path="/routes" element={<RoleProtectedRoute allowedRoles={['admin', 'delivery_coordinator']}><DeliveryRoutes /></RoleProtectedRoute>} />
        <Route path="/pod" element={<RoleProtectedRoute allowedRoles={['admin', 'delivery_coordinator', 'finance_manager']}><ProofOfDelivery /></RoleProtectedRoute>} />
        
        <Route path="/kyc" element={<RoleProtectedRoute allowedRoles={['admin', 'compliance_admin']}><KycVerification /></RoleProtectedRoute>} />
        <Route path="/alerts" element={<RoleProtectedRoute allowedRoles={['admin', 'compliance_admin', 'finance_manager']}><RiskAlerts /></RoleProtectedRoute>} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all Rescue Route for White Screens */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
