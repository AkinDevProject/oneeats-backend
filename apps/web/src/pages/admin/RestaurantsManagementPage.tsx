import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Store, Search, Filter, Eye, Edit3, Trash2, Check, X,
  AlertCircle, MapPin, Phone, Mail, Star,
  Calendar, Users, Award, TrendingUp, Clock, Settings,
  CheckCircle, XCircle, AlertTriangle, MoreVertical,
  BarChart3, Download, RefreshCcw, EyeOff
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { Restaurant } from '../../types';

const RestaurantsManagementPage: React.FC = () => {
  const { restaurants, loading, error, refetch, updateRestaurantStatus, deleteRestaurant } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'BLOCKED'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'block' | 'delete' | null>(null);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Restaurant['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="animate-pulse">⏳ En attente</Badge>;
      case 'APPROVED':
        return <Badge variant="success">✅ Approuvé</Badge>;
      case 'BLOCKED':
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

  const confirmAction = async () => {
    if (!selectedRestaurant || !actionType) return;

    try {
      switch (actionType) {
        case 'approve':
          await updateRestaurantStatus(selectedRestaurant.id, 'APPROVED');
          break;
        case 'block':
          await updateRestaurantStatus(selectedRestaurant.id, 'BLOCKED');
          break;
        case 'delete':
          await deleteRestaurant(selectedRestaurant.id);
          break;
      }

      // Refresh la liste après l'action
      await refetch();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      // Optionnel: afficher un message d'erreur à l'utilisateur
    }

    setShowActionModal(false);
    setSelectedRestaurant(null);
    setActionType(null);
  };

  const pendingCount = restaurants.filter(r => r.status === 'PENDING').length;
  const approvedCount = restaurants.filter(r => r.status === 'APPROVED').length;
  const blockedCount = restaurants.filter(r => r.status === 'BLOCKED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Erreur : {error}</p>
          <Button onClick={refetch} className="mt-4">Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Style Data-Driven */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Gestion Restaurants</h1>
            <p className="text-gray-600 mt-1">
              Supervision avancée • Validation intelligente • Métriques partenaires
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Analytics Controls */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <EyeOff className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <select className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none">
                <option>Tous les statuts</option>
                <option>En attente</option>
                <option>Approuvés</option>
                <option>Bloqués</option>
              </select>
            </div>
            <button
              onClick={refetch}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* Analytics Metrics - Style Data-Driven */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Restaurants</p>
                  <p className="text-3xl font-bold">{restaurants.length}</p>
                  <p className="text-purple-200 text-xs mt-1">Partenaires actifs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">En Attente</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                  <p className="text-blue-200 text-xs mt-1">{pendingCount > 0 ? 'Action requise!' : 'Tout traité'}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approuvés</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
                  <p className="text-green-200 text-xs mt-1">Actifs plateforme</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-700 to-gray-800 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Bloqués</p>
                  <p className="text-3xl font-bold">{blockedCount}</p>
                  <p className="text-gray-400 text-xs mt-1">Suspendus temp.</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section - Filtres et Contrôles */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Filter className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filtres et Recherche Avancée</h3>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'Tous', count: filteredRestaurants.length },
                    { key: 'PENDING', label: 'En attente', count: pendingCount },
                    { key: 'APPROVED', label: 'Approuvés', count: approvedCount },
                    { key: 'BLOCKED', label: 'Bloqués', count: blockedCount }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                        statusFilter === key
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        statusFilter === key ? 'bg-white bg-opacity-20' : 'bg-white'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

      {/* Liste des Restaurants */}
      {filteredRestaurants.length === 0 ? (
        <Card className="text-center py-16 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <Store className="h-16 w-16 text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun restaurant trouvé' : 'Aucun restaurant pour le moment'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les nouveaux restaurants apparaîtront ici'
                }
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Effacer la recherche
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <Card
              key={restaurant.id}
              hover
              className={`transition-all duration-300 ${
                restaurant.status === 'PENDING' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' :
                restaurant.status === 'BLOCKED' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' :
                'border-gray-200'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {restaurant.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{restaurant.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(restaurant.status)}
                    <div className={`w-3 h-3 rounded-full ${
                      restaurant.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>Téléphone:</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {restaurant.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Adresse:</span>
                    </span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
                      {restaurant.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Inscription:</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(restaurant.registrationDate, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Catégorie:</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {restaurant.category}
                    </Badge>
                  </div>
                </div>

                {/* Actions détaillées pour les restaurants en attente */}
                {restaurant.status === 'PENDING' && (
                  <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800 text-sm">Action requise</span>
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      Ce restaurant attend votre validation.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAction(restaurant, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleAction(restaurant, 'block')}
                        className="bg-red-600 hover:bg-red-700 text-xs flex-1"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setShowDetailModal(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>

                  {restaurant.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleAction(restaurant, 'block')}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Bloquer
                    </Button>
                  )}

                  {restaurant.status === 'BLOCKED' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleAction(restaurant, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Débloquer
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleAction(restaurant, 'delete')}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default RestaurantsManagementPage;