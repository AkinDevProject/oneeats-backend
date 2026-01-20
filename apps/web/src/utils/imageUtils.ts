/**
 * Utilitaires pour la gestion des images et miniatures
 */

/**
 * Génère l'URL d'une miniature depuis une image complète
 * Pour l'instant, utilise l'image originale avec le FileController
 */
export const getThumbnailUrl = (imageUrl: string, _size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!imageUrl) return '';

  // Si l'URL commence par /uploads/, c'est une image locale
  if (imageUrl.startsWith('/uploads/')) {
    // Convertir l'URL vers le bon format pour le FileController
    // De: /uploads/menu-items/filename.jpg
    // Vers: http://localhost:8080/uploads/menu-items/filename.jpg
    // Note: _size parameter reserved for future thumbnail generation support
    return `http://localhost:8080${imageUrl}`;
  }

  // Pour les URLs externes, retourner l'URL originale
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