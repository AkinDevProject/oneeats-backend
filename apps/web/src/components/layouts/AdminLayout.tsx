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
  Database
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

        {/* Sidebar - Style Data-Driven Admin */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header - Style Data-Driven Admin */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 border-b border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DelishGo Admin</h1>
                  <p className="text-purple-100 text-sm">Panel Administrateur</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-purple-100 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Stats in Sidebar */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-green-300" />
                  <div>
                    <div className="text-white font-bold text-lg">12</div>
                    <div className="text-purple-100 text-xs">Restaurants</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-orange-300" />
                  <div>
                    <div className="text-white font-bold text-lg">24</div>
                    <div className="text-purple-100 text-xs">Commandes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation - Style Data-Driven Admin */}
          <nav className="flex-1 p-6">
            <div className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-sm border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive(item.href) 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isActive(item.href) ? 'text-purple-700' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.badge && (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.badge}
                      </div>
                    </div>
                  )}
                  {isActive(item.href) && (
                    <div className="w-2 h-8 bg-purple-500 rounded-l-full absolute right-0"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Sidebar Footer - Admin */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Système</div>
                    <div className="text-xs text-gray-600">Surveillance active</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Style Data-Driven Admin */}
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
                      Panel administrateur • Supervision et contrôle système
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* System status indicator */}
                  <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Système OK</span>
                  </div>

                  {/* Admin notifications */}
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </button>

                  {/* Admin user menu */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-600">Administrateur</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Admin actions */}
                  <div className="flex items-center space-x-2">
                    <button className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                      <BarChart3 className="h-4 w-4" />
                      <span>Rapports</span>
                    </button>
                    
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Déconnexion</span>
                    </button>
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