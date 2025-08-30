import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, DollarSign, Search, ImageIcon, Activity,
  Sparkles, Zap, Flame, AlertCircle, Clock, ChefHat, Coffee, Pizza, Cake
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MenuItemOptionsForm } from '../../components/forms/MenuItemOptionsForm';
import { MenuItem, MenuItemOption } from '../../types';
import { useRestaurantData } from '../../hooks/useRestaurantData';
import apiService from '../../services/api';

const MenuPage: React.FC = () => {
  const { menuItems, loading, error, refetch } = useRestaurantData();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    options: [] as MenuItemOption[]
  });

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.available).length,
    unavailable: menuItems.filter(item => !item.available).length,
    categories: categories.length - 1
  };

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'entrées', label: 'Entrées' },
    { key: 'plats', label: 'Plats' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'boissons', label: 'Boissons' }
  ];

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        available: item.available,
        options: item.options || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true,
        options: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      setMenuItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price),
              category: formData.category,
              available: formData.available,
              options: formData.options
            }
          : item
      ));
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        restaurantId: '1',
        options: formData.options
      };
      setMenuItems(prev => [...prev, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const groupedItems = categories.slice(1).reduce((acc, category) => {
    acc[category] = menuItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="bg-gray-50">
      {/* Mobile & Tablet Optimized Header - Identical to Orders Page */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        {/* Mobile Header */}
        <div className="px-4 py-3 sm:hidden">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-700">MENU</span>
              <span className="text-xs text-gray-500">{stats.total} plats</span>
            </div>
            
            <Button
              onClick={() => handleOpenModal()}
              variant="primary"
              size="sm"
              className="px-3 py-1 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Ajouter
            </Button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="mobile-search"
              type="text"
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
          
          {/* Mobile Category Tabs - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'all', label: 'Toutes', shortLabel: 'Toutes', count: stats.total },
              { key: 'entrées', label: 'Entrées', shortLabel: 'Entrées', count: menuItems.filter(o => o.category === 'entrées').length },
              { key: 'plats', label: 'Plats', shortLabel: 'Plats', count: menuItems.filter(o => o.category === 'plats').length },
              { key: 'desserts', label: 'Desserts', shortLabel: 'Desserts', count: menuItems.filter(o => o.category === 'desserts').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'all':
                    return { 
                      icon: Sparkles, emoji: '🍽️', gradient: 'from-slate-500 to-slate-700',
                      bgGradient: 'from-slate-50 to-slate-100', textColor: 'text-slate-700',
                      activeGradient: 'bg-gradient-to-r from-slate-500 to-slate-700'
                    };
                  case 'entrées':
                    return { 
                      icon: AlertCircle, emoji: '🥗', gradient: 'from-emerald-400 to-teal-600',
                      bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-emerald-800',
                      activeGradient: 'bg-gradient-to-r from-emerald-400 to-teal-600'
                    };
                  case 'plats':
                    return { 
                      icon: ChefHat, emoji: '🍖', gradient: 'from-orange-400 to-red-500',
                      bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800',
                      activeGradient: 'bg-gradient-to-r from-orange-400 to-red-500'
                    };
                  case 'desserts':
                    return { 
                      icon: Cake, emoji: '🍰', gradient: 'from-pink-400 to-purple-600',
                      bgGradient: 'from-pink-50 to-purple-50', textColor: 'text-pink-800',
                      activeGradient: 'bg-gradient-to-r from-pink-400 to-purple-600'
                    };
                  default: return { icon: Clock, emoji: '🍽️', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = selectedCategory === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`relative p-3 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg` 
                      : `bg-gradient-to-r ${config.bgGradient} border border-gray-200 active:scale-95`
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : config.textColor}`} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-xs ${isActive ? 'text-white' : config.textColor}`}>
                        {tab.shortLabel}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-white ' + config.textColor
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tablet Header */}
        <div className="hidden sm:block lg:hidden px-5 py-4">
          {/* Tablet Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700">GESTION MENU</span>
              <span className="text-sm text-gray-500">• {stats.total} plats • {stats.available} disponibles</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={() => handleOpenModal()}
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
              >
                Ajouter
              </Button>
            </div>
          </div>
          
          {/* Tablet Category Tabs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'all', label: 'Toutes', count: stats.total },
              { key: 'entrées', label: 'Entrées', count: menuItems.filter(o => o.category === 'entrées').length },
              { key: 'plats', label: 'Plats', count: menuItems.filter(o => o.category === 'plats').length },
              { key: 'desserts', label: 'Desserts', count: menuItems.filter(o => o.category === 'desserts').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'all': return { icon: Sparkles, emoji: '🍽️', gradient: 'from-slate-500 to-slate-700', bgGradient: 'from-slate-50 to-slate-100', textColor: 'text-slate-700', activeGradient: 'bg-gradient-to-r from-slate-500 to-slate-700' };
                  case 'entrées': return { icon: AlertCircle, emoji: '🥗', gradient: 'from-emerald-400 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-emerald-800', activeGradient: 'bg-gradient-to-r from-emerald-400 to-teal-600' };
                  case 'plats': return { icon: ChefHat, emoji: '🍖', gradient: 'from-orange-400 to-red-500', bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800', activeGradient: 'bg-gradient-to-r from-orange-400 to-red-500' };
                  case 'desserts': return { icon: Cake, emoji: '🍰', gradient: 'from-pink-400 to-purple-600', bgGradient: 'from-pink-50 to-purple-50', textColor: 'text-pink-800', activeGradient: 'bg-gradient-to-r from-pink-400 to-purple-600' };
                  default: return { icon: Clock, emoji: '🍽️', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = selectedCategory === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`relative p-4 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg` 
                      : `bg-gradient-to-r ${config.bgGradient} border border-gray-200 hover:shadow-md active:scale-95`
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : config.textColor}`} />
                    </div>
                    <div className={`font-medium text-sm ${isActive ? 'text-white' : config.textColor}`}>
                      {tab.label}
                    </div>
                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-white shadow-sm ' + config.textColor
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700">GESTION MENU</span>
              <span className="text-sm text-gray-500">• {stats.total} plats • {stats.available} disponibles • {stats.categories} catégories</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={() => handleOpenModal()}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Ajouter un plat
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { key: 'all', label: 'Toutes', count: stats.total },
              { key: 'entrées', label: 'Entrées', count: menuItems.filter(o => o.category === 'entrées').length },
              { key: 'plats', label: 'Plats', count: menuItems.filter(o => o.category === 'plats').length },
              { key: 'desserts', label: 'Desserts', count: menuItems.filter(o => o.category === 'desserts').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'all': return { icon: Sparkles, emoji: '🍽️', gradient: 'from-slate-500 to-slate-700', bgGradient: 'from-slate-50 to-slate-100', textColor: 'text-slate-700', activeGradient: 'bg-gradient-to-br from-slate-500 to-slate-700', shadowColor: 'shadow-slate-300', glowColor: 'shadow-slate-500/50' };
                  case 'entrées': return { icon: AlertCircle, emoji: '🥗', gradient: 'from-emerald-400 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-emerald-800', activeGradient: 'bg-gradient-to-br from-emerald-400 to-teal-600', shadowColor: 'shadow-emerald-200', glowColor: 'shadow-emerald-500/50' };
                  case 'plats': return { icon: ChefHat, emoji: '🍖', gradient: 'from-orange-400 to-red-500', bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800', activeGradient: 'bg-gradient-to-br from-orange-400 to-red-500', shadowColor: 'shadow-orange-200', glowColor: 'shadow-orange-500/50' };
                  case 'desserts': return { icon: Cake, emoji: '🍰', gradient: 'from-pink-400 to-purple-600', bgGradient: 'from-pink-50 to-purple-50', textColor: 'text-pink-800', activeGradient: 'bg-gradient-to-br from-pink-400 to-purple-600', shadowColor: 'shadow-pink-200', glowColor: 'shadow-pink-500/50' };
                  default: return { icon: Clock, emoji: '🍽️', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-br from-gray-400 to-gray-600', shadowColor: 'shadow-gray-200', glowColor: 'shadow-gray-500/50' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = selectedCategory === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg ${config.glowColor}` 
                      : `bg-gradient-to-br ${config.bgGradient} hover:shadow-md ${config.shadowColor} border border-gray-200`
                  }`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 right-2 text-4xl opacity-20">{config.emoji}</div>
                  </div>
                  
                  <div className="relative space-y-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto transition-all duration-300 ${
                      isActive ? 'bg-white bg-opacity-20' : `bg-gradient-to-br ${config.gradient}`
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className={`font-bold text-sm ${isActive ? 'text-white' : config.textColor}`}>
                      {tab.label}
                    </div>
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : `bg-white shadow-sm ${config.textColor}`
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Optimized */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        {/* Menu Items - Responsive Empty State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 sm:py-10 lg:py-12 px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-400" />
            </div>
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 px-2">
              {searchTerm ? 'Aucun plat trouvé' : `Aucun plat ${selectedCategory !== 'all' ? `(${selectedCategory})` : ''}`}
            </h4>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-2">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : selectedCategory === 'all' 
                  ? 'Commencez par ajouter vos premiers plats'
                  : `Aucun plat dans la catégorie ${selectedCategory} pour le moment`
              }
            </p>
          </div>
        ) : selectedCategory === 'all' ? (
          // Show grouped by category - Full Responsive
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => {
              const config = (() => {
                switch(category) {
                  case 'entrées': return { gradient: 'from-emerald-50 to-teal-50', textColor: 'text-emerald-800', iconGradient: 'from-emerald-400 to-teal-600', icon: AlertCircle };
                  case 'plats': return { gradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800', iconGradient: 'from-orange-400 to-red-500', icon: ChefHat };
                  case 'desserts': return { gradient: 'from-pink-50 to-purple-50', textColor: 'text-pink-800', iconGradient: 'from-pink-400 to-purple-600', icon: Cake };
                  default: return { gradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-800', iconGradient: 'from-gray-400 to-gray-600', icon: Clock };
                }
              })();
              
              return (
                <div key={category} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`px-3 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 bg-gradient-to-r ${config.gradient}`}>
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r ${config.iconGradient}`}>
                          <config.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <h2 className={`text-base sm:text-lg lg:text-xl font-bold ${config.textColor} capitalize`}>{category}</h2>
                      </div>
                      <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-white shadow-sm ${config.textColor} shrink-0`}>
                        {items.length} plat{items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleOpenModal(item)}
                          onDelete={() => handleDelete(item.id)}
                          onToggleAvailability={() => toggleAvailability(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show filtered items in responsive grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={() => handleOpenModal(item)}
                onDelete={() => handleDelete(item.id)}
                onToggleAvailability={() => toggleAvailability(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Modifier le plat' : 'Ajouter un plat'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du plat"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <Input
            label="Prix (€)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
          <Input
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Disponible
            </label>
          </div>

          {/* Options du plat */}
          <div className="border-t border-gray-200 pt-6">
            <MenuItemOptionsForm
              options={formData.options}
              onChange={(options) => setFormData({...formData, options})}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const MenuItemCard: React.FC<{
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}> = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  return (
    <Card
      hover
      className={`transition-all duration-300 ${
        !item.available
          ? 'opacity-75 border-gray-300 bg-gray-50'
          : 'border-gray-200 hover:border-primary-200'
      }`}
    >
      <div className="space-y-4">
        {/* Image placeholder - Responsive */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-md sm:rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
          </div>
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
            <Badge
              variant={item.available ? 'success' : 'danger'}
              size="sm"
              className="shadow-sm text-xs"
            >
              <span className="hidden sm:inline">{item.available ? 'Disponible' : 'Indisponible'}</span>
              <span className="sm:hidden">{item.available ? '✓' : '✗'}</span>
            </Badge>
          </div>
        </div>

        {/* Content - Responsive Typography */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 flex-1 leading-tight">{item.name}</h3>
            <Badge variant="secondary" size="sm" className="shrink-0 text-xs">
              {item.category}
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-success-600" />
              <span className="text-lg sm:text-xl font-bold text-success-600">
                {item.price.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Actions - Responsive Layout */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={onEdit}
            className="flex-1 sm:flex-initial sm:min-w-[100px]"
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant={item.available ? 'warning' : 'success'}
            icon={item.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onClick={onToggleAvailability}
            className="flex-1 sm:flex-initial sm:min-w-[100px]"
          >
            {item.available ? 'Masquer' : 'Afficher'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onDelete}
            className="flex-1 sm:flex-initial sm:min-w-[100px]"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MenuPage;