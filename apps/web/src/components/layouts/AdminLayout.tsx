import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  ChefHat,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Restaurants', href: '/admin/restaurants', icon: Store },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Statistiques', href: '/admin/stats', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md shadow-strong border-r border-gray-200/60 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:bg-white lg:backdrop-blur-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:justify-start">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-600 animate-bounce-gentle" />
              <h1 className="text-xl font-bold text-gray-900">DelishGo</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-500 px-6 pb-4">Administration</p>
          
          <nav className="flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${
                  isActive(item.href)
                    ? 'sidebar-item-active'
                    : 'sidebar-item-inactive'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-200/60">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Administration
                </h2>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Connecté en tant que {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;