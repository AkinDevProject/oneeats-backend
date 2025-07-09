import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Check, Ban, Trash2, Search, Filter } from 'lucide-react';
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des restaurants</h1>
        <p className="text-gray-600 text-sm sm:text-base">Gérez les restaurants de votre plateforme</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Validé</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="sm">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun restaurant trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Nom</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Email</TableHeader>
                  <TableHeader className="hidden md:table-cell">Date d'inscription</TableHeader>
                  <TableHeader>Statut</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.category}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{restaurant.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{restaurant.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(restaurant.registrationDate, 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(restaurant.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {restaurant.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleAction(restaurant, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {restaurant.status !== 'blocked' && (
                          <Button 
                            size="sm" 
                            variant="warning"
                            onClick={() => handleAction(restaurant, 'block')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleAction(restaurant, 'delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

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