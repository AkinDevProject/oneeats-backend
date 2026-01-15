import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Surface,
  Button,
  Card,
  Switch,
  List,
  Divider,
  Dialog,
  Portal,
  RadioButton,
  Chip,
  IconButton,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useFavorites } from '../../src/hooks/useFavorites';

type AccountSection = 'profile' | 'orders' | 'favorites' | 'settings' | 'support';

export default function ProfileMVP() {
  console.log('📋 Profile page rendering');

  const [activeSection, setActiveSection] = useState<AccountSection | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { user, logout } = useAuth();
  const { currentTheme, selectedTheme, themeMetadata } = useAppTheme();
  const { orders } = useOrder();
  const { favorites } = useFavorites();

  // Compteurs
  const activeOrdersCount = orders.filter(o =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length;
  const favoritesCount = favorites.length;

  // Handlers pour les sections
  const handleSectionPress = (section: AccountSection) => {
    setActiveSection(section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (section) {
      case 'profile':
        router.push('/account');
        break;
      case 'orders':
        router.push('/orders');
        break;
      case 'favorites':
        router.push('/(tabs)/favorites');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'support':
        router.push('/aide-support');
        break;
    }
  };

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
    try {
      await Share.share({
        message: 'Découvrez OneEats, votre app de livraison de repas préférée !',
        title: 'OneEats - Livraison de repas',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager');
    }
  };

  // Handler pour la connexion SSO
  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  // Render du menu principal
  const renderMainMenu = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section connexion si pas authentifié */}
      {!user && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card style={[styles.userCard, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content style={styles.loginCardContent}>
              <View style={styles.userAvatar}>
                <MaterialIcons name="account-circle" size={60} color={currentTheme.colors.outline} />
              </View>
              <Text style={[styles.loginTitle, { color: currentTheme.colors.onSurface }]}>
                Bienvenue sur OneEats
              </Text>
              <Text style={[styles.loginSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                Connectez-vous pour accéder à votre compte
              </Text>
              <Button
                mode="contained"
                icon="login"
                onPress={handleLogin}
                style={styles.loginButton}
                buttonColor={currentTheme.colors.primary}
              >
                Se connecter
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Profil utilisateur */}
      {user && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card style={[styles.userCard, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content style={styles.userCardContent}>
              <View style={styles.userAvatar}>
                <MaterialIcons name="account-circle" size={60} color={currentTheme.colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: currentTheme.colors.onSurface }]}>
                  {user.name || 'Utilisateur OneEats'}
                </Text>
                <Text style={[styles.userEmail, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {user.email}
                </Text>
                <View style={styles.userStats}>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    12 commandes
                  </Chip>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    ⭐ 4.8
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Profil Personnel */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Profil Personnel"
            description="Informations et préférences de compte"
            left={(props) => <List.Icon {...props} icon="account-circle" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('profile')}
          />
        </Card>
      </Animated.View>

      {/* Mes Commandes */}
      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Mes Commandes"
            description={activeOrdersCount > 0 ? `${activeOrdersCount} commande${activeOrdersCount > 1 ? 's' : ''} en cours` : 'Historique et suivi'}
            left={(props) => <List.Icon {...props} icon="receipt-long" color={currentTheme.colors.primary} />}
            right={(props) => (
              <View style={styles.listItemRight}>
                {activeOrdersCount > 0 && (
                  <Chip
                    compact
                    style={[styles.badge, { backgroundColor: currentTheme.colors.primaryContainer }]}
                    textStyle={{ color: currentTheme.colors.onPrimaryContainer, fontSize: 12 }}
                  >
                    {activeOrdersCount}
                  </Chip>
                )}
                <List.Icon {...props} icon="chevron-right" />
              </View>
            )}
            onPress={() => handleSectionPress('orders')}
          />
        </Card>
      </Animated.View>

      {/* Mes Favoris */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Mes Favoris"
            description={favoritesCount > 0 ? `${favoritesCount} restaurant${favoritesCount > 1 ? 's' : ''} favori${favoritesCount > 1 ? 's' : ''}` : 'Vos restaurants préférés'}
            left={(props) => <List.Icon {...props} icon="heart" color={currentTheme.colors.error} />}
            right={(props) => (
              <View style={styles.listItemRight}>
                {favoritesCount > 0 && (
                  <Chip
                    compact
                    style={[styles.badge, { backgroundColor: currentTheme.colors.errorContainer }]}
                    textStyle={{ color: currentTheme.colors.onErrorContainer, fontSize: 12 }}
                  >
                    {favoritesCount}
                  </Chip>
                )}
                <List.Icon {...props} icon="chevron-right" />
              </View>
            )}
            onPress={() => handleSectionPress('favorites')}
          />
        </Card>
      </Animated.View>

      {/* Paramètres Avancés */}
      <Animated.View entering={FadeInDown.delay(350).springify()}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Paramètres Avancés"
            description={`${themeMetadata?.[selectedTheme]?.emoji || '🎨'} ${themeMetadata?.[selectedTheme]?.name || 'Configuration'}`}
            left={(props) => <List.Icon {...props} icon="settings" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('settings')}
          />
        </Card>
      </Animated.View>

      {/* Aide & Support */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Aide & Support"
            description="FAQ, contact et assistance"
            left={(props) => <List.Icon {...props} icon="help-outline" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('support')}
          />
        </Card>
      </Animated.View>

      {/* Déconnexion */}
      {user && (
        <Animated.View entering={FadeInDown.delay(450).springify()}>
          <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content>
              <Button
                mode="outlined"
                icon="logout"
                onPress={() => setShowLogoutDialog(true)}
                style={[styles.logoutButton, { borderColor: currentTheme.colors.error }]}
                textColor={currentTheme.colors.error}
              >
                Se déconnecter
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Version */}
      <Animated.View entering={FadeIn.delay(500)}>
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: currentTheme.colors.onSurfaceVariant }]}>
            OneEats v1.0.0 (Build 1)
          </Text>
          <Text style={[styles.versionText, { color: currentTheme.colors.onSurfaceVariant }]}>
            © 2024 OneEats. Tous droits réservés.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      <Animated.View entering={SlideInRight} style={styles.content}>
        {renderMainMenu()}
      </Animated.View>

      {/* Dialogs */}
      <Portal>
        {/* Dialog déconnexion */}
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Se déconnecter</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleLogout}>Se déconnecter</Button>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
  userAvatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    height: 28,
  },
  menuCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    height: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  logoutButton: {
    borderRadius: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});
