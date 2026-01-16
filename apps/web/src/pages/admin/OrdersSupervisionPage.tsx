import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShoppingCart, Clock, CheckCircle, XCircle, AlertTriangle, Package,
  TrendingUp, Calendar, Eye, RefreshCcw, User, Mail
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { AdminMetricCard, AdminPageHeader, AdminSearchFilter } from '../../components/admin';
import { useOrders } from '../../hooks/data/useOrders';
import { OrderStatus, Order } from '../../types';
import OrderDetailModal from '../../components/modals/OrderDetailModal';

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'danger'; icon: React.FC<{ className?: string }> }> = {
  PENDING: { label: 'En attente', variant: 'warning', icon: Clock },
  CONFIRMED: { label: 'Confirmée', variant: 'info', icon: CheckCircle },
  PREPARING: { label: 'En préparation', variant: 'default', icon: Package },
  READY: { label: 'Prête', variant: 'success', icon: TrendingUp },
  COMPLETED: { label: 'Terminée', variant: 'success', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', variant: 'danger', icon: XCircle },
};

const OrdersSupervisionPage: React.FC = () => {
  const { filteredOrders, loading, error, filters, setFilters, refetch, updateOrderStatus, getOrderStats } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = getOrderStats();

  const filterTabs = useMemo(() => [
    { key: '', label: 'Toutes', count: stats.total },
    { key: 'PENDING', label: 'En attente', count: stats.pending },
    { key: 'PREPARING', label: 'Préparation', count: stats.preparing + stats.confirmed },
    { key: 'READY', label: 'Prêtes', count: stats.ready },
    { key: 'COMPLETED', label: 'Terminées', count: stats.completed }
  ], [stats]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try { await updateOrderStatus(orderId, newStatus); } catch (e) { console.error('Erreur:', e); }
  }, [updateOrderStatus]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  }, [filters, setFilters]);

  const handleStatusFilter = useCallback((status: string) => {
    setFilters({ ...filters, status: status as OrderStatus || undefined });
  }, [filters, setFilters]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="text-center py-16 border-danger-200 bg-danger-50">
          <AlertTriangle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{error}</p>
          <Button variant="outline" onClick={refetch} className="mt-4" icon={<RefreshCcw className="h-4 w-4" />}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Analytics Dashboard - Supervision Commandes"
        subtitle="Monitoring temps réel • Gestion avancée • Supervision intelligente"
        onRefresh={refetch}
        onExport={() => {}}
      />

      <div className="p-8 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard title="Total Commandes" value={stats.total} subtitle="Toutes les commandes" icon={<ShoppingCart className="h-6 w-6" />} color="violet" />
          <AdminMetricCard title="En Attente" value={stats.pending} subtitle={stats.pending > 0 ? 'Action requise!' : 'Tout traité'} icon={<Clock className="h-6 w-6" />} color="orange" alert={stats.pending > 0} />
          <AdminMetricCard title="En Préparation" value={stats.preparing + stats.confirmed} subtitle="Cuisines actives" icon={<Package className="h-6 w-6" />} color="blue" />
          <AdminMetricCard title="Terminées" value={stats.completed + stats.ready} subtitle="Succès plateforme" icon={<CheckCircle className="h-6 w-6" />} color="green" />
        </div>

        {/* Search & Filters */}
        <AdminSearchFilter
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher par numéro de commande, nom client ou email..."
          tabs={filterTabs}
          activeTab={filters.status || ''}
          onTabChange={handleStatusFilter}
        />

        {/* Orders Table */}
        <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Gestion des Commandes</h2>
                  <p className="text-sm text-gray-600">{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} • Supervision en temps réel</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-600">Live</span>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState searchTerm={searchTerm} hasFilters={!!filters.status} onClear={() => { setSearchTerm(''); setFilters({}); }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <TableHeader icon={<ShoppingCart className="h-4 w-4" />} label="Commande" />
                    <TableHeader icon={<User className="h-4 w-4" />} label="Client" />
                    <TableHeader icon={<Package className="h-4 w-4" />} label="Articles" />
                    <TableHeader icon={<Calendar className="h-4 w-4" />} label="Date & Heure" />
                    <TableHeader label="Statut" />
                    <TableHeader label="Montant" />
                    <TableHeader label="Actions" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      index={index}
                      onViewDetails={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <OrderDetailModal order={selectedOrder} isOpen={isModalOpen} onClose={() => { setSelectedOrder(null); setIsModalOpen(false); }} onStatusChange={updateOrderStatus} />
      </div>
    </div>
  );
};

// Sub-components
function TableHeader({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
    </th>
  );
}

function EmptyState({ searchTerm, hasFilters, onClear }: { searchTerm: string; hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm || hasFilters ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'}
      </h3>
      <p className="text-gray-500">{searchTerm || hasFilters ? 'Essayez de modifier vos critères' : 'Les nouvelles commandes apparaîtront ici'}</p>
      {(searchTerm || hasFilters) && <Button variant="outline" onClick={onClear} className="mt-4">Effacer les filtres</Button>}
    </div>
  );
}

function OrderRow({ order, index, onViewDetails, onStatusChange }: {
  order: Order;
  index: number;
  onViewDetails: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const rowBg = order.status === 'PENDING' ? 'bg-gradient-to-r from-orange-50 to-orange-25 border-l-4 border-orange-400' :
                order.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-50 to-red-25' :
                order.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-50 to-green-25' : '';

  return (
    <tr className={cn('transition-all duration-200 hover:bg-gray-50 animate-fade-in', rowBg)} style={{ animationDelay: `${index * 50}ms` }}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            #{order.orderNumber.slice(-3)}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
            <div className="text-xs text-gray-500">ID: {order.id.slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{order.clientFirstName} {order.clientLastName}</div>
        <div className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /><span className="truncate max-w-[200px]">{order.clientEmail}</span></div>
        {order.clientPhone && <div className="text-xs text-gray-400">📞 {order.clientPhone}</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Package className="h-4 w-4 text-blue-600" /></div>
          <div>
            <div className="text-sm font-medium text-gray-900">{order.items.length} article{order.items.length > 1 ? 's' : ''}</div>
            <div className="text-xs text-gray-500">Commande complète</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{format(order.createdAt, 'dd MMM yyyy', { locale: fr })}</div>
        <div className="text-sm text-gray-500">{format(order.createdAt, 'HH:mm', { locale: fr })}</div>
        {order.estimatedPickupTime && <div className="text-xs text-gray-400">Récup.: {format(order.estimatedPickupTime, 'HH:mm', { locale: fr })}</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', order.status === 'PENDING' && 'animate-pulse')}>
            <StatusIcon className="w-3 h-3 mr-1" />{status.label}
          </Badge>
          {order.status === 'PENDING' && <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-lg font-bold text-gray-900">{order.totalAmount.toFixed(2)} €</div>
        <div className="text-xs text-gray-500">TTC</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onViewDetails} className="hover:bg-blue-50 hover:border-blue-300">
            <Eye className="h-3 w-3 mr-1" />Voir détails
          </Button>
          {order.status === 'PENDING' ? (
            <div className="flex gap-1">
              <Button size="sm" variant="success" onClick={() => onStatusChange(order.id, 'CONFIRMED')} className="bg-green-600 hover:bg-green-700 text-white px-2">
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => onStatusChange(order.id, 'CANCELLED')} className="bg-red-600 hover:bg-red-700 text-white px-2">
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          )}
        </div>
      </td>
    </tr>
  );
}

export default OrdersSupervisionPage;
