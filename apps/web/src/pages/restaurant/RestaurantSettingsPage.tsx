import React, { useState } from 'react';
import { Camera, Clock, MapPin, Phone, Mail } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres du restaurant</h1>
        <p className="text-gray-600 text-sm sm:text-base">Gérez les informations de votre restaurant</p>
      </div>

      {/* Status Toggle */}
      <Card>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statut du restaurant</h3>
            <p className="text-sm text-gray-600">
              {isOpen ? 'Votre restaurant est actuellement ouvert' : 'Votre restaurant est actuellement fermé'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isOpen ? 'success' : 'danger'}>
              {isOpen ? 'Ouvert' : 'Fermé'}
            </Badge>
            <Button
              onClick={handleToggleOpen}
              variant={isOpen ? 'danger' : 'success'}
              size="sm"
            >
              {isOpen ? 'Fermer' : 'Ouvrir'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Restaurant Information */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom du restaurant"
            value={restaurant.name}
            onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
          />
          <Input
            label="Catégorie"
            value={restaurant.category}
            onChange={(e) => setRestaurant({...restaurant, category: e.target.value})}
          />
          <Input
            label="Email"
            type="email"
            value={restaurant.email}
            onChange={(e) => setRestaurant({...restaurant, email: e.target.value})}
          />
          <Input
            label="Téléphone"
            value={restaurant.phone}
            onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <textarea
            value={restaurant.address}
            onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Logo Upload */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Logo du restaurant</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <Button variant="secondary" size="sm">
              Choisir un fichier
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Format recommandé: JPG, PNG. Taille maximale: 2MB
            </p>
          </div>
        </div>
      </Card>

      {/* Opening Hours */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-24 text-sm font-medium text-gray-700">
                {dayLabels[day as keyof typeof dayLabels]}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={restaurant.schedule[day] !== null}
                  onChange={(e) => {
                    const newSchedule = { ...restaurant.schedule };
                    if (e.target.checked) {
                      newSchedule[day] = { open: '09:00', close: '18:00' };
                    } else {
                      newSchedule[day] = null;
                    }
                    setRestaurant({...restaurant, schedule: newSchedule});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 w-16">Ouvert</span>
              </div>
              {restaurant.schedule[day] && (
                <div className="flex items-center space-x-2">
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
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500">à</span>
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
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Mettre à jour
        </Button>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;