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
      
      {/* 🏠 ACCUEIL - Découverte restaurants */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <IconSymbol 
                size={26} 
                name={focused ? 'house.fill' : 'house'} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      {/* 🛒 PANIER & COMMANDES - Unifié pour MVP */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Mes Commandes',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <IconSymbol 
                size={26} 
                name={focused ? 'bag.fill' : 'bag'} 
                color={color} 
              />
              {(totalItems > 0 || currentOrder) && (
                <TabBadge count={totalItems + (currentOrder ? 1 : 0)} color="#00CCBC" />
              )}
            </View>
          ),
        }}
      />

      {/* 👤 PROFIL - Personnel & Paramètres */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon Compte',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <IconSymbol 
                size={26} 
                name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'} 
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
