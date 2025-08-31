import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { OrderProvider } from '../src/contexts/OrderContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '../src/contexts/ThemeContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant interne avec accès au thème
function AppContent() {
  const colorScheme = useColorScheme();
  const { currentTheme, selectedTheme } = useAppTheme();

  return (
    <PaperProvider theme={currentTheme} key={selectedTheme}>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <OrderProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/index" options={{ headerShown: false }} />
                  <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="designs" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" backgroundColor={currentTheme.colors.background} />
              </ThemeProvider>
            </OrderProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AppContent />
        </AppThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
