import React, { useState } from 'react';
import {
  Camera, Clock, MapPin, Phone, Mail, Settings, Save, Upload, Store, Shield, Bell, Palette,
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity, Users, ShoppingCart, Star, Target, Zap,
  Calendar, Download, RefreshCw, Eye, EyeOff, DollarSign
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { mockRestaurants } from '../../data/mockData';

const RestaurantSettingsPage: React.FC = () => {
  const [restaurant, setRestaurant] = useState(mockRestaurants[0]);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const handleSave = () => {
    // Save restaurant settings
    console.log('Saving restaurant settings:', restaurant);
  };

  // Analytics Data
  const analytics = {
    performanceMetrics: {
      totalOrders: 156,
      revenue: 3420,
      avgRating: 4.7,
      openDays: Object.values(restaurant.schedule).filter(s => s !== null).length
    },

    operationalStats: [
      { label: 'Jours d\'ouverture', value: Object.values(restaurant.schedule).filter(s => s !== null).length, total: 7, color: '#3b82f6' },
      { label: 'Informations complètes', value: 85, total: 100, color: '#10b981' },
      { label: 'Visibilité profil', value: 92, total: 100, color: '#f59e0b' }
    ],

    recentActivity: [
      { action: 'Mise à jour du menu', time: 'Il y a 2h', status: 'success' },
      { action: 'Modification horaires', time: 'Il y a 5h', status: 'info' },
      { action: 'Photo de profil changée', time: 'Il y a 1 jour', status: 'success' },
      { action: 'Information de contact mise à jour', time: 'Il y a 2 jours', status: 'info' }
    ]
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    setRestaurant(prev => ({ ...prev, isOpen: !isOpen }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Responsive Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Mobile Header */}
          <div className="flex flex-col space-y-4 lg:hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres Restaurant</h1>
              <p className="text-sm text-gray-600 mt-1">Configuration • Analytics • Profil</p>
            </div>
            
            {/* Mobile Controls Row */}
            <div className="flex items-center justify-between space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={showAnalytics ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="px-2 py-2"
                >
                  {showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="px-2 py-2">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="px-2 py-2">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Paramètres</h1>
              <p className="text-gray-600 mt-1">Configurez votre profil et suivez vos performances</p>
            </div>
            <div className="flex items-center space-x-4">
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
              <span className="truncate">+12.5% ce mois</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-2xl sm:text-3xl font-bold truncate">€{analytics.performanceMetrics.revenue}</div>
                <div className="text-green-100 font-medium text-xs sm:text-sm">Chiffre d'affaires</div>
              </div>
            </div>
            <div className="flex items-center text-green-100 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">+18.2% ce mois</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Star className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-2xl sm:text-3xl font-bold">{analytics.performanceMetrics.avgRating}</div>
                <div className="text-purple-100 font-medium text-xs sm:text-sm">Note moyenne</div>
              </div>
            </div>
            <div className="flex items-center text-purple-100 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">+0.3 ce mois</span>
            </div>
          </Card>

          <Card className={`p-4 sm:p-6 ${isOpen ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-xl sm:text-2xl font-bold truncate">{isOpen ? 'OUVERT' : 'FERMÉ'}</div>
                <div className={`${isOpen ? 'text-green-100' : 'text-red-100'} font-medium text-xs sm:text-sm`}>Statut du restaurant</div>
              </div>
            </div>
            <Button
              onClick={handleToggleOpen}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm"
            >
              {isOpen ? 'Fermer' : 'Ouvrir'}
            </Button>
          </Card>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-8">
            {/* Operational Stats */}
            <Card className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Statistiques opérationnelles</h3>
                <Target className="h-5 w-5 text-purple-500" />
              </div>

              <div className="space-y-4">
                {analytics.operationalStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                      <span className="text-sm font-bold" style={{ color: stat.color }}>
                        {stat.value}{stat.total === 100 ? '%' : `/${stat.total}`}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: stat.color,
                          width: `${(stat.value / stat.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-4 lg:p-6 md:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Activité récente</h3>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'success' ?
                        <Settings className="h-4 w-4" /> :
                        <Bell className="h-4 w-4" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Restaurant Information */}
        <Card className="bg-white mb-6 lg:mb-8">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Informations générales</h3>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Nom du restaurant"
                  value={restaurant.name}
                  onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                  className="input-field"
                />
                <Input
                  label="Catégorie"
                  value={restaurant.category}
                  onChange={(e) => setRestaurant({...restaurant, category: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                  <Input
                    label="Email"
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant({...restaurant, email: e.target.value})}
                    className="input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                  <Input
                    label="Téléphone"
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Adresse complète</span>
              </label>
              <textarea
                value={restaurant.address}
                onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                rows={3}
                className="input-field resize-none"
                placeholder="Entrez l'adresse complète de votre restaurant..."
              />
            </div>
          </div>
        </Card>

        {/* Logo Upload */}
        <Card className="bg-white mb-6 lg:mb-8">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Image de profil</h3>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-purple-200 group-hover:border-purple-300 transition-colors">
                    <Camera className="h-12 w-12 text-purple-500" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Logo de votre restaurant</h4>
                    <p className="text-sm text-gray-600">Ajoutez une image qui représente votre établissement</p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      icon={<Upload className="h-4 w-4" />}
                      className="shadow-sm"
                    >
                      Télécharger une image
                    </Button>
                    <p className="text-xs text-gray-500">
                      Formats acceptés: JPG, PNG, WebP • Taille max: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Opening Hours */}
        <Card className="bg-white mb-6 lg:mb-8">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Horaires d'ouverture</h3>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {days.map((day, index) => {
                const isOpen = restaurant.schedule[day] !== null;
                return (
                  <div key={day} className={`p-4 rounded-lg border transition-all duration-200 ${
                    isOpen ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                  <div className="flex items-center space-x-3 lg:w-48">
                    <div className={`w-3 h-3 rounded-full ${
                      isOpen ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {dayLabels[day as keyof typeof dayLabels]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => {
                          const newSchedule = { ...restaurant.schedule };
                          if (e.target.checked) {
                            newSchedule[day] = { open: '09:00', close: '18:00' };
                          } else {
                            newSchedule[day] = null;
                          }
                          setRestaurant({...restaurant, schedule: newSchedule});
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className={`text-sm font-medium ${
                        isOpen ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </label>

                    {isOpen && (
                      <div className="flex items-center space-x-3 animate-fade-in">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">De</span>
                          <input
                            type="time"
                            value={restaurant.schedule[day]?.open || '09:00'}
                            onChange={(e) => {
                              const newSchedule = { ...restaurant.schedule };
                              if (newSchedule[day]) {
                                newSchedule[day] = { ...newSchedule[day], open: e.target.value };
                              }
                              setRestaurant({...restaurant, schedule: newSchedule});
                            }}
                            className="input-field px-2 py-1 text-sm w-20"
                          />
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">à</span>
                          <input
                            type="time"
                            value={restaurant.schedule[day]?.close || '18:00'}
                            onChange={(e) => {
                              const newSchedule = { ...restaurant.schedule };
                              if (newSchedule[day]) {
                                newSchedule[day] = { ...newSchedule[day], close: e.target.value };
                              }
                              setRestaurant({...restaurant, schedule: newSchedule});
                            }}
                            className="input-field px-2 py-1 text-sm w-20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Les clients verront vos horaires d'ouverture sur votre profil</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            size="lg"
          >
            Annuler les modifications
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="lg"
            icon={<Save className="h-5 w-5" />}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;

