import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Card,
  Button,
  Badge,
  Divider,
  Switch,
} from 'react-native-paper';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';

import { useAppTheme } from '../../src/contexts/ThemeContext';
import { usePushNotifications, useNotificationTester } from '../../src/contexts/PushNotificationContext';
import { useOrder } from '../../src/contexts/OrderContext';

export default function TestNotificationsScreen() {
  const [autoMode, setAutoMode] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const { currentTheme } = useAppTheme();
  const { 
    expoPushToken, 
    notifications, 
    unreadCount, 
    permissionStatus,
    requestPermissions,
    sendOrderStatusNotification,
    sendPromotionNotification,
    sendRecommendationNotification,
    markAllAsRead,
    clearNotifications,
  } = usePushNotifications();
  
  const { testOrderFlow } = useNotificationTester();
  const { orders, updateOrderStatus } = useOrder();

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Permissions accordées', 'Vous allez maintenant recevoir les notifications push !');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleTestOrderStatus = (status: string) => {
    sendOrderStatusNotification(`test-${Date.now()}`, status, 'Restaurant Test');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTestPromotion = () => {
    const promotions = [
      { title: '🔥 Flash Sale !', message: '-30% sur tous les burgers jusqu\'à minuit !' },
      { title: '🍕 Pizza Party', message: '2 pizzas achetées = 1 offerte ce weekend' },
      { title: '🌟 Nouveau restaurant', message: 'Sushi Master vient d\'ouvrir près de chez vous !' },
      { title: '🎉 Happy Hour', message: 'Cocktails à -50% de 17h à 19h' },
    ];
    
    const randomPromo = promotions[Math.floor(Math.random() * promotions.length)];
    sendPromotionNotification(randomPromo.title, randomPromo.message, 'test-restaurant');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTestRecommendation = () => {
    const recommendations = [
      { title: 'Basé sur vos goûts', message: 'Nous pensons que vous allez adorer la cuisine thaï !' },
      { title: 'Tendance près de vous', message: 'Les bowls healthy sont très populaires dans votre quartier' },
      { title: 'Nouveau plat à essayer', message: 'Avez-vous déjà goûté aux raviolis vapeur ?' },
    ];
    
    const randomReco = recommendations[Math.floor(Math.random() * recommendations.length)];
    sendRecommendationNotification(randomReco.title, randomReco.message);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAutoMode = (enabled: boolean) => {
    setAutoMode(enabled);
    
    if (enabled) {
      // Démarrer le mode automatique
      const id = setInterval(() => {
        const actions = [
          () => handleTestOrderStatus(['confirmed', 'preparing', 'ready', 'completed'][Math.floor(Math.random() * 4)]),
          handleTestPromotion,
          handleTestRecommendation,
        ];
        
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        randomAction();
      }, 5000); // Toutes les 5 secondes
      
      setIntervalId(id);
      Alert.alert('Mode auto activé', 'Une notification sera envoyée toutes les 5 secondes');
    } else {
      // Arrêter le mode automatique
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      Alert.alert('Mode auto désactivé', 'Les notifications automatiques sont arrêtées');
    }
  };

  const handleSimulateOrderFlow = () => {
    Alert.alert(
      'Simuler une commande complète',
      'Ceci va déclencher une séquence de notifications pour simuler le cycle complet d\'une commande.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Démarrer', 
          onPress: () => {
            testOrderFlow();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const handleUpdateRealOrder = () => {
    if (orders.length === 0) {
      Alert.alert('Aucune commande', 'Créez d\'abord une commande pour tester les vraies notifications.');
      return;
    }

    const activeOrder = orders.find(o => o.status !== 'completed' && o.status !== 'cancelled');
    if (!activeOrder) {
      Alert.alert('Aucune commande active', 'Toutes vos commandes sont terminées.');
      return;
    }

    const nextStatus = {
      'pending': 'confirmed',
      'confirmed': 'preparing', 
      'preparing': 'ready',
      'ready': 'completed',
    }[activeOrder.status];

    if (nextStatus) {
      updateOrderStatus(activeOrder.id, nextStatus as any);
      sendOrderStatusNotification(activeOrder.id, nextStatus, activeOrder.restaurant.name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Statut mis à jour', `Commande passée à: ${nextStatus}`);
    }
  };

  const renderPermissionStatus = () => (
    <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
      <Card.Content>
        <View style={styles.permissionHeader}>
          <MaterialIcons 
            name={permissionStatus === 'granted' ? 'notifications-active' : 'notifications-off'} 
            size={24} 
            color={permissionStatus === 'granted' ? currentTheme.colors.primary : currentTheme.colors.error} 
          />
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            Permissions Push
          </Text>
        </View>
        
        <Text style={[styles.statusText, { color: currentTheme.colors.onSurfaceVariant }]}>
          Statut: <Text style={{ fontWeight: '600', color: permissionStatus === 'granted' ? currentTheme.colors.primary : currentTheme.colors.error }}>
            {permissionStatus === 'granted' ? '✅ Accordées' : '❌ Refusées'}
          </Text>
        </Text>
        
        {expoPushToken && (
          <Text style={[styles.tokenText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Token: {expoPushToken.substring(0, 20)}...
          </Text>
        )}
        
        {permissionStatus !== 'granted' && (
          <Button
            mode="contained"
            onPress={handlePermissionRequest}
            style={styles.permissionButton}
            buttonColor={currentTheme.colors.primary}
          >
            Demander les permissions
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderNotificationStats = () => (
    <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
      <Card.Content>
        <View style={styles.statsHeader}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            Statistiques
          </Text>
          <Badge style={{ backgroundColor: currentTheme.colors.primary }}>{notifications.length}</Badge>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.colors.primary }]}>{notifications.length}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.colors.error }]}>{unreadCount}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>Non lues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.colors.tertiary }]}>
              {notifications.filter(n => n.data.type === 'order_status').length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.onSurfaceVariant }]}>Commandes</Text>
          </View>
        </View>
        
        <View style={styles.statsActions}>
          <Button
            mode="outlined"
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
            style={styles.statButton}
          >
            Tout marquer comme lu
          </Button>
          <Button
            mode="outlined"
            onPress={clearNotifications}
            disabled={notifications.length === 0}
            style={styles.statButton}
            textColor={currentTheme.colors.error}
          >
            Effacer tout
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTestActions = () => (
    <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
      <Card.Content>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
          Tests de Notifications
        </Text>
        
        {/* Mode automatique */}
        <View style={styles.autoModeRow}>
          <Text style={[styles.autoModeLabel, { color: currentTheme.colors.onSurface }]}>
            Mode automatique
          </Text>
          <Switch
            value={autoMode}
            onValueChange={handleAutoMode}
            trackColor={{ false: currentTheme.colors.outline, true: currentTheme.colors.primary }}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Tests individuels */}
        <View style={styles.testGrid}>
          <Button
            mode="contained"
            onPress={() => handleTestOrderStatus('confirmed')}
            style={styles.testButton}
            buttonColor={currentTheme.colors.primary}
            icon="check-circle"
          >
            Commande confirmée
          </Button>
          
          <Button
            mode="contained"
            onPress={() => handleTestOrderStatus('preparing')}
            style={styles.testButton}
            buttonColor={currentTheme.colors.secondary}
            icon="chef-hat"
          >
            En préparation
          </Button>
          
          <Button
            mode="contained"
            onPress={() => handleTestOrderStatus('ready')}
            style={styles.testButton}
            buttonColor={currentTheme.colors.tertiary}
            icon="bell-ring"
          >
            Prêt à récupérer
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleTestPromotion}
            style={styles.testButton}
            icon="sale"
          >
            Promotion
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleTestRecommendation}
            style={styles.testButton}
            icon="lightbulb"
          >
            Recommandation
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleSimulateOrderFlow}
            style={styles.testButton}
            icon="play-circle"
          >
            Flux complet
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Tests avec vraies commandes */}
        <Button
          mode="contained"
          onPress={handleUpdateRealOrder}
          style={styles.realOrderButton}
          buttonColor={currentTheme.colors.primary}
          icon="receipt"
        >
          Tester avec vraie commande ({orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length} active)
        </Button>
      </Card.Content>
    </Card>
  );

  const renderRecentNotifications = () => (
    <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
      <Card.Content>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
          Notifications Récentes (5 dernières)
        </Text>
        
        {notifications.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Aucune notification pour le moment
          </Text>
        ) : (
          notifications.slice(0, 5).map((notification, index) => (
            <View key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: currentTheme.colors.onSurface }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationBody, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {notification.body}
                </Text>
                <Text style={[styles.notificationTime, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {notification.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              {!notification.read && (
                <Badge style={{ backgroundColor: currentTheme.colors.error }}>Nouveau</Badge>
              )}
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Test Notifications Push',
          headerStyle: { backgroundColor: currentTheme.colors.surface },
          headerTitleStyle: { 
            color: currentTheme.colors.onSurface,
            fontWeight: '600'
          },
          headerTintColor: currentTheme.colors.onSurface,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar style="auto" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.delay(100)}>
            {renderPermissionStatus()}
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(200)}>
            {renderNotificationStats()}
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(300)}>
            {renderTestActions()}
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(400)}>
            {renderRecentNotifications()}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  permissionButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
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
  statsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statButton: {
    flex: 1,
    borderRadius: 8,
  },
  autoModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  autoModeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  testGrid: {
    gap: 8,
  },
  testButton: {
    borderRadius: 8,
  },
  realOrderButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 12,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    opacity: 0.7,
  },
});