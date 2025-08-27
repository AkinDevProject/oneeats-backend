import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Divider, Badge } from 'react-native-paper';
import { router } from 'expo-router';

import { useAuth } from '../../src/contexts/AuthContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { useOrder } from '../../src/contexts/OrderContext';

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
  color?: string;
  showChevron?: boolean;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    favoriteRestaurants: 0,
    points: 0,
    level: 'Bronze',
  });

  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotification();
  const { orders } = useOrder();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    calculateStats();
  }, [orders]);

  const calculateStats = () => {
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    
    let level = 'Bronze';
    let points = Math.floor(totalSpent * 10);
    
    if (points >= 1000) level = 'Gold';
    else if (points >= 500) level = 'Silver';
    
    setStats({
      totalOrders: completedOrders,
      favoriteRestaurants: user?.favoriteRestaurants.length || 0,
      points,
      level,
    });
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
            router.replace('/(tabs)/');
          }
        }
      ]
    );
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (unreadCount > 0) {
      markAllAsRead();
    }
    // In a real app, navigate to notifications screen
    Alert.alert(
      'Notifications',
      `Vous avez ${notifications.length} notification${notifications.length > 1 ? 's' : ''}${unreadCount > 0 ? ` (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})` : ''}.`,
      [
        { text: 'OK' },
        notifications.length > 0 && {
          text: 'Tout effacer',
          onPress: clearNotifications
        }
      ].filter(Boolean)
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Mon compte',
      items: [
        {
          icon: 'person-outline',
          title: 'Informations personnelles',
          subtitle: 'Nom, email, téléphone',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Fonctionnalité', 'Modification du profil à venir !');
          },
          color: '#3b82f6',
          showChevron: true,
        },
        {
          icon: 'location-outline',
          title: 'Adresses',
          subtitle: 'Gérer vos adresses de livraison',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Fonctionnalité', 'Gestion des adresses à venir !');
          },
          color: '#22c55e',
          showChevron: true,
        },
        {
          icon: 'card-outline',
          title: 'Moyens de paiement',
          subtitle: 'Cartes et portefeuilles',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Fonctionnalité', 'Gestion des paiements à venir !');
          },
          color: '#f59e0b',
          showChevron: true,
        },
      ]
    },
    {
      title: 'Mes préférences',
      items: [
        {
          icon: 'heart-outline',
          title: 'Restaurants favoris',
          subtitle: `${stats.favoriteRestaurants} restaurant${stats.favoriteRestaurants > 1 ? 's' : ''}`,
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Fonctionnalité', 'Liste des favoris à venir !');
          },
          color: '#ef4444',
          showChevron: true,
        },
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Gérer vos préférences',
          badge: unreadCount,
          onPress: handleNotificationPress,
          color: '#8b5cf6',
          showChevron: true,
        },
        {
          icon: 'settings-outline',
          title: 'Paramètres',
          subtitle: 'Langue, thème, confidentialité',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Fonctionnalité', 'Paramètres à venir !');
          },
          color: '#64748b',
          showChevron: true,
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Aide et support',
          subtitle: 'FAQ, contact, signalement',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Support', 'Pour toute question, contactez-nous à support@delishgo.com');
          },
          color: '#06b6d4',
          showChevron: true,
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Confidentialité',
          subtitle: 'Données personnelles et sécurité',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Confidentialité', 'Vos données sont protégées selon nos CGU.');
          },
          color: '#10b981',
          showChevron: true,
        },
      ]
    }
  ];

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#ec4899', '#f97316']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mon Profil 👤</Text>
            <Text style={styles.headerSubtitle}>
              {isAuthenticated ? `Bonjour ${user?.name?.split(' ')[0] || 'ami'}` : 'Connectez-vous'}
            </Text>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderNotAuthenticated = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.notAuthenticated}>
      <Ionicons name="person-circle-outline" size={100} color="#cbd5e1" />
      <Text style={styles.notAuthTitle}>Non connecté</Text>
      <Text style={styles.notAuthText}>
        Connectez-vous pour accéder à votre profil, suivre vos commandes et profiter d'avantages exclusifs.
      </Text>
      
      <View style={styles.authButtons}>
        <Button
          mode="contained"
          onPress={() => router.push('/auth' as any)}
          style={styles.loginButton}
          labelStyle={styles.loginButtonText}
          contentStyle={styles.buttonContent}
        >
          Se connecter
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/auth?mode=guest' as any)}
          style={styles.guestButton}
          labelStyle={styles.guestButtonText}
          contentStyle={styles.buttonContent}
        >
          Continuer en invité
        </Button>
      </View>
    </Animated.View>
  );

  const renderUserProfile = () => (
    <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.profileSection}>
      <Card style={styles.profileCard}>
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
          style={styles.profileGradient}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
              {user?.isGuest && (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>Invité</Text>
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              {user?.isGuest && (
                <Button
                  mode="outlined"
                  onPress={() => router.push('/auth?mode=convert' as any)}
                  style={styles.upgradeButton}
                  labelStyle={styles.upgradeButtonText}
                  compact
                >
                  Créer un compte complet
                </Button>
              )}
            </View>
            
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{stats.level}</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderStats = () => (
    <Animated.View 
      entering={SlideInRight.delay(300).springify()}
      style={styles.statsSection}
    >
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="receipt-outline" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#fecaca' }]}>
            <Ionicons name="heart" size={24} color="#ef4444" />
          </View>
          <Text style={styles.statValue}>{stats.favoriteRestaurants}</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="star" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="trophy" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{stats.level}</Text>
          <Text style={styles.statLabel}>Niveau</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderMenuItem = (item: MenuItem, index: number) => (
    <Animated.View
      key={item.title}
      entering={SlideInRight.delay(400 + index * 50).springify()}
    >
      <Pressable style={styles.menuItem} onPress={item.onPress}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.menuItemRight}>
          {item.badge && item.badge > 0 && (
            <Badge style={[styles.menuBadge, { backgroundColor: item.color }]}>
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
          {item.showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderMenuSection = (section: { title: string; items: MenuItem[] }, sectionIndex: number) => (
    <Animated.View
      key={section.title}
      entering={FadeIn.delay(500 + sectionIndex * 100)}
      style={styles.menuSection}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Card style={styles.menuCard}>
        {section.items.map((item, index) => (
          <View key={item.title}>
            {renderMenuItem(item, index)}
            {index < section.items.length - 1 && <Divider style={styles.menuDivider} />}
          </View>
        ))}
      </Card>
    </Animated.View>
  );

  const renderLogoutSection = () => (
    <Animated.View entering={SlideInRight.delay(800).springify()} style={styles.logoutSection}>
      <Card style={styles.logoutCard}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </Card>
    </Animated.View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {renderNotAuthenticated()}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderUserProfile()}
          {renderStats()}
          
          {menuSections.map((section, index) => renderMenuSection(section, index))}
          
          {renderLogoutSection()}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 140,
  },
  headerGradient: {
    flex: 1,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Not authenticated styles
  notAuthenticated: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAuthText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#ec4899',
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    borderColor: '#ec4899',
    borderRadius: 25,
  },
  guestButtonText: {
    color: '#ec4899',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    paddingVertical: 6,
  },

  // Profile section styles
  profileSection: {
    marginBottom: 20,
  },
  profileCard: {
    elevation: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  guestBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  guestBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  upgradeButton: {
    borderColor: '#ec4899',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: '#ec4899',
    fontSize: 12,
  },
  levelBadge: {
    backgroundColor: '#ec4899',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  // Stats section styles
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 4,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Menu section styles
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    elevation: 1,
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    fontSize: 10,
  },
  menuDivider: {
    marginLeft: 72,
    backgroundColor: '#f1f5f9',
  },

  // Logout section styles
  logoutSection: {
    marginTop: 10,
  },
  logoutCard: {
    elevation: 1,
    borderRadius: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});