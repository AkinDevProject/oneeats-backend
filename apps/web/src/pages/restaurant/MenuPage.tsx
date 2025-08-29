import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, ChefHat, Tag, DollarSign, Package, Filter, Search, ImageIcon,
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity, Users, ShoppingCart, Star, Target, Zap,
  Calendar, Download, RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MenuItemOptionsForm } from '../../components/forms/MenuItemOptionsForm';
import { mockMenuItems } from '../../data/mockData';
import { MenuItem, MenuItemOption } from '../../types';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

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

  // Analytics Data
  const analytics = {
    popularItems: [
      { name: 'Pizza Margherita', orders: 142, revenue: 1420 },
      { name: 'Burger Classic', orders: 98, revenue: 1470 },
      { name: 'Salade César', orders: 87, revenue: 1044 },
      { name: 'Pâtes Carbonara', orders: 76, revenue: 912 }
    ],
    categoryDistribution: categories.slice(1).map(category => ({
      category,
      count: menuItems.filter(item => item.category === category).length,
      color: category === 'Entrées' ? '#3b82f6' :
             category === 'Plats' ? '#10b981' :
             category === 'Desserts' ? '#f59e0b' : '#8b5cf6'
    })),
    performanceMetrics: {
      avgRating: 4.3,
      totalOrders: 403,
      revenue: 5846,
      topCategory: categories.slice(1)[0] || 'Plats'
    }
  };

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
      // Update existing item
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
      // Add new item
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
    <div className="min-h-screen bg-gray-100">
      {/* Header with Responsive Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Mobile Header */}
          <div className="flex flex-col space-y-4 lg:hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion du Menu</h1>
              <p className="text-sm text-gray-600 mt-1">Analytics • Temps réel</p>
            </div>
            
            {/* Mobile Actions Row */}
            <div className="flex items-center justify-between space-x-2">
              <Button
                onClick={() => handleOpenModal()}
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                className="flex-1"
              >
                <span className="sm:hidden">Ajouter</span>
                <span className="hidden sm:inline">Ajouter un plat</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={showAnalytics ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="px-2 py-2"
                >
                  {showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Gestion du Menu</h1>
              <p className="text-gray-600 mt-1">Données en temps réel et analyses de performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleOpenModal()}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Ajouter un plat
              </Button>
              <Button
                variant={showAnalytics ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                icon={showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              >
                {showAnalytics ? 'Masquer Analytics' : 'Afficher Analytics'}
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
                Actualiser
              </Button>
              <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Responsive Padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">

        {/* Key Metrics Row - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-2xl sm:text-3xl font-bold">{analytics.performanceMetrics.totalOrders}</div>
                <div className="text-blue-100 font-medium text-xs sm:text-sm">Commandes totales</div>
              </div>
            </div>
            <div className="flex items-center text-blue-100 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">+12.5% vs semaine dernière</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">€{analytics.performanceMetrics.revenue}</div>
                <div className="text-green-100 font-medium">Chiffre d'affaires</div>
              </div>
            </div>
            <div className="flex items-center text-green-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+18.2% vs semaine dernière</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <ChefHat className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-purple-100 font-medium">Plats au menu</div>
              </div>
            </div>
            <div className="flex items-center text-purple-100 text-sm">
              <div className="w-4 h-4 mr-1 rounded bg-green-400 opacity-75" />
              <span>{stats.available} disponibles</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{analytics.performanceMetrics.avgRating}</div>
                <div className="text-orange-100 font-medium">Note moyenne</div>
              </div>
            </div>
            <div className="flex items-center text-orange-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+0.2 vs semaine dernière</span>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Popular Items */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Articles les plus populaires</h3>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Cette semaine</span>
                </div>
              </div>

              <div className="space-y-4">
                {analytics.popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.orders} commandes</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(item.orders / Math.max(...analytics.popularItems.map(i => i.orders))) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€{item.revenue}</div>
                      <div className="text-sm text-gray-600">CA</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Répartition par catégorie</h3>
                <PieChart className="h-5 w-5 text-green-500" />
              </div>

              <div className="space-y-4">
                {analytics.categoryDistribution.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium text-gray-900">{stats.total} plats</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Menu Management */}
        <Card className="bg-white mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Gestion du Menu</h3>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  {categories.map((category) => {
                    const count = category === 'all' ? stats.total : menuItems.filter(item => item.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCategory === category
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {category === 'all' ? 'Toutes' : category} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun plat trouvé' : 'Aucun plat dans cette catégorie'}
              </h4>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Essayez de modifier votre recherche'
                  : 'Commencez par ajouter vos premiers plats'
                }
              </p>
            </div>
          ) : selectedCategory === 'all' ? (
            // Show grouped by category
            Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="bg-white">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              </Card>
            ))
          ) : (
            // Show filtered items
            <Card className="bg-white">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Résultats de recherche</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              </div>
            </Card>
          )}
        </div>
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
        {/* Image placeholder */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant={item.available ? 'success' : 'danger'}
              size="sm"
              className="shadow-sm"
            >
              {item.available ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 flex-1">{item.name}</h3>
            <Badge variant="secondary" size="sm" className="ml-2">
              {item.category}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-success-600" />
              <span className="text-xl font-bold text-success-600">
                {item.price.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={onEdit}
            className="flex-1"
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant={item.available ? 'warning' : 'success'}
            icon={item.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onClick={onToggleAvailability}
          >
            {item.available ? 'Masquer' : 'Afficher'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MenuPage;
