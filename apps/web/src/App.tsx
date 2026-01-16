import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import './styles/menu-images.css';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import AdminLayout from './components/layouts/AdminLayout';
import RestaurantLayout from './components/layouts/RestaurantLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantsManagementPage from './pages/admin/RestaurantsManagementPage';
import UsersPage from './pages/admin/UsersPage';
import OrdersSupervisionPage from './pages/admin/OrdersSupervisionPage';
import StatsPage from './pages/admin/StatsPage';
import AnalyticsSystemPage from './pages/admin/AnalyticsSystemPage';
import MenuPage from './pages/restaurant/MenuPage';
import RestaurantSettingsPage from './pages/restaurant/RestaurantSettingsPage';
import OrdersManagementPage from './pages/restaurant/OrdersManagementPage';

function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<RestaurantsManagementPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="orders" element={<OrdersSupervisionPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="analytics" element={<AnalyticsSystemPage />} />
          </Route>

          {/* Restaurant Routes */}
          <Route path="/restaurant" element={
            <ProtectedRoute requiredRole="restaurant">
              <RestaurantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OrdersManagementPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="settings" element={<RestaurantSettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;