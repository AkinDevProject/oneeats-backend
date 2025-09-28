import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Save, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { User, UserStatus, CreateUserRequest, UpdateUserRequest } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit' | 'view';
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
    }
    setError(null);
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        if (!formData.password) {
          setError('Le mot de passe est requis pour créer un utilisateur');
          return;
        }
        await onSubmit({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        } as CreateUserRequest);
      } else {
        await onSubmit({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        } as UpdateUserRequest);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'SUSPENDED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'SUSPENDED': return 'Suspendu';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-md p-6 mx-auto my-8 text-left align-middle transition-all transform bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {mode === 'create' && 'Créer un utilisateur'}
                  {mode === 'edit' && 'Modifier l\'utilisateur'}
                  {mode === 'view' && 'Détails de l\'utilisateur'}
                </h3>
                {user && mode !== 'create' && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getStatusColor(user.status)} size="sm">
                      {getStatusLabel(user.status)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ID: {user.id.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                disabled={mode === 'view'}
                className="text-sm"
              />
              <Input
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                disabled={mode === 'view'}
                className="text-sm"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={mode === 'view'}
                className="pl-10 text-sm"
              />
            </div>

            {mode === 'create' && (
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Minimum 8 caractères"
                className="text-sm"
              />
            )}

            {/* User Info for View/Edit Mode */}
            {user && mode !== 'create' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Créé le:</span>
                    <div className="font-medium text-gray-900">
                      {user.createdAt.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Modifié le:</span>
                    <div className="font-medium text-gray-900">
                      {user.updatedAt.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {mode === 'view' ? 'Fermer' : 'Annuler'}
              </Button>

              {mode !== 'view' && (
                <Button
                  type="submit"
                  variant="primary"
                  icon={loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};