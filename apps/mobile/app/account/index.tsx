import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Surface,
  Button,
  Card,
  List,
  Divider,
  Dialog,
  Portal,
  TextInput as PaperTextInput,
  Chip,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

import { useAppTheme } from '../../src/contexts/ThemeContext';
import { apiService } from '../../src/services/api';
import { ENV } from '../../src/config/env';

// Interface pour les données utilisateur
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les statistiques
interface UserStats {
  ordersCount: number;
  favoriteRestaurantsCount: number;
  totalSpent: number;
}

type AccountSection = 'profile' | 'orders' | 'addresses' | 'security' | 'privacy' | 'export' | 'password';

export default function AccountPage() {
  console.log('📋 Account page rendering');

  const [activeSection, setActiveSection] = useState<AccountSection | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats>({
    ordersCount: 0,
    favoriteRestaurantsCount: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editField, setEditField] = useState({ key: '', value: '', title: '' });

  const { currentTheme } = useAppTheme();

  // Charger les données utilisateur
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données utilisateur
      const userData = await apiService.users.getById(ENV.DEV_USER_ID);
      setUser(userData);

      // Récupérer les commandes pour calculer les stats
      const orders = await apiService.orders.getByUserId(ENV.DEV_USER_ID);

      // Calculer les statistiques
      const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      const ordersCount = orders.length;

      // TODO: Récupérer les vrais favoris depuis l'API
      const favoriteRestaurantsCount = 3; // Valeur simulée pour correspondre aux favoris mock

      setStats({
        ordersCount,
        favoriteRestaurantsCount,
        totalSpent,
      });

    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setError('Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour les sections
  const handleSectionPress = (section: AccountSection) => {
    setActiveSection(section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigation ou actions directes pour certaines sections
    switch (section) {
      case 'orders':
        Alert.alert('Historique', 'Navigation vers l\'historique des commandes');
        break;
      case 'addresses':
        Alert.alert('Adresses', 'Navigation vers la gestion des adresses');
        break;
      case 'password':
        Alert.alert('Mot de passe', 'Navigation vers le changement de mot de passe');
        break;
      case 'privacy':
        Alert.alert('Confidentialité', 'Navigation vers les paramètres de confidentialité');
        break;
      case 'export':
        Alert.alert('Export', 'Fonctionnalité d\'export des données');
        break;
    }
  };

  const handleEdit = (field: string, title: string, value: string) => {
    setEditField({ key: field, value, title });
    setShowEditDialog(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    if (user && editField.value.trim()) {
      setUser(prev => prev ? ({
        ...prev,
        [editField.key]: editField.value.trim(),
      }) : null);
      setShowEditDialog(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Informations mises à jour avec succès');
      // TODO: Sauvegarder via API
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
    // TODO: Implémentation réelle de suppression + déconnexion
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Affichage du loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Chargement de votre profil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage de l'erreur
  if (error || !user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={currentTheme.colors.error} />
          <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
            {error || 'Utilisateur non trouvé'}
          </Text>
          <Button mode="contained" onPress={loadUserData} style={styles.retryButton}>
            Réessayer
          </Button>
        </View>
      </SafeAreaView>
    );
  }

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
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={[styles.userEmail, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {user.email}
                </Text>
                <View style={styles.userStats}>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    {stats.ordersCount} commandes
                  </Chip>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    {stats.totalSpent.toFixed(2)}€
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Informations Personnelles */}
      <Animated.View entering={FadeIn.delay(200)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Subheader style={{ color: currentTheme.colors.onSurfaceVariant }}>
            Informations Personnelles
          </List.Subheader>

          <List.Item
            title="Prénom"
            description={user?.firstName}
            left={(props) => <List.Icon {...props} icon="badge" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => handleEdit('firstName', 'Prénom', user?.firstName || '')}
          />
          <Divider />

          <List.Item
            title="Nom"
            description={user?.lastName}
            left={(props) => <List.Icon {...props} icon="badge" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => handleEdit('lastName', 'Nom', user?.lastName || '')}
          />
          <Divider />

          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => handleEdit('email', 'Email', user?.email || '')}
          />
          <Divider />

          <List.Item
            title="Téléphone"
            description={user?.phone || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="phone" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => handleEdit('phone', 'Téléphone', user?.phone || '')}
          />
          <Divider />

          <List.Item
            title="Adresse"
            description={user?.address || 'Non renseignée'}
            left={(props) => <List.Icon {...props} icon="map-marker" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => handleEdit('address', 'Adresse', user?.address || '')}
          />
        </Card>
      </Animated.View>

      {/* Actions Rapides */}
      <Animated.View entering={FadeIn.delay(300)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Subheader style={{ color: currentTheme.colors.onSurfaceVariant }}>
            Actions Rapides
          </List.Subheader>

          <List.Item
            title="Historique des commandes"
            description={`${stats.ordersCount} commandes passées`}
            left={(props) => <List.Icon {...props} icon="history" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('orders')}
          />
          <Divider />

          <List.Item
            title="Mes adresses"
            description="Gérer vos adresses de livraison"
            left={(props) => <List.Icon {...props} icon="map-marker" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('addresses')}
          />
        </Card>
      </Animated.View>

      {/* Sécurité */}
      <Animated.View entering={FadeIn.delay(400)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Subheader style={{ color: currentTheme.colors.onSurfaceVariant }}>
            Sécurité & Confidentialité
          </List.Subheader>

          <List.Item
            title="Changer le mot de passe"
            description="Modifier votre mot de passe"
            left={(props) => <List.Icon {...props} icon="lock" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('password')}
          />
          <Divider />

          <List.Item
            title="Confidentialité"
            description="Paramètres de confidentialité"
            left={(props) => <List.Icon {...props} icon="shield-account" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('privacy')}
          />
          <Divider />

          <List.Item
            title="Exporter mes données"
            description="Télécharger vos informations"
            left={(props) => <List.Icon {...props} icon="download" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('export')}
          />
        </Card>
      </Animated.View>

      {/* Zone de danger */}
      <Animated.View entering={FadeIn.delay(500)}>
        <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.error }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.error }]}>
              Zone de Danger
            </Text>
            <Button
              mode="outlined"
              icon="delete-forever"
              onPress={handleDeleteAccount}
              style={[styles.dangerButton, { borderColor: currentTheme.colors.error }]}
              textColor={currentTheme.colors.error}
            >
              Supprimer mon compte
            </Button>
          </Card.Content>
        </Card>
      </Animated.View>

      <View style={styles.bottomSpacer} />
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
        {/* Dialog édition */}
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Modifier {editField.title}</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              value={editField.value}
              onChangeText={(text) => setEditField(prev => ({ ...prev, value: text }))}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleSave}>Sauvegarder</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog suppression */}
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Supprimer le compte</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={confirmDeleteAccount} buttonColor={currentTheme.colors.error}>
              Supprimer
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
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dangerButton: {
    borderRadius: 8,
  },
  bottomSpacer: {
    height: 32,
  },
  // Loading et Error styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 8,
  },
});