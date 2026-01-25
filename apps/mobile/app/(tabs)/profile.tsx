import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  Dialog,
  Portal,
  TouchableRipple,
} from 'react-native-paper';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useUserProfile } from '../../src/contexts/UserProfileContext';

export default function ProfilePage() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const { currentTheme } = useAppTheme();
  const { orders } = useOrder();
  const { favorites } = useFavorites();
  const { userProfile, isLoading: profileLoading, fullName } = useUserProfile();

  // Nom complet depuis PostgreSQL (via contexte partage)
  const displayName = fullName;
  const displayEmail = userProfile?.email || user?.email || '';

  // Compteurs
  const totalOrders = orders.length;
  const activeOrdersCount = orders.filter(o =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length;
  const favoritesCount = favorites.length;

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Découvre OneEats ! Commande tes plats préférés et récupère-les rapidement. 🍔🍕',
      });
    } catch (error) {
      // Ignore
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  // Menu item component
  const MenuItem = ({
    icon,
    label,
    subtitle,
    onPress,
    badge,
    iconBg = '#F5F5F5',
    delay = 0
  }: {
    icon: string;
    label: string;
    subtitle?: string;
    onPress: () => void;
    badge?: number;
    iconBg?: string;
    delay?: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <TouchableRipple
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        borderless
        style={styles.menuItem}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
            <Text style={styles.menuIcon}>{icon}</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuLabel, { color: currentTheme.colors.onSurface }]}>
              {label}
            </Text>
            {subtitle && (
              <Text style={[styles.menuSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.menuRight}>
            {badge !== undefined && badge > 0 && (
              <View style={[styles.badge, { backgroundColor: currentTheme.colors.primary }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
            <Text style={[styles.chevron, { color: currentTheme.colors.onSurfaceVariant }]}>›</Text>
          </View>
        </View>
      </TouchableRipple>
    </Animated.View>
  );

  // Section header
  const SectionHeader = ({ title, delay = 0 }: { title: string; delay?: number }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Text style={[styles.sectionHeader, { color: currentTheme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec profil */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}
        >
          {user ? (
            <>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {profileLoading ? (
                    <ActivityIndicator size="small" color={currentTheme.colors.primary} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={() => router.push('/account')}
                >
                  <Text style={{ fontSize: 12 }}>✏️</Text>
                </TouchableOpacity>
              </View>

              {/* Nom et email - depuis PostgreSQL */}
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>

              {/* Stats rapides */}
              <View style={styles.statsContainer}>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push('/orders')}
                >
                  <Text style={styles.statNumber}>{totalOrders}</Text>
                  <Text style={styles.statLabel}>Commandes</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push('/(tabs)/favorites')}
                >
                  <Text style={styles.statNumber}>{favoritesCount}</Text>
                  <Text style={styles.statLabel}>Favoris</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Non connecté */}
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
              </View>
              <Text style={styles.userName}>Bienvenue !</Text>
              <Text style={styles.userEmail}>Connectez-vous pour profiter de toutes les fonctionnalités</Text>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Commande en cours */}
        {activeOrdersCount > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <TouchableRipple
              onPress={() => router.push('/orders')}
              borderless
              style={[styles.activeOrderBanner, { backgroundColor: '#FFF3E0' }]}
            >
              <View style={styles.activeOrderContent}>
                <Text style={{ fontSize: 24 }}>🍳</Text>
                <View style={styles.activeOrderText}>
                  <Text style={styles.activeOrderTitle}>Commande en cours</Text>
                  <Text style={styles.activeOrderSubtitle}>
                    {activeOrdersCount} commande{activeOrdersCount > 1 ? 's' : ''} en préparation
                  </Text>
                </View>
                <Text style={{ color: '#E65100', fontSize: 18 }}>›</Text>
              </View>
            </TouchableRipple>
          </Animated.View>
        )}

        {/* Section Mon Compte */}
        <SectionHeader title="MON COMPTE" delay={150} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="👤"
            label="Profil personnel"
            subtitle="Informations et préférences"
            iconBg="#E3F2FD"
            onPress={() => router.push('/account')}
            delay={200}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="📋"
            label="Mes commandes"
            subtitle="Historique et suivi"
            iconBg="#E8F5E9"
            badge={activeOrdersCount}
            onPress={() => router.push('/orders')}
            delay={250}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="❤️"
            label="Mes favoris"
            subtitle={`${favoritesCount} restaurant${favoritesCount > 1 ? 's' : ''}`}
            iconBg="#FCE4EC"
            onPress={() => router.push('/(tabs)/favorites')}
            delay={300}
          />
        </View>

        {/* Section Préférences */}
        <SectionHeader title="PRÉFÉRENCES" delay={350} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="⚙️"
            label="Paramètres"
            subtitle="Notifications, thème, langue"
            iconBg="#F3E5F5"
            onPress={() => router.push('/settings')}
            delay={400}
          />
        </View>

        {/* Section Autres */}
        <SectionHeader title="AUTRES" delay={500} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="🎁"
            label="Inviter des amis"
            subtitle="Partagez l'app et gagnez des réductions"
            iconBg="#E8F5E9"
            onPress={handleShare}
            delay={550}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="❓"
            label="Aide & Support"
            subtitle="FAQ, contact, signaler un problème"
            iconBg="#E3F2FD"
            onPress={() => router.push('/aide-support')}
            delay={600}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="⭐"
            label="Noter l'application"
            subtitle="Donnez-nous votre avis"
            iconBg="#FFF8E1"
            onPress={() => Alert.alert('Merci !', 'Redirection vers le store...')}
            delay={650}
          />
        </View>

        {/* Déconnexion */}
        {user && (
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <TouchableRipple
              onPress={() => setShowLogoutDialog(true)}
              borderless
              style={[styles.logoutButton, { backgroundColor: currentTheme.colors.surface }]}
            >
              <View style={styles.logoutContent}>
                <Text style={{ fontSize: 18 }}>🚪</Text>
                <Text style={[styles.logoutText, { color: '#D32F2F' }]}>
                  Se déconnecter
                </Text>
              </View>
            </TouchableRipple>
          </Animated.View>
        )}

        {/* Version */}
        <Animated.View entering={FadeIn.delay(750)}>
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: currentTheme.colors.onSurfaceVariant }]}>
              OneEats v1.0.0
            </Text>
            <Text style={[styles.versionSubtext, { color: currentTheme.colors.onSurfaceVariant }]}>
              Fait avec ❤️ à Paris
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Dialog déconnexion */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Se déconnecter</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleLogout} buttonColor="#D32F2F">
              Déconnexion
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Login button
  loginButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00CCBC',
  },
  // Active order banner
  activeOrderBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeOrderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  activeOrderText: {
    flex: 1,
    marginLeft: 12,
  },
  activeOrderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E65100',
  },
  activeOrderSubtitle: {
    fontSize: 13,
    color: '#F57C00',
    marginTop: 2,
  },
  // Sections
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  menuSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 74,
  },
  // Logout
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Version
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 13,
  },
  versionSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
