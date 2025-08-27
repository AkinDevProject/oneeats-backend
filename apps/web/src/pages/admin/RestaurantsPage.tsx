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
import { mockRestaurants } from '../../data/mockData';
import { Restaurant } from '../../types';

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'block' | 'delete' | null>(null);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (restaurant: Restaurant, action: 'approve' | 'block' | 'delete') => {
    setSelectedRestaurant(restaurant);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (!selectedRestaurant || !modalAction) return;

    setRestaurants(prev => prev.map(r => {
      if (r.id === selectedRestaurant.id) {
        if (modalAction === 'approve') {
          return { ...r, status: 'approved' as const };
        } else if (modalAction === 'block') {
          return { ...r, status: 'blocked' as const };
        }
      }
      return r;
    }));

    if (modalAction === 'delete') {
      setRestaurants(prev => prev.filter(r => r.id !== selectedRestaurant.id));
    }

    setShowModal(false);
    setSelectedRestaurant(null);
    setModalAction(null);
  };

  const getStatusBadge = (status: Restaurant['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Validé</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'blocked':
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
      delete: { title: 'Supprimer le restaurant', message: 'Êtes-vous sûr de vouloir supprimer définitivement ce restaurant ?' }
    };

    return actions[modalAction];
  };

  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => r.status === 'pending').length,
    approved: restaurants.filter(r => r.status === 'approved').length,
    blocked: restaurants.filter(r => r.status === 'blocked').length,
    active: restaurants.filter(r => r.isOpen).length
  };

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
                restaurant.status === 'pending' ? 'border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100' :
                restaurant.status === 'blocked' ? 'border-danger-200 bg-gradient-to-br from-danger-50 to-danger-100' :
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
                      <p className="text-sm text-gray-500">{restaurant.category}</p>
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
                  <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} className="flex-1">
                    Voir détails
                  </Button>
                  {restaurant.status === 'pending' && (
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
                  {restaurant.status !== 'blocked' && (
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalContent()?.title || ''}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {getModalContent()?.message}
          </p>
          <div className="flex justify-end space-x-2">
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
      </Modal>
    </div>
  );
};

export default RestaurantsPage;