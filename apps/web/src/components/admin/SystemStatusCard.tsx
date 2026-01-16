import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Database, Globe, Shield, Activity } from 'lucide-react';

type StatusType = 'success' | 'warning' | 'error';

interface SystemStatus {
  id: string;
  label: string;
  sublabel: string;
  status: StatusType;
  icon?: React.ReactNode;
}

interface SystemStatusCardProps {
  title?: string;
  statuses?: SystemStatus[];
  className?: string;
}

const defaultStatuses: SystemStatus[] = [
  { id: 'db', label: 'Base de données', sublabel: 'Opérationnelle', status: 'success', icon: <Database className="h-8 w-8" /> },
  { id: 'api', label: 'API Services', sublabel: 'Tous en ligne', status: 'success', icon: <Globe className="h-8 w-8" /> },
  { id: 'security', label: 'Sécurité', sublabel: 'Protégé', status: 'success', icon: <Shield className="h-8 w-8" /> },
  { id: 'monitoring', label: 'Monitoring', sublabel: 'Actif', status: 'success', icon: <Activity className="h-8 w-8" /> },
];

const statusColors: Record<StatusType, { bg: string; border: string; text: string; subtext: string; icon: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', subtext: 'text-green-700', icon: 'text-green-600' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', subtext: 'text-yellow-700', icon: 'text-yellow-600' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', subtext: 'text-red-700', icon: 'text-red-600' },
};

/**
 * SystemStatusCard - Affichage de l'état du système
 * Montre les différents composants système avec leur statut
 */
export function SystemStatusCard({
  title = 'État du Système',
  statuses = defaultStatuses,
  className,
}: SystemStatusCardProps) {
  const allHealthy = statuses.every((s) => s.status === 'success');

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full animate-pulse',
            allHealthy ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className={cn(
            'text-sm font-medium',
            allHealthy ? 'text-green-700' : 'text-yellow-700'
          )}>
            {allHealthy ? 'Système opérationnel' : 'Attention requise'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => {
          const colors = statusColors[status.status];
          return (
            <div
              key={status.id}
              className={cn(
                'rounded-lg p-4 border',
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-center gap-3">
                <div className={colors.icon}>
                  {status.icon}
                </div>
                <div>
                  <div className={cn('font-bold', colors.text)}>{status.label}</div>
                  <div className={cn('text-sm', colors.subtext)}>{status.sublabel}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default SystemStatusCard;
