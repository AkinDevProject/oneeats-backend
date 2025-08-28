import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Download, Ban, Eye, Users, UserPlus, Shield, User, Activity, Calendar, Mail, TrendingUp, BarChart3, RefreshCcw, EyeOff, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../components/ui/Table';
import { mockUsers } from '../../data/mockData';

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Rôle', 'Date d\'inscription', 'Nb commandes', 'Statut'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        format(user.createdAt, 'dd/MM/yyyy'),
        user.ordersCount?.toString() || '0',
        user.status || 'active'
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
    admins: users.filter(u => u.role === 'admin').length,
    restaurants: users.filter(u => u.role === 'restaurant').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
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
              <select className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none">
                <option>Tous les rôles</option>
                <option>Administrateurs</option>
                <option>Restaurateurs</option>
              </select>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
            <Button variant="primary" icon={<UserPlus className="h-4 w-4" />}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Administrateurs</p>
                  <p className="text-3xl font-bold">{stats.admins}</p>
                  <p className="text-blue-200 text-xs mt-1">Super utilisateurs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Restaurateurs</p>
                  <p className="text-3xl font-bold">{stats.restaurants}</p>
                  <p className="text-green-200 text-xs mt-1">Partenaires actifs</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Actifs</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                  <p className="text-orange-200 text-xs mt-1">En ligne récemment</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-700 to-gray-800 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Inactifs</p>
                  <p className="text-3xl font-bold">{stats.inactive}</p>
                  <p className="text-gray-400 text-xs mt-1">Comptes suspendus</p>
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
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
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
          {filteredUsers.map((user, index) => (
            <Card 
              key={user.id} 
              hover
              className={`transition-all duration-300 ${
                user.status === 'inactive' ? 'border-danger-200 bg-gradient-to-br from-danger-50 to-danger-100' :
                user.role === 'admin' ? 'border-secondary-200 bg-gradient-to-br from-secondary-50 to-secondary-100' :
                'border-gray-200'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      user.role === 'admin' ? 'bg-secondary-100' : 'bg-primary-100'
                    }`}>
                      {user.role === 'admin' ? 
                        <Shield className="h-6 w-6 text-secondary-600" /> :
                        <User className="h-6 w-6 text-primary-600" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'info'} size="sm">
                      {user.role === 'admin' ? 'Admin' : 'Restaurant'}
                    </Badge>
                    <Badge 
                      variant={user.status === 'active' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
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
                      <TrendingUp className="h-3 w-3" />
                      <span>Commandes:</span>
                    </span>
                    <Badge variant="info" size="sm">
                      {user.ordersCount || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernière activité:</span>
                    <span className="font-medium text-gray-900">
                      Il y a 2h
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    icon={<Eye className="h-4 w-4" />} 
                    className="flex-1"
                  >
                    Voir profil
                  </Button>
                  <Button 
                    size="sm" 
                    variant={user.status === 'active' ? 'warning' : 'success'}
                    icon={<Ban className="h-4 w-4" />}
                    onClick={() => handleToggleStatus(user.id)}
                    className="flex-1"
                  >
                    {user.status === 'active' ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default UsersPage;