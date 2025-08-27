import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Eye, ShoppingCart, Clock, CheckCircle, XCircle, AlertTriangle, Package, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../components/ui/Table';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'accepted':
        return <Badge variant="success">Acceptée</Badge>;
      case 'preparing':
        return <Badge variant="default">En préparation</Badge>;
      case 'ready':
        return <Badge variant="success">Prête</Badge>;
      case 'delivered':
        return <Badge variant="success">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Annulée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => ['accepted', 'preparing'].includes(o.status)).length,
    ready: mockOrders.filter(o => o.status === 'ready').length,
    completed: mockOrders.filter(o => ['delivered'].includes(o.status)).length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
    revenue: mockOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Suivi des commandes</h1>
        <p className="text-gray-600 text-sm sm:text-base flex items-center space-x-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Supervision globale de toutes les commandes</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card hover className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-center mb-2">
            <ShoppingCart className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-700">{stats.total}</div>
          <div className="text-xs text-primary-600">Total</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-warning-700">{stats.pending}</div>
          <div className="text-xs text-warning-600">En attente</div>
          {stats.pending > 0 && <div className="text-xs text-warning-500 font-bold animate-pulse">Urgent</div>}
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-700">{stats.processing}</div>
          <div className="text-xs text-secondary-600">En cours</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-center mb-2">
            <Package className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.ready}</div>
          <div className="text-xs text-success-600">Prêtes</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.completed}</div>
          <div className="text-xs text-success-600">Terminées</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-danger-600" />
          </div>
          <div className="text-lg font-bold text-danger-700">{stats.revenue.toFixed(0)} €</div>
          <div className="text-xs text-danger-600">CA total</div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" className="backdrop-blur-sm">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher par ID, client, restaurant..."
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
                { key: 'all', label: 'Toutes', count: stats.total, color: 'primary' },
                { key: 'pending', label: 'En attente', count: stats.pending, color: 'warning' },
                { key: 'accepted', label: 'Acceptées', count: stats.processing, color: 'info' },
                { key: 'ready', label: 'Prêtes', count: stats.ready, color: 'success' },
                { key: 'delivered', label: 'Terminées', count: stats.completed, color: 'success' }
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

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-16 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Les nouvelles commandes apparaîtront ici'
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
              {searchTerm && ` trouvée${filteredOrders.length > 1 ? 's' : ''}`}
            </h2>
          </div>
          <div className="space-y-3">
            {filteredOrders.map((order, index) => (
              <Card 
                key={order.id} 
                hover
                className={`transition-all duration-300 ${
                  order.status === 'pending' ? 'border-warning-200 bg-gradient-to-r from-warning-50 to-warning-100' :
                  order.status === 'cancelled' ? 'border-danger-200 bg-gradient-to-r from-danger-50 to-danger-100' :
                  order.status === 'ready' ? 'border-success-200 bg-gradient-to-r from-success-50 to-success-100' :
                  'border-gray-200'
                } animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                          <p className="text-sm text-gray-500">{order.restaurantName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status)}
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(order.createdAt, 'dd MMM HH:mm', { locale: fr })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-xs text-gray-500">Client:</span>
                        <p className="font-medium text-gray-900">{order.clientName}</p>
                        <p className="text-sm text-gray-600">{order.clientEmail}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Articles:</span>
                        <p className="font-medium text-gray-900">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                        <p className="text-sm text-gray-600">{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Total:</span>
                        <p className="text-xl font-bold text-success-600">{order.total.toFixed(2)} €</p>
                        {order.estimatedTime && (
                          <p className="text-sm text-gray-600">{order.estimatedTime} min</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 lg:ml-6">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      icon={<Eye className="h-4 w-4" />}
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;