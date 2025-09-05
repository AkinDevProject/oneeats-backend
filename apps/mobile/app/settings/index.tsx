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
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useSettings } from '../../src/contexts/SettingsContext';

type SettingSection = 'notifications' | 'dietary' | 'privacy' | 'account' | 'app' | 'about';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'Dollar US ($)', symbol: '$' },
  { code: 'GBP', name: 'Livre Sterling (£)', symbol: '£' },
];

export default function AdvancedSettingsScreen() {
  const [activeSection, setActiveSection] = useState<SettingSection | null>(null);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user, updateUserProfile, changePassword, logout } = useAuth();
  const { currentTheme, selectedTheme, setSelectedTheme, themeMetadata } = useAppTheme();
  const { 
    settings, 
    updateNotificationSettings, 
    updateDietaryPreferences, 
    updatePrivacySettings,
    updateAppSettings,
    resetSettings,
    exportSettings
  } = useSettings();

  // Handlers pour les sections
  const handleSectionPress = (section: SettingSection) => {
    setActiveSection(section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goBack = () => {
    if (activeSection) {
      setActiveSection(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      router.back();
    }
  };

  // Handlers pour les notifications
  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateNotificationSettings({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handlers pour les préférences alimentaires
  const handleDietaryChange = (key: keyof typeof settings.dietary, value: boolean) => {
    updateDietaryPreferences({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handlers pour la confidentialité
  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    updatePrivacySettings({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handlers pour l'app
  const handleLanguageChange = (language: 'fr' | 'en' | 'es' | 'it') => {
    updateAppSettings({ language });
    setShowLanguageDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCurrencyChange = (currency: 'EUR' | 'USD' | 'GBP') => {
    updateAppSettings({ currency });
    setShowCurrencyDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDistanceUnitChange = () => {
    const newUnit = settings.distanceUnit === 'km' ? 'mi' : 'km';
    updateAppSettings({ distanceUnit: newUnit });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAutoLocationChange = (value: boolean) => {
    updateAppSettings({ autoLocation: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handler pour changer le mot de passe
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await changePassword(newPassword);
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe');
    }
  };

  // Handler pour réinitialiser les paramètres
  const handleResetSettings = async () => {
    try {
      await resetSettings();
      setShowResetDialog(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Paramètres réinitialisés');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de réinitialiser les paramètres');
    }
  };

  // Handler pour exporter les paramètres
  const handleExportSettings = async () => {
    try {
      const settingsData = exportSettings();
      await Share.share({
        message: settingsData,
        title: 'Mes paramètres OneEats',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter les paramètres');
    }
  };

  // Render du menu principal
  const renderMainMenu = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Notifications */}
      <Animated.View entering={FadeIn.delay(100)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Notifications"
            description={`${Object.values(settings.notifications).filter(Boolean).length} activées`}
            left={(props) => <List.Icon {...props} icon="bell" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('notifications')}
          />
        </Card>
      </Animated.View>

      {/* Préférences alimentaires */}
      <Animated.View entering={FadeIn.delay(200)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Préférences alimentaires"
            description={`${Object.values(settings.dietary).filter(Boolean).length} préférences définies`}
            left={(props) => <List.Icon {...props} icon="food-apple" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('dietary')}
          />
        </Card>
      </Animated.View>

      {/* Confidentialité */}
      <Animated.View entering={FadeIn.delay(300)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Confidentialité"
            description="Gestion des données et permissions"
            left={(props) => <List.Icon {...props} icon="shield-account" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('privacy')}
          />
        </Card>
      </Animated.View>

      {/* Compte utilisateur */}
      {user && (
        <Animated.View entering={FadeIn.delay(400)}>
          <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
            <List.Item
              title="Compte utilisateur"
              description="Modifier email, mot de passe"
              left={(props) => <List.Icon {...props} icon="account-cog" color={currentTheme.colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleSectionPress('account')}
            />
          </Card>
        </Animated.View>
      )}

      {/* Application */}
      <Animated.View entering={FadeIn.delay(500)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Application"
            description="Langue, devise, unités"
            left={(props) => <List.Icon {...props} icon="cog" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('app')}
          />
        </Card>
      </Animated.View>

      {/* À propos */}
      <Animated.View entering={FadeIn.delay(600)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="À propos"
            description="Informations et support"
            left={(props) => <List.Icon {...props} icon="information" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('about')}
          />
        </Card>
      </Animated.View>
    </ScrollView>
  );

  // Render de la section notifications
  const renderNotificationsSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🔔 Notifications Push
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Mises à jour de commande
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Statut, préparation, prêt à récupérer
              </Text>
            </View>
            <Switch
              value={settings.notifications.orderUpdates}
              onValueChange={(value) => handleNotificationChange('orderUpdates', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Promotions et offres
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Réductions, bons plans, nouveautés
              </Text>
            </View>
            <Switch
              value={settings.notifications.promotions}
              onValueChange={(value) => handleNotificationChange('promotions', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Recommandations
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Suggestions basées sur vos goûts
              </Text>
            </View>
            <Switch
              value={settings.notifications.recommendations}
              onValueChange={(value) => handleNotificationChange('recommendations', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Son
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Son de notification
              </Text>
            </View>
            <Switch
              value={settings.notifications.sound}
              onValueChange={(value) => handleNotificationChange('sound', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Vibration
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Vibration lors des notifications
              </Text>
            </View>
            <Switch
              value={settings.notifications.vibration}
              onValueChange={(value) => handleNotificationChange('vibration', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render de la section préférences alimentaires
  const renderDietarySection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🥗 Préférences Alimentaires
          </Text>
          <Text style={[styles.sectionDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
            Personnalisez vos recommandations selon vos besoins alimentaires
          </Text>

          {Object.entries({
            vegetarian: { label: 'Végétarien', icon: '🌱', description: 'Sans viande ni poisson' },
            vegan: { label: 'Végétalien', icon: '🌿', description: 'Aucun produit d\'origine animale' },
            glutenFree: { label: 'Sans gluten', icon: '🌾', description: 'Sans blé, orge, seigle' },
            dairyFree: { label: 'Sans lactose', icon: '🥛', description: 'Sans produits laitiers' },
            nutFree: { label: 'Sans noix', icon: '🥜', description: 'Sans fruits à coque' },
            halal: { label: 'Halal', icon: '☪️', description: 'Conforme aux prescriptions islamiques' },
            kosher: { label: 'Casher', icon: '✡️', description: 'Conforme aux lois juives' },
          }).map(([key, info]) => (
            <View key={key}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.dietaryLabelRow}>
                    <Text style={styles.dietaryIcon}>{info.icon}</Text>
                    <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                      {info.label}
                    </Text>
                  </View>
                  <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {info.description}
                  </Text>
                </View>
                <Switch
                  value={settings.dietary[key as keyof typeof settings.dietary]}
                  onValueChange={(value) => handleDietaryChange(key as keyof typeof settings.dietary, value)}
                  trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
                />
              </View>
              <Divider />
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render de la section confidentialité
  const renderPrivacySection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🔒 Confidentialité
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Partager ma localisation
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Pour trouver les restaurants proches
              </Text>
            </View>
            <Switch
              value={settings.privacy.shareLocation}
              onValueChange={(value) => handlePrivacyChange('shareLocation', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Données d'usage
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Améliorer l'application (anonyme)
              </Text>
            </View>
            <Switch
              value={settings.privacy.shareUsageData}
              onValueChange={(value) => handlePrivacyChange('shareUsageData', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Emails marketing
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Newsletters et offres par email
              </Text>
            </View>
            <Switch
              value={settings.privacy.marketingEmails}
              onValueChange={(value) => handlePrivacyChange('marketingEmails', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Profil visible
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Autoriser les autres utilisateurs à voir mon profil
              </Text>
            </View>
            <Switch
              value={settings.privacy.profileVisible}
              onValueChange={(value) => handlePrivacyChange('profileVisible', value)}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render de la section compte utilisateur
  const renderAccountSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            👤 Mon Compte
          </Text>

          <List.Item
            title="Changer le mot de passe"
            description="Modifier votre mot de passe"
            left={(props) => <List.Icon {...props} icon="key" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPasswordDialog(true)}
          />

          <Divider />

          <List.Item
            title="Modifier l'email"
            description={user?.email || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Modifier email', 'Fonctionnalité bientôt disponible')}
          />

          <Divider />

          <List.Item
            title="Supprimer le compte"
            description="Action irréversible"
            left={(props) => <List.Icon {...props} icon="delete" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert(
              'Supprimer le compte',
              'Cette action est irréversible. Toutes vos données seront perdues.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => Alert.alert('Suppression', 'Fonctionnalité bientôt disponible') }
              ]
            )}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render de la section application
  const renderAppSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            ⚙️ Application
          </Text>

          <List.Item
            title="Langue"
            description={LANGUAGES.find(l => l.code === settings.language)?.name || 'Français'}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={() => (
              <Text style={styles.languageFlag}>
                {LANGUAGES.find(l => l.code === settings.language)?.flag}
              </Text>
            )}
            onPress={() => setShowLanguageDialog(true)}
          />

          <Divider />

          <List.Item
            title="Devise"
            description={CURRENCIES.find(c => c.code === settings.currency)?.name || 'Euro (€)'}
            left={(props) => <List.Icon {...props} icon="currency-eur" />}
            right={() => (
              <Text style={[styles.currencySymbol, { color: currentTheme.colors.onSurfaceVariant }]}>
                {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
              </Text>
            )}
            onPress={() => setShowCurrencyDialog(true)}
          />

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Unité de distance
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                {settings.distanceUnit === 'km' ? 'Kilomètres' : 'Miles'}
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={handleDistanceUnitChange}
              style={styles.unitButton}
            >
              {settings.distanceUnit.toUpperCase()}
            </Button>
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Localisation automatique
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Détecter automatiquement votre position
              </Text>
            </View>
            <Switch
              value={settings.autoLocation}
              onValueChange={handleAutoLocationChange}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>

          <Divider />

          <List.Item
            title="Thème"
            description={`${themeMetadata[selectedTheme]?.emoji} ${themeMetadata[selectedTheme]?.name}`}
            left={(props) => <List.Icon {...props} icon="palette" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/designs/design-selector')}
          />
        </Card.Content>
      </Card>

      {/* Actions avancées */}
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🔧 Actions Avancées
          </Text>

          <Button
            mode="outlined"
            icon="export"
            onPress={handleExportSettings}
            style={styles.actionButton}
          >
            Exporter les paramètres
          </Button>

          <Button
            mode="outlined"
            icon="restore"
            onPress={() => setShowResetDialog(true)}
            style={styles.actionButton}
          >
            Réinitialiser les paramètres
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render de la section à propos
  const renderAboutSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            ℹ️ À Propos
          </Text>

          <List.Item
            title="Version de l'application"
            description="1.0.0 (Build 1)"
            left={(props) => <List.Icon {...props} icon="information" />}
          />

          <Divider />

          <List.Item
            title="Conditions d'utilisation"
            description="Lire les CGU"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL('https://oneeats.com/terms')}
          />

          <Divider />

          <List.Item
            title="Politique de confidentialité"
            description="Protection de vos données"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL('https://oneeats.com/privacy')}
          />

          <Divider />

          <List.Item
            title="Support client"
            description="support@oneeats.com"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="email" />}
            onPress={() => Linking.openURL('mailto:support@oneeats.com')}
          />

          <Divider />

          <List.Item
            title="Évaluer l'application"
            description="Donnez votre avis sur les stores"
            left={(props) => <List.Icon {...props} icon="star" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Alert.alert('Évaluer', 'Merci ! Cette fonctionnalité sera bientôt disponible.')}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: activeSection 
            ? {
                notifications: 'Notifications',
                dietary: 'Préférences Alimentaires',
                privacy: 'Confidentialité',
                account: 'Mon Compte',
                app: 'Application',
                about: 'À Propos',
              }[activeSection]
            : 'Paramètres Avancés',
          headerStyle: { backgroundColor: currentTheme.colors.surface },
          headerTitleStyle: { 
            color: currentTheme.colors.onSurface,
            fontWeight: '600'
          },
          headerBackTitle: activeSection ? 'Paramètres' : 'Profil',
          headerTintColor: currentTheme.colors.onSurface,
          headerLeft: activeSection ? () => (
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={currentTheme.colors.onSurface}
              onPress={goBack}
            />
          ) : undefined,
        }} 
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar style="auto" />
        
        <Animated.View entering={SlideInRight} style={styles.content}>
          {activeSection === null && renderMainMenu()}
          {activeSection === 'notifications' && renderNotificationsSection()}
          {activeSection === 'dietary' && renderDietarySection()}
          {activeSection === 'privacy' && renderPrivacySection()}
          {activeSection === 'account' && renderAccountSection()}
          {activeSection === 'app' && renderAppSection()}
          {activeSection === 'about' && renderAboutSection()}
        </Animated.View>

        {/* Dialogs */}
        <Portal>
          {/* Dialog choix de langue */}
          <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
            <Dialog.Title>Choisir la langue</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={handleLanguageChange}
                value={settings.language}
              >
                {LANGUAGES.map((language) => (
                  <RadioButton.Item
                    key={language.code}
                    label={`${language.flag} ${language.name}`}
                    value={language.code}
                  />
                ))}
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLanguageDialog(false)}>Annuler</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Dialog choix de devise */}
          <Dialog visible={showCurrencyDialog} onDismiss={() => setShowCurrencyDialog(false)}>
            <Dialog.Title>Choisir la devise</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={handleCurrencyChange}
                value={settings.currency}
              >
                {CURRENCIES.map((currency) => (
                  <RadioButton.Item
                    key={currency.code}
                    label={`${currency.symbol} ${currency.name}`}
                    value={currency.code}
                  />
                ))}
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowCurrencyDialog(false)}>Annuler</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Dialog changement de mot de passe */}
          <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
            <Dialog.Title>Changer le mot de passe</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nouveau mot de passe"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                mode="outlined"
                style={styles.passwordInput}
              />
              <TextInput
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                style={styles.passwordInput}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowPasswordDialog(false)}>Annuler</Button>
              <Button mode="contained" onPress={handlePasswordChange}>Modifier</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Dialog réinitialisation */}
          <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
            <Dialog.Title>Réinitialiser les paramètres</Dialog.Title>
            <Dialog.Content>
              <Text>Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowResetDialog(false)}>Annuler</Button>
              <Button mode="contained" onPress={handleResetSettings}>Réinitialiser</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </>
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
  menuCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  dietaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dietaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  languageFlag: {
    fontSize: 20,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  unitButton: {
    borderRadius: 8,
  },
  actionButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  passwordInput: {
    marginBottom: 8,
  },
});