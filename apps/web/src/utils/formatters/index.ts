/**
 * Utilitaires de formatage réutilisables
 * Centralise tous les formatages pour maintenir la cohérence
 */

/**
 * Formate un montant monétaire en euros
 * @param amount - Montant à formater
 * @param options - Options de formatage
 */
export const formatCurrency = (
  amount: number, 
  options: {
    showCents?: boolean;
    prefix?: string;
    suffix?: string;
  } = {}
): string => {
  const { showCents = false, prefix = '', suffix = '' } = options;
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(amount);
  
  return `${prefix}${formatted}${suffix}`;
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param value - Nombre à formater
 * @param options - Options de formatage
 */
export const formatNumber = (
  value: number, 
  options: {
    decimals?: number;
    suffix?: string;
    prefix?: string;
  } = {}
): string => {
  const { decimals = 0, suffix = '', prefix = '' } = options;
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
  
  return `${prefix}${formatted}${suffix}`;
};

/**
 * Formate un pourcentage
 * @param value - Valeur en décimal (0.15 = 15%)
 * @param decimals - Nombre de décimales
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formate une durée en minutes/heures
 * @param minutes - Durée en minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
};

/**
 * Formate une date relative (il y a X temps)
 * @param date - Date à formater
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return targetDate.toLocaleDateString('fr-FR');
};

/**
 * Formate une date/heure complète
 * @param date - Date à formater
 * @param options - Options de formatage
 */
export const formatDateTime = (
  date: Date | string, 
  options: {
    showTime?: boolean;
    showSeconds?: boolean;
    format?: 'short' | 'long';
  } = {}
): string => {
  const { showTime = true, showSeconds = false, format = 'short' } = options;
  const targetDate = new Date(date);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: format === 'long' ? 'long' : '2-digit',
    year: 'numeric'
  };
  
  if (showTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
    if (showSeconds) {
      dateOptions.second = '2-digit';
    }
  }
  
  return targetDate.toLocaleDateString('fr-FR', dateOptions);
};

/**
 * Formate un changement avec signe et couleur
 * @param change - Valeur du changement (ex: 15.3 pour +15.3%)
 * @param format - Format de sortie
 */
export const formatChange = (
  change: number, 
  format: 'percentage' | 'currency' | 'number' = 'percentage'
): {
  value: string;
  isPositive: boolean;
  displayValue: string;
} => {
  const isPositive = change >= 0;
  const sign = isPositive ? '+' : '';
  
  let formattedValue: string;
  
  switch (format) {
    case 'currency':
      formattedValue = formatCurrency(Math.abs(change));
      break;
    case 'number':
      formattedValue = formatNumber(Math.abs(change));
      break;
    case 'percentage':
    default:
      formattedValue = `${Math.abs(change).toFixed(1)}%`;
      break;
  }
  
  return {
    value: formattedValue,
    isPositive,
    displayValue: `${sign}${formattedValue}`
  };
};

/**
 * Formate un statut avec traduction
 * @param status - Statut technique
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    preparing: 'En préparation', 
    ready: 'Prête',
    cancelled: 'Annulée',
    delivered: 'Livrée'
  };
  
  return statusMap[status] || status;
};

/**
 * Tronque un texte avec ellipses
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Formate un nom pour l'affichage (première lettre majuscule)
 * @param name - Nom à formater
 */
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formate un numéro de téléphone français
 * @param phone - Numéro à formater
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};