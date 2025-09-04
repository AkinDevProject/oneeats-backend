import React, { lazy } from 'react';

// Lazy load des composants lourds pour améliorer le temps de démarrage initial
export const LazyCartScreen = lazy(() => import('../app/(tabs)/cart'));
export const LazyProfileScreen = lazy(() => import('../app/(tabs)/profile'));
export const LazyRestaurantScreen = lazy(() => import('../app/restaurant/[id]'));
export const LazyMenuScreen = lazy(() => import('../app/menu/[id]'));
export const LazyDesignSelector = lazy(() => import('../app/designs/design-selector'));