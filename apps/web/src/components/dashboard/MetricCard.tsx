import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

/**
 * Composant de carte métrique réutilisable
 * Utilisé dans les dashboards pour afficher les KPIs de manière cohérente
 */

interface MetricCardProps {
  /** Icône à afficher en haut à gauche */
  icon: LucideIcon;
  /** Valeur principale à afficher */
  value: string | number;
  /** Label/nom de la métrique */
  label: string;
  /** Pourcentage de changement (optionnel) */
  change?: string;
  /** Couleur du thème de la carte */
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  /** Active l'animation sur hover */
  animate?: boolean;
  /** Format de la valeur (monétaire, pourcentage, etc.) */
  valueFormat?: 'currency' | 'percentage' | 'number';
  /** Description supplémentaire */
  description?: string;
}

/**
 * Configuration des couleurs pour chaque thème
 */
const colorConfig = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    text: 'text-blue-100',
    changePositive: 'text-blue-200',
    changeNegative: 'text-blue-300'
  },
  green: {
    gradient: 'from-green-500 to-green-600', 
    text: 'text-green-100',
    changePositive: 'text-green-200',
    changeNegative: 'text-green-300'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    text: 'text-purple-100', 
    changePositive: 'text-purple-200',
    changeNegative: 'text-purple-300'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    text: 'text-orange-100',
    changePositive: 'text-orange-200', 
    changeNegative: 'text-orange-300'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    text: 'text-red-100',
    changePositive: 'text-red-200',
    changeNegative: 'text-red-300'
  },
  yellow: {
    gradient: 'from-yellow-500 to-yellow-600',
    text: 'text-yellow-100',
    changePositive: 'text-yellow-200',
    changeNegative: 'text-yellow-300'
  }
};

/**
 * Formate la valeur selon le format spécifié
 */
const formatValue = (value: string | number, format?: MetricCardProps['valueFormat']): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return `€${value.toLocaleString('fr-FR')}`;
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return value.toLocaleString('fr-FR');
  }
};

/**
 * Détermine si le changement est positif ou négatif
 */
const getChangeColor = (change: string, colors: typeof colorConfig.blue): string => {
  if (change.startsWith('+')) return colors.changePositive;
  if (change.startsWith('-')) return colors.changeNegative;
  return colors.changePositive;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  value,
  label,
  change,
  color,
  animate = true,
  valueFormat = 'number',
  description
}) => {
  const colors = colorConfig[color];
  
  return (
    <Card 
      className={`
        p-6 bg-gradient-to-br ${colors.gradient} text-white 
        ${animate ? 'transform transition-all duration-200 hover:scale-105 hover:shadow-lg' : ''}
        cursor-default
      `}
    >
      {/* Header avec icône */}
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8" />
        {change && (
          <div className={`text-sm font-medium ${getChangeColor(change, colors)}`}>
            {change}
          </div>
        )}
      </div>

      {/* Valeur principale */}
      <div className="mb-2">
        <div className="text-3xl font-bold">
          {formatValue(value, valueFormat)}
        </div>
      </div>

      {/* Label */}
      <div className={`${colors.text} font-medium`}>
        {label}
      </div>

      {/* Description optionnelle */}
      {description && (
        <div className={`text-xs ${colors.text} mt-2 opacity-90`}>
          {description}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;