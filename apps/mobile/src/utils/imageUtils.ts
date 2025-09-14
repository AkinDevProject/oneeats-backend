import { ENV } from '../config/env';

/**
 * Construit l'URL complète d'une image en fonction du chemin fourni par l'API
 * @param imageUrl - URL d'image fournie par l'API (peut être relative ou absolue)
 * @param fallbackUrl - URL de fallback si aucune image n'est disponible
 * @returns URL complète de l'image
 */
export function buildImageUrl(
  imageUrl: string | null | undefined,
  fallbackUrl = 'https://via.placeholder.com/400x300'
): string {
  // Si pas d'image, utiliser le fallback
  if (!imageUrl) {
    return fallbackUrl;
  }

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Si c'est un chemin relatif vers les uploads, construire l'URL complète
  if (imageUrl.startsWith('/uploads')) {
    const baseUrl = ENV.API_URL.replace('/api', ''); // Enlever /api pour avoir l'URL de base
    return `${baseUrl}${imageUrl}`;
  }

  // Pour tout autre chemin relatif, construire l'URL complète
  if (imageUrl.startsWith('/')) {
    const baseUrl = ENV.API_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }

  // Si c'est un nom de fichier seul, l'ajouter au dossier uploads
  const baseUrl = ENV.API_URL.replace('/api', '');
  return `${baseUrl}/uploads/${imageUrl}`;
}

/**
 * Construit l'URL d'image pour un restaurant
 * @param imageUrl - URL d'image fournie par l'API
 * @returns URL complète de l'image restaurant
 */
export function buildRestaurantImageUrl(imageUrl: string | null | undefined): string {
  return buildImageUrl(imageUrl, 'https://via.placeholder.com/400x300');
}

/**
 * Construit l'URL d'image pour un item de menu
 * @param imageUrl - URL d'image fournie par l'API
 * @returns URL complète de l'image menu item
 */
export function buildMenuItemImageUrl(imageUrl: string | null | undefined): string {
  return buildImageUrl(imageUrl, 'https://via.placeholder.com/300x300');
}