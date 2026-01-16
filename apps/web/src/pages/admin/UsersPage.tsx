import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, Ban, Eye, Users, UserPlus, Activity, Calendar, Mail, EyeOff, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchFilter,
  AdminMetricCardSkeleton,
  AdminAlertZone,
  AdminQuickActions,
  AdminShortcutsHelp,
} from '../../components/admin';
import type { AdminAlert, QuickAction } from '../../components/admin';
import { useKeyboardShortcuts, useShortcutsHelp, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { useUsers } from '../../hooks/data/useUsers';
import { User, UserStatus, CreateUserRequest, UpdateUserRequest } from '../../types';
import { UserModal } from '../../components/modals/UserModal';

// Skeleton for user card
function UserCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 flex-1 bg-gray-200 rounded" />
          <div className="h-8 flex-1 bg-gray-200 rounded" />
        </div>
      </div>
    </Card>
  );
}

const UsersPage: React.FC = () => {
  const { users, loading, error, updateUserStatus, createUser, updateUser, refetch } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'create' | 'edit' | 'view'; user?: User | null }>({
    isOpen: false,
    mode: 'create',
    user: null,
  });

  // Shortcuts help modal
  const { isVisible: showShortcuts, toggle: toggleShortcuts, hide: closeShortcuts } = useShortcutsHelp();

  // Stats et données filtrées
  const { filteredUsers, stats } = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return {
      filteredUsers: filtered,
      stats: {
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        inactive: users.filter(u => u.status === 'INACTIVE').length,
        suspended: users.filter(u => u.status === 'SUSPENDED').length,
      }
    };
  }, [users, searchTerm, statusFilter]);

  // Alerts
  const alerts = useMemo<AdminAlert[]>(() => {
    const alertList: AdminAlert[] = [];
    if (stats.suspended > 0) {
      alertList.push({
        id: 'suspended-users',
        severity: 'critical',
        title: `${stats.suspended} compte${stats.suspended > 1 ? 's' : ''} suspendu${stats.suspended > 1 ? 's' : ''}`,
        message: 'Des comptes utilisateurs ont été suspendus et nécessitent une attention.',
        action: { label: 'Voir suspendus', onClick: () => setStatusFilter('SUSPENDED') },
      });
    }
    if (stats.inactive > 5) {
      alertList.push({
        id: 'inactive-users',
        severity: 'warning',
        title: `${stats.inactive} comptes inactifs`,
        message: 'Un nombre élevé de comptes sont marqués comme inactifs.',
        action: { label: 'Voir inactifs', onClick: () => setStatusFilter('INACTIVE') },
      });
    }
    return alertList;
  }, [stats]);

  const handleToggleStatus = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserStatus(userId, newStatus);
    } catch (e) {
      console.error('Erreur:', e);
    }
  }, [users, updateUserStatus]);

  const handleOpenModal = useCallback((mode: 'create' | 'edit' | 'view', user?: User) => {
    setModalState({ isOpen: true, mode, user: user || null });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'create', user: null });
  }, []);

  const handleModalSubmit = useCallback(async (data: CreateUserRequest | UpdateUserRequest) => {
    if (modalState.mode === 'create') await createUser(data as CreateUserRequest);
    else if (modalState.mode === 'edit' && modalState.user) await updateUser(modalState.user.id, data as UpdateUserRequest);
  }, [modalState, createUser, updateUser]);

  const handleExportCSV = useCallback(() => {
    const safeFormatDate = (date: Date | string | null | undefined) => {
      if (!date) return 'N/A';
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return format(d, 'dd/MM/yyyy');
      } catch {
        return 'N/A';
      }
    };

    const csvContent = [
      ['Prénom', 'Nom', 'Email', "Date d'inscription", 'Statut'],
      ...filteredUsers.map(user => [user.firstName, user.lastName, user.email, safeFormatDate(user.createdAt), user.status])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'utilisateurs.csv';
    link.click();
  }, [filteredUsers]);

  const handleRefresh = useCallback(() => {
    refetch?.();
  }, [refetch]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'r', ctrl: true, description: 'Actualiser', action: handleRefresh, category: 'Actions' },
    { key: 'e', ctrl: true, description: 'Exporter CSV', action: handleExportCSV, category: 'Actions' },
    { key: 'n', ctrl: true, description: 'Nouvel utilisateur', action: () => handleOpenModal('create'), category: 'Actions' },
    { key: 'a', alt: true, description: 'Filtrer: Actifs', action: () => setStatusFilter('ACTIVE'), category: 'Filtres' },
    { key: 'i', alt: true, description: 'Filtrer: Inactifs', action: () => setStatusFilter('INACTIVE'), category: 'Filtres' },
    { key: 's', alt: true, description: 'Filtrer: Suspendus', action: () => setStatusFilter('SUSPENDED'), category: 'Filtres' },
    { key: 't', alt: true, description: 'Tous les utilisateurs', action: () => setStatusFilter('ALL'), category: 'Filtres' },
    { key: '?', description: 'Aide raccourcis', action: toggleShortcuts, category: 'Navigation' },
  ], [handleRefresh, handleExportCSV, handleOpenModal, toggleShortcuts]);

  useKeyboardShortcuts(shortcuts, { enabled: !modalState.isOpen && !showShortcuts });

  // Quick actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'new-user',
      label: 'Nouvel utilisateur',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => handleOpenModal('create'),
    },
    {
      id: 'activate-all',
      label: 'Activer inactifs',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        // Activate all inactive users
        users.filter(u => u.status === 'INACTIVE').forEach(u => updateUserStatus(u.id, 'ACTIVE'));
      },
      disabled: stats.inactive === 0,
    },
  ], [handleOpenModal, users, stats.inactive, updateUserStatus]);

  // Loading with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminPageHeader
          title="Analytics Dashboard - Gestion Utilisateurs"
          subtitle="Supervision intelligente • Gestion avancée • Analyse comportementale"
        />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <AdminMetricCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <UserCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="text-center py-16 border-danger-200 bg-danger-50 max-w-md">
          <Users className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700 mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh} icon={<RefreshCcw className="h-4 w-4" />}>
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Analytics Dashboard - Gestion Utilisateurs"
        subtitle="Supervision intelligente • Gestion avancée • Analyse comportementale"
        onExport={handleExportCSV}
        onRefresh={handleRefresh}
      >
        <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => handleOpenModal('create')}>
          Nouvel utilisateur
        </Button>
      </AdminPageHeader>

      <div className="p-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <AdminAlertZone alerts={alerts} maxVisible={2} />
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Total Utilisateurs"
            value={stats.total}
            subtitle="Base utilisateurs"
            icon={<Users className="h-6 w-6" />}
            color="violet"
          />
          <AdminMetricCard
            title="Actifs"
            value={stats.active}
            subtitle="Utilisateurs actifs"
            icon={<Activity className="h-6 w-6" />}
            color="green"
            onClick={() => setStatusFilter('ACTIVE')}
          />
          <AdminMetricCard
            title="Inactifs"
            value={stats.inactive}
            subtitle="Comptes inactifs"
            icon={<EyeOff className="h-6 w-6" />}
            color="gray"
            onClick={() => setStatusFilter('INACTIVE')}
            alert={stats.inactive > 5}
          />
          <AdminMetricCard
            title="Suspendus"
            value={stats.suspended}
            subtitle="Comptes suspendus"
            icon={<Ban className="h-6 w-6" />}
            color="red"
            onClick={() => setStatusFilter('SUSPENDED')}
            alert={stats.suspended > 0}
          />
        </div>

        {/* Search & Filters */}
        <AdminSearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par nom, email..."
          resultCount={filteredUsers.length}
          resultLabel="utilisateur"
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="SUSPENDED">Suspendus</option>
          </select>
          {statusFilter !== 'ALL' && (
            <button onClick={() => setStatusFilter('ALL')} className="text-sm text-violet-600 hover:text-violet-800 font-medium">
              Effacer filtres
            </button>
          )}
        </AdminSearchFilter>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <Card className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
            </h3>
            <p className="text-gray-500">{searchTerm ? 'Essayez de modifier vos critères' : 'Les nouveaux utilisateurs apparaîtront ici'}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                onViewProfile={() => handleOpenModal('view', user)}
                onToggleStatus={() => handleToggleStatus(user.id)}
              />
            ))}
          </div>
        )}

        <UserModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSubmit={handleModalSubmit} user={modalState.user} mode={modalState.mode} />
      </div>

      {/* Quick Actions FAB */}
      <AdminQuickActions
        actions={quickActions}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
      />

      {/* Keyboard Shortcuts Help */}
      <AdminShortcutsHelp
        isVisible={showShortcuts}
        onClose={closeShortcuts}
        shortcuts={shortcuts}
      />
    </div>
  );
};

// Helper function to safely format dates
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd MMM yyyy', { locale: fr });
  } catch {
    return 'N/A';
  }
}

// Sub-components
function UserCard({ user, index, onViewProfile, onToggleStatus }: { user: User; index: number; onViewProfile: () => void; onToggleStatus: () => void }) {
  const cardBg = user.status === 'INACTIVE' ? 'border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100' :
                 user.status === 'SUSPENDED' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200';

  const statusVariant = user.status === 'ACTIVE' ? 'success' : user.status === 'INACTIVE' ? 'warning' : 'danger';
  const statusLabel = user.status === 'ACTIVE' ? 'Actif' : user.status === 'INACTIVE' ? 'Inactif' : 'Suspendu';

  return (
    <Card hover className={cn('transition-all duration-300 animate-fade-in', cardBg)} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary-100">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
        </div>

        {/* Info */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" />Inscription:</span>
            <span className="font-medium text-gray-900">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" />Dernière MAJ:</span>
            <span className="font-medium text-gray-900">{formatDate(user.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Statut:</span>
            <Badge variant={statusVariant} size="sm">{user.status}</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} className="flex-1" onClick={onViewProfile}>
            Voir profil
          </Button>
          <Button
            size="sm"
            variant={user.status === 'ACTIVE' ? 'warning' : 'success'}
            icon={<Ban className="h-4 w-4" />}
            onClick={onToggleStatus}
            className="flex-1"
          >
            {user.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default UsersPage;
