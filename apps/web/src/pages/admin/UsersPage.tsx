import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Download, Ban, Eye, Users, UserPlus, Shield, User as UserIcon, Activity, Calendar, Mail, TrendingUp, BarChart3, RefreshCcw, EyeOff, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../components/ui/Table';
import { useUsers } from '../../hooks/data/useUsers';
import { User, UserStatus, CreateUserRequest, UpdateUserRequest } from '../../types';
import { UserModal } from '../../components/modals/UserModal';

const UsersPage: React.FC = () => {
  const { users, loading, error, updateUserStatus, createUser, updateUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    user?: User | null;
  }>({
    isOpen: false,
    mode: 'create',
    user: null,
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="text-center py-16 border-danger-200 bg-danger-50">
          <Users className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{error}</p>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserStatus(userId, newStatus);
      // Optionally show success message
      console.log(`Statut utilisateur mis à jour vers ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut utilisateur. Veuillez réessayer.');
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', user?: User) => {
    setModalState({
      isOpen: true,
      mode,
      user: user || null,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      user: null,
    });
  };

  const handleModalSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (modalState.mode === 'create') {
      await createUser(data as CreateUserRequest);
    } else if (modalState.mode === 'edit' && modalState.user) {
      await updateUser(modalState.user.id, data as UpdateUserRequest);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Prénom', 'Nom', 'Email', 'Date d\'inscription', 'Statut'],
      ...filteredUsers.map(user => [
        user.firstName,
        user.lastName,
        user.email,
        format(user.createdAt, 'dd/MM/yyyy'),
        user.status
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'utilisateurs.csv';
    link.click();
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    inactive: users.filter(u => u.status === 'INACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Style Data-Driven */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Gestion Utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              Supervision intelligente • Gestion avancée • Analyse comportementale
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
                <option value="SUSPENDED">Suspendus</option>
              </select>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
            <Button
              variant="primary"
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => handleOpenModal('create')}
            >
              Nouvel utilisateur
            </Button>
            <button 
              onClick={handleExportCSV} 
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
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
                  <p className="text-purple-100 text-sm font-medium">Total Utilisateurs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-purple-200 text-xs mt-1">Base utilisateurs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Actifs</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                  <p className="text-green-200 text-xs mt-1">Utilisateurs actifs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Inactifs</p>
                  <p className="text-3xl font-bold">{stats.inactive}</p>
                  <p className="text-gray-200 text-xs mt-1">Comptes inactifs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <EyeOff className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Suspendus</p>
                  <p className="text-3xl font-bold">{stats.suspended}</p>
                  <p className="text-red-200 text-xs mt-1">Comptes suspendus</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Ban className="h-6 w-6" />
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
                <h3 className="text-lg font-semibold text-gray-900">Recherche et Filtres Avancés</h3>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou rôle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ACTIVE">Actifs</option>
                    <option value="INACTIVE">Inactifs</option>
                    <option value="SUSPENDED">Suspendus</option>
                  </select>

                  {statusFilter !== 'ALL' && (
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Effacer filtres
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
                  {statusFilter !== 'ALL' && (
                    <span className="ml-2 text-purple-600 font-medium">
                      • Filtre: {statusFilter === 'ACTIVE' ? 'Actifs' : statusFilter === 'INACTIVE' ? 'Inactifs' : 'Suspendus'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-16 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <Users className="h-16 w-16 text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Les nouveaux utilisateurs apparaîtront ici'
                }
              </p>
            </div>
            {(searchTerm || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="mt-4"
              >
                Effacer tous les filtres
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <Card 
              key={user.id} 
              hover
              className={`transition-all duration-300 ${
                user.status === 'INACTIVE' ? 'border-danger-200 bg-gradient-to-br from-danger-50 to-danger-100' :
                user.status === 'SUSPENDED' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' :
                'border-gray-200'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={user.status === 'ACTIVE' ? 'success' : user.status === 'INACTIVE' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {user.status === 'ACTIVE' ? 'Actif' : user.status === 'INACTIVE' ? 'Inactif' : 'Suspendu'}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Inscription:</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(user.createdAt, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Dernière MAJ:</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(user.updatedAt, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut:</span>
                    <Badge
                      variant={user.status === 'ACTIVE' ? 'success' : user.status === 'INACTIVE' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {user.status}
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
                    onClick={() => handleOpenModal('view', user)}
                  >
                    Voir profil
                  </Button>
                  <Button
                    size="sm"
                    variant={user.status === 'ACTIVE' ? 'warning' : 'success'}
                    icon={<Ban className="h-4 w-4" />}
                    onClick={() => handleToggleStatus(user.id)}
                    className="flex-1"
                  >
                    {user.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        user={modalState.user}
        mode={modalState.mode}
      />
      </div>
    </div>
  );
};

export default UsersPage;