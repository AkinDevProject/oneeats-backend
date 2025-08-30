import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { totalItems } = useCart();
  const { currentOrder } = useOrder();
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
      
      {/* Accueil Tab - Restaurants avec recherche intégrée */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <IconSymbol 
                size={28} 
                name={focused ? 'house.fill' : 'house'} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      {/* Panier/Commandes Tab - Fusionné */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <IconSymbol 
                size={28} 
                name={focused ? 'cart.fill' : 'cart'} 
                color={color} 
              />
              <TabBadge count={totalItems + (currentOrder ? 1 : 0)} color="#FF6B6B" />
            </View>
          ),
        }}
      />

      {/* Profil Tab - Avec favoris intégrés */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <IconSymbol 
                size={28} 
                name={focused ? 'person.circle.fill' : 'person.circle'} 
                color={color} 
              />
              <TabBadge count={unreadCount} color="#9B59B6" />
            </View>
          ),
        }}
      />

      {/* Hide unused tabs */}
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Recherche intégrée dans l'accueil
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null, // Fusionné avec le panier
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Tab non utilisé
        }}
      />
    </Tabs>
  );
}
