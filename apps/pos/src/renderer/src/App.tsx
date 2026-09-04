import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import CashierPage from './pages/CashierPage';
import LoginPage from './pages/LoginPage';
import ActivationPage from './pages/ActivationPage';
import KitchenPage from './pages/KitchenPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ShiftPage from './pages/ShiftPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CashierPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/shift" element={<ShiftPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
