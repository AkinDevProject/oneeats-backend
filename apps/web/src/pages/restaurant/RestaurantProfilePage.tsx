import React, { useState, useEffect } from 'react';
import {
  MapPin, Phone, Mail, Clock, Star, Edit3, Save, X,
  Camera, Upload, Eye, EyeOff, Building2, Users,
  Calendar, Award, TrendingUp, Settings, Globe, CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import apiService from '../../services/api';

const RestaurantProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ID du restaurant Pizza Palace (le premier de la DB)
  const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

  const [profileData, setProfileData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    imageUrl: '/placeholder-restaurant.jpg',
    coverImage: '/placeholder-cover.jpg',
    category: '',
    priceRange: '€€',
    rating: 0,
    reviewsCount: 0,
    isOpen: true,
    openingSince: '2020',
    specialties: [],
    schedule: {
      monday: { open: '11:00', close: '23:00', closed: false },
      tuesday: { open: '11:00', close: '23:00', closed: false },
      wednesday: { open: '11:00', close: '23:00', closed: false },
      thursday: { open: '11:00', close: '23:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    features: ['Wifi gratuit', 'Accessible PMR']
  });

  const [tempData, setTempData] = useState({ ...profileData });

  // Fonction pour charger les données du restaurant depuis l'API
  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const restaurant = await apiService.restaurants.getById(RESTAURANT_ID);
      
      const mappedData = {
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
        reviewsCount: 127, // Mock data - sera ajouté à l'API plus tard
        isOpen: restaurant.isOpen,
        openingSince: '2020',
        specialties: restaurant.cuisineType === 'PIZZA' ? ['Pizza', 'Pâtes', 'Desserts italiens'] : 
                     restaurant.cuisineType === 'AMERICAIN' ? ['Burgers', 'Frites', 'Milkshakes'] :
                     restaurant.cuisineType === 'JAPONAIS' ? ['Sushis', 'Sashimis', 'Makis'] : [],
        schedule: {
          monday: { open: '11:00', close: '23:00', closed: false },
          tuesday: { open: '11:00', close: '23:00', closed: false },
          wednesday: { open: '11:00', close: '23:00', closed: false },
          thursday: { open: '11:00', close: '23:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '11:00', close: '23:00', closed: false },
          sunday: { open: '', close: '', closed: true }
        },
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        },
        features: ['Wifi gratuit', 'Accessible PMR']
      };
      
      setProfileData(mappedData);
      setTempData(mappedData);
      
    } catch (err) {
      console.error('Error loading restaurant data:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadRestaurantData();
  }, []);

  const days = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setProfileData({ ...tempData });
      setIsEditing(false);
      setIsSaving(false);
      setSavedMessage('✅ Profil mis à jour avec succès !');
      setTimeout(() => setSavedMessage(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
    setTempData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const toggleRestaurantStatus = () => {
    setTempData(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données du restaurant...</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si nécessaire
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadRestaurantData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header avec actions */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏪 Profil du Restaurant
          </h1>
          <p className="text-gray-600 mt-1">Gérez les informations de votre établissement</p>
        </div>

        <div className="flex items-center space-x-3">
          {savedMessage && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl animate-fade-in">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{savedMessage}</span>
            </div>
          )}

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCancel}
                className="bg-white text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Statut du restaurant */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${tempData.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Status: {tempData.isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
              </h3>
              <p className="text-sm text-gray-600">
                {tempData.isOpen ? 'Vos clients peuvent passer commande' : 'Vos clients ne peuvent pas commander'}
              </p>
            </div>
          </div>
          {isEditing && (
            <Button
              onClick={toggleRestaurantStatus}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                tempData.isOpen
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {tempData.isOpen ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Fermer temporairement
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Ouvrir le restaurant
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Section principale avec image de couverture */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <ImageWithFallback
            src={tempData.coverImage}
            alt="Couverture"
            className="w-full h-full object-cover opacity-80"
            fallbackSrc="/placeholder-cover.jpg"
          />
          {isEditing && (
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all duration-300"
            >
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="relative px-6 pb-6">
          {/* Logo et infos principales */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden">
                <ImageWithFallback
                  src={tempData.imageUrl}
                  alt={tempData.name}
                  className="w-full h-full object-cover"
                  fallbackText="Logo restaurant"
                />
              </div>
              {isEditing && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-300"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                      className="text-2xl font-bold text-white bg-transparent border-b-2 border-white border-opacity-50 focus:border-opacity-100 focus:outline-none mb-2"
                      placeholder="Nom du restaurant"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-white mb-2">{profileData.name}</h1>
                  )}
                  <div className="flex items-center space-x-4 text-white text-opacity-90">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{profileData.rating}</span>
                      <span className="text-sm">({profileData.reviewsCount} avis)</span>
                    </div>
                    <Badge className="bg-white bg-opacity-20 text-white">
                      {profileData.category}
                    </Badge>
                    <Badge className="bg-white bg-opacity-20 text-white">
                      {profileData.priceRange}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Informations générales
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea
                  value={tempData.description}
                  onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez votre restaurant..."
                />
              ) : (
                <p className="text-gray-600">{profileData.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                {isEditing ? (
                  <select
                    value={tempData.category}
                    onChange={(e) => setTempData({ ...tempData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Italien">Italien</option>
                    <option value="Français">Français</option>
                    <option value="Japonais">Japonais</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Mexicain">Mexicain</option>
                    <option value="Indien">Indien</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{profileData.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gamme de prix</label>
                {isEditing ? (
                  <select
                    value={tempData.priceRange}
                    onChange={(e) => setTempData({ ...tempData, priceRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="€">€ (Économique)</option>
                    <option value="€€">€€ (Modéré)</option>
                    <option value="€€€">€€€ (Élevé)</option>
                    <option value="€€€€">€€€€ (Très élevé)</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{profileData.priceRange}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialités</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {tempData.specialties.map((specialty, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                      {specialty}
                      <button
                        onClick={() => {
                          const newSpecialties = tempData.specialties.filter((_, i) => i !== index);
                          setTempData({ ...tempData, specialties: newSpecialties });
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Ajouter une spécialité"
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setTempData({
                          ...tempData,
                          specialties: [...tempData.specialties, e.currentTarget.value.trim()]
                        });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.specialties.map((specialty, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Coordonnées */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Coordonnées
          </h3>

          <div className="space-y-4">
            {[
              { key: 'address', label: 'Adresse', icon: MapPin, type: 'text' },
              { key: 'phone', label: 'Téléphone', icon: Phone, type: 'tel' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email' },
              { key: 'website', label: 'Site web', icon: Globe, type: 'url' }
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {isEditing ? (
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={type}
                      value={tempData[key as keyof typeof tempData] as string}
                      onChange={(e) => setTempData({ ...tempData, [key]: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`${label}...`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span>{profileData[key as keyof typeof profileData] as string}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Horaires d'ouverture */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-purple-600" />
          Horaires d'ouverture
        </h3>

        <div className="space-y-3">
          {days.map(({ key, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
              <div className="w-24 font-medium text-gray-700">{label}</div>

              {isEditing ? (
                <div className="flex items-center space-x-4 flex-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!tempData.schedule[key].closed}
                      onChange={(e) => handleScheduleChange(key, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Ouvert</span>
                  </label>

                  {!tempData.schedule[key].closed && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={tempData.schedule[key].open}
                        onChange={(e) => handleScheduleChange(key, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">à</span>
                      <input
                        type="time"
                        value={tempData.schedule[key].close}
                        onChange={(e) => handleScheduleChange(key, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1">
                  {profileData.schedule[key].closed ? (
                    <span className="text-red-600 font-medium">Fermé</span>
                  ) : (
                    <span className="text-gray-600">
                      {profileData.schedule[key].open} - {profileData.schedule[key].close}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Modal pour les images */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="📸 Modifier les images"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo du restaurant</label>
            <div className="flex items-center space-x-4">
              <ImageWithFallback
                src={tempData.imageUrl}
                alt="Logo"
                className="w-16 h-16 rounded-lg object-cover border"
                fallbackSrc="/placeholder-restaurant.jpg"
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Télécharger un logo
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
            <div className="flex items-center space-x-4">
              <ImageWithFallback
                src={tempData.coverImage}
                alt="Couverture"
                className="w-24 h-16 rounded-lg object-cover border"
                fallbackSrc="/placeholder-cover.jpg"
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Télécharger une couverture
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowImageModal(false)} variant="secondary">
              Annuler
            </Button>
            <Button onClick={() => setShowImageModal(false)} className="bg-green-500 hover:bg-green-600 text-white">
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RestaurantProfilePage;

