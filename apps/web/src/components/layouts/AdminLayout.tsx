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
  X,
  Bell,
  Zap,
  TrendingUp,
  Activity,
  User,
  Shield,
  Database,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const navigation: NavigationItem[] = [
    { 
      name: 'Analytics Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble système'
    },
    { 
      name: 'Gestion Restaurants', 
      href: '/admin/restaurants', 
      icon: Store,
      badge: 12,
      description: 'Restaurants partenaires'
    },
    { 
      name: 'Utilisateurs', 
      href: '/admin/users', 
      icon: Users,
      description: 'Gestion des comptes'
    },
    { 
      name: 'Supervision Commandes', 
      href: '/admin/orders', 
      icon: ShoppingCart,
      badge: 24,
      description: 'Monitoring global'
    },
    { 
      name: 'Analytics Système', 
      href: '/admin/stats', 
      icon: BarChart3,
      description: 'Métriques détaillées'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getActivePageTitle = () => {
    const activePage = navigation.find(item => isActive(item.href));
    return activePage?.name || 'Analytics Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 border-b border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DelishGo</h1>
                  <p className="text-purple-100 text-sm">Administration</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-purple-100 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-sm ${
                        isActive(item.href) ? 'text-purple-700' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div className={`text-xs mt-0.5 ${
                          isActive(item.href) ? 'text-purple-500' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {item.badge}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Admin Controls Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              {/* Control Section Title */}
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Contrôles Admin</span>
              </div>

              {/* System Status */}
              <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Système</div>
                    <div className="text-xs text-green-600">En ligne - Surveillance active</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Sound Control */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    soundEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Alertes sonores</div>
                    <div className="text-xs text-gray-500">Notifications système</div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Auto Refresh Control */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Actualisation auto</div>
                    <div className="text-xs text-gray-500">Données temps réel</div>
                  </div>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Export Data */}
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all group">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                  <Download className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Exporter données</div>
                  <div className="text-xs text-gray-500">Rapports globaux</div>
                </div>
              </button>
            </div>

            {/* Profile & Logout Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              {/* Profile Section */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-purple-600 font-medium">Administrateur</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-all group"
              >
                <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-red-700">Déconnexion</div>
                  <div className="text-xs text-red-500">Fermer la session</div>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{getActivePageTitle()}</h1>
                    <p className="text-gray-600 mt-1">
                      Interface de gestion administrateur
                    </p>
                  </div>
                </div>

                {/* Simplified header - minimal controls only */}
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Contrôles disponibles dans la barre latérale
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;