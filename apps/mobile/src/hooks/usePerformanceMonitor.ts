import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, InteractionManager } from 'react-native';

// Types pour le monitoring de performance
interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  jsHeapSize?: number;
  navigationTime?: number;
  imageLoadTime?: number;
  apiResponseTime?: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'render' | 'interaction' | 'navigation' | 'api' | 'image';
  metadata?: Record<string, any>;
}

// Store global pour les métriques de performance
class PerformanceStore {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 100;

  addEntry(entry: PerformanceEntry) {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getEntries(type?: string): PerformanceEntry[] {
    if (type) {
      return this.entries.filter(entry => entry.type === type);
    }
    return [...this.entries];
  }

  getAverageTime(type: string): number {
    const entries = this.getEntries(type);
    if (entries.length === 0) return 0;
    
    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return totalTime / entries.length;
  }

  getMetrics(): PerformanceMetrics {
    return {
      renderTime: this.getAverageTime('render'),
      interactionTime: this.getAverageTime('interaction'),
      navigationTime: this.getAverageTime('navigation'),
      apiResponseTime: this.getAverageTime('api'),
      imageLoadTime: this.getAverageTime('image'),
    };
  }

  clear() {
    this.entries = [];
  }
}

const performanceStore = new PerformanceStore();

// Hook pour mesurer le temps de rendu des composants
export const useRenderTime = (componentName: string, enabled = __DEV__) => {
  const renderStartTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  // Marquer le début du render (s'exécute à chaque render, avant useEffect)
  renderStartTime.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    if (!enabled) return;

    const endTime = performance.now();
    const duration = endTime - renderStartTime.current;

    // Stocker dans ref au lieu de state pour éviter la boucle infinie
    lastRenderTime.current = duration;

    performanceStore.addEntry({
      name: componentName,
      startTime: renderStartTime.current,
      duration,
      type: 'render',
      metadata: { component: componentName, renderCount: renderCount.current }
    });

    if (duration > 16) { // Plus de 16ms = problème potentiel à 60fps
      console.warn(`⚠️ Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }); // Pas de dépendances pour mesurer chaque render, mais pas de setState

  // Retourne une fonction pour obtenir le dernier temps de rendu
  return lastRenderTime.current;
};

// Hook pour mesurer les interactions utilisateur
export const useInteractionTime = () => {
  const measureInteraction = useCallback((interactionName: string, callback: () => void | Promise<void>) => {
    const startTime = performance.now();
    
    const measure = async () => {
      try {
        await callback();
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        performanceStore.addEntry({
          name: interactionName,
          startTime,
          duration,
          type: 'interaction',
          metadata: { interaction: interactionName }
        });

        if (duration > 100) { // Plus de 100ms = interaction lente
          console.warn(`⚠️ Slow interaction: ${interactionName} took ${duration.toFixed(2)}ms`);
        }
      }
    };

    measure();
  }, []);

  return { measureInteraction };
};

// Hook pour mesurer les temps de navigation
export const useNavigationTime = () => {
  const measureNavigation = useCallback((routeName: string, navigationFn: () => void) => {
    const startTime = performance.now();
    
    navigationFn();
    
    // Mesurer après que l'interaction soit terminée
    InteractionManager.runAfterInteractions(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceStore.addEntry({
        name: routeName,
        startTime,
        duration,
        type: 'navigation',
        metadata: { route: routeName }
      });

      if (duration > 500) { // Plus de 500ms = navigation lente
        console.warn(`⚠️ Slow navigation: ${routeName} took ${duration.toFixed(2)}ms`);
      }
    });
  }, []);

  return { measureNavigation };
};

// Hook pour mesurer les temps de chargement d'API
export const useAPITime = () => {
  const measureAPI = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceStore.addEntry({
        name: apiName,
        startTime,
        duration,
        type: 'api',
        metadata: { api: apiName, success: true, ...metadata }
      });

      if (duration > 2000) { // Plus de 2s = API lente
        console.warn(`⚠️ Slow API call: ${apiName} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceStore.addEntry({
        name: apiName,
        startTime,
        duration,
        type: 'api',
        metadata: { api: apiName, success: false, error: String(error), ...metadata }
      });

      throw error;
    }
  }, []);

  return { measureAPI };
};

// Hook pour mesurer les temps de chargement d'images
export const useImageLoadTime = () => {
  const measureImageLoad = useCallback((imageName: string, onLoad?: () => void) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceStore.addEntry({
        name: imageName,
        startTime,
        duration,
        type: 'image',
        metadata: { image: imageName }
      });

      if (duration > 3000) { // Plus de 3s = image lente
        console.warn(`⚠️ Slow image load: ${imageName} took ${duration.toFixed(2)}ms`);
      }

      onLoad?.();
    };
  }, []);

  return { measureImageLoad };
};

// Hook pour obtenir les métriques de performance
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => performanceStore.getMetrics());

  const refreshMetrics = useCallback(() => {
    setMetrics(performanceStore.getMetrics());
  }, []);

  const clearMetrics = useCallback(() => {
    performanceStore.clear();
    setMetrics({
      renderTime: 0,
      interactionTime: 0,
      navigationTime: 0,
      apiResponseTime: 0,
      imageLoadTime: 0,
    });
  }, []);

  const getDetailedMetrics = useCallback(() => {
    return {
      all: performanceStore.getEntries(),
      render: performanceStore.getEntries('render'),
      interaction: performanceStore.getEntries('interaction'),
      navigation: performanceStore.getEntries('navigation'),
      api: performanceStore.getEntries('api'),
      image: performanceStore.getEntries('image'),
    };
  }, []);

  return {
    metrics,
    refreshMetrics,
    clearMetrics,
    getDetailedMetrics,
  };
};

// Hook pour détecter les problèmes de performance
export const usePerformanceAlert = (thresholds = {
  render: 16,
  interaction: 100,
  navigation: 500,
  api: 2000,
  image: 3000,
}) => {
  const [alerts, setAlerts] = useState<string[]>([]);

  const checkPerformance = useCallback(() => {
    const metrics = performanceStore.getMetrics();
    const newAlerts: string[] = [];

    Object.entries(thresholds).forEach(([type, threshold]) => {
      const value = metrics[type as keyof PerformanceMetrics];
      if (value && value > threshold) {
        newAlerts.push(`${type} performance issue: ${value.toFixed(2)}ms (threshold: ${threshold}ms)`);
      }
    });

    setAlerts(newAlerts);
    return newAlerts;
  }, [thresholds]);

  return { alerts, checkPerformance };
};

// Hook pour monitorer la mémoire (Web uniquement)
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used?: number;
    total?: number;
    percentage?: number;
  }>({});

  const checkMemory = useCallback(() => {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const total = memory.totalJSHeapSize / 1024 / 1024; // MB
      const percentage = (used / total) * 100;

      const info = { used, total, percentage };
      setMemoryInfo(info);

      if (percentage > 85) {
        console.warn(`⚠️ High memory usage: ${percentage.toFixed(1)}% (${used.toFixed(1)}MB/${total.toFixed(1)}MB)`);
      }

      return info;
    }
    return null;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [checkMemory]);

  return { memoryInfo, checkMemory };
};

// Hook pour optimiser les re-rendus avec performance tracking
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  name?: string
): T => {
  const callbackName = name || 'anonymous';
  
  return useCallback((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = callback(...args);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 5) { // Plus de 5ms = callback coûteux
      console.warn(`⚠️ Expensive callback: ${callbackName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }, deps) as T;
};

// Utilitaire pour logger les performances en développement
export const logPerformanceReport = () => {
  if (!__DEV__) return;

  const metrics = performanceStore.getMetrics();
  const entries = performanceStore.getEntries();

  console.group('📊 Performance Report');
  console.table(metrics);
  
  console.group('🔍 Detailed Metrics');
  console.log('Total entries:', entries.length);
  console.log('Slow renders (>16ms):', entries.filter(e => e.type === 'render' && e.duration > 16).length);
  console.log('Slow interactions (>100ms):', entries.filter(e => e.type === 'interaction' && e.duration > 100).length);
  console.log('Slow navigations (>500ms):', entries.filter(e => e.type === 'navigation' && e.duration > 500).length);
  console.log('Slow API calls (>2s):', entries.filter(e => e.type === 'api' && e.duration > 2000).length);
  console.log('Slow images (>3s):', entries.filter(e => e.type === 'image' && e.duration > 3000).length);
  console.groupEnd();
  
  console.groupEnd();
};