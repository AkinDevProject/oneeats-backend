import React, { useState } from 'react';
import { X, Ban, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { User, SuspendUserRequest } from '../../types';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SuspendUserRequest) => Promise<void>;
  user: User;
}

type DurationOption = {
  label: string;
  value: number | null;
  description: string;
};

const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 jour', value: 1, description: 'Suspension temporaire courte' },
  { label: '7 jours', value: 7, description: 'Suspension d\'une semaine' },
  { label: '30 jours', value: 30, description: 'Suspension d\'un mois' },
  { label: 'Indéfinie', value: null, description: 'Jusqu\'à réactivation manuelle' },
];

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [reason, setReason] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('La raison de suspension est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        reason: reason.trim(),
        durationDays: selectedDuration ?? undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setSelectedDuration(7);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suspension');
    } finally {
      setLoading(false);
    }
  };

  const getEndDate = () => {
    if (selectedDuration === null) return 'Indéfinie';
    const endDate = addDays(new Date(), selectedDuration);
    return format(endDate, 'dd MMMM yyyy à HH:mm', { locale: fr });
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
          {/* Success State */}
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Utilisateur suspendu
              </h3>
              <p className="text-sm text-gray-600">
                {user.firstName} {user.lastName} a été suspendu avec succès.
                {selectedDuration && (
                  <span className="block mt-1">
                    Fin de suspension: {getEndDate()}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Ban className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Suspendre l'utilisateur
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
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

              {/* Warning */}
              <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Attention</p>
                    <p>L'utilisateur ne pourra plus se connecter ni passer de commandes pendant la suspension.</p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Décrivez la raison de la suspension..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                    required
                  />
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Durée de la suspension
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATION_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setSelectedDuration(option.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedDuration === option.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* End Date Preview */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fin de suspension:</span>
                    <span className="font-medium text-gray-900">
                      {getEndDate()}
                    </span>
                  </div>
                </div>

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
                    variant="danger"
                    icon={loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    disabled={loading || !reason.trim()}
                  >
                    {loading ? 'Suspension...' : 'Suspendre'}
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
