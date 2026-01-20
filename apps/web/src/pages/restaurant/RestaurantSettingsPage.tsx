import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera, Clock, MapPin, Phone, Mail, Save, Upload, Store, Bell, Power, X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import apiService from '../../services/api';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const dayLabels: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
};

interface RestaurantSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  cuisineType?: string;
  isOpen: boolean;
  imageUrl?: string;
  schedule: Record<string, { open: string; close: string } | null>;
  [key: string]: unknown;
}

const RestaurantSettingsPage: React.FC = () => {
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [originalRestaurant, setOriginalRestaurant] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [originalIsOpen, setOriginalIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load restaurant data
  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await apiService.restaurants.getById(RESTAURANT_ID);
      const mappedData = {
        ...apiData,
        category: apiData.cuisineType,
        schedule: apiData.schedule || {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '17:00' },
          sunday: null
        }
      };
      setRestaurant(mappedData);
      setOriginalRestaurant(mappedData);
      setIsOpen(apiData.isOpen);
      setOriginalIsOpen(apiData.isOpen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, []);

  // Check for changes
  const hasChanges = useMemo(() => {
    if (!restaurant || !originalRestaurant) return false;
    if (isOpen !== originalIsOpen) return true;
    if (restaurant.name !== originalRestaurant.name ||
        restaurant.email !== originalRestaurant.email ||
        restaurant.phone !== originalRestaurant.phone ||
        restaurant.address !== originalRestaurant.address ||
        restaurant.category !== originalRestaurant.category) return true;
    return JSON.stringify(restaurant.schedule) !== JSON.stringify(originalRestaurant.schedule);
  }, [restaurant, originalRestaurant, isOpen, originalIsOpen]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancel = () => {
    if (originalRestaurant && hasChanges) {
      setRestaurant(originalRestaurant);
      setIsOpen(originalIsOpen);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;
    try {
      setSaving(true);
      const updateData = {
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        cuisineType: restaurant.category,
        isOpen,
        schedule: restaurant.schedule
      };
      const updated = await apiService.restaurants.update(RESTAURANT_ID, updateData);
      const mappedData = { ...updated, category: updated.cuisineType, schedule: updated.schedule };
      setRestaurant(mappedData);
      setOriginalRestaurant(mappedData);
      setIsOpen(updated.isOpen);
      setOriginalIsOpen(updated.isOpen);
      showNotification('success', 'Modifications enregistrées');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async () => {
    try {
      setSaving(true);
      const updated = await apiService.restaurants.toggleStatus(RESTAURANT_ID, !isOpen);
      setRestaurant({ ...updated, category: updated.cuisineType, schedule: updated.schedule || restaurant?.schedule });
      setIsOpen(updated.isOpen);
      showNotification('success', `Restaurant ${updated.isOpen ? 'ouvert' : 'fermé'}`);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showNotification('error', 'Format non supporté (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Fichier trop volumineux (max 5MB)');
      return;
    }
    try {
      setUploading(true);
      const updated = await apiService.restaurants.uploadImage(RESTAURANT_ID, file);
      setRestaurant({ ...updated, category: updated.cuisineType, schedule: updated.schedule || restaurant?.schedule });
      showNotification('success', 'Image uploadée');
    } catch {
      showNotification('error', 'Erreur upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Supprimer l\'image ?')) return;
    try {
      setUploading(true);
      const updated = await apiService.restaurants.deleteImage(RESTAURANT_ID);
      setRestaurant({ ...updated, category: updated.cuisineType, schedule: updated.schedule || restaurant?.schedule });
      showNotification('success', 'Image supprimée');
    } catch {
      showNotification('error', 'Erreur suppression');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return `http://localhost:8080/api/proxy/image?url=${encodeURIComponent(url)}`;
    return url.startsWith('/') ? `http://localhost:8080${url}` : `http://localhost:8080/${url}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-danger-600 mb-4">{error || 'Erreur'}</p>
          <Button onClick={loadRestaurantData}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={cn(
            'px-4 py-3 rounded-lg shadow-lg flex items-center gap-2',
            notification.type === 'success' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'
          )}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="hover:bg-white/20 rounded p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-secondary-700">PARAMÈTRES</span>
            </div>
            <button
              onClick={handleToggleOpen}
              disabled={saving}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2',
                isOpen
                  ? 'bg-success-500 text-white hover:bg-success-600'
                  : 'bg-danger-500 text-white hover:bg-danger-600',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Power className="h-4 w-4" />
              {isOpen ? 'OUVERT' : 'FERMÉ'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto pb-24">
        {/* General Information */}
        <Card className="mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-primary-50">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-primary-800">Informations générales</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom du restaurant"
                value={restaurant.name}
                onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
              />
              <Input
                label="Catégorie"
                value={restaurant.category}
                onChange={(e) => setRestaurant({ ...restaurant, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Email"
                  type="email"
                  value={restaurant.email}
                  onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Téléphone"
                  value={restaurant.phone}
                  onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Adresse
              </label>
              <textarea
                value={restaurant.address}
                onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Image */}
        <Card className="mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-secondary-50">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-secondary-600" />
              <h3 className="font-bold text-secondary-800">Image de profil</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                {restaurant.imageUrl ? (
                  <img
                    src={getImageUrl(restaurant.imageUrl)}
                    alt="Restaurant"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Upload className="h-4 w-4" />}
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                  >
                    {restaurant.imageUrl ? 'Changer' : 'Uploader'}
                  </Button>
                  {restaurant.imageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger-600 border-danger-300"
                      onClick={handleImageDelete}
                      disabled={uploading}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 5MB</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-warning-50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning-600" />
              <h3 className="font-bold text-warning-800">Horaires d'ouverture</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {days.map((day) => {
                const dayOpen = restaurant.schedule[day] !== null;
                return (
                  <div
                    key={day}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all',
                      dayOpen ? 'border-success-300 bg-success-50' : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{dayLabels[day]}</span>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayOpen}
                          onChange={(e) => {
                            const newSchedule = { ...restaurant.schedule };
                            newSchedule[day] = e.target.checked ? { open: '09:00', close: '18:00' } : null;
                            setRestaurant({ ...restaurant, schedule: newSchedule });
                          }}
                          className="sr-only"
                        />
                        <div className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          dayOpen ? 'bg-success-500' : 'bg-gray-300'
                        )}>
                          <div className={cn(
                            'w-4 h-4 bg-white rounded-full transform transition-transform mt-0.5',
                            dayOpen ? 'translate-x-5' : 'translate-x-0.5'
                          )} />
                        </div>
                      </label>
                    </div>
                    {dayOpen && (
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="time"
                          value={restaurant.schedule[day]?.open || '09:00'}
                          onChange={(e) => {
                            const newSchedule = { ...restaurant.schedule };
                            if (newSchedule[day]) newSchedule[day] = { ...newSchedule[day], open: e.target.value };
                            setRestaurant({ ...restaurant, schedule: newSchedule });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">à</span>
                        <input
                          type="time"
                          value={restaurant.schedule[day]?.close || '18:00'}
                          onChange={(e) => {
                            const newSchedule = { ...restaurant.schedule };
                            if (newSchedule[day]) newSchedule[day] = { ...newSchedule[day], close: e.target.value };
                            setRestaurant({ ...restaurant, schedule: newSchedule });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-600" />
              <span className="text-sm text-primary-700">Les clients verront vos horaires sur votre profil</span>
            </div>
          </div>
        </Card>
      </main>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
        <div className="max-w-4xl mx-auto flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving || !hasChanges}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            icon={saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;
