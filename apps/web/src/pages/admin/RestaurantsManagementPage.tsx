import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Store, Search, Filter, Eye, Edit3, Trash2, Check, X, 
  AlertCircle, ChevronDown, MapPin, Phone, Mail, Star,
  Calendar, Users, Award, TrendingUp, Clock, Settings,
  CheckCircle, XCircle, AlertTriangle, MoreVertical
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { mockRestaurants } from '../../data/mockData';
import { Restaurant } from '../../types';

const RestaurantsManagementPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'block' | 'delete' | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Restaurant['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="animate-pulse">⏳ En attente</Badge>;
      case 'approved':
        return <Badge variant="success">✅ Approuvé</Badge>;
      case 'blocked':
        return <Badge variant="danger">🚫 Bloqué</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const handleAction = (restaurant: Restaurant, action: 'approve' | 'block' | 'delete') => {
    setSelectedRestaurant(restaurant);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (!selectedRestaurant || !actionType) return;

    setRestaurants(prev => prev.map(restaurant => {
      if (restaurant.id === selectedRestaurant.id) {
        switch (actionType) {
          case 'approve':
            return { ...restaurant, status: 'approved' as const };
          case 'block':
            return { ...restaurant, status: 'blocked' as const };
          case 'delete':
            return restaurant; // Will be filtered out below
          default:
            return restaurant;
        }
      }
      return restaurant;
    }));

    if (actionType === 'delete') {
      setRestaurants(prev => prev.filter(r => r.id !== selectedRestaurant.id));
    }

    setShowActionModal(false);
    setSelectedRestaurant(null);
    setActionType(null);
  };

  const pendingCount = restaurants.filter(r => r.status === 'pending').length;
  const approvedCount = restaurants.filter(r => r.status === 'approved').length;
  const blockedCount = restaurants.filter(r => r.status === 'blocked').length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏪 Gestion des Restaurants
          </h1>
          <p className="text-gray-600 mt-1">Supervisez et validez les restaurants partenaires</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="text-3xl font-bold text-blue-600">{restaurants.length}</div>
          <div className="text-sm text-gray-600 font-medium">Total restaurants</div>
          <div className="text-xs text-blue-600 mt-1">Dans la plateforme</div>
        </Card>

        <Card className={`p-4 text-center transition-all duration-300 hover:scale-105 ${
          pendingCount > 0 
            ? 'bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 animate-pulse' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <div className={`text-3xl font-bold ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            {pendingCount}
          </div>
          <div className="text-sm text-gray-600 font-medium">En attente</div>
          {pendingCount > 0 && (
            <div className="text-xs text-orange-600 font-bold animate-pulse">Action requise!</div>
          )}
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-sm text-gray-600 font-medium">Approuvés</div>
          <div className="text-xs text-green-600 mt-1">Actifs sur la plateforme</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-pink-100 border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="text-3xl font-bold text-red-600">{blockedCount}</div>
          <div className="text-sm text-gray-600 font-medium">Bloqués</div>
          <div className="text-xs text-red-600 mt-1">Suspendus temporairement</div>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, email ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Tous', count: filteredRestaurants.length },
                { key: 'pending', label: 'En attente', count: pendingCount },
                { key: 'approved', label: 'Approuvés', count: approvedCount },
                { key: 'blocked', label: 'Bloqués', count: blockedCount }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    statusFilter === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    statusFilter === key ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des Restaurants */}
      <div className="space-y-4">
        {filteredRestaurants.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-500 text-xl font-medium">Aucun restaurant trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
          </Card>
        ) : (
          filteredRestaurants.map((restaurant) => {
            const isExpanded = expandedCard === restaurant.id;
            
            return (
              <Card 
                key={restaurant.id}
                className={`transition-all duration-500 hover:shadow-xl ${
                  restaurant.status === 'pending' 
                    ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg'
                    : restaurant.status === 'approved'
                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                    : restaurant.status === 'blocked'
                    ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {restaurant.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                            <p className="text-sm text-gray-600">{restaurant.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(restaurant.status)}
                          <div className={`w-3 h-3 rounded-full ${
                            restaurant.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </div>

                      {/* Infos principales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{restaurant.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{restaurant.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{restaurant.address}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Inscrit le {format(restaurant.registrationDate, 'dd/MM/yyyy', { locale: fr })}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Store className="h-4 w-4" />
                            <span>Statut: {restaurant.isOpen ? 'Ouvert' : 'Fermé'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions détaillées pour les restaurants en attente */}
                      {restaurant.status === 'pending' && (
                        <div className="bg-orange-100 border border-orange-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <span className="font-medium text-orange-800">Action requise</span>
                          </div>
                          <p className="text-sm text-orange-700 mb-3">
                            Ce restaurant attend votre validation pour rejoindre la plateforme.
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleAction(restaurant, 'approve')}
                              className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleAction(restaurant, 'block')}
                              className="bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Bouton d'expansion pour les détails */}
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : restaurant.id)}
                        className="flex items-center justify-between w-full text-left p-3 bg-white bg-opacity-50 rounded-xl hover:bg-opacity-75 transition-all duration-300"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          📋 Voir plus de détails
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {/* Détails étendus */}
                      {isExpanded && (
                        <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-xl space-y-3 animate-in slide-in-from-top duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Horaires</h4>
                              <div className="space-y-1">
                                {Object.entries(restaurant.schedule).map(([day, schedule]) => (
                                  <div key={day} className="flex justify-between text-sm">
                                    <span className="capitalize text-gray-600">{day.substring(0, 3)}</span>
                                    <span className="text-gray-800">
                                      {schedule ? `${schedule.open} - ${schedule.close}` : 'Fermé'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-gray-600">Catégorie:</span>
                                  <Badge className="bg-blue-100 text-blue-700">{restaurant.category}</Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span>Inscription: {format(restaurant.registrationDate, 'dd MMMM yyyy', { locale: fr })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-6">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 lg:flex-none hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <Eye className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">Détails</span>
                      </Button>
                      
                      {restaurant.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAction(restaurant, 'block')}
                          className="flex-1 lg:flex-none hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-105"
                        >
                          <X className="h-4 w-4 lg:mr-2" />
                          <span className="hidden lg:inline">Bloquer</span>
                        </Button>
                      )}
                      
                      {restaurant.status === 'blocked' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleAction(restaurant, 'approve')}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                        >
                          <Check className="h-4 w-4 lg:mr-2" />
                          <span className="hidden lg:inline">Débloquer</span>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleAction(restaurant, 'delete')}
                        className="flex-1 lg:flex-none transition-all duration-200 transform hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`🏪 Détails de ${selectedRestaurant?.name}`}
      >
        {selectedRestaurant && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium">{selectedRestaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedRestaurant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="font-medium">{selectedRestaurant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie:</span>
                  <Badge className="bg-blue-100 text-blue-700">{selectedRestaurant.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  {getStatusBadge(selectedRestaurant.status)}
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Adresse</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>{selectedRestaurant.address}</span>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Horaires d'ouverture</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {Object.entries(selectedRestaurant.schedule).map(([day, schedule]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-medium">
                        {schedule ? `${schedule.open} - ${schedule.close}` : 'Fermé'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowDetailModal(false)} variant="secondary">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation d'action */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Confirmation"
      >
        {selectedRestaurant && actionType && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {actionType === 'approve' ? '✅' : actionType === 'block' ? '🚫' : '🗑️'}
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {actionType === 'approve' && 'Approuver ce restaurant ?'}
                {actionType === 'block' && 'Bloquer ce restaurant ?'}
                {actionType === 'delete' && 'Supprimer ce restaurant ?'}
              </p>
              <p className="text-sm text-gray-600">
                Restaurant: <span className="font-medium">{selectedRestaurant.name}</span>
              </p>
              {actionType === 'delete' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Cette action est irréversible. Tous les données liées à ce restaurant seront supprimées.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowActionModal(false)} variant="secondary">
                Annuler
              </Button>
              <Button
                onClick={confirmAction}
                className={`${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'block' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {actionType === 'approve' && 'Approuver'}
                {actionType === 'block' && 'Bloquer'}
                {actionType === 'delete' && 'Supprimer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantsManagementPage;