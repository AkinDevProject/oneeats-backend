import React from 'react';
import { PieChart } from 'lucide-react';
import { Card } from '../ui/Card';

/**
 * Composant d'affichage de la distribution des statuts de commandes
 * Affiche les statuts avec leurs couleurs et compteurs respectifs
 */

interface StatusItem {
  /** Nom du statut affiché */
  status: string;
  /** Nombre d'éléments dans ce statut */
  count: number;
  /** Couleur hexadécimale associée au statut */
  color: string;
}

interface StatusDistributionProps {
  /** Titre de la section */
  title?: string;
  /** Données des statuts à afficher */
  statusData: StatusItem[];
  /** Masquer l'icône du titre */
  hideIcon?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback appelé quand un statut est cliqué */
  onStatusClick?: (status: StatusItem) => void;
  /** Affichage compact (sans totaux) */
  compact?: boolean;
}

/**
 * Calcule le pourcentage pour chaque statut
 */
const calculatePercentages = (statusData: StatusItem[]) => {
  const total = statusData.reduce((sum, item) => sum + item.count, 0);
  
  return statusData.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));
};

export const StatusDistribution: React.FC<StatusDistributionProps> = ({
  title = "Distribution des statuts",
  statusData,
  hideIcon = false,
  className = '',
  onStatusClick,
  compact = false
}) => {
  const dataWithPercentages = calculatePercentages(statusData);
  const totalCount = statusData.reduce((sum, item) => sum + item.count, 0);
  const hasClickHandler = Boolean(onStatusClick);

  return (
    <Card className={`p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
        {!hideIcon && <PieChart className="h-5 w-5 text-green-500" />}
      </div>
      
      {/* Liste des statuts */}
      <div className="space-y-4">
        {dataWithPercentages.map((item) => (
          <div 
            key={item.status} 
            className={`
              flex items-center justify-between group
              ${hasClickHandler ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors' : ''}
            `}
            onClick={() => onStatusClick?.(item)}
            role={hasClickHandler ? 'button' : undefined}
            tabIndex={hasClickHandler ? 0 : undefined}
            onKeyDown={(e) => {
              if (hasClickHandler && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onStatusClick?.(item);
              }
            }}
          >
            {/* Indicateur de couleur et nom du statut */}
            <div className="flex items-center space-x-3 min-w-0">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
                aria-label={`Couleur pour ${item.status}`}
              />
              <span className="text-sm font-medium text-gray-900 truncate">
                {item.status}
              </span>
            </div>
            
            {/* Compteur et pourcentage */}
            <div className="flex items-center space-x-2">
              {!compact && item.percentage > 0 && (
                <span className="text-xs text-gray-500 font-medium">
                  {item.percentage}%
                </span>
              )}
              <span 
                className="text-2xl font-bold"
                style={{ color: item.color }}
              >
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Barre de progression visuelle (optionnelle) */}
      {!compact && totalCount > 0 && (
        <div className="mt-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
            {dataWithPercentages.map((item, index) => (
              item.count > 0 && (
                <div
                  key={`${item.status}-${index}`}
                  className="h-full transition-all duration-500"
                  style={{
                    backgroundColor: item.color,
                    width: `${item.percentage}%`
                  }}
                  title={`${item.status}: ${item.count} (${item.percentage}%)`}
                />
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Total */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: {' '}
            <span className="font-medium text-gray-900">
              {totalCount} commande{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Message si aucune donnée */}
      {statusData.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <PieChart className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">
            Aucune donnée disponible
          </p>
        </div>
      )}
    </Card>
  );
};

export default StatusDistribution;