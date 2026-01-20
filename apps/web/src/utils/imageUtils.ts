/**
 * Utilitaires pour la gestion des images et miniatures
 */

// URL de base de l'API (utilise la variable d'environnement ou l'origine actuelle)
const getApiBaseUrl = (): string => {
  // En production ou via Quinoa, utiliser l'origine actuelle
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    // Si on est sur le port Vite dev (5173), rediriger vers le backend (8080)
    if (origin.includes(':5173')) {
      return origin.replace(':5173', ':8080');
    }
    return origin;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8080';
};

/**
 * Genere l'URL d'une miniature depuis une image complete
 * Utilise le parametre size pour demander la bonne taille au backend
 *
 * Tailles disponibles:
 * - small: 150x150 (pour les listes, icones)
 * - medium: 400x400 (pour les cartes de menu)
 * - large: 800x800 (pour les modals, details)
 */
export const getThumbnailUrl = (imageUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!imageUrl) return '';

  // Si l'URL commence par /uploads/, c'est une image locale
  if (imageUrl.startsWith('/uploads/')) {
    const baseUrl = `${getApiBaseUrl()}${imageUrl}`;

    // Pour 'large', retourner l'image originale sans parametre
    if (size === 'large') {
      return baseUrl;
    }

    // Ajouter le parametre de taille pour les thumbnails
    return `${baseUrl}?size=${size}`;
  }

  // Pour les URLs externes (Unsplash, etc.), retourner l'URL originale
  // Unsplash supporte ses propres parametres de redimensionnement
  if (imageUrl.includes('unsplash.com')) {
    // Ajouter les parametres Unsplash pour optimiser la taille
    const sizeMap = {
      small: 'w=150&h=150&fit=crop',
      medium: 'w=400&h=400&fit=crop',
      large: 'w=800&h=800&fit=crop'
    };
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${sizeMap[size]}`;
  }

  return imageUrl;
};

/**
 * Génère l'URL optimisée pour les cartes de menu
 */
export const getMenuCardImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  return getThumbnailUrl(imageUrl, 'medium');
};

/**
 * Génère l'URL optimisée pour les aperçus dans les modals
 */
export const getModalPreviewImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  return getThumbnailUrl(imageUrl, 'large');
};

/**
 * Génère l'URL optimisée pour les listes et miniatures
 */
export const getListThumbnailUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  return getThumbnailUrl(imageUrl, 'small');
};

/**
 * Vérifie si un fichier est une image valide
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Vérifie si la taille du fichier est acceptable (5MB max)
 */
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Valide un fichier image (type et taille)
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!isValidImageFile(file)) {
    return {
      isValid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.'
    };
  }

  if (!isValidFileSize(file)) {
    return {
      isValid: false,
      error: 'Fichier trop volumineux. Maximum 5MB.'
    };
  }

  return { isValid: true };
};

/**
 * Crée une URL d'aperçu temporaire pour un fichier
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Libère une URL d'aperçu temporaire
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};