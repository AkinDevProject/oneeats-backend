import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CartProvider } from '../contexts/CartContext';
import { OrderProvider } from '../contexts/OrderContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { PushNotificationProvider } from '../contexts/PushNotificationContext';

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: '#6750a4',
    onPrimary: '#ffffff',
    primaryContainer: '#eaddff',
    onPrimaryContainer: '#21005d',
    secondary: '#625b71',
    onSecondary: '#ffffff',
    secondaryContainer: '#e8def8',
    onSecondaryContainer: '#1d192b',
    tertiary: '#7d5260',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffd8e4',
    onTertiaryContainer: '#31111d',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    background: '#fffbfe',
    onBackground: '#1c1b1f',
    surface: '#fffbfe',
    onSurface: '#1c1b1f',
    surfaceVariant: '#e7e0ec',
    onSurfaceVariant: '#49454f',
    outline: '#79747e',
    outlineVariant: '#cab6cf',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#f4eff4',
    inversePrimary: '#d0bcff',
    elevation: {
      level0: 'transparent',
      level1: '#f7f2fa',
      level2: '#f1edf7',
      level3: '#ebe6f4',
      level4: '#e8e3f1',
      level5: '#e4dfee',
    },
  },
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <PaperProvider theme={mockTheme}>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <OrderProvider>
                <PushNotificationProvider>
                  {children}
                </PushNotificationProvider>
              </OrderProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };