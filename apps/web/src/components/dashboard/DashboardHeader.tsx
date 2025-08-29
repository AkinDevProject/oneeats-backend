import React, { ReactNode } from 'react';
import { Eye, EyeOff, RefreshCw, Download } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * En-tête de dashboard responsive et réutilisable
 * Gère l'affichage mobile/desktop avec les contrôles communs
 */

interface DashboardHeaderProps {
  /** Titre principal du dashboard */
  title: string;
  /** Sous-titre ou description */
  subtitle?: string;
  /** État d'affichage des analytics */
  showAnalytics: boolean;
  /** Callback pour basculer l'affichage analytics */
  onToggleAnalytics: () => void;
  /** Période de temps sélectionnée */
  timeRange: string;
  /** Callback pour changer la période */
  onTimeRangeChange: (range: string) => void;
  /** Options de période personnalisées */
  timeRangeOptions?: { value: string; label: string }[];
  /** Actions supplémentaires à afficher */
  actions?: ReactNode;
  /** Masquer le bouton d'actualisation */
  hideRefresh?: boolean;
  /** Masquer le bouton d'export */
  hideExport?: boolean;
  /** Callback pour l'actualisation */
  onRefresh?: () => void;
  /** Callback pour l'export */
  onExport?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Options de période par défaut
 */
const defaultTimeRangeOptions = [
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' }
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  showAnalytics,
  onToggleAnalytics,
  timeRange,
  onTimeRangeChange,
  timeRangeOptions = defaultTimeRangeOptions,
  actions,
  hideRefresh = false,
  hideExport = false,
  onRefresh,
  onExport,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        
        {/* Version Mobile */}
        <div className="flex flex-col space-y-4 lg:hidden">
          {/* Titre Mobile */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Contrôles Mobile */}
          <div className="flex items-center justify-between">
            {/* Sélecteur de période */}
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Actions Mobile */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Toggle Analytics */}
              <Button
                variant={showAnalytics ? "primary" : "ghost"}
                size="sm"
                onClick={onToggleAnalytics}
                className="px-2 py-2"
                title={showAnalytics ? 'Masquer Analytics' : 'Afficher Analytics'}
              >
                {showAnalytics ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              {/* Bouton Actualiser */}
              {!hideRefresh && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 py-2"
                  onClick={onRefresh}
                  title="Actualiser"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}

              {/* Actions personnalisées */}
              {actions}
            </div>
          </div>
        </div>

        {/* Version Desktop */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Titre Desktop */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Contrôles Desktop */}
          <div className="flex items-center space-x-4">
            {/* Toggle Analytics */}
            <Button
              variant={showAnalytics ? "primary" : "ghost"}
              size="sm"
              onClick={onToggleAnalytics}
              icon={showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            >
              {showAnalytics ? 'Masquer Analytics' : 'Afficher Analytics'}
            </Button>

            {/* Sélecteur de période */}
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Bouton Actualiser */}
            {!hideRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={onRefresh}
              >
                Actualiser
              </Button>
            )}

            {/* Bouton Export */}
            {!hideExport && (
              <Button 
                variant="ghost" 
                size="sm" 
                icon={<Download className="h-4 w-4" />}
                onClick={onExport}
              >
                Exporter
              </Button>
            )}

            {/* Actions personnalisées */}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;