import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Store, Eye, Trash2, Check, X, AlertTriangle, MapPin, Phone, Mail,
  Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import { AdminMetricCard, AdminPageHeader, AdminSearchFilter } from '../../components/admin';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { Restaurant } from '../../types';

const RestaurantsManagementPage: React.FC = () => {
  const { restaurants, loading, error, refetch, updateRestaurantStatus, deleteRestaurant } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'block' | 'delete' | null>(null);

  // Statistiques et données filtrées
  const { filteredRestaurants, stats } = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return {
      filteredRestaurants: filtered,
      stats: {
        total: restaurants.length,
        pending: restaurants.filter(r => r.status === 'PENDING').length,
        approved: restaurants.filter(r => r.status === 'APPROVED').length,
        blocked: restaurants.filter(r => r.status === 'BLOCKED').length,
      }
    };
  }, [restaurants, searchTerm, statusFilter]);

  const filterTabs = [
    { key: 'all', label: 'Tous', count: stats.total },
    { key: 'PENDING', label: 'En attente', count: stats.pending },
    { key: 'APPROVED', label: 'Approuvés', count: stats.approved },
    { key: 'BLOCKED', label: 'Bloqués', count: stats.blocked }
  ];

  const handleAction = (restaurant: Restaurant, action: 'approve' | 'block' | 'delete') => {
    setSelectedRestaurant(restaurant);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
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
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des restaurants...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Erreur : {error}</p>
          <Button onClick={refetch} className="mt-4">Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Analytics Dashboard - Gestion Restaurants"
        subtitle="Supervision avancée • Validation intelligente • Métriques partenaires"
        onRefresh={refetch}
        onExport={() => {}}
      />

      <div className="p-8 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Total Restaurants"
            value={stats.total}
            subtitle="Partenaires actifs"
            icon={<Store className="h-6 w-6" />}
            color="violet"
          />
          <AdminMetricCard
            title="En Attente"
            value={stats.pending}
            subtitle={stats.pending > 0 ? 'Action requise!' : 'Tout traité'}
            icon={<Clock className="h-6 w-6" />}
            color="blue"
            alert={stats.pending > 0}
          />
          <AdminMetricCard
            title="Approuvés"
            value={stats.approved}
            subtitle="Actifs plateforme"
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
          <AdminMetricCard
            title="Bloqués"
            value={stats.blocked}
            subtitle="Suspendus temp."
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
              {searchTerm ? 'Aucun restaurant trouvé' : 'Aucun restaurant pour le moment'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Les nouveaux restaurants apparaîtront ici'}
            </p>
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

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`🏪 Détails de ${selectedRestaurant?.name}`}>
          {selectedRestaurant && <RestaurantDetails restaurant={selectedRestaurant} onClose={() => setShowDetailModal(false)} />}
        </Modal>

        {/* Action Confirmation Modal */}
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
    </div>
  );
};

// Sub-components
function RestaurantCard({ restaurant, index, onViewDetails, onAction }: {
  restaurant: Restaurant;
  index: number;
  onViewDetails: () => void;
  onAction: (r: Restaurant, action: 'approve' | 'block' | 'delete') => void;
}) {
  const cardBg = restaurant.status === 'PENDING' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' :
                 restaurant.status === 'BLOCKED' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200';

  return (
    <Card hover className={cn('transition-all duration-300 animate-fade-in', cardBg)} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Mail className="h-3 w-3" />
                <span>{restaurant.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={restaurant.status} />
            <div className={cn('w-3 h-3 rounded-full', restaurant.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg text-sm">
          <InfoRow icon={<Phone className="h-3 w-3" />} label="Téléphone" value={restaurant.phone} />
          <InfoRow icon={<MapPin className="h-3 w-3" />} label="Adresse" value={restaurant.address} truncate />
          <InfoRow icon={<Calendar className="h-3 w-3" />} label="Inscription" value={format(restaurant.registrationDate, 'dd MMM yyyy', { locale: fr })} />
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Catégorie:</span>
            <Badge className="bg-blue-100 text-blue-700">{restaurant.category}</Badge>
          </div>
        </div>

        {/* Pending Alert */}
        {restaurant.status === 'PENDING' && (
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800 text-sm">Action requise</span>
            </div>
            <p className="text-xs text-orange-700 mb-3">Ce restaurant attend votre validation.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="success" onClick={() => onAction(restaurant, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />Approuver
              </Button>
              <Button size="sm" variant="danger" onClick={() => onAction(restaurant, 'block')} className="flex-1 bg-red-600 hover:bg-red-700 text-xs">
                <XCircle className="h-3 w-3 mr-1" />Rejeter
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
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
            <Button size="sm" variant="success" onClick={() => onAction(restaurant, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" />Débloquer
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => onAction(restaurant, 'delete')} className="flex-1">
            <Trash2 className="h-4 w-4 mr-1" />Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Restaurant['status'] }) {
  const variants: Record<string, { variant: 'warning' | 'success' | 'danger'; label: string }> = {
    PENDING: { variant: 'warning', label: '⏳ En attente' },
    APPROVED: { variant: 'success', label: '✅ Approuvé' },
    BLOCKED: { variant: 'danger', label: '🚫 Bloqué' },
  };
  const { variant, label } = variants[status] || { variant: 'default', label: 'Inconnu' };
  return <Badge variant={variant} className={status === 'PENDING' ? 'animate-pulse' : ''}>{label}</Badge>;
}

function InfoRow({ icon, label, value, truncate }: { icon: React.ReactNode; label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 flex items-center gap-1">{icon}<span>{label}:</span></span>
      <span className={cn('font-medium text-gray-900', truncate && 'text-right max-w-[60%] truncate')}>{value}</span>
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
          <Badge className="bg-blue-100 text-blue-700">{restaurant.category}</Badge>
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
      <Section title="Horaires d'ouverture">
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
    approve: { emoji: '✅', title: 'Approuver ce restaurant ?', btnClass: 'bg-green-600 hover:bg-green-700' },
    block: { emoji: '🚫', title: 'Bloquer ce restaurant ?', btnClass: 'bg-red-600 hover:bg-red-700' },
    delete: { emoji: '🗑️', title: 'Supprimer ce restaurant ?', btnClass: 'bg-red-600 hover:bg-red-700' },
  };
  const { emoji, title, btnClass } = config[actionType];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-4">{emoji}</div>
        <p className="text-lg font-medium text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-600">Restaurant: <span className="font-medium">{restaurant.name}</span></p>
        {actionType === 'delete' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">⚠️ Cette action est irréversible.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="secondary">Annuler</Button>
        <Button onClick={onConfirm} className={cn('text-white', btnClass)}>
          {actionType === 'approve' ? 'Approuver' : actionType === 'block' ? 'Bloquer' : 'Supprimer'}
        </Button>
      </div>
    </div>
  );
}

export default RestaurantsManagementPage;
