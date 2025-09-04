import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import {
  Card,
  Button,
  Divider,
  Surface,
  Avatar,
  Badge,
  List,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexts/AuthContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { mockRestaurants } from '../../src/data/mockData';

// Types pour les sections
type ProfileSection = 'account' | 'favorites' | 'settings' | 'support';

export default function ProfileMVP() {
  const [activeSection, setActiveSection] = useState<ProfileSection>('account');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotification();
  const { orders } = useOrder();
  const { currentTheme, selectedTheme, themeMetadata } = useAppTheme();

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Calculer les statistiques utilisateur
  const stats = {
    totalOrders: orders.filter(o => o.status === 'completed').length,
    favoriteRestaurants: user?.favoriteRestaurants?.length || 0,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    level: orders.length >= 10 ? 'Gold' : orders.length >= 5 ? 'Silver' : 'Bronze',
  };

  // Actions
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            logout();
            router.replace('/auth/login' as any);
          }
        }
      ]
    );
  };

  const handleClearNotifications = () => {
    Alert.alert(
      'Supprimer toutes les notifications',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: () => {
            clearNotifications();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  // Favoris simulés
  const favoriteRestaurants = mockRestaurants.slice(0, stats.favoriteRestaurants || 3);

  // Rendu des sections
  const renderSectionTabs = () => (
    <Surface style={styles.tabsContainer} elevation={1}>
      <View style={styles.tabs}>
        {[
          { key: 'account' as ProfileSection, title: 'Compte', icon: 'account' },
          { key: 'favorites' as ProfileSection, title: 'Favoris', icon: 'heart' },
          { key: 'settings' as ProfileSection, title: 'Réglages', icon: 'cog' },
          { key: 'support' as ProfileSection, title: 'Aide', icon: 'help-circle' },
        ].map(({ key, title, icon }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeSection === key && { backgroundColor: currentTheme.colors.primaryContainer }
            ]}
            onPress={() => {
              setActiveSection(key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Avatar.Icon
              size={24}
              icon={icon}
              style={{
                backgroundColor: activeSection === key ? currentTheme.colors.primary : currentTheme.colors.surfaceVariant,
                marginBottom: 4,
              }}
            />
            <Text style={[
              styles.tabText,
              {
                color: activeSection === key ? currentTheme.colors.onPrimaryContainer : currentTheme.colors.onSurface
              }
            ]}>
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  // Section Compte
  const renderAccountSection = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content style={styles.loginPrompt}>
              <Avatar.Icon size={80} icon="account-outline" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
              <Text style={[styles.promptTitle, { color: currentTheme.colors.onSurface }]}>
                Connectez-vous
              </Text>
              <Text style={[styles.promptSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                Accédez à votre profil et vos commandes
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/auth/login' as any)}
                style={styles.loginButton}
                buttonColor={currentTheme.colors.primary}
              >
                Se connecter
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return (
      <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
        {/* Info utilisateur */}
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={64}
                label={user?.name?.substring(0, 2).toUpperCase() || 'U'}
                style={{ backgroundColor: currentTheme.colors.primary }}
              />
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: currentTheme.colors.onSurface }]}>
                  {user?.name || 'Utilisateur'}
                </Text>
                <Text style={[styles.userEmail, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {user?.email || user?.phone || 'Non renseigné'}
                </Text>
                <Badge style={{ backgroundColor: currentTheme.colors.tertiary }}>
                  Niveau {stats.level}
                </Badge>
              </View>
              <IconButton
                icon="pencil"
                size={24}
                onPress={() => Alert.alert('Modifier profil', 'Fonctionnalité bientôt disponible')}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Statistiques */}
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="bar-chart" size={20} color={currentTheme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                Mes statistiques
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentTheme.colors.primary }]}>
                  {stats.totalOrders}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Commandes
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentTheme.colors.primary }]}>
                  {stats.favoriteRestaurants}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Favoris
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentTheme.colors.primary }]}>
                  {stats.totalSpent.toFixed(0)}€
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Dépensé
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Menu principal */}
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="apps" size={20} color={currentTheme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                Menu
              </Text>
            </View>
            <List.Item
              title="Mes commandes"
              description="Historique de toutes mes commandes"
              left={(props) => <List.Icon {...props} icon="receipt" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/(tabs)/cart' as any)}
            />
            <List.Item
              title="Favoris"
              description="Mes restaurants préférés"
              left={(props) => <List.Icon {...props} icon="heart" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Favoris', 'Fonctionnalité bientôt disponible')}
            />
            <List.Item
              title="Réglages"
              description="Préférences et configuration"
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Réglages', 'Fonctionnalité bientôt disponible')}
            />
            <List.Item
              title="Aide & Support"
              description="Besoin d'aide ?"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Aide', 'Fonctionnalité bientôt disponible')}
            />
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notifications" size={20} color={currentTheme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                Notifications
              </Text>
            </View>
            <List.Item
              title="Notifications"
              description={`${unreadCount} messages non lus`}
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <List.Icon icon="chevron-right" />}
              onPress={() => setActiveSection('support')}
            />
          </Card.Content>
        </Card>

        {/* Déconnexion */}
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              textColor={currentTheme.colors.error}
              style={[styles.logoutButton, { borderColor: currentTheme.colors.error }]}
            >
              Se déconnecter
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  // Section Favoris
  const renderFavoritesSection = () => (
    <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
      {favoriteRestaurants.length === 0 ? (
        <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content style={styles.emptyState}>
            <Avatar.Icon size={80} icon="heart-outline" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
            <Text style={[styles.emptyTitle, { color: currentTheme.colors.onSurface }]}>
              Aucun favori
            </Text>
            <Text style={[styles.emptySubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
              Ajoutez vos restaurants préférés pour les retrouver facilement
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)/' as any)}
              style={styles.emptyButton}
              buttonColor={currentTheme.colors.primary}
            >
              Découvrir des restaurants
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="favorite" size={24} color={currentTheme.colors.primary} />
            <Text style={[styles.pageTitle, { color: currentTheme.colors.onSurface }]}>
              Mes restaurants favoris ({favoriteRestaurants.length})
            </Text>
          </View>
          {favoriteRestaurants.map((restaurant) => (
            <Card key={restaurant.id} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <View style={styles.restaurantItem}>
                  <View style={styles.restaurantInfo}>
                    <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>
                      {restaurant.name}
                    </Text>
                    <Text style={[styles.restaurantCuisine, { color: currentTheme.colors.onSurfaceVariant }]}>
                      {restaurant.cuisine} • ★ {restaurant.rating}
                    </Text>
                    <Text style={[styles.restaurantDetails, { color: currentTheme.colors.onSurfaceVariant }]}>
                      {restaurant.deliveryTime} • {restaurant.distance}
                    </Text>
                  </View>
                  <View style={styles.restaurantActions}>
                    <IconButton
                      icon="heart"
                      size={24}
                      iconColor={currentTheme.colors.error}
                      onPress={() => Alert.alert('Retirer des favoris', 'Fonctionnalité bientôt disponible')}
                    />
                    <Button
                      mode="contained"
                      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                      buttonColor={currentTheme.colors.primary}
                      style={styles.viewButton}
                    >
                      Voir
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );

  // Section Paramètres
  const renderSettingsSection = () => (
    <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
      {/* Thème */}
      <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🎨 Apparence
          </Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
              Thème de couleur
            </Text>
            <Text style={[styles.settingValue, { color: currentTheme.colors.onSurfaceVariant }]}>
              {themeMetadata[selectedTheme]?.emoji} {themeMetadata[selectedTheme]?.name}
            </Text>
          </View>
          <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
            Changement de thème bientôt disponible
          </Text>
        </Card.Content>
      </Card>

      {/* Notifications */}
      <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🔔 Notifications
          </Text>
          <View style={styles.settingItem}>
            <View>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Notifications push
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Recevoir les mises à jour de commandes
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>
          <Divider />
          <View style={styles.settingItem}>
            <View>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Marketing
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Promotions et offres spéciales
              </Text>
            </View>
            <Switch
              value={marketingEnabled}
              onValueChange={setMarketingEnabled}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Localisation */}
      <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            📍 Localisation
          </Text>
          <View style={styles.settingItem}>
            <View>
              <Text style={[styles.settingLabel, { color: currentTheme.colors.onSurface }]}>
                Services de localisation
              </Text>
              <Text style={[styles.settingDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                Pour trouver les restaurants proches
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Section Support
  const renderSupportSection = () => (
    <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
      {/* Notifications */}
      <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <View style={styles.notificationHeader}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
              🔔 Notifications ({notifications.length})
            </Text>
            {notifications.length > 0 && (
              <Button
                mode="text"
                onPress={handleClearNotifications}
                textColor={currentTheme.colors.error}
              >
                Tout supprimer
              </Button>
            )}
          </View>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Avatar.Icon size={60} icon="bell-outline" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
              <Text style={[styles.emptyTitle, { color: currentTheme.colors.onSurface, fontSize: 16 }]}>
                Aucune notification
              </Text>
            </View>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Avatar.Icon
                  size={32}
                  icon="bell"
                  style={{ backgroundColor: currentTheme.colors.primaryContainer }}
                />
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: currentTheme.colors.onSurface }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {notification.message}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🆘 Support & Aide
          </Text>
          <List.Item
            title="FAQ"
            description="Questions fréquemment posées"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('FAQ', 'Fonctionnalité bientôt disponible')}
          />
          <List.Item
            title="Nous contacter"
            description="Besoin d'aide ? Contactez-nous"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Contact', 'support@oneeats.com')}
          />
          <List.Item
            title="À propos"
            description="OneEats v1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('OneEats', 'Version 1.0.0\nApplication de commande de repas')}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="dark" backgroundColor={currentTheme.colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Surface style={[styles.headerSurface, { backgroundColor: currentTheme.colors.surface }]} elevation={1}>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
            Mon Compte
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            Profil, favoris et paramètres
          </Text>
        </Surface>
      </Animated.View>

      {/* Tabs */}
      {renderSectionTabs()}

      {/* Content */}
      <View style={styles.content}>
        {activeSection === 'account' && renderAccountSection()}
        {activeSection === 'favorites' && renderFavoritesSection()}
        {activeSection === 'settings' && renderSettingsSection()}
        {activeSection === 'support' && renderSupportSection()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerSurface: {
    padding: 16,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  promptSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  logoutButton: {
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    marginBottom: 4,
  },
  restaurantDetails: {
    fontSize: 12,
  },
  restaurantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  themeSelector: {
    marginTop: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 12,
    marginTop: 2,
  },
});