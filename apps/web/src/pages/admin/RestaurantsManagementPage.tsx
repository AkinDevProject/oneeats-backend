import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Store, Eye, Trash2, Check, X, AlertTriangle, MapPin, Phone, Mail,
  Calendar, CheckCircle, XCircle, Clock, Keyboard
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchFilter,
  AdminAlertZone,
  AdminTableSkeleton,
  AdminMetricCardSkeleton,
  AdminShortcutsHelp,
  AdminQuickActions,
} from '../../components/admin';
import type { AdminAlert, QuickAction } from '../../components/admin';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { Restaurant } from '../../types';
import { useKeyboardShortcuts, useShortcutsHelp, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

const RestaurantsManagementPage: React.FC = () => {
  const _navigate = useNavigate();
  const { restaurants, loading, error, refetch, updateRestaurantStatus, deleteRestaurant } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'block' | 'delete' | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const { isVisible: showShortcuts, toggle: toggleShortcuts, hide: hideShortcuts } = useShortcutsHelp();

  // Statistiques et données filtrées
  const { filteredRestaurants, stats, alerts } = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const statsData = {
      total: restaurants.length,
      pending: restaurants.filter(r => r.status === 'PENDING').length,
      approved: restaurants.filter(r => r.status === 'APPROVED').length,
      blocked: restaurants.filter(r => r.status === 'BLOCKED').length,
    };

    // Generate alerts
    const generatedAlerts: AdminAlert[] = [];

    if (statsData.pending > 0) {
      generatedAlerts.push({
        id: 'pending-restaurants',
        type: 'restaurant',
        severity: statsData.pending > 3 ? 'critical' : 'warning',
        title: `${statsData.pending} restaurant${statsData.pending > 1 ? 's' : ''} en attente de validation`,
        message: 'Ces restaurants attendent votre approbation pour rejoindre la plateforme',
        timestamp: new Date(),
        actionLabel: 'Voir en attente',
        onAction: () => setStatusFilter('PENDING'),
      });
    }

    if (statsData.blocked > 2) {
      generatedAlerts.push({
        id: 'blocked-restaurants',
        type: 'restaurant',
        severity: 'info',
        title: `${statsData.blocked} restaurants bloqués`,
        message: 'Vérifiez si certains peuvent être réactivés',
        timestamp: new Date(),
        actionLabel: 'Voir bloqués',
        onAction: () => setStatusFilter('BLOCKED'),
      });
    }

    const filteredAlerts = generatedAlerts.filter(a => !dismissedAlerts.has(a.id));

    return {
      filteredRestaurants: filtered,
      stats: statsData,
      alerts: filteredAlerts,
    };
  }, [restaurants, searchTerm, statusFilter, dismissedAlerts]);

  const filterTabs = [
    { key: 'all', label: 'Tous', count: stats.total },
    { key: 'PENDING', label: 'En attente', count: stats.pending },
    { key: 'APPROVED', label: 'Approuvés', count: stats.approved },
    { key: 'BLOCKED', label: 'Bloqués', count: stats.blocked }
  ];

  // Handlers
  const handleAction = useCallback((restaurant: Restaurant, action: 'approve' | 'block' | 'delete') => {
    setSelectedRestaurant(restaurant);
    setActionType(action);
    setShowActionModal(true);
  }, []);

  const confirmAction = useCallback(async () => {
    if (!selectedRestaurant || !actionType) return;
    try {
      if (actionType === 'approve') await updateRestaurantStatus(selectedRestaurant.id, 'APPROVED');
      else if (actionType === 'block') await updateRestaurantStatus(selectedRestaurant.id, 'BLOCKED');
      else if (actionType === 'delete') await deleteRestaurant(selectedRestaurant.id);
      await refetch();
    } catch (e) {
      console.error('Erreur:', e);
    }
    setShowActionModal(false);
    setSelectedRestaurant(null);
    setActionType(null);
  }, [selectedRestaurant, actionType, updateRestaurantStatus, deleteRestaurant, refetch]);

  const handleApproveAllPending = useCallback(async () => {
    const pendingRestaurants = restaurants.filter(r => r.status === 'PENDING');
    for (const r of pendingRestaurants) {
      await updateRestaurantStatus(r.id, 'APPROVED');
    }
    refetch();
  }, [restaurants, updateRestaurantStatus, refetch]);

  const handleExport = useCallback(() => {
    const csv = [
      ['Nom', 'Email', 'Téléphone', 'Catégorie', 'Statut', 'Date inscription'],
      ...restaurants.map(r => [r.name, r.email, r.phone, r.category, r.status, format(r.registrationDate, 'dd/MM/yyyy')])
    ].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'restaurants.csv';
    link.click();
  }, [restaurants]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'r', ctrl: true, description: 'Actualiser', action: refetch, category: 'Actions' },
    { key: 'e', ctrl: true, description: 'Exporter CSV', action: handleExport, category: 'Actions' },
    { key: 'p', alt: true, description: 'Filtrer: En attente', action: () => setStatusFilter('PENDING'), category: 'Filtres' },
    { key: 'a', alt: true, description: 'Filtrer: Approuvés', action: () => setStatusFilter('APPROVED'), category: 'Filtres' },
    { key: 'b', alt: true, description: 'Filtrer: Bloqués', action: () => setStatusFilter('BLOCKED'), category: 'Filtres' },
    { key: 't', alt: true, description: 'Filtrer: Tous', action: () => setStatusFilter('all'), category: 'Filtres' },
    { key: '?', shift: true, description: 'Afficher les raccourcis', action: toggleShortcuts, category: 'Aide' },
  ], [refetch, handleExport, toggleShortcuts]);

  useKeyboardShortcuts(shortcuts);

  // Quick actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'approve-all',
      label: 'Approuver tout',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: handleApproveAllPending,
      badge: stats.pending,
      disabled: stats.pending === 0,
    },
  ], [handleApproveAllPending, stats.pending]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminPageHeader title="Gestion Restaurants" subtitle="Chargement..." />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <AdminMetricCardSkeleton key={i} />)}
          </div>
          <AdminTableSkeleton rows={6} />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center border-red-200 bg-red-50 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-red-600 hover:bg-red-700 text-white">Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Gestion Restaurants"
        subtitle={`${stats.total} partenaires • ${stats.pending} en attente`}
        onRefresh={refetch}
        onExport={handleExport}
      >
        <button
          onClick={toggleShortcuts}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Raccourcis clavier"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </AdminPageHeader>

      <div className="p-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <AdminAlertZone
            alerts={alerts}
            onDismiss={(id) => setDismissedAlerts(prev => new Set([...prev, id]))}
            onAction={(alert) => alert.onAction?.()}
            maxVisible={2}
          />
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Total Restaurants"
            value={stats.total}
            subtitle="Partenaires"
            icon={<Store className="h-6 w-6" />}
            color="violet"
          />
          <AdminMetricCard
            title="En Attente"
            value={stats.pending}
            subtitle={stats.pending > 0 ? 'Action requise!' : 'Tout traité'}
            icon={<Clock className="h-6 w-6" />}
            color="orange"
            alert={stats.pending > 0}
          />
          <AdminMetricCard
            title="Approuvés"
            value={stats.approved}
            subtitle="Actifs"
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
          <AdminMetricCard
            title="Bloqués"
            value={stats.blocked}
            subtitle="Suspendus"
            icon={<XCircle className="h-6 w-6" />}
            color="gray"
          />
        </div>

        {/* Search & Filters */}
        <AdminSearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par nom, email ou catégorie..."
          tabs={filterTabs}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />

        {/* Restaurant Grid */}
        {filteredRestaurants.length === 0 ? (
          <Card className="text-center py-16">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun restaurant trouvé' : 'Aucun restaurant'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Essayez de modifier vos critères' : 'Les nouveaux restaurants apparaîtront ici'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Effacer les filtres
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
                onViewDetails={() => { setSelectedRestaurant(restaurant); setShowDetailModal(true); }}
                onAction={handleAction}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Détails de ${selectedRestaurant?.name}`}>
          {selectedRestaurant && <RestaurantDetails restaurant={selectedRestaurant} onClose={() => setShowDetailModal(false)} />}
        </Modal>

        <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="Confirmation">
          {selectedRestaurant && actionType && (
            <ActionConfirmation
              restaurant={selectedRestaurant}
              actionType={actionType}
              onConfirm={confirmAction}
              onCancel={() => setShowActionModal(false)}
            />
          )}
        </Modal>
      </div>

      {/* Quick Actions FAB */}
      <AdminQuickActions
        actions={quickActions}
        onRefresh={refetch}
        onExport={handleExport}
      />

      {/* Keyboard Shortcuts Help */}
      <AdminShortcutsHelp shortcuts={shortcuts} isVisible={showShortcuts} onClose={hideShortcuts} />
    </div>
  );
};

// Sub-components (unchanged but optimized)
function RestaurantCard({ restaurant, index, onViewDetails, onAction }: {
  restaurant: Restaurant;
  index: number;
  onViewDetails: () => void;
  onAction: (r: Restaurant, action: 'approve' | 'block' | 'delete') => void;
}) {
  const cardBg = restaurant.status === 'PENDING' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' :
                 restaurant.status === 'BLOCKED' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200';

  return (
    <Card hover className={cn('transition-all duration-300', cardBg)} style={{ animationDelay: `${index * 50}ms` }}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{restaurant.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={restaurant.status} />
            <div className={cn('w-3 h-3 rounded-full', restaurant.isOpen ? 'bg-green-500' : 'bg-red-500')} />
          </div>
        </div>

        <div className="space-y-2 p-3 bg-white/50 rounded-lg text-sm">
          <InfoRow icon={<Phone className="h-3 w-3" />} label="Tél" value={restaurant.phone} />
          <InfoRow icon={<MapPin className="h-3 w-3" />} label="Adresse" value={restaurant.address} truncate />
          <InfoRow icon={<Calendar className="h-3 w-3" />} label="Inscrit" value={format(restaurant.registrationDate, 'dd MMM yyyy', { locale: fr })} />
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Catégorie:</span>
            <Badge className="bg-violet-100 text-violet-700">{restaurant.category}</Badge>
          </div>
        </div>

        {restaurant.status === 'PENDING' && (
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800 text-sm">Action requise</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAction(restaurant, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />Approuver
              </Button>
              <Button size="sm" onClick={() => onAction(restaurant, 'block')} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs">
                <XCircle className="h-3 w-3 mr-1" />Rejeter
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onViewDetails} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />Détails
          </Button>
          {restaurant.status === 'APPROVED' && (
            <Button size="sm" variant="warning" onClick={() => onAction(restaurant, 'block')} className="flex-1">
              <X className="h-4 w-4 mr-1" />Bloquer
            </Button>
          )}
          {restaurant.status === 'BLOCKED' && (
            <Button size="sm" onClick={() => onAction(restaurant, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Check className="h-4 w-4 mr-1" />Débloquer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Restaurant['status'] }) {
  const variants: Record<string, { variant: 'warning' | 'success' | 'danger'; label: string }> = {
    PENDING: { variant: 'warning', label: 'En attente' },
    APPROVED: { variant: 'success', label: 'Approuvé' },
    BLOCKED: { variant: 'danger', label: 'Bloqué' },
  };
  const { variant, label } = variants[status] || { variant: 'default' as const, label: 'Inconnu' };
  return <Badge variant={variant} className={status === 'PENDING' ? 'animate-pulse' : ''}>{label}</Badge>;
}

function InfoRow({ icon, label, value, truncate }: { icon: React.ReactNode; label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 flex items-center gap-1">{icon}<span>{label}:</span></span>
      <span className={cn('font-medium text-gray-900', truncate && 'text-right max-w-[55%] truncate')}>{value}</span>
    </div>
  );
}

function RestaurantDetails({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <Section title="Informations générales">
        <InfoBlock label="Nom" value={restaurant.name} />
        <InfoBlock label="Email" value={restaurant.email} />
        <InfoBlock label="Téléphone" value={restaurant.phone} />
        <div className="flex justify-between">
          <span className="text-gray-600">Catégorie:</span>
          <Badge className="bg-violet-100 text-violet-700">{restaurant.category}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Statut:</span>
          <StatusBadge status={restaurant.status} />
        </div>
      </Section>
      <Section title="Adresse">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <span>{restaurant.address}</span>
        </div>
      </Section>
      <Section title="Horaires">
        {Object.entries(restaurant.schedule).map(([day, schedule]) => (
          <div key={day} className="flex justify-between">
            <span className="capitalize text-gray-600">{day}</span>
            <span className="font-medium">{schedule ? `${schedule.open} - ${schedule.close}` : 'Fermé'}</span>
          </div>
        ))}
      </Section>
      <div className="flex justify-end">
        <Button onClick={onClose} variant="secondary">Fermer</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ActionConfirmation({ restaurant, actionType, onConfirm, onCancel }: {
  restaurant: Restaurant;
  actionType: 'approve' | 'block' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const config = {
    approve: { icon: <CheckCircle className="h-12 w-12 text-green-500" />, title: 'Approuver ce restaurant ?', btnClass: 'bg-green-600 hover:bg-green-700', btnLabel: 'Approuver' },
    block: { icon: <XCircle className="h-12 w-12 text-red-500" />, title: 'Bloquer ce restaurant ?', btnClass: 'bg-red-600 hover:bg-red-700', btnLabel: 'Bloquer' },
    delete: { icon: <Trash2 className="h-12 w-12 text-red-500" />, title: 'Supprimer ce restaurant ?', btnClass: 'bg-red-600 hover:bg-red-700', btnLabel: 'Supprimer' },
  };
  const { icon, title, btnClass, btnLabel } = config[actionType];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <p className="text-lg font-medium text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-600">Restaurant: <span className="font-medium">{restaurant.name}</span></p>
        {actionType === 'delete' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">Cette action est irréversible.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="secondary">Annuler</Button>
        <Button onClick={onConfirm} className={cn('text-white', btnClass)}>{btnLabel}</Button>
      </div>
    </div>
  );
}

export default RestaurantsManagementPage;
