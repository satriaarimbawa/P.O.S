import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';

// Pages
import CashierPage from './pages/CashierPage';
import LoginPage from './pages/LoginPage';
import ActivationPage from './pages/ActivationPage';
import KitchenPage from './pages/KitchenPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ShiftPage from './pages/ShiftPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivationPage />} />
        
        {/* Cashier Main Terminal */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CashierPage />
            </ProtectedRoute>
          }
        />

        {/* Shift Management (Kasir & Manager) */}
        <Route
          path="/shift"
          element={
            <ProtectedRoute>
              <ShiftPage />
            </ProtectedRoute>
          }
        />

        {/* Kitchen Display System (Barista & Kitchen) */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* Laporan Owner (Manager / Admin Only) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Pengaturan Outlet (Manager / Admin Only) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

