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
  Palette,
  Bell,
  Zap,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
  badge?: string | number;
  description?: string;
}

const RestaurantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { 
      name: 'Gestion des commandes', 
      href: '/restaurant/orders', 
      icon: ShoppingCart,
      badge: 3,
      description: 'Traitement des commandes'
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
    return activePage?.name || 'Gestion des commandes';
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

        {/* Sidebar - Style Data-Driven */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header - Style Data-Driven */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DelishGo</h1>
                  <p className="text-blue-100 text-sm">Gestion Restaurant</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

          </div>
          
          {/* Navigation - Style Data-Driven */}
          <nav className="flex-1 p-6">
            <div className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive(item.href) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isActive(item.href) ? 'text-blue-700' : 'text-gray-900'
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
                    <div className="w-2 h-8 bg-blue-500 rounded-l-full absolute right-0"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Temps réel</div>
                    <div className="text-xs text-gray-600">Données synchronisées</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Style Data-Driven */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <HamburgerMenu className="h-6 w-6" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{getActivePageTitle()}</h1>
                    <p className="text-gray-600 mt-1">
                      Interface de gestion restaurant
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">

                  {/* Notifications */}
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </button>

                  {/* User menu */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-600">Restaurateur</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/restaurant/dashboard-designs"
                      className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Changer le design du dashboard"
                    >
                      <Palette className="h-4 w-4" />
                      <span>Styles</span>
                    </Link>
                    
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

export default RestaurantLayout;