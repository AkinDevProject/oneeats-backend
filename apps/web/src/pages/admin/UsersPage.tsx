import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Download, Ban, Eye, Users, UserPlus, Shield, User, Activity, Calendar, Mail, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Gérez les utilisateurs de votre plateforme</span>
          </p>
        </div>
        <Button variant="primary" icon={<UserPlus className="h-4 w-4" />}>
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card hover className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-700">{stats.total}</div>
          <div className="text-xs text-primary-600">Total</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-700">{stats.admins}</div>
          <div className="text-xs text-secondary-600">Admins</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <div className="flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-warning-700">{stats.restaurants}</div>
          <div className="text-xs text-warning-600">Restaurants</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.active}</div>
          <div className="text-xs text-success-600">Actifs</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <div className="flex items-center justify-center mb-2">
            <Ban className="h-6 w-6 text-danger-600" />
          </div>
          <div className="text-2xl font-bold text-danger-700">{stats.inactive}</div>
          <div className="text-xs text-danger-600">Inactifs</div>
        </Card>
      </div>

      {/* Filters and actions */}
      <Card variant="glass" className="backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full lg:w-auto">
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
            <div className="text-sm text-gray-500">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </div>
            <Button 
              onClick={handleExportCSV} 
              variant="outline"
              icon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
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
  );
};

export default UsersPage;