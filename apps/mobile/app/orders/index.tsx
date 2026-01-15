import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import {
  Card,
  Button,
  Surface,
  Chip,
  Avatar,
  ProgressBar,
} from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useOrder } from '../../src/contexts/OrderContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { Order } from '../../src/types';
import EmptyState from '../../src/components/ui/EmptyState';

type OrderTabType = 'current' | 'history';

// Configuration des statuts
const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string; progress: number }> = {
  pending: { icon: 'schedule', label: 'En attente', color: '#9A3412', bgColor: '#FED7AA', progress: 0.2 },
  confirmed: { icon: 'check-circle', label: 'Confirmée', color: '#047857', bgColor: '#A7F3D0', progress: 0.4 },
  preparing: { icon: 'restaurant', label: 'En préparation', color: '#92400E', bgColor: '#FDE68A', progress: 0.7 },
  ready: { icon: 'done-all', label: 'Prête !', color: '#166534', bgColor: '#BBF7D0', progress: 0.95 },
  completed: { icon: 'check', label: 'Récupérée', color: '#166534', bgColor: '#BBF7D0', progress: 1 },
  cancelled: { icon: 'close', label: 'Annulée', color: '#DC2626', bgColor: '#FECACA', progress: 0 },
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderTabType>('current');
  const [refreshing, setRefreshing] = useState(false);

  const { orders, refreshOrders } = useOrder();
  const { currentTheme } = useAppTheme();

  // Séparer les commandes
  const activeOrders = orders.filter(o =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );
  const completedOrders = orders.filter(o =>
    ['completed', 'cancelled'].includes(o.status)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab: OrderTabType) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Rendu d'une commande active
  const renderActiveOrder = (order: Order, index: number) => {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    return (
      <Animated.View
        key={order.id}
        entering={SlideInUp.delay(index * 100)}
      >
        <Card
          style={[styles.orderCard, { backgroundColor: currentTheme.colors.surface }]}
          onPress={() => router.push(`/order/${order.id}`)}
        >
          <Card.Content>
            {/* Header avec statut */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>
                  {order.restaurant?.name || 'Restaurant'}
                </Text>
                <Text style={[styles.orderNumber, { color: currentTheme.colors.onSurfaceVariant }]}>
                  #{order.orderNumber?.split('-').pop() || order.id.substring(0, 8)}
                </Text>
              </View>
              <Chip
                icon={() => <MaterialIcons name={status.icon as any} size={16} color={status.color} />}
                style={{ backgroundColor: status.bgColor }}
                textStyle={{ color: status.color, fontSize: 12, fontWeight: '600' }}
              >
                {status.label}
              </Chip>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={status.progress}
                color={status.color}
                style={styles.progressBar}
              />
            </View>

            {/* Détails */}
            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="access-time" size={16} color={currentTheme.colors.onSurfaceVariant} />
                <Text style={[styles.detailText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Retrait: {order.pickupTime instanceof Date
                    ? order.pickupTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    : 'Heure non définie'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="receipt" size={16} color={currentTheme.colors.onSurfaceVariant} />
                <Text style={[styles.detailText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {order.items?.length || 0} articles • {(order.total || 0).toFixed(2)}€
                </Text>
              </View>
            </View>

            {/* Actions */}
            <Button
              mode="outlined"
              onPress={() => router.push(`/order/${order.id}`)}
              style={styles.viewButton}
            >
              Voir les détails
            </Button>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // Rendu d'une commande historique
  const renderHistoryOrder = (order: Order, index: number) => {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.completed;
    const orderDate = order.orderTime instanceof Date
      ? order.orderTime
      : new Date(order.orderTime);

    return (
      <Animated.View
        key={order.id}
        entering={FadeIn.delay(index * 50)}
      >
        <Card
          style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface }]}
          onPress={() => router.push(`/order/${order.id}`)}
        >
          <Card.Content>
            <View style={styles.historyHeader}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyRestaurant, { color: currentTheme.colors.onSurface }]}>
                  {order.restaurant?.name || 'Restaurant'}
                </Text>
                <Text style={[styles.historyDate, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {orderDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
              </View>
              <Chip
                icon={() => <MaterialIcons name={status.icon as any} size={14} color={status.color} />}
                style={{ backgroundColor: status.bgColor }}
                textStyle={{ color: status.color, fontSize: 11 }}
                compact
              >
                {status.label}
              </Chip>
            </View>

            <View style={styles.historyDetails}>
              <Text style={[styles.historyItems, { color: currentTheme.colors.onSurfaceVariant }]}>
                {order.items?.length || 0} articles
              </Text>
              <Text style={[styles.historyTotal, { color: currentTheme.colors.primary }]}>
                {(order.total || 0).toFixed(2)}€
              </Text>
            </View>

            {order.status === 'completed' && (
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert('Recommander', 'Fonctionnalité bientôt disponible');
                }}
                style={styles.reorderButton}
                buttonColor={currentTheme.colors.primary}
                compact
              >
                Recommander
              </Button>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // État vide
  const renderEmptyState = (type: 'current' | 'history') => (
    <EmptyState
      variant="orders"
      title={type === 'current' ? 'Aucune commande en cours' : 'Pas d\'historique'}
      subtitle={type === 'current'
        ? 'Vos commandes actives apparaîtront ici'
        : 'Vos commandes terminées s\'afficheront ici'}
      icon={type === 'current' ? 'pending-actions' : 'history'}
      actionLabel={type === 'current' ? 'Commander maintenant' : undefined}
      onAction={type === 'current' ? () => router.push('/(tabs)/') : undefined}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mes Commandes',
          headerStyle: { backgroundColor: currentTheme.colors.surface },
          headerTitleStyle: { color: currentTheme.colors.onSurface, fontWeight: '600' },
          headerTintColor: currentTheme.colors.onSurface,
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
        edges={['bottom']}
      >
        <StatusBar style="auto" />

        {/* Tabs */}
        <Surface style={[styles.tabsContainer, { backgroundColor: currentTheme.colors.surface }]} elevation={1}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'current' && { backgroundColor: currentTheme.colors.primaryContainer }
              ]}
              onPress={() => handleTabChange('current')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'current' ? currentTheme.colors.onPrimaryContainer : currentTheme.colors.onSurfaceVariant }
              ]}>
                En cours
              </Text>
              {activeOrders.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: currentTheme.colors.primary }]}>
                  <Text style={[styles.tabBadgeText, { color: currentTheme.colors.onPrimary }]}>
                    {activeOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'history' && { backgroundColor: currentTheme.colors.primaryContainer }
              ]}
              onPress={() => handleTabChange('history')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'history' ? currentTheme.colors.onPrimaryContainer : currentTheme.colors.onSurfaceVariant }
              ]}>
                Historique
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={currentTheme.colors.primary}
              colors={[currentTheme.colors.primary]}
            />
          }
        >
          {activeTab === 'current' && (
            activeOrders.length === 0
              ? renderEmptyState('current')
              : activeOrders.map((order, index) => renderActiveOrder(order, index))
          )}

          {activeTab === 'history' && (
            completedOrders.length === 0
              ? renderEmptyState('history')
              : completedOrders.map((order, index) => renderHistoryOrder(order, index))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  // Order cards (active)
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 13,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  viewButton: {
    borderRadius: 8,
  },
  // History cards
  historyCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyRestaurant: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItems: {
    fontSize: 13,
  },
  historyTotal: {
    fontSize: 15,
    fontWeight: '600',
  },
  reorderButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
});
