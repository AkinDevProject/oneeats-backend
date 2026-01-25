import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  Dialog,
  Portal,
  TextInput as PaperTextInput,
  TouchableRipple,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUserProfile } from '../../src/contexts/UserProfileContext';

// Interface pour le champ en édition
interface EditField {
  key: string;
  value: string;
  title: string;
  keyboardType: KeyboardTypeOptions;
  placeholder: string;
}

export default function AccountPage() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editField, setEditField] = useState<EditField>({
    key: '',
    value: '',
    title: '',
    keyboardType: 'default',
    placeholder: '',
  });

  const { currentTheme } = useAppTheme();
  const { user: authUser } = useAuth();
  const { userProfile: user, isLoading: loading, error, refreshProfile, updateProfile: updateUserProfile } = useUserProfile();

  const handleEdit = (
    field: string,
    title: string,
    value: string,
    keyboardType: KeyboardTypeOptions = 'default',
    placeholder: string = ''
  ) => {
    setEditField({ key: field, value, title, keyboardType, placeholder });
    setShowEditDialog(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (user && editField.value.trim()) {
      // Validation basique
      if (editField.key === 'email' && !editField.value.includes('@')) {
        Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
        return;
      }
      if (editField.key === 'phone' && editField.value.length < 10) {
        Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
        return;
      }

      // Preparer les donnees de mise a jour
      const updateData: { firstName?: string; lastName?: string; email?: string } = {};
      updateData[editField.key as keyof typeof updateData] = editField.value.trim();

      // Sauvegarder via le contexte (mise a jour automatique partout)
      const success = await updateUserProfile(updateData);
      if (success) {
        setShowEditDialog(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Succès', 'Informations mises à jour');
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
      }
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Compte supprimé', 'Votre compte a été supprimé');
    router.replace('/auth/login');
  };

  // Composant MenuItem harmonisé avec profile.tsx
  const MenuItem = ({
    icon,
    label,
    value,
    onPress,
    iconBg = '#F5F5F5',
    showEdit = false,
    delay = 0,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress: () => void;
    iconBg?: string;
    showEdit?: boolean;
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
            {value && (
              <Text style={[styles.menuValue, { color: currentTheme.colors.onSurfaceVariant }]}>
                {value}
              </Text>
            )}
          </View>
          {showEdit ? (
            <Text style={[styles.editIcon, { color: currentTheme.colors.primary }]}>✏️</Text>
          ) : (
            <Text style={[styles.chevron, { color: currentTheme.colors.onSurfaceVariant }]}>›</Text>
          )}
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
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
            {error || 'Utilisateur non trouvé'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={refreshProfile}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header avec navigation */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
          Profil Personnel
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Informations Personnelles */}
        <SectionHeader title="INFORMATIONS PERSONNELLES" delay={100} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="👤"
            label="Prénom"
            value={user.firstName}
            iconBg="#E3F2FD"
            showEdit
            onPress={() => handleEdit('firstName', 'Prénom', user.firstName, 'default', 'Entrez votre prénom')}
            delay={150}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="👤"
            label="Nom"
            value={user.lastName}
            iconBg="#E3F2FD"
            showEdit
            onPress={() => handleEdit('lastName', 'Nom', user.lastName, 'default', 'Entrez votre nom')}
            delay={200}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="📧"
            label="Email"
            value={user.email}
            iconBg="#E8F5E9"
            showEdit
            onPress={() => handleEdit('email', 'Email', user.email, 'email-address', 'exemple@email.com')}
            delay={250}
          />
        </View>

        {/* Section Sécurité */}
        <SectionHeader title="SÉCURITÉ" delay={350} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="🔒"
            label="Changer le mot de passe"
            iconBg="#F3E5F5"
            onPress={() => {
              // TODO: Implémenter la page de changement de mot de passe
              Alert.alert('Mot de passe', 'Cette fonctionnalité sera disponible prochainement');
            }}
            delay={400}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="🛡️"
            label="Confidentialité"
            iconBg="#E0F7FA"
            onPress={() => {
              // TODO: Implémenter la page de confidentialité
              Alert.alert('Confidentialité', 'Cette fonctionnalité sera disponible prochainement');
            }}
            delay={450}
          />
        </View>

        {/* Section Données */}
        <SectionHeader title="MES DONNÉES" delay={500} />

        <View style={[styles.menuSection, { backgroundColor: currentTheme.colors.surface }]}>
          <MenuItem
            icon="📋"
            label="Historique des commandes"
            iconBg="#E8F5E9"
            onPress={() => router.push('/orders')}
            delay={550}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="📦"
            label="Exporter mes données"
            iconBg="#FFF8E1"
            onPress={() => {
              Alert.alert(
                'Export des données',
                'Vous recevrez un email avec toutes vos données dans les 24h.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Exporter',
                    onPress: () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert('Succès', 'Demande d\'export envoyée');
                    }
                  }
                ]
              );
            }}
            delay={600}
          />
        </View>

        {/* Zone de Danger */}
        <SectionHeader title="ZONE DE DANGER" delay={650} />

        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <TouchableRipple
            onPress={handleDeleteAccount}
            borderless
            style={[styles.dangerButton, { backgroundColor: '#FFEBEE' }]}
          >
            <View style={styles.dangerContent}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerTitle}>Supprimer mon compte</Text>
                <Text style={styles.dangerSubtitle}>Cette action est irréversible</Text>
              </View>
            </View>
          </TouchableRipple>
        </Animated.View>

        {/* Info membre */}
        <Animated.View entering={FadeIn.delay(750)}>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberText, { color: currentTheme.colors.onSurfaceVariant }]}>
              Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Dialogs */}
      <Portal>
        {/* Dialog édition */}
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Modifier {editField.title}</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              mode="outlined"
              value={editField.value}
              onChangeText={(text) => setEditField(prev => ({ ...prev, value: text }))}
              keyboardType={editField.keyboardType}
              placeholder={editField.placeholder}
              autoFocus
              autoCapitalize={editField.key === 'email' ? 'none' : 'words'}
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
            <Text style={{ marginBottom: 12 }}>
              Êtes-vous sûr de vouloir supprimer votre compte ?
            </Text>
            <Text style={{ color: '#D32F2F', fontWeight: '500' }}>
              Cette action est irréversible. Toutes vos données seront perdues.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={confirmDeleteAccount} buttonColor="#D32F2F">
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 32,
  },
  headerSpacer: {
    width: 32,
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  // Menu Item
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
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 14,
    marginTop: 2,
  },
  editIcon: {
    fontSize: 16,
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
  // Danger Zone
  dangerButton: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerTextContainer: {
    marginLeft: 14,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  dangerSubtitle: {
    fontSize: 13,
    color: '#E57373',
    marginTop: 2,
  },
  // Member info
  memberInfo: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  memberText: {
    fontSize: 13,
  },
  // Loading & Error
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});
