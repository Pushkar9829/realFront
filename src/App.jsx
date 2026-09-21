import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlotMapPage from './pages/PlotMapPage';
import { ProjectsPage, PlotsPage, BrokersPage, CustomersPage, LeadsPage } from './pages/CrmPages';
import {
  SiteVisitsPage,
  FollowUpsPage,
  PaymentSchemesPage,
  BookingsPage,
  PaymentsPage,
  InstallmentsPage,
  CommissionsPage,
} from './pages/SalesPages';
import {
  DocumentsPage,
  UsersPage,
  DesignationsPage,
  ReportsPage,
  SettingsPage,
  NotificationsPage,
  SearchPage,
} from './pages/AdminPages';
import './theme/global.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="plots" element={<PlotsPage />} />
        <Route path="plot-map" element={<PlotMapPage />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="site-visits" element={<SiteVisitsPage />} />
        <Route path="follow-ups" element={<FollowUpsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="payment-schemes" element={<PaymentSchemesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="installments" element={<InstallmentsPage />} />
        <Route path="commissions" element={<CommissionsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="designations" element={<DesignationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a5c45',
          borderRadius: 8,
          fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
