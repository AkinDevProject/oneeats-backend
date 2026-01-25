import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Switch,
  Dialog,
  Portal,
  Button,
  TextInput,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useSettings } from '../../src/contexts/SettingsContext';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar', symbol: '$' },
  { code: 'GBP', name: 'Livre', symbol: '£' },
];

export default function SettingsScreen() {
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user, changePassword } = useAuth();
  const { currentTheme, selectedTheme, themeMetadata } = useAppTheme();
  const {
    settings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppSettings,
    resetSettings,
    exportSettings,
  } = useSettings();

  // Handlers
  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateNotificationSettings({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    updatePrivacySettings({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLanguageChange = (language: 'fr' | 'en' | 'es') => {
    updateAppSettings({ language });
    setShowLanguageDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCurrencyChange = (currency: 'EUR' | 'USD' | 'GBP') => {
    updateAppSettings({ currency });
    setShowCurrencyDialog(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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
      Alert.alert('Succès', 'Mot de passe modifié');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe');
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings();
      setShowResetDialog(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Paramètres réinitialisés');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de réinitialiser');
    }
  };

  const handleExportSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const settingsData = exportSettings();
      await Share.share({
        message: settingsData,
        title: 'Mes paramètres OneEats',
      });
    } catch (error) {
      // User cancelled
    }
  };

  // Composant Switch Row
  const SwitchRow = ({
    emoji,
    label,
    subtitle,
    value,
    onValueChange,
    iconBg,
  }: {
    emoji: string;
    label: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    iconBg: string;
  }) => (
    <View style={styles.switchRow}>
      <View style={[styles.switchIconContainer, { backgroundColor: iconBg }]}>
        <Text style={styles.switchEmoji}>{emoji}</Text>
      </View>
      <View style={styles.switchTextContainer}>
        <Text style={[styles.switchLabel, { color: currentTheme.colors.onSurface }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.switchSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
      />
    </View>
  );

  // Composant Menu Item
  const MenuItem = ({
    emoji,
    label,
    value,
    onPress,
    iconBg,
  }: {
    emoji: string;
    label: string;
    value?: string;
    onPress: () => void;
    iconBg: string;
  }) => (
    <TouchableRipple onPress={onPress} borderless style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
          <Text style={styles.menuEmoji}>{emoji}</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuLabel, { color: currentTheme.colors.onSurface }]}>
            {label}
          </Text>
        </View>
        {value && (
          <Text style={[styles.menuValue, { color: currentTheme.colors.onSurfaceVariant }]}>
            {value}
          </Text>
        )}
        <Text style={[styles.menuChevron, { color: currentTheme.colors.onSurfaceVariant }]}>›</Text>
      </View>
    </TouchableRipple>
  );

  // Section Header
  const SectionHeader = ({ title, delay }: { title: string; delay: number }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header cohérent */}
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
          Paramètres
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Notifications */}
        <SectionHeader title="NOTIFICATIONS" delay={100} />

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}
        >
          <SwitchRow
            emoji="📦"
            label="Mises à jour commandes"
            subtitle="Statut, préparation, prêt"
            value={settings.notifications.orderUpdates}
            onValueChange={(v) => handleNotificationChange('orderUpdates', v)}
            iconBg="#E3F2FD"
          />
          <View style={styles.divider} />
          <SwitchRow
            emoji="🎁"
            label="Promotions"
            subtitle="Offres et réductions"
            value={settings.notifications.promotions}
            onValueChange={(v) => handleNotificationChange('promotions', v)}
            iconBg="#FFF3E0"
          />
          <View style={styles.divider} />
          <SwitchRow
            emoji="🔔"
            label="Son"
            value={settings.notifications.sound}
            onValueChange={(v) => handleNotificationChange('sound', v)}
            iconBg="#F3E5F5"
          />
          <View style={styles.divider} />
          <SwitchRow
            emoji="📳"
            label="Vibration"
            value={settings.notifications.vibration}
            onValueChange={(v) => handleNotificationChange('vibration', v)}
            iconBg="#E8F5E9"
          />
        </Animated.View>

        {/* Section Apparence */}
        <SectionHeader title="APPARENCE" delay={250} />

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}
        >
          <MenuItem
            emoji={themeMetadata[selectedTheme]?.emoji || '🎨'}
            label="Thème"
            value={themeMetadata[selectedTheme]?.name || 'Clair'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Thème', 'Le thème actuel est : ' + (themeMetadata[selectedTheme]?.name || 'Clair'));
            }}
            iconBg="#E8EAF6"
          />
          <View style={styles.divider} />
          <MenuItem
            emoji={LANGUAGES.find(l => l.code === settings.language)?.flag || '🇫🇷'}
            label="Langue"
            value={LANGUAGES.find(l => l.code === settings.language)?.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLanguageDialog(true);
            }}
            iconBg="#E0F7FA"
          />
          <View style={styles.divider} />
          <MenuItem
            emoji="💰"
            label="Devise"
            value={`${CURRENCIES.find(c => c.code === settings.currency)?.symbol} ${settings.currency}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCurrencyDialog(true);
            }}
            iconBg="#FFF8E1"
          />
        </Animated.View>

        {/* Section Confidentialité */}
        <SectionHeader title="CONFIDENTIALITÉ" delay={400} />

        <Animated.View
          entering={FadeInDown.delay(450).duration(400)}
          style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}
        >
          <SwitchRow
            emoji="📍"
            label="Localisation"
            subtitle="Pour trouver les restaurants proches"
            value={settings.privacy.shareLocation}
            onValueChange={(v) => handlePrivacyChange('shareLocation', v)}
            iconBg="#FFEBEE"
          />
          <View style={styles.divider} />
          <SwitchRow
            emoji="📊"
            label="Données d'usage"
            subtitle="Améliorer l'app (anonyme)"
            value={settings.privacy.shareUsageData}
            onValueChange={(v) => handlePrivacyChange('shareUsageData', v)}
            iconBg="#E8F5E9"
          />
          <View style={styles.divider} />
          <SwitchRow
            emoji="📧"
            label="Emails marketing"
            value={settings.privacy.marketingEmails}
            onValueChange={(v) => handlePrivacyChange('marketingEmails', v)}
            iconBg="#E3F2FD"
          />
        </Animated.View>

        {/* Section Compte */}
        {user && (
          <>
            <SectionHeader title="COMPTE" delay={550} />

            <Animated.View
              entering={FadeInDown.delay(600).duration(400)}
              style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}
            >
              <MenuItem
                emoji="🔑"
                label="Changer mot de passe"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPasswordDialog(true);
                }}
                iconBg="#FCE4EC"
              />
              <View style={styles.divider} />
              <MenuItem
                emoji="📤"
                label="Exporter mes données"
                onPress={handleExportSettings}
                iconBg="#E0F2F1"
              />
              <View style={styles.divider} />
              <MenuItem
                emoji="🔄"
                label="Réinitialiser paramètres"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowResetDialog(true);
                }}
                iconBg="#FFF3E0"
              />
            </Animated.View>
          </>
        )}

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(700)}>
          <Text style={[styles.footer, { color: currentTheme.colors.onSurfaceVariant }]}>
            OneEats v1.0.0
          </Text>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Dialogs */}
      <Portal>
        {/* Dialog Langue */}
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>Choisir la langue</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => handleLanguageChange(value as 'fr' | 'en' | 'es')}
              value={settings.language}
            >
              {LANGUAGES.map((lang) => (
                <RadioButton.Item
                  key={lang.code}
                  label={`${lang.flag} ${lang.name}`}
                  value={lang.code}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Devise */}
        <Dialog visible={showCurrencyDialog} onDismiss={() => setShowCurrencyDialog(false)}>
          <Dialog.Title>Choisir la devise</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => handleCurrencyChange(value as 'EUR' | 'USD' | 'GBP')}
              value={settings.currency}
            >
              {CURRENCIES.map((curr) => (
                <RadioButton.Item
                  key={curr.code}
                  label={`${curr.symbol} ${curr.name} (${curr.code})`}
                  value={curr.code}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCurrencyDialog(false)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Mot de passe */}
        <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
          <Dialog.Title>Changer le mot de passe</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Confirmer"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handlePasswordChange}>Modifier</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Réinitialisation */}
        <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
          <Dialog.Title>Réinitialiser ?</Dialog.Title>
          <Dialog.Content>
            <Text>Tous les paramètres seront remis aux valeurs par défaut.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResetDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleResetSettings}>Réinitialiser</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 70,
  },
  // Switch Row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  switchIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchEmoji: {
    fontSize: 20,
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  menuEmoji: {
    fontSize: 20,
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
    marginRight: 8,
  },
  menuChevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
  bottomSpacer: {
    height: 40,
  },
  // Dialog
  dialogInput: {
    marginBottom: 12,
  },
});
