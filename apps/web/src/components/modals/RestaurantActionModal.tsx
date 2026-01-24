import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Ban, AlertTriangle, Store } from 'lucide-react';
import { Button } from '../ui/Button';
import { Restaurant } from '../../types';

type ActionType = 'approve' | 'reject' | 'block';

interface RestaurantActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  actionType: ActionType;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onBlock: (reason: string) => Promise<void>;
}

export const RestaurantActionModal: React.FC<RestaurantActionModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  actionType,
  onApprove,
  onReject,
  onBlock,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requiresReason = actionType === 'reject' || actionType === 'block';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresReason && !reason.trim()) {
      setError('La raison est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (actionType === 'approve') {
        await onApprove();
      } else if (actionType === 'reject') {
        await onReject(reason.trim());
      } else if (actionType === 'block') {
        await onBlock(reason.trim());
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getConfig = () => {
    switch (actionType) {
      case 'approve':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          iconBg: 'bg-green-100',
          title: 'Approuver le restaurant',
          description: 'Ce restaurant pourra commencer à recevoir des commandes.',
          buttonLabel: 'Approuver',
          buttonClass: 'bg-green-600 hover:bg-green-700',
          successMessage: 'Restaurant approuvé avec succès',
        };
      case 'reject':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          title: 'Rejeter le restaurant',
          description: 'La demande d\'inscription sera refusée.',
          buttonLabel: 'Rejeter',
          buttonClass: 'bg-red-600 hover:bg-red-700',
          successMessage: 'Restaurant rejeté',
          reasonLabel: 'Raison du rejet',
          reasonPlaceholder: 'Ex: Documents incomplets, informations incorrectes...',
        };
      case 'block':
        return {
          icon: <Ban className="h-6 w-6 text-orange-600" />,
          iconBg: 'bg-orange-100',
          title: 'Bloquer le restaurant',
          description: 'Le restaurant ne pourra plus recevoir de commandes.',
          buttonLabel: 'Bloquer',
          buttonClass: 'bg-orange-600 hover:bg-orange-700',
          successMessage: 'Restaurant bloqué',
          reasonLabel: 'Raison du blocage',
          reasonPlaceholder: 'Ex: Violation des conditions, plaintes clients...',
        };
    }
  };

  const config = getConfig();

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
          {/* Success State */}
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {config.successMessage}
              </h3>
              <p className="text-sm text-gray-600">
                {restaurant.name}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {config.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {restaurant.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Restaurant Info */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {restaurant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.email}</p>
                    <p className="text-sm text-gray-500">{restaurant.category}</p>
                  </div>
                </div>
              </div>

              {/* Warning for reject/block */}
              {requiresReason && (
                <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Attention</p>
                      <p>{config.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation for approve */}
              {actionType === 'approve' && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p>{config.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason field for reject/block */}
                {requiresReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.reasonLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={config.reasonPlaceholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
                      required
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className={`text-white ${config.buttonClass}`}
                    disabled={loading || (requiresReason && !reason.trim())}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Traitement...</span>
                      </div>
                    ) : (
                      config.buttonLabel
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
