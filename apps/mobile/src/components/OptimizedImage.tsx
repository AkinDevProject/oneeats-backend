import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  ImageStyle,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { Surface, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Cache simple en mémoire pour les images
const imageCache = new Map<string, string>();
const failedImages = new Set<string>();

interface OptimizedImageProps {
  source: string | ImageSourcePropType;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  showRetry?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
  // Options d'optimisation
  quality?: 'low' | 'medium' | 'high';
  priority?: 'low' | 'normal' | 'high';
  lazy?: boolean;
  preload?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  containerStyle,
  placeholder,
  fallback,
  showRetry = true,
  resizeMode = 'cover',
  onLoad,
  onError,
  quality = 'medium',
  priority = 'normal',
  lazy = true,
  preload = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const imageUrl = typeof source === 'string' ? source : '';
  const maxRetries = 2;

  // Générer l'URL optimisée basée sur la qualité
  const getOptimizedUrl = useCallback((url: string, quality: string): string => {
    if (!url || typeof url !== 'string') return url;
    
    // Si c'est une URL externe, on peut ajouter des paramètres d'optimisation
    if (url.startsWith('http')) {
      // Simuler une optimisation d'image (par exemple avec un service comme Cloudinary)
      const qualityParams = {
        low: 'q_30,f_auto',
        medium: 'q_70,f_auto',
        high: 'q_90,f_auto',
      };
      
      // Pour une vraie implémentation, vous pourriez ajouter :
      // return url.replace(/\.(jpg|jpeg|png)/, `_${qualityParams[quality]}.$1`);
    }
    
    return url;
  }, []);

  const optimizedUrl = getOptimizedUrl(imageUrl, quality);

  // Vérifier le cache
  const getCachedImage = useCallback((url: string): string | undefined => {
    return imageCache.get(url);
  }, []);

  const setCachedImage = useCallback((url: string, cachedUrl: string) => {
    if (imageCache.size > 100) {
      // Nettoyer le cache si il devient trop grand
      const firstKey = imageCache.keys().next().value;
      if (firstKey) imageCache.delete(firstKey);
    }
    imageCache.set(url, cachedUrl);
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    
    // Mettre en cache
    if (optimizedUrl) {
      setCachedImage(optimizedUrl, optimizedUrl);
    }
    
    onLoad?.();
  }, [optimizedUrl, setCachedImage, onLoad]);

  const handleError = useCallback(() => {
    console.warn('Image loading failed:', optimizedUrl);
    setLoading(false);
    setError(true);
    
    // Marquer comme échec
    if (optimizedUrl) {
      failedImages.add(optimizedUrl);
    }
    
    onError?.();
  }, [optimizedUrl, onError]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setError(false);
      
      // Supprimer du cache d'échec pour permettre une nouvelle tentative
      if (optimizedUrl) {
        failedImages.delete(optimizedUrl);
        imageCache.delete(optimizedUrl);
      }
    }
  }, [retryCount, optimizedUrl]);

  // Précharger l'image si demandé
  React.useEffect(() => {
    if (preload && optimizedUrl && !getCachedImage(optimizedUrl)) {
      Image.prefetch(optimizedUrl)
        .then(() => setCachedImage(optimizedUrl, optimizedUrl))
        .catch(() => failedImages.add(optimizedUrl));
    }
  }, [preload, optimizedUrl, getCachedImage, setCachedImage]);

  // Vérifier si l'image a déjà échoué
  if (optimizedUrl && failedImages.has(optimizedUrl) && retryCount >= maxRetries) {
    return (
      <View style={[styles.container, containerStyle]}>
        {fallback || (
          <View style={[styles.fallback, style]}>
            <MaterialIcons name="broken-image" size={40} color="#ccc" />
            <Text style={styles.fallbackText}>Image non disponible</Text>
            {showRetry && (
              <IconButton
                icon="refresh"
                size={20}
                onPress={handleRetry}
              />
            )}
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.placeholder, style]}>
          {placeholder || (
            <>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.error, style]}>
          <MaterialIcons name="error-outline" size={32} color="#f44336" />
          <Text style={styles.errorText}>Erreur de chargement</Text>
          {showRetry && retryCount < maxRetries && (
            <IconButton
              icon="refresh"
              size={24}
              onPress={handleRetry}
            />
          )}
        </View>
      </View>
    );
  }

  const imageSource = typeof source === 'string' 
    ? { uri: optimizedUrl, cache: 'force-cache' as const }
    : source;

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        // Optimisations natives
        fadeDuration={300}
        progressiveRenderingEnabled={true}
        removeClippedSubviews={true}
      />
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Hook pour précharger des images
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState(new Set<string>());
  
  const preloadImages = useCallback(async (urls: string[]) => {
    const promises = urls.map(async (url) => {
      if (!preloadedImages.has(url)) {
        try {
          await Image.prefetch(url);
          imageCache.set(url, url);
          return url;
        } catch (error) {
          failedImages.add(url);
          return null;
        }
      }
      return url;
    });
    
    const results = await Promise.allSettled(promises);
    const successful = results
      .filter((result): result is PromiseFulfilledResult<string | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value!);
    
    setPreloadedImages(prev => new Set([...prev, ...successful]));
    
    return successful;
  }, [preloadedImages]);
  
  const clearPreloadCache = useCallback(() => {
    imageCache.clear();
    failedImages.clear();
    setPreloadedImages(new Set());
  }, []);
  
  return {
    preloadImages,
    clearPreloadCache,
    preloadedCount: preloadedImages.size,
    failedCount: failedImages.size,
  };
};

// Hook pour optimiser les performances d'image
export const useImageOptimization = () => {
  const getCacheStats = useCallback(() => ({
    cached: imageCache.size,
    failed: failedImages.size,
    memory: (imageCache.size * 0.1), // Estimation en MB
  }), []);
  
  const clearFailedCache = useCallback(() => {
    failedImages.clear();
  }, []);
  
  const clearImageCache = useCallback(() => {
    imageCache.clear();
  }, []);
  
  return {
    getCacheStats,
    clearFailedCache,
    clearImageCache,
  };
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    minHeight: 100,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    minHeight: 100,
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  error: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    minHeight: 100,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default OptimizedImage;