import React, { useState } from 'react';
import {
  Camera, Clock, MapPin, Phone, Mail, Settings, Save, Upload, Store, Palette, Bell
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { mockRestaurants } from '../../data/mockData';

const RestaurantSettingsPage: React.FC = () => {
  const [restaurant, setRestaurant] = useState(mockRestaurants[0]);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);

  const handleSave = () => {
    // Save restaurant settings
    console.log('Saving restaurant settings:', restaurant);
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
    <div className="bg-gray-50">
      {/* Mobile & Tablet Optimized Header - Identical to Orders/Menu Page */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        {/* Mobile Header */}
        <div className="px-4 py-3 sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-700">PARAMÈTRES</span>
              <span className="text-xs text-gray-500">Configuration</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOpen ? 'Ouvert' : 'Fermé'}
              </div>
            </div>
          </div>
          
          {/* Mobile Settings Tabs */}
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">Configuration Restaurant</div>
                  <div className="text-xs text-purple-100">Gérez vos paramètres</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tablet Header */}
        <div className="hidden sm:block lg:hidden px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700">PARAMÈTRES RESTAURANT</span>
              <span className="text-sm text-gray-500">• Configuration complète</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOpen ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                Restaurant {isOpen ? 'Ouvert' : 'Fermé'}
              </div>
            </div>
          </div>
          
          {/* Tablet Settings Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">Configuration</div>
                  <div className="text-xs text-purple-100">Paramètres généraux</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">Sécurisé</div>
                  <div className="text-xs text-orange-100">Données protégées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700">PARAMÈTRES RESTAURANT</span>
              <span className="text-sm text-gray-500">• Configuration complète • Gestion du profil</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                Restaurant {isOpen ? 'Ouvert' : 'Fermé'}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Content - Responsive Optimized */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">

        {/* Restaurant Status - Enhanced Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Card className={`p-3 sm:p-4 lg:p-6 max-w-full sm:max-w-md ${isOpen ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{isOpen ? 'OUVERT' : 'FERMÉ'}</div>
                <div className={`${isOpen ? 'text-green-100' : 'text-red-100'} font-medium text-xs sm:text-sm`}>Statut du restaurant</div>
              </div>
            </div>
            <Button
              onClick={handleToggleOpen}
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm transition-all duration-200"
            >
              {isOpen ? 'Fermer le restaurant' : 'Ouvrir le restaurant'}
            </Button>
          </Card>
        </div>


        {/* Restaurant Information - Enhanced Responsive */}
        <Card className="bg-white mb-4 sm:mb-6 lg:mb-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="px-3 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-blue-800">Informations générales</h3>
            </div>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <Input
                  label="Nom du restaurant"
                  value={restaurant.name}
                  onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                  className="text-sm sm:text-base"
                />
                <Input
                  label="Catégorie"
                  value={restaurant.category}
                  onChange={(e) => setRestaurant({...restaurant, category: e.target.value})}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-7 sm:top-8 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    label="Email"
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant({...restaurant, email: e.target.value})}
                    className="pl-8 sm:pl-10 text-sm sm:text-base"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-7 sm:top-8 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    label="Téléphone"
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
                    className="pl-8 sm:pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-xs sm:text-sm">Adresse complète</span>
              </label>
              <textarea
                value={restaurant.address}
                onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                placeholder="Entrez l'adresse complète de votre restaurant..."
              />
            </div>
          </div>
        </Card>

        {/* Logo Upload - Enhanced Responsive */}
        <Card className="bg-white mb-4 sm:mb-6 lg:mb-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="px-3 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-purple-800">Image de profil</h3>
            </div>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-purple-200 group-hover:border-purple-300 transition-all duration-200">
                    <Camera className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-500" />
                  </div>
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h4 className="font-medium text-sm sm:text-base text-gray-900">Logo de votre restaurant</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Ajoutez une image qui représente votre établissement</p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      icon={<Upload className="h-3 w-3 sm:h-4 sm:w-4" />}
                      size="sm"
                      className="shadow-sm text-xs sm:text-sm w-full sm:w-auto"
                    >
                      Télécharger une image
                    </Button>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WebP • Max: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Opening Hours - Enhanced Responsive */}
        <Card className="bg-white mb-4 sm:mb-6 lg:mb-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="px-3 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-orange-800">Horaires d'ouverture</h3>
            </div>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Enhanced Responsive Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {days.map((day, index) => {
                const isOpen = restaurant.schedule[day] !== null;
                return (
                  <div key={day} className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isOpen 
                      ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' 
                      : 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100'
                  }`}>
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm sm:text-base font-bold text-gray-800 capitalize">
                          {dayLabels[day as keyof typeof dayLabels]}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isOpen ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isOpen ? 'OUVERT' : 'FERMÉ'}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="mb-4">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
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
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            isOpen ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                              isOpen ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${
                          isOpen ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {isOpen ? 'Restaurant ouvert' : 'Restaurant fermé'}
                        </span>
                      </label>
                    </div>

                    {/* Time Inputs */}
                    {isOpen && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Ouverture</label>
                              <div className="relative">
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
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Fermeture</label>
                              <div className="relative">
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
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="text-xs text-green-600 font-medium">
                              {restaurant.schedule[day]?.open} - {restaurant.schedule[day]?.close}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 flex items-start sm:items-center space-x-2">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 sm:mt-0 flex-shrink-0" />
                <span>Les clients verront vos horaires d'ouverture sur votre profil</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Fixed Action Bar - Always Accessible */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:relative lg:shadow-none lg:border-t-0 lg:bg-transparent lg:pt-6">
          <div className="px-4 py-3 lg:px-0 lg:py-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                {/* Mobile: Full width buttons */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full lg:w-auto order-2 sm:order-1"
                >
                  <span className="sm:hidden">Annuler</span>
                  <span className="hidden sm:inline">Annuler les modifications</span>
                </Button>
                
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="lg"
                  icon={<Save className="h-5 w-5" />}
                  className="w-full lg:w-auto order-1 sm:order-2 shadow-lg lg:shadow-none"
                >
                  <span className="sm:hidden">Enregistrer</span>
                  <span className="hidden sm:inline">Enregistrer les modifications</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bottom safe area for mobile */}
          <div className="h-safe-area-inset-bottom lg:hidden"></div>
        </div>
        
        {/* Spacer to prevent content from being hidden behind fixed buttons */}
        <div className="h-20 lg:hidden"></div>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;

