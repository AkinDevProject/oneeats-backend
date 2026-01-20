import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Settings,
  LogOut,
  ChefHat,
  Menu as HamburgerMenu,
  X,
  Bell,
  Zap,
  User,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
}

const RestaurantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isSettingsPage = location.pathname.includes('/settings');

  const navigation: NavigationItem[] = [
    {
      name: 'Commandes',
      href: '/restaurant/orders',
      icon: ShoppingCart,
      badge: 3,
      description: 'Gestion des commandes'
    },
    {
      name: 'Menu',
      href: '/restaurant/menu',
      icon: MenuIcon,
      description: 'Gestion du menu'
    },
    {
      name: 'Paramètres',
      href: '/restaurant/settings',
      icon: Settings,
      description: 'Configuration'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/restaurant/orders') {
      return location.pathname === '/restaurant' || location.pathname.startsWith('/restaurant/orders');
    }
    return location.pathname.startsWith(path);
  };

  const getActivePageTitle = () => {
    const activePage = navigation.find(item => isActive(item.href));
    return activePage?.name || 'Commandes';
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
        <div className={cn(
          'fixed top-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200',
          'transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
          isSettingsPage ? 'bottom-32' : 'bottom-0',
          'lg:bottom-auto lg:inset-y-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {/* Sidebar Header - OneEats Branding */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 border-b border-primary-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OneEats</h1>
                  <p className="text-primary-100 text-sm">Restaurant Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-primary-100 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            'flex-1 p-6 overflow-y-auto',
            isSettingsPage ? 'pb-12' : 'pb-6',
            'lg:pb-6'
          )}>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center justify-between p-3 rounded-lg transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-md transition-colors',
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        'font-medium text-sm',
                        isActive(item.href) ? 'text-primary-700' : 'text-gray-900'
                      )}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div className={cn(
                          'text-xs mt-0.5',
                          isActive(item.href) ? 'text-primary-500' : 'text-gray-500'
                        )}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <div className="w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {item.badge}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Restaurant Controls Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Contrôles</span>
              </div>

              {/* Sound Control */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    soundEnabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                  )}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sons</div>
                    <div className="text-xs text-gray-500">Notifications</div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    soundEnabled ? 'bg-primary-500' : 'bg-gray-200'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>

              {/* Auto Refresh Control */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    autoRefresh ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-500'
                  )}>
                    <RefreshCw className={cn('h-4 w-4', autoRefresh && 'animate-spin')} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Auto-refresh</div>
                    <div className="text-xs text-gray-500">Temps réel</div>
                  </div>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    autoRefresh ? 'bg-success-500' : 'bg-gray-200'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>

              {/* Live Status */}
              <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-4 border border-success-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-success-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Temps réel</div>
                    <div className="text-xs text-gray-600">Données synchronisées</div>
                  </div>
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Profile & Logout Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              {/* Profile Section */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-primary-600 font-medium">Restaurateur</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-danger-50 hover:bg-danger-100 border border-danger-200 transition-all group"
              >
                <div className="p-2 rounded-lg bg-danger-100 text-danger-600 group-hover:bg-danger-200">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-danger-700">Déconnexion</div>
                  <div className="text-xs text-danger-500">Fermer la session</div>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm lg:block hidden">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getActivePageTitle()}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    OneEats Restaurant Dashboard
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm lg:hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <HamburgerMenu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary-500" />
                  <span className="font-bold text-gray-900">OneEats</span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto" key={location.pathname}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLayout;
