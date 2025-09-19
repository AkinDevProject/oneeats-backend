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
  SlideInRight,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';

type AccountSection = 'profile' | 'orders' | 'addresses' | 'payments' | 'settings' | 'support';

export default function ProfileMVP() {
  console.log('📋 Profile page rendering');

  const [activeSection, setActiveSection] = useState<AccountSection | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { user, logout } = useAuth();
  const { currentTheme, selectedTheme, themeMetadata } = useAppTheme();

  // Handlers pour les sections
  const handleSectionPress = (section: AccountSection) => {
    setActiveSection(section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigation directe pour certaines sections
    switch (section) {
      case 'profile':
        router.push('/account');
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

  // Render du menu principal
  const renderMainMenu = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profil utilisateur */}
      {user && (
        <Animated.View entering={FadeIn.delay(100)}>
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
      <Animated.View entering={FadeIn.delay(200)}>
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

      {/* Paramètres Avancés */}
      <Animated.View entering={FadeIn.delay(600)}>
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
      <Animated.View entering={FadeIn.delay(700)}>
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
        <Animated.View entering={FadeIn.delay(900)}>
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
      <Animated.View entering={FadeIn.delay(1000)}>
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
