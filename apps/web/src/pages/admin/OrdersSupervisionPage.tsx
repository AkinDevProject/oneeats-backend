import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  Filter,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  Calendar,
  Eye,
  RefreshCcw,
  User,
  Mail,
  MapPin
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useOrders } from '../../hooks/data/useOrders';
import { OrderStatus } from '../../types';

const OrdersSupervisionPage: React.FC = () => {
  const {
    filteredOrders,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    updateOrderStatus,
    getOrderStats
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const stats = getOrderStats();

  const statusConfig = {
    PENDING: {
      label: 'En attente',
      variant: 'warning' as const,
      icon: Clock,
      count: stats.pending
    },
    CONFIRMED: {
      label: 'Confirmée',
      variant: 'info' as const,
      icon: CheckCircle,
      count: stats.confirmed
    },
    PREPARING: {
      label: 'En préparation',
      variant: 'default' as const,
      icon: Package,
      count: stats.preparing
    },
    READY: {
      label: 'Prête',
      variant: 'success' as const,
      icon: TrendingUp,
      count: stats.ready
    },
    COMPLETED: {
      label: 'Terminée',
      variant: 'success' as const,
      icon: CheckCircle,
      count: stats.completed
    },
    CANCELLED: {
      label: 'Annulée',
      variant: 'danger' as const,
      icon: XCircle,
      count: stats.cancelled
    },
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleStatusFilter = (status?: OrderStatus) => {
    setFilters({ ...filters, status });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="text-center py-16 border-danger-200 bg-danger-50">
          <AlertTriangle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{error}</p>
          <Button
            variant="outline"
            onClick={refetch}
            className="mt-4"
            icon={<RefreshCcw className="h-4 w-4" />}
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Style Data-Driven */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Supervision Commandes</h1>
            <p className="text-gray-600 mt-1">
              Monitoring temps réel • Gestion avancée • Supervision intelligente
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
                  <Filter className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <select className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none">
                <option>Temps réel</option>
                <option>Dernière heure</option>
                <option>Aujourd'hui</option>
              </select>
            </div>
            <Button
              onClick={refetch}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </Button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <TrendingUp className="h-4 w-4" />
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
                  <p className="text-purple-100 text-sm font-medium">Total Commandes</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-purple-200 text-xs mt-1">Toutes les commandes</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">En Attente</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <p className="text-orange-200 text-xs mt-1">{stats.pending > 0 ? 'Action requise!' : 'Tout traité'}</p>
                  {stats.pending > 0 && (
                    <div className="text-xs text-orange-200 font-bold animate-pulse mt-1">🚨 URGENT</div>
                  )}
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">En Préparation</p>
                  <p className="text-3xl font-bold">{stats.preparing + stats.confirmed}</p>
                  <p className="text-blue-200 text-xs mt-1">Cuisines actives</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Terminées</p>
                  <p className="text-3xl font-bold">{stats.completed + stats.ready}</p>
                  <p className="text-green-200 text-xs mt-1">Succès plateforme</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
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
                    placeholder="Rechercher par numéro de commande, nom client ou email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[
                    { key: undefined, label: 'Toutes', count: stats.total },
                    { key: 'PENDING', label: 'En attente', count: stats.pending },
                    { key: 'PREPARING', label: 'Préparation', count: stats.preparing + stats.confirmed },
                    { key: 'READY', label: 'Prêtes', count: stats.ready },
                    { key: 'COMPLETED', label: 'Terminées', count: stats.completed }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key || 'all'}
                      onClick={() => handleStatusFilter(key as OrderStatus)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                        filters.status === key
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filters.status === key ? 'bg-white bg-opacity-20' : 'bg-white'
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

        {/* Orders Table - Enhanced Design */}
        <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Gestion des Commandes
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} • Supervision en temps réel
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-600">Live</span>
                </div>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="flex flex-col items-center space-y-4">
                <ShoppingCart className="h-16 w-16 text-gray-300" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filters.status ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filters.status
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Les nouvelles commandes apparaîtront ici'
                    }
                  </p>
                </div>
                {(searchTerm || filters.status) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                    }}
                    className="mt-4"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Commande</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Client</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Articles</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date & Heure</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => {
                    const statusInfo = statusConfig[order.status];
                    return (
                      <tr
                        key={order.id}
                        className={`transition-all duration-200 hover:bg-gray-50 ${
                          order.status === 'PENDING' ? 'bg-gradient-to-r from-orange-50 to-orange-25 border-l-4 border-orange-400' :
                          order.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-50 to-red-25' :
                          order.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-50 to-green-25' :
                          ''
                        } animate-fade-in`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              #{order.orderNumber.slice(-3)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {order.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.clientFirstName} {order.clientLastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{order.clientEmail}</span>
                            </div>
                            {order.clientPhone && (
                              <div className="text-xs text-gray-400">
                                📞 {order.clientPhone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.items.length} article{order.items.length > 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                Commande complète
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(order.createdAt, 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(order.createdAt, 'HH:mm', { locale: fr })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.estimatedPickupTime && `Récup.: ${format(order.estimatedPickupTime, 'HH:mm', { locale: fr })}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={statusInfo.variant}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'PENDING' ? 'animate-pulse' : ''
                              }`}
                            >
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            {order.status === 'PENDING' && (
                              <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {order.totalAmount.toFixed(2)} €
                            </div>
                            <div className="text-xs text-gray-500">
                              TTC
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {selectedOrder === order.id ? 'Masquer' : 'Voir'}
                            </Button>

                            {order.status === 'PENDING' && (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}

                            {order.status !== 'PENDING' && (
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                {Object.entries(statusConfig).map(([status, config]) => (
                                  <option key={status} value={status}>
                                    {config.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      {/* Order Details Panel */}
      {selectedOrder && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Détails de la commande {filteredOrders.find(o => o.id === selectedOrder)?.orderNumber}
            </h3>
          </div>

          {(() => {
            const order = filteredOrders.find(o => o.id === selectedOrder);
            if (!order) return null;

            return (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="outline">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Informations client</span>
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nom:</span> {order.clientFirstName} {order.clientLastName}</p>
                      <p><span className="font-medium">Email:</span> {order.clientEmail}</p>
                      {order.clientPhone && <p><span className="font-medium">Téléphone:</span> {order.clientPhone}</p>}
                    </div>
                  </Card>

                  <Card variant="outline">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Informations commande</span>
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Montant total:</span> {order.totalAmount.toFixed(2)} €</p>
                      <p><span className="font-medium">Créée le:</span> {format(order.createdAt, 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                      <p><span className="font-medium">Dernière mise à jour:</span> {format(order.updatedAt, 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                      {order.estimatedPickupTime && (
                        <p><span className="font-medium">Récupération estimée:</span> {format(order.estimatedPickupTime, 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                      )}
                    </div>
                  </Card>
                </div>

                {order.specialInstructions && (
                  <Card variant="outline">
                    <h4 className="font-medium text-gray-900 mb-2">Instructions spéciales</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {order.specialInstructions}
                    </p>
                  </Card>
                )}

                <Card variant="outline">
                  <h4 className="font-medium text-gray-900 mb-2">Articles commandés</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">{item.menuItemName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x à {item.unitPrice.toFixed(2)} €
                          </p>
                          {item.specialNotes && (
                            <p className="text-sm text-gray-500 italic">Note: {item.specialNotes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{item.subtotal.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })()}
        </Card>
      )}
      </div>
    </div>
  );
};

export default OrdersSupervisionPage;