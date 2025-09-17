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
import { useOrder } from '../../src/contexts/OrderContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { Badge } from 'react-native-paper';

// Custom badge component for tab bar
const TabBadge = ({ count, color }: { count: number; color: string }) => {
  if (count === 0) return null;

  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: color,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    }}>
      <Badge
        size={16}
        style={{
          backgroundColor: color,
          color: 'white',
          fontSize: 10,
          fontWeight: 'bold'
        }}
      >
        {count > 99 ? '99+' : count.toString()}
      </Badge>
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
  const { currentOrder } = useOrder();
  const { unreadCount } = useNotification();

  console.log('🔍 TabLayout rendering on platform:', Platform.OS);
  console.log('🔍 Cart totalItems:', totalItems);
  console.log('🔍 CurrentOrder:', currentOrder ? 'exists' : 'null');
  console.log('🔍 UnreadCount:', unreadCount);

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

      {/* 🏠 ACCUEIL - Découverte restaurants */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color, focused }) => {
            console.log('🏠 Home tab icon rendering:', { color, focused, platform: Platform.OS });
            return (
              <View>
                <TabIcon
                  name={focused ? 'house.fill' : 'house'}
                  focused={focused}
                  color={color}
                />
              </View>
            );
          },
        }}
      />

      {/* 🛒 PANIER & COMMANDES - Unifié pour MVP */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Mes Commandes',
          tabBarIcon: ({ color, focused }) => {
            console.log('🛒 Cart tab icon rendering:', { color, focused, platform: Platform.OS });
            return (
              <View style={{ position: 'relative' }}>
                <TabIcon
                  name={focused ? 'bag.fill' : 'bag'}
                  focused={focused}
                  color={color}
                />
                {(totalItems > 0 || currentOrder) && (
                  <TabBadge count={totalItems + (currentOrder ? 1 : 0)} color="#00CCBC" />
                )}
              </View>
            );
          },
        }}
      />

      {/* 👤 PROFIL - Personnel & Paramètres */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon Compte',
          tabBarIcon: ({ color, focused }) => {
            console.log('👤 Profile tab icon rendering:', { color, focused, platform: Platform.OS });
            return (
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
            );
          },
        }}
      />

    </Tabs>
  );
}