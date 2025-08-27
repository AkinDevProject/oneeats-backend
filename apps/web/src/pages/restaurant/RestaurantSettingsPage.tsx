import React, { useState } from 'react';
import { Camera, Clock, MapPin, Phone, Mail, Settings, Save, Upload, Store, Shield, Bell, Palette } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres du restaurant</h1>
        <p className="text-gray-600 text-sm sm:text-base flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Configurez votre profil et vos préférences</span>
        </p>
      </div>

      {/* Status Toggle */}
      <Card variant="elevated" className={`border-2 ${
        isOpen ? 'border-success-200 bg-gradient-to-r from-success-50 to-success-100' : 
        'border-danger-200 bg-gradient-to-r from-danger-50 to-danger-100'
      }`}>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              isOpen ? 'bg-success-200' : 'bg-danger-200'
            }`}>
              <Store className={`h-6 w-6 ${
                isOpen ? 'text-success-700' : 'text-danger-700'
              }`} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statut du restaurant</h3>
              <p className="text-sm text-gray-600">
                {isOpen ? 'Votre restaurant accepte actuellement les commandes' : 
                'Votre restaurant n\'accepte pas les commandes pour le moment'}
              </p>
              <div className="mt-2">
                <Badge 
                  variant={isOpen ? 'success' : 'danger'} 
                  size="lg"
                  className="font-medium"
                >
                  {isOpen ? '✓ Ouvert aux commandes' : '✗ Fermé aux commandes'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleToggleOpen}
              variant={isOpen ? 'warning' : 'success'}
              size="lg"
              icon={isOpen ? <Shield className="h-5 w-5" /> : <Store className="h-5 w-5" />}
              className="shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isOpen ? 'Fermer temporairement' : 'Ouvrir maintenant'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Restaurant Information */}
      <Card variant="elevated">
        <div className="flex items-center space-x-2 mb-6">
          <Store className="h-5 w-5 text-primary-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Informations générales</h3>
        </div>
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
      </Card>

      {/* Logo Upload */}
      <Card variant="elevated">
        <div className="flex items-center space-x-2 mb-6">
          <Palette className="h-5 w-5 text-secondary-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Image de profil</h3>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-primary-200 group-hover:border-primary-300 transition-colors">
                <Camera className="h-12 w-12 text-primary-500" />
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
      </Card>

      {/* Opening Hours */}
      <Card variant="elevated">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="h-5 w-5 text-warning-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Horaires d'ouverture</h3>
        </div>
        <div className="space-y-4">
          {days.map((day, index) => {
            const isOpen = restaurant.schedule[day] !== null;
            return (
              <div key={day} className={`p-4 rounded-lg border transition-all duration-200 ${
                isOpen ? 'border-success-200 bg-success-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                  <div className="flex items-center space-x-3 lg:w-48">
                    <div className={`w-3 h-3 rounded-full ${
                      isOpen ? 'bg-success-500' : 'bg-gray-300'
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
                        isOpen ? 'text-success-700' : 'text-gray-500'
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
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700 flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Les clients verront vos horaires d'ouverture sur votre profil</span>
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Button 
          variant="outline" 
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Annuler les modifications
        </Button>
        <Button 
          onClick={handleSave}
          variant="primary"
          size="lg"
          icon={<Save className="h-5 w-5" />}
          className="flex-1 sm:flex-none shadow-lg hover:shadow-xl"
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;