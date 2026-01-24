import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
// Import global CSS for React Native Web fixes - including title fixes
import '../assets/styles/global.css';
// Supprimer les warnings de développement sur Web
if (typeof window !== 'undefined') {
  require('../web/suppress-warnings.js');
}

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { OrderProvider } from '../src/contexts/OrderContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { PushNotificationProvider } from '../src/contexts/PushNotificationContext';
import { WebSocketProvider } from '../src/contexts/WebSocketContext';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
import { NetworkProvider } from '../src/contexts/NetworkContext';
import { OfflineBanner } from '../src/components/OfflineBanner';

// Create a client for React Query - Optimisé pour de meilleures performances
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Réduire les tentatives pour échouer plus vite
      staleTime: 10 * 60 * 1000, // 10 minutes - données restent fraîches plus longtemps
      cacheTime: 15 * 60 * 1000, // 15 minutes en cache
      refetchOnWindowFocus: false, // Pas de refetch au focus de la fenêtre
      refetchOnMount: false, // Pas de refetch au montage si données en cache
    },
  },
});

// Composant interne avec accès au thème
function AppContent() {
  const colorScheme = useColorScheme();
  const { currentTheme, selectedTheme } = useAppTheme();

  return (
    <PaperProvider theme={currentTheme} key={selectedTheme}>
      <NetworkProvider>
        <SettingsProvider>
          <AuthProvider>
            <FavoritesProvider>
              <PushNotificationProvider>
                <NotificationProvider>
                  <CartProvider>
                    <OrderProvider>
                      <WebSocketProvider>
                        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                          <OfflineBanner position="top" />
                          <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                            <Stack.Screen name="auth/debug" options={{ headerShown: false }} />
                            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                            <Stack.Screen name="designs" options={{ headerShown: false }} />
                            <Stack.Screen name="account" options={{ headerShown: false }} />
                            <Stack.Screen name="orders" options={{ headerShown: false }} />
                            <Stack.Screen name="settings" options={{ headerShown: false }} />
                            <Stack.Screen name="aide-support" options={{ headerShown: false }} />
                            <Stack.Screen name="order" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" />
                          </Stack>
                          <StatusBar style="auto" backgroundColor={currentTheme.colors.background} />
                        </ThemeProvider>
                      </WebSocketProvider>
                    </OrderProvider>
                  </CartProvider>
                </NotificationProvider>
              </PushNotificationProvider>
            </FavoritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </NetworkProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ 
      flex: 1, 
      width: '100%', 
      height: '100%',
      minHeight: '100vh',
      WebkitBoxSizing: 'border-box',
      boxSizing: 'border-box'
    }}>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AppContent />
        </AppThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
