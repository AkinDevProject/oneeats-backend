import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layouts/AdminLayout';
import RestaurantLayout from './components/layouts/RestaurantLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantsPage from './pages/admin/RestaurantsPage';
import UsersPage from './pages/admin/UsersPage';
import OrdersPage from './pages/admin/OrdersPage';
import StatsPage from './pages/admin/StatsPage';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import MenuPage from './pages/restaurant/MenuPage';
import RestaurantStatsPage from './pages/restaurant/RestaurantStatsPage';
import RestaurantSettingsPage from './pages/restaurant/RestaurantSettingsPage';

function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>

          {/* Restaurant Routes */}
          <Route path="/restaurant" element={
            <ProtectedRoute requiredRole="restaurant">
              <RestaurantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<RestaurantDashboard />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="stats" element={<RestaurantStatsPage />} />
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