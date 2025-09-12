import React, { useState, useEffect } from 'react';
import {
  Camera, Clock, MapPin, Phone, Mail, Settings, Save, Upload, Store, Palette, Bell,
  Power
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import apiService from '../../services/api';

const RestaurantSettingsPage: React.FC = () => {
  // ID du restaurant Pizza Palace
  const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
  
  const [restaurant, setRestaurant] = useState(null);
  const [originalRestaurant, setOriginalRestaurant] = useState(null); // Données d'origine pour annuler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [originalIsOpen, setOriginalIsOpen] = useState(false); // État d'origine pour annuler
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Fonction pour charger les données du restaurant
  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiData = await apiService.restaurants.getById(RESTAURANT_ID);
      
      // Mapper les données de l'API vers le format attendu par la page
      const mappedData = {
        ...apiData,
        category: apiData.cuisineType, // Mapping cuisineType -> category
        schedule: apiData.schedule || { // Utiliser les données de l'API, sinon valeurs par défaut
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '17:00' },
          sunday: null // Fermé le dimanche
        }
      };
      
      setRestaurant(mappedData);
      setIsOpen(apiData.isOpen);
      
    } catch (err) {
      console.error('Error loading restaurant data:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour valider l'URL d'image
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    
    try {
      // Si c'est une URL relative, c'est valide
      if (url.startsWith('/')) return true;
      
      // Si c'est une URL complète, valider
      new URL(url);
      return true;
    } catch {
      // URL invalide
      console.warn('Invalid image URL detected:', url);
      return false;
    }
  };

  // Fonction pour construire l'URL complète de l'image
  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    
    // Nettoyer l'URL des espaces
    const cleanUrl = imageUrl.trim();
    
    // Si c'est une URL externe (http/https), utiliser le proxy
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return `http://localhost:8080/api/proxy/image?url=${encodeURIComponent(cleanUrl)}`;
    }
    
    // Si c'est une URL relative, ajouter le serveur local
    if (cleanUrl.startsWith('/')) {
      return `http://localhost:8080${cleanUrl}`;
    }
    
    // Par défaut, traiter comme une URL relative
    return `http://localhost:8080/${cleanUrl}`;
  };

  // Charger les données au montage
  useEffect(() => {
    loadRestaurantData();
  }, []);

  const handleSave = async () => {
    if (!restaurant) return;

    try {
      setSaving(true);
      setError(null);
      
      // Préparer les données à envoyer (mapper les champs UI vers l'API)
      const updateData = {
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        cuisineType: restaurant.category, // Mapper category -> cuisineType
        isOpen: isOpen,
        schedule: {
          monday: restaurant.schedule.monday,
          tuesday: restaurant.schedule.tuesday,
          wednesday: restaurant.schedule.wednesday,
          thursday: restaurant.schedule.thursday,
          friday: restaurant.schedule.friday,
          saturday: restaurant.schedule.saturday,
          sunday: restaurant.schedule.sunday
        }
      };

      console.log('Saving restaurant settings:', updateData);
      
      // Envoyer les données au backend
      const updatedRestaurant = await apiService.restaurants.update(RESTAURANT_ID, updateData);
      
      console.log('Restaurant updated successfully:', updatedRestaurant);
      
      // Mettre à jour l'état local avec les données retournées du serveur
      const mappedData = {
        ...updatedRestaurant,
        category: updatedRestaurant.cuisineType,
        schedule: updatedRestaurant.schedule // Utiliser les horaires mis à jour du serveur
      };
      
      setRestaurant(mappedData);
      setIsOpen(updatedRestaurant.isOpen);
      
      // Afficher le message de succès
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error saving restaurant settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };


  const handleToggleOpen = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const newOpenStatus = !isOpen;
      console.log('Toggling restaurant status:', newOpenStatus);
      
      // Appel direct à l'API pour changer le statut
      const updatedRestaurant = await apiService.restaurants.toggleStatus(RESTAURANT_ID, newOpenStatus);
      
      console.log('Restaurant status updated:', updatedRestaurant);
      
      // Mettre à jour l'état local avec les données retournées
      const mappedData = {
        ...updatedRestaurant,
        category: updatedRestaurant.cuisineType,
        schedule: updatedRestaurant.schedule || (restaurant ? restaurant.schedule : {})
      };
      
      setRestaurant(mappedData);
      setIsOpen(updatedRestaurant.isOpen);
      
    } catch (err) {
      console.error('Error toggling restaurant status:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers JPG, PNG et WebP sont autorisés');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('La taille du fichier ne peut pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      console.log('Uploading restaurant image:', file.name);
      
      // Upload image
      const updatedRestaurant = await apiService.restaurants.uploadImage(RESTAURANT_ID, file);
      
      console.log('Image uploaded successfully:', updatedRestaurant);
      
      // Update local state
      const mappedData = {
        ...updatedRestaurant,
        category: updatedRestaurant.cuisineType,
        schedule: updatedRestaurant.schedule || (restaurant ? restaurant.schedule : {})
      };
      
      setRestaurant(mappedData);
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer l\'image de profil ?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      console.log('Deleting restaurant image');
      
      // Delete image
      const updatedRestaurant = await apiService.restaurants.deleteImage(RESTAURANT_ID);
      
      console.log('Image deleted successfully:', updatedRestaurant);
      
      // Update local state
      const mappedData = {
        ...updatedRestaurant,
        category: updatedRestaurant.cuisineType,
        schedule: updatedRestaurant.schedule || (restaurant ? restaurant.schedule : {})
      };
      
      setRestaurant(mappedData);
      
      // Show success message
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'image');
    } finally {
      setDeleting(false);
    }
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

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres du restaurant...</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si nécessaire
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadRestaurantData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Ne pas afficher la page si les données ne sont pas encore chargées
  if (!restaurant) {
    return null;
  }

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
              <button
                onClick={handleToggleOpen}
                disabled={saving}
                className={`group relative px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed ${
                  isOpen 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105' 
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isOpen ? 'bg-green-200' : 'bg-red-200'
                  }`}></div>
                  <span>{isOpen ? 'Ouvert' : 'Fermé'}</span>
                </div>
              </button>
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
              <button
                onClick={handleToggleOpen}
                disabled={saving}
                className={`group relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden border-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isOpen 
                    ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105' 
                    : 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-400 shadow-lg shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-md ${
                    isOpen ? 'bg-green-200' : 'bg-red-200'
                  }`}></div>
                  <span>Restaurant {isOpen ? 'Ouvert' : 'Fermé'}</span>
                </div>
              </button>
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
              <button
                onClick={handleToggleOpen}
                disabled={saving}
                className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden border-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isOpen 
                    ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white border-green-300 shadow-xl shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105' 
                    : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white border-red-300 shadow-xl shadow-red-500/50 hover:shadow-red-500/70 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-2">
                  <Power className={`w-5 h-5 ${
                    isOpen ? 'animate-pulse' : 'opacity-75'
                  }`} />
                  <span>{isOpen ? 'OUVERT' : 'FERMÉ'}</span>
                </div>
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Content - Responsive Optimized */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">



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
            <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div className="relative group mx-auto lg:mx-0 w-32 h-32 lg:w-40 lg:h-40">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center border-2 border-purple-200 overflow-hidden shadow-lg">
                    {restaurant?.imageUrl ? (
                      <img 
                        src={getImageUrl(restaurant.imageUrl)}
                        alt="Restaurant logo" 
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', restaurant.imageUrl);
                          // Hide fallback if visible
                          const fallbackDiv = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
                          if (fallbackDiv) {
                            fallbackDiv.style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          console.error('Failed to load image:', restaurant.imageUrl);
                          // Show fallback on error
                          e.currentTarget.style.display = 'none';
                          const fallbackDiv = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
                          if (fallbackDiv) {
                            fallbackDiv.style.display = 'flex';
                          }
                        }}
                      />
                    ) : (
                      <Camera className="h-12 w-12 lg:h-16 lg:w-16 text-purple-500" />
                    )}
                    <div className="image-fallback hidden items-center justify-center w-full h-full absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100">
                      <Camera className="h-12 w-12 lg:h-16 lg:w-16 text-purple-500" />
                    </div>
                  </div>
                  
                  {/* Loading Overlay */}
                  {(uploading || deleting) && (
                    <div className="absolute inset-0 rounded-xl bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || deleting}
                />
              </div>
              {/* Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="font-medium text-base text-gray-900 mb-1">Logo de votre restaurant</h4>
                  <p className="text-sm text-gray-600">Ajoutez une image qui représente votre établissement</p>
                </div>
                
                {/* Current Image Info */}
                {restaurant?.imageUrl && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 font-medium">Image actuelle chargée</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1 break-all">
                      {restaurant.imageUrl.length > 50 ? `${restaurant.imageUrl.substring(0, 50)}...` : restaurant.imageUrl}
                    </p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      icon={uploading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      size="sm"
                      className="flex-1 shadow-sm"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploading || deleting}
                    >
                      {uploading ? 'Upload en cours...' : (restaurant?.imageUrl ? 'Changer l\'image' : 'Télécharger une image')}
                    </Button>
                    
                    {restaurant?.imageUrl && (
                      <Button
                        variant="outline"
                        icon={deleting ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-red-500">✕</span>
                        )}
                        size="sm"
                        className="flex-1 sm:flex-none border-red-300 text-red-600 hover:bg-red-50 shadow-sm"
                        onClick={handleImageDelete}
                        disabled={uploading || deleting}
                      >
                        {deleting ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Formats acceptés : JPG, PNG, WebP • Taille max : 5MB
                  </p>
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

        {/* Success/Error Messages */}
        {(saveSuccess || uploadSuccess || deleteSuccess || error) && (
          <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
            {saveSuccess && (
              <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
                <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                <span className="font-medium">Modifications enregistrées avec succès !</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
                <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                <span className="font-medium">Image uploadée avec succès !</span>
              </div>
            )}
            {deleteSuccess && (
              <div className="bg-orange-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
                <div className="w-2 h-2 bg-orange-200 rounded-full animate-pulse"></div>
                <span className="font-medium">Image supprimée avec succès !</span>
              </div>
            )}
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-200 rounded-full"></div>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        )}

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
                  onClick={loadRestaurantData}
                  disabled={saving}
                >
                  <span className="sm:hidden">Annuler</span>
                  <span className="hidden sm:inline">Annuler les modifications</span>
                </Button>
                
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="lg"
                  icon={saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
                  className="w-full lg:w-auto order-1 sm:order-2 shadow-lg lg:shadow-none"
                  disabled={saving}
                >
                  <span className="sm:hidden">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  <span className="hidden sm:inline">{saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
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

