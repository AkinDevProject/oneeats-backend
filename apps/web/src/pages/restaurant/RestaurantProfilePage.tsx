import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Phone, Mail, Clock, Star, Edit3, Save, X,
  Camera, Upload, Eye, EyeOff, Settings, Globe, CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { cn } from '../../lib/utils';
import apiService from '../../services/api';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

const days = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

interface ProfileData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  coverImage: string;
  category: string;
  priceRange: string;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  specialties: string[];
  schedule: Record<string, { open: string; close: string; closed: boolean }>;
}

const defaultSchedule = {
  monday: { open: '11:00', close: '23:00', closed: false },
  tuesday: { open: '11:00', close: '23:00', closed: false },
  wednesday: { open: '11:00', close: '23:00', closed: false },
  thursday: { open: '11:00', close: '23:00', closed: false },
  friday: { open: '11:00', close: '23:00', closed: false },
  saturday: { open: '11:00', close: '23:00', closed: false },
  sunday: { open: '', close: '', closed: true }
};

const RestaurantProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [tempData, setTempData] = useState<ProfileData | null>(null);

  const loadRestaurantData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurant = await apiService.restaurants.getById(RESTAURANT_ID);
      const data: ProfileData = {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website || '',
        imageUrl: restaurant.imageUrl || '/placeholder-restaurant.jpg',
        coverImage: restaurant.imageUrl || '/placeholder-cover.jpg',
        category: restaurant.cuisineType,
        priceRange: '€€',
        rating: restaurant.rating,
        reviewsCount: 127,
        isOpen: restaurant.isOpen,
        specialties: restaurant.cuisineType === 'PIZZA' ? ['Pizza', 'Pâtes', 'Desserts italiens'] :
                     restaurant.cuisineType === 'AMERICAIN' ? ['Burgers', 'Frites', 'Milkshakes'] :
                     restaurant.cuisineType === 'JAPONAIS' ? ['Sushis', 'Sashimis', 'Makis'] : [],
        schedule: defaultSchedule,
      };
      setProfileData(data);
      setTempData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRestaurantData(); }, [loadRestaurantData]);

  const handleSave = async () => {
    if (!tempData) return;
    setIsSaving(true);
    setTimeout(() => {
      setProfileData({ ...tempData });
      setIsEditing(false);
      setIsSaving(false);
      setSavedMessage('Profil mis à jour avec succès !');
      setTimeout(() => setSavedMessage(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    if (profileData) setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
    if (!tempData) return;
    setTempData({
      ...tempData,
      schedule: { ...tempData.schedule, [day]: { ...tempData.schedule[day], [field]: value } }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données du restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData || !tempData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-danger-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadRestaurantData} variant="primary">Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil du Restaurant</h1>
          <p className="text-gray-600 mt-1">Gérez les informations de votre établissement</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <div className="flex items-center gap-2 bg-success-100 text-success-700 px-4 py-2 rounded-xl animate-fade-in">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{savedMessage}</span>
            </div>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="primary">
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleCancel} variant="outline"><X className="h-4 w-4 mr-2" />Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving} variant="success">
                {isSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />Sauvegarde...</> : <><Save className="h-4 w-4 mr-2" />Sauvegarder</>}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('w-4 h-4 rounded-full', tempData.isOpen ? 'bg-success-500 animate-pulse' : 'bg-danger-500')} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Status: {tempData.isOpen ? 'Ouvert' : 'Fermé'}
              </h3>
              <p className="text-sm text-gray-600">
                {tempData.isOpen ? 'Vos clients peuvent passer commande' : 'Vos clients ne peuvent pas commander'}
              </p>
            </div>
          </div>
          {isEditing && (
            <Button
              onClick={() => setTempData({ ...tempData, isOpen: !tempData.isOpen })}
              variant={tempData.isOpen ? 'danger' : 'success'}
            >
              {tempData.isOpen ? <><EyeOff className="h-4 w-4 mr-2" />Fermer</> : <><Eye className="h-4 w-4 mr-2" />Ouvrir</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Cover + Profile */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600">
          <ImageWithFallback src={tempData.coverImage} alt="Couverture" className="w-full h-full object-cover opacity-80" fallbackSrc="/placeholder-cover.jpg" />
          {isEditing && (
            <button onClick={() => setShowImageModal(true)} className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-all">
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden">
                <ImageWithFallback src={tempData.imageUrl} alt={tempData.name} className="w-full h-full object-cover" fallbackText="Logo" />
              </div>
              {isEditing && (
                <button onClick={() => setShowImageModal(true)} className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-all">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 mt-4 sm:mt-0">
              {isEditing ? (
                <input
                  type="text"
                  value={tempData.name}
                  onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                  className="text-2xl font-bold text-white bg-transparent border-b-2 border-white/50 focus:border-white focus:outline-none mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white mb-2">{profileData.name}</h1>
              )}
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning-400 fill-current" />
                  <span className="font-medium">{profileData.rating}</span>
                  <span className="text-sm">({profileData.reviewsCount} avis)</span>
                </div>
                <Badge className="bg-white/20 text-white">{profileData.category}</Badge>
                <Badge className="bg-white/20 text-white">{profileData.priceRange}</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary-600" />
            Informations générales
          </h3>
          <div className="space-y-4">
            <FormField label="Description" isEditing={isEditing}>
              {isEditing ? (
                <textarea value={tempData.description} onChange={(e) => setTempData({ ...tempData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              ) : (
                <p className="text-gray-600">{profileData.description}</p>
              )}
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Catégorie" isEditing={isEditing}>
                {isEditing ? (
                  <select value={tempData.category} onChange={(e) => setTempData({ ...tempData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="Italien">Italien</option>
                    <option value="Français">Français</option>
                    <option value="Japonais">Japonais</option>
                    <option value="Fast Food">Fast Food</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{profileData.category}</p>
                )}
              </FormField>
              <FormField label="Gamme de prix" isEditing={isEditing}>
                {isEditing ? (
                  <select value={tempData.priceRange} onChange={(e) => setTempData({ ...tempData, priceRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="€">€</option>
                    <option value="€€">€€</option>
                    <option value="€€€">€€€</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{profileData.priceRange}</p>
                )}
              </FormField>
            </div>
            <FormField label="Spécialités" isEditing={isEditing}>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? tempData : profileData).specialties.map((s, i) => (
                  <Badge key={i} className="bg-primary-100 text-primary-700">
                    {s}
                    {isEditing && (
                      <button onClick={() => setTempData({ ...tempData, specialties: tempData.specialties.filter((_, idx) => idx !== i) })} className="ml-2 text-primary-500 hover:text-primary-700">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Ajouter..."
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setTempData({ ...tempData, specialties: [...tempData.specialties, e.currentTarget.value.trim()] });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                )}
              </div>
            </FormField>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-success-600" />
            Coordonnées
          </h3>
          <div className="space-y-4">
            {[
              { key: 'address', label: 'Adresse', icon: MapPin, type: 'text' },
              { key: 'phone', label: 'Téléphone', icon: Phone, type: 'tel' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email' },
              { key: 'website', label: 'Site web', icon: Globe, type: 'url' }
            ].map(({ key, label, icon: Icon, type }) => (
              <FormField key={key} label={label} isEditing={isEditing}>
                {isEditing ? (
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={type}
                      value={tempData[key as keyof ProfileData] as string}
                      onChange={(e) => setTempData({ ...tempData, [key]: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span>{profileData[key as keyof ProfileData] as string}</span>
                  </div>
                )}
              </FormField>
            ))}
          </div>
        </Card>
      </div>

      {/* Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-violet-600" />
          Horaires d'ouverture
        </h3>
        <div className="space-y-3">
          {days.map(({ key, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-24 font-medium text-gray-700">{label}</div>
              {isEditing ? (
                <div className="flex items-center gap-4 flex-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!tempData.schedule[key].closed}
                      onChange={(e) => handleScheduleChange(key, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">Ouvert</span>
                  </label>
                  {!tempData.schedule[key].closed && (
                    <div className="flex items-center gap-2">
                      <input type="time" value={tempData.schedule[key].open} onChange={(e) => handleScheduleChange(key, 'open', e.target.value)} className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      <span className="text-gray-500">à</span>
                      <input type="time" value={tempData.schedule[key].close} onChange={(e) => handleScheduleChange(key, 'close', e.target.value)} className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1">
                  {profileData.schedule[key].closed ? (
                    <span className="text-danger-600 font-medium">Fermé</span>
                  ) : (
                    <span className="text-gray-600">{profileData.schedule[key].open} - {profileData.schedule[key].close}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Image Modal */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title="Modifier les images">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo du restaurant</label>
            <div className="flex items-center gap-4">
              <ImageWithFallback src={tempData.imageUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border" fallbackSrc="/placeholder-restaurant.jpg" />
              <Button variant="primary"><Upload className="h-4 w-4 mr-2" />Télécharger un logo</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
            <div className="flex items-center gap-4">
              <ImageWithFallback src={tempData.coverImage} alt="Couverture" className="w-24 h-16 rounded-lg object-cover border" fallbackSrc="/placeholder-cover.jpg" />
              <Button variant="primary"><Upload className="h-4 w-4 mr-2" />Télécharger une couverture</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowImageModal(false)} variant="secondary">Annuler</Button>
            <Button onClick={() => setShowImageModal(false)} variant="success">Sauvegarder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function FormField({ label, children }: { label: string; isEditing?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default RestaurantProfilePage;
