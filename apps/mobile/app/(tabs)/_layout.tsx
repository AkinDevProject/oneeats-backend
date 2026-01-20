import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCart } from '../../src/contexts/CartContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import AnimatedBadge from '../../src/components/ui/AnimatedBadge';

// Custom badge component for tab bar (using AnimatedBadge)
const TabBadge = ({ count, color }: { count: number; color: string }) => {
  if (count === 0) return null;

  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      zIndex: 1,
    }}>
      <AnimatedBadge count={count} color={color} size="small" />
    </View>
  );
};

// Fonction pour rendre les icônes compatibles avec toutes les plateformes
const TabIcon = ({ name, focused, color, size = 26 }: {
  name: string;
  focused: boolean;
  color: string;
  size?: number;
}) => {
  // Mapping des icônes SF Symbols vers MaterialIcons pour Android
  const iconMap: { [key: string]: string } = {
    'house': 'home',
    'house.fill': 'home',
    'bag': 'shopping-bag',
    'bag.fill': 'shopping-bag',
    'person.crop.circle': 'account-circle',
    'person.crop.circle.fill': 'account-circle',
  };

  if (Platform.OS === 'android') {
    const iconName = iconMap[name] || 'help';
    console.log(`🔧 Android icon mapping: ${name} → ${iconName}`);
    return <MaterialIcons name={iconName as any} size={size} color={color} />;
  }

  // Utiliser IconSymbol sur iOS et web
  return <IconSymbol size={size} name={name} color={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { totalItems } = useCart();
  const { unreadCount } = useNotification();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      {/* 🏠 ACCUEIL - Découverte restaurants + Favoris intégrés */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'house.fill' : 'house'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* 🛒 PANIER - Focus conversion (pas de sous-onglets) */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <MaterialIcons
                name={focused ? 'shopping-cart' : 'shopping-cart'}
                size={26}
                color={color}
              />
              {totalItems > 0 && (
                <TabBadge count={totalItems} color="#00CCBC" />
              )}
            </View>
          ),
        }}
      />

      {/* 🚫 FAVORIS - Masqué de la tab bar (accessible depuis Accueil et Compte) */}
      <Tabs.Screen
        name="favorites"
        options={{
          href: null, // Masque l'onglet de la tab bar
        }}
      />

      {/* 👤 COMPTE - Profil + Commandes + Favoris + Paramètres */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <TabIcon
                name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
                focused={focused}
                color={color}
              />
              {unreadCount > 0 && (
                <TabBadge count={unreadCount} color="#FF6D00" />
              )}
            </View>
          ),
        }}
      />

    </Tabs>
  );
}