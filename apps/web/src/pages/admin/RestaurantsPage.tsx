import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Check, Ban, Trash2, Search, Filter, Store, MapPin, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../components/ui/Table';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { Restaurant } from '../../types';

const RestaurantsPage: React.FC = () => {
  const { restaurants, loading, error, updateRestaurantStatus, deleteRestaurant } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'block' | 'delete' | 'details' | null>(null);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (restaurant: Restaurant, action: 'approve' | 'block' | 'delete' | 'details') => {
    setSelectedRestaurant(restaurant);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRestaurant || !modalAction) return;

    try {
      if (modalAction === 'approve') {
        await updateRestaurantStatus(selectedRestaurant.id, 'APPROVED');
      } else if (modalAction === 'block') {
        await updateRestaurantStatus(selectedRestaurant.id, 'BLOCKED');
      } else if (modalAction === 'delete') {
        await deleteRestaurant(selectedRestaurant.id);
      } else if (modalAction === 'details') {
        // Les détails sont affichés dans le modal, pas d'action à confirmer
        return;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }

    setShowModal(false);
    setSelectedRestaurant(null);
    setModalAction(null);
  };

  const handleStatusChange = async (newStatus: 'PENDING' | 'APPROVED' | 'BLOCKED') => {
    if (!selectedRestaurant) return;

    try {
      await updateRestaurantStatus(selectedRestaurant.id, newStatus);
      setShowModal(false);
      setSelectedRestaurant(null);
      setModalAction(null);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const getStatusBadge = (status: Restaurant['status']) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">Validé</Badge>;
      case 'PENDING':
        return <Badge variant="warning">En attente</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Bloqué</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const getModalContent = () => {
    if (!selectedRestaurant || !modalAction) return null;

    const actions = {
      approve: { title: 'Valider le restaurant', message: 'Êtes-vous sûr de vouloir valider ce restaurant ?' },
      block: { title: 'Bloquer le restaurant', message: 'Êtes-vous sûr de vouloir bloquer ce restaurant ?' },
      delete: { title: 'Supprimer le restaurant', message: 'Êtes-vous sûr de vouloir supprimer définitivement ce restaurant ?' },
      details: { title: 'Détails du restaurant', message: '' }
    };

    return actions[modalAction];
  };

  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => r.status.toUpperCase() === 'PENDING').length,
    approved: restaurants.filter(r => r.status.toUpperCase() === 'APPROVED').length,
    blocked: restaurants.filter(r => r.status.toUpperCase() === 'BLOCKED').length,
    active: restaurants.filter(r => r.isOpen).length
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement des restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="text-center py-16 border-danger-200 bg-danger-50">
          <AlertCircle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des restaurants</h1>
          <p className="text-gray-600 text-sm sm:text-base flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>Gérez les restaurants de votre plateforme</span>
          </p>
        </div>
        <Button variant="primary" icon={<Store className="h-4 w-4" />}>
          Nouveau restaurant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card hover className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-center mb-2">
            <Store className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-700">{stats.total}</div>
          <div className="text-xs text-primary-600">Total</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-warning-700">{stats.pending}</div>
          <div className="text-xs text-warning-600">En attente</div>
          {stats.pending > 0 && <div className="text-xs text-warning-500 font-bold animate-pulse">Action requise</div>}
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-center mb-2">
            <Check className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.approved}</div>
          <div className="text-xs text-success-600">Validés</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <div className="flex items-center justify-center mb-2">
            <Ban className="h-6 w-6 text-danger-600" />
          </div>
          <div className="text-2xl font-bold text-danger-700">{stats.blocked}</div>
          <div className="text-xs text-danger-600">Bloqués</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-700">{stats.active}</div>
          <div className="text-xs text-secondary-600">Actifs</div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" className="backdrop-blur-sm">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tous', count: stats.total, color: 'primary' },
                { key: 'pending', label: 'En attente', count: stats.pending, color: 'warning' },
                { key: 'approved', label: 'Validés', count: stats.approved, color: 'success' },
                { key: 'blocked', label: 'Bloqués', count: stats.blocked, color: 'danger' }
              ].map(({ key, label, count, color }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={statusFilter === key ? 'primary' : 'ghost'}
                  onClick={() => setStatusFilter(key as any)}
                  className="relative"
                >
                  {label}
                  {count > 0 && (
                    <Badge 
                      size="sm" 
                      variant={statusFilter === key ? 'secondary' : color as any}
                      className="ml-1"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

        {/* Restaurants Grid */}
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
                restaurant.status.toUpperCase() === 'PENDING' ? 'border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100' :
                restaurant.status.toUpperCase() === 'BLOCKED' ? 'border-danger-200 bg-gradient-to-br from-danger-50 to-danger-100' :
                'border-gray-200'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Store className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      <p className="text-sm text-gray-500">{restaurant.cuisineType}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(restaurant.status)}
                </div>

                {/* Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{restaurant.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium text-gray-900">{restaurant.phone}</span>
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
                    <span className="text-gray-600">Statut:</span>
                    <Badge 
                      variant={restaurant.isOpen ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Eye className="h-4 w-4" />}
                    className="flex-1"
                    onClick={() => handleAction(restaurant, 'details')}
                  >
                    Voir détails
                  </Button>
                  {restaurant.status.toUpperCase() === 'PENDING' && (
                    <Button 
                      size="sm" 
                      variant="success"
                      icon={<Check className="h-4 w-4" />}
                      onClick={() => handleAction(restaurant, 'approve')}
                      className="flex-1"
                    >
                      Valider
                    </Button>
                  )}
                  {restaurant.status.toUpperCase() !== 'BLOCKED' && (
                    <Button 
                      size="sm" 
                      variant="warning"
                      icon={<Ban className="h-4 w-4" />}
                      onClick={() => handleAction(restaurant, 'block')}
                    >
                      Bloquer
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="danger"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => handleAction(restaurant, 'delete')}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalContent()?.title || ''}
      >
        <div className="space-y-4">
          {modalAction === 'details' && selectedRestaurant ? (
            /* Modal détails */
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cuisine</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.cuisineType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.phone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Adresse</label>
                <p className="text-sm text-gray-900">{selectedRestaurant.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedRestaurant.description}</p>
              </div>

              {/* Statut actuel et actions */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Statut actuel</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRestaurant.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Note: {selectedRestaurant.rating}/5 ⭐
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedRestaurant.isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
                    </div>
                  </div>
                </div>

                {/* Actions de changement de statut */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Changer le statut</label>
                  <div className="flex space-x-2">
                    {selectedRestaurant.status.toUpperCase() !== 'PENDING' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleStatusChange('PENDING')}
                      >
                        En attente
                      </Button>
                    )}
                    {selectedRestaurant.status.toUpperCase() !== 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange('APPROVED')}
                      >
                        Approuver
                      </Button>
                    )}
                    {selectedRestaurant.status.toUpperCase() !== 'BLOCKED' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange('BLOCKED')}
                      >
                        Bloquer
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            /* Modal de confirmation pour les autres actions */
            <div>
              <p className="text-sm text-gray-600">
                {getModalContent()?.message}
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button
                  variant={modalAction === 'delete' ? 'danger' : 'primary'}
                  onClick={confirmAction}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RestaurantsPage;