import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PermissionsProvider } from './contexts/PermissionsContext.jsx';
import { NotificationsProvider } from './contexts/NotificationsContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import TwoFA from './pages/TwoFA.jsx';
import Overview from './pages/Overview.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import UsersManagement from './pages/UsersManagement.jsx';
import TaxReturns from './pages/TaxReturns.jsx';
import DocumentView from './pages/DocumentView.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Settings from './pages/Settings.jsx';
import NotAuthorized from './pages/NotAuthorized.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionsProvider>
          <NotificationsProvider>
            <DataProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/2fa" element={<TwoFA />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/overview" replace />} />
                  <Route 
                    path="overview" 
                    element={
                      <ProtectedRoute permission="page:overview">
                        <Overview />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="customers" 
                    element={
                      <ProtectedRoute permission="page:customers">
                        <Customers />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="customers/:id" 
                    element={
                      <ProtectedRoute permission="page:customers">
                        <CustomerDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="users-management" 
                    element={
                      <ProtectedRoute permission="page:users_management">
                        <UsersManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="tax-returns" 
                    element={
                      <ProtectedRoute permission="page:tax_returns">
                        <TaxReturns />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="documents/:id" 
                    element={
                      <ProtectedRoute permission="page:customers">
                        <DocumentView />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="invoices" 
                    element={
                      <ProtectedRoute permission="page:invoices">
                        <Invoices />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="payments" 
                    element={
                      <ProtectedRoute permission="page:payments">
                        <Payments />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="settings" 
                    element={
                      <ProtectedRoute permission="page:settings">
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataProvider>
          </NotificationsProvider>
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;