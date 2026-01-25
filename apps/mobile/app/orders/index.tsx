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
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import {
  Surface,
  ProgressBar,
  TouchableRipple,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useOrder } from '../../src/contexts/OrderContext';
import { useCart } from '../../src/contexts/CartContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { Order } from '../../src/types';
import EmptyState from '../../src/components/ui/EmptyState';

type OrderTabType = 'current' | 'history';

// Configuration des statuts
const STATUS_CONFIG: Record<string, { icon: string; emoji: string; label: string; color: string; bgColor: string; progress: number }> = {
  pending: { icon: 'schedule', emoji: '⏳', label: 'En attente', color: '#9A3412', bgColor: '#FED7AA', progress: 0.2 },
  confirmed: { icon: 'check-circle', emoji: '✅', label: 'Confirmée', color: '#047857', bgColor: '#A7F3D0', progress: 0.4 },
  preparing: { icon: 'restaurant', emoji: '👨‍🍳', label: 'En préparation', color: '#92400E', bgColor: '#FDE68A', progress: 0.7 },
  ready: { icon: 'done-all', emoji: '🎉', label: 'Prête !', color: '#166534', bgColor: '#BBF7D0', progress: 0.95 },
  completed: { icon: 'check', emoji: '✓', label: 'Récupérée', color: '#166534', bgColor: '#BBF7D0', progress: 1 },
  cancelled: { icon: 'close', emoji: '❌', label: 'Annulée', color: '#DC2626', bgColor: '#FECACA', progress: 0 },
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderTabType>('current');
  const [refreshing, setRefreshing] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const { orders, refreshOrders } = useOrder();
  const { addItem, clearCart } = useCart();
  const { currentTheme } = useAppTheme();
  const { user, isLoading: authLoading } = useAuth();

  // Guard d'authentification - rediriger vers login si non connecte
  if (!authLoading && !user) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: currentTheme.colors.background }}
        edges={['top', 'bottom']}
      >
        <StatusBar style="auto" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="lock-outline" size={64} color={currentTheme.colors.onSurfaceVariant} />
          <Text style={{ fontSize: 20, fontWeight: '600', color: currentTheme.colors.onSurface, marginTop: 16, textAlign: 'center' }}>
            Connexion requise
          </Text>
          <Text style={{ fontSize: 14, color: currentTheme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
            Connectez-vous pour voir vos commandes
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={{
              marginTop: 24,
              backgroundColor: currentTheme.colors.primary,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: currentTheme.colors.onPrimary, fontSize: 16, fontWeight: '600' }}>
              Se connecter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: currentTheme.colors.primary, fontSize: 14 }}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  // Fonction pour recommander
  const handleReorder = (order: Order) => {
    Alert.alert(
      'Recommander',
      `Voulez-vous ajouter les ${order.items?.length || 0} articles de cette commande à votre panier ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider et ajouter',
          style: 'destructive',
          onPress: async () => {
            setReordering(order.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              // Vider le panier actuel
              clearCart();

              // Ajouter chaque item de la commande
              for (const item of order.items || []) {
                addItem(
                  {
                    ...item.menuItem,
                    options: item.options,
                    totalPrice: item.totalPrice,
                    quantity: item.quantity,
                  },
                  item.quantity,
                  item.specialInstructions
                );
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Naviguer vers le panier
              router.push('/(tabs)/cart');
            } catch (error) {
              console.error('Erreur reorder:', error);
              Alert.alert('Erreur', 'Impossible de recommander cette commande');
            } finally {
              setReordering(null);
            }
          }
        },
        {
          text: 'Ajouter au panier',
          onPress: async () => {
            setReordering(order.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              // Ajouter chaque item sans vider le panier
              for (const item of order.items || []) {
                addItem(
                  {
                    ...item.menuItem,
                    options: item.options,
                    totalPrice: item.totalPrice,
                    quantity: item.quantity,
                  },
                  item.quantity,
                  item.specialInstructions
                );
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Articles ajoutés !',
                'Les articles ont été ajoutés à votre panier.',
                [
                  { text: 'Continuer', style: 'cancel' },
                  { text: 'Voir le panier', onPress: () => router.push('/(tabs)/cart') }
                ]
              );
            } catch (error) {
              console.error('Erreur reorder:', error);
              Alert.alert('Erreur', 'Impossible de recommander cette commande');
            } finally {
              setReordering(null);
            }
          }
        }
      ]
    );
  };

  // Formater l'heure de retrait
  const formatPickupTime = (pickupTime: Date | string | undefined): string => {
    if (!pickupTime) return 'Dès que possible';

    try {
      const date = pickupTime instanceof Date ? pickupTime : new Date(pickupTime);
      if (isNaN(date.getTime())) return 'Dès que possible';
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Dès que possible';
    }
  };

  // Formater la date de commande
  const formatOrderDate = (orderTime: Date | string): string => {
    try {
      const date = orderTime instanceof Date ? orderTime : new Date(orderTime);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  // Rendu d'une commande active
  const renderActiveOrder = (order: Order, index: number) => {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    return (
      <Animated.View
        key={order.id}
        entering={SlideInUp.delay(index * 100)}
      >
        <TouchableRipple
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/order/${order.id}`);
          }}
          borderless
          style={[styles.orderCard, { backgroundColor: currentTheme.colors.surface }]}
        >
          <View style={styles.orderCardContent}>
            {/* Header avec statut */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>
                  {order.restaurant?.name || 'Restaurant'}
                </Text>
                <Text style={[styles.orderNumber, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Commande #{order.orderNumber?.split('-').pop() || order.id.substring(0, 8)}
                </Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: status.bgColor }]}>
                <Text style={{ fontSize: 14 }}>{status.emoji}</Text>
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={status.progress}
                color={status.color}
                style={styles.progressBar}
              />
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Commandée
                </Text>
                <Text style={[styles.progressLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Prête
                </Text>
              </View>
            </View>

            {/* Détails */}
            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <Text style={{ fontSize: 16 }}>🕐</Text>
                <Text style={[styles.detailText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Retrait : {formatPickupTime(order.pickupTime)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={{ fontSize: 16 }}>🧾</Text>
                <Text style={[styles.detailText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''} • {(order.total || 0).toFixed(2)}€
                </Text>
              </View>
            </View>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <Text style={[styles.ctaText, { color: currentTheme.colors.primary }]}>
                Voir les détails →
              </Text>
            </View>
          </View>
        </TouchableRipple>
      </Animated.View>
    );
  };

  // Rendu d'une commande historique
  const renderHistoryOrder = (order: Order, index: number) => {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.completed;
    const isReordering = reordering === order.id;

    return (
      <Animated.View
        key={order.id}
        entering={FadeInDown.delay(index * 50).duration(400)}
      >
        <View style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface }]}>
          <TouchableRipple
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/order/${order.id}`);
            }}
            borderless
            style={styles.historyCardTouchable}
          >
            <View>
              <View style={styles.historyHeader}>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyRestaurant, { color: currentTheme.colors.onSurface }]}>
                    {order.restaurant?.name || 'Restaurant'}
                  </Text>
                  <Text style={[styles.historyDate, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {formatOrderDate(order.orderTime)}
                  </Text>
                </View>
                <View style={[styles.historyStatusChip, { backgroundColor: status.bgColor }]}>
                  <Text style={{ fontSize: 12 }}>{status.emoji}</Text>
                  <Text style={[styles.historyStatusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <View style={styles.historyDetails}>
                <Text style={[styles.historyItems, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                </Text>
                <Text style={[styles.historyTotal, { color: currentTheme.colors.onSurface }]}>
                  {(order.total || 0).toFixed(2)}€
                </Text>
              </View>
            </View>
          </TouchableRipple>

          {/* Bouton Recommander - seulement pour les commandes complétées */}
          {order.status === 'completed' && (
            <TouchableRipple
              onPress={() => handleReorder(order)}
              disabled={isReordering}
              borderless
              style={[styles.reorderButton, { backgroundColor: currentTheme.colors.primaryContainer }]}
            >
              <View style={styles.reorderContent}>
                <Text style={{ fontSize: 16 }}>{isReordering ? '⏳' : '🔄'}</Text>
                <Text style={[styles.reorderText, { color: currentTheme.colors.onPrimaryContainer }]}>
                  {isReordering ? 'Ajout en cours...' : 'Recommander'}
                </Text>
              </View>
            </TouchableRipple>
          )}
        </View>
      </Animated.View>
    );
  };

  // État vide
  const renderEmptyState = (type: 'current' | 'history') => (
    <EmptyState
      variant="orders"
      title={type === 'current' ? 'Aucune commande en cours' : 'Pas encore d\'historique'}
      subtitle={type === 'current'
        ? 'Vos commandes actives apparaîtront ici'
        : 'Vos commandes terminées s\'afficheront ici'}
      icon={type === 'current' ? 'pending-actions' : 'history'}
      actionLabel={type === 'current' ? 'Commander maintenant' : undefined}
      onAction={type === 'current' ? () => router.push('/(tabs)/') : undefined}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar style="auto" />

      {/* Header custom */}
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
          Mes Commandes
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Tabs */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Surface style={[styles.tabsContainer, { backgroundColor: currentTheme.colors.surface }]} elevation={1}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'current' && { backgroundColor: currentTheme.colors.primaryContainer }
              ]}
              onPress={() => handleTabChange('current')}
            >
              <Text style={{ fontSize: 16 }}>🍳</Text>
              <Text style={[
                styles.tabText,
                { color: activeTab === 'current' ? currentTheme.colors.onPrimaryContainer : currentTheme.colors.onSurfaceVariant }
              ]}>
                En cours
              </Text>
              {activeOrders.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: '#FF6D00' }]}>
                  <Text style={styles.tabBadgeText}>
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
              <Text style={{ fontSize: 16 }}>📜</Text>
              <Text style={[
                styles.tabText,
                { color: activeTab === 'history' ? currentTheme.colors.onPrimaryContainer : currentTheme.colors.onSurfaceVariant }
              ]}>
                Historique
              </Text>
              {completedOrders.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: currentTheme.colors.outline }]}>
                  <Text style={styles.tabBadgeText}>
                    {completedOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Surface>
      </Animated.View>

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
  // Tabs
  tabsContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 16,
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
    borderRadius: 12,
    margin: 4,
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
    color: '#FFF',
  },
  // Content
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  orderCardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 13,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 11,
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
  },
  ctaContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // History cards
  historyCard: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyCardTouchable: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyRestaurant: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 13,
    marginTop: 2,
  },
  historyStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItems: {
    fontSize: 14,
  },
  historyTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Reorder button
  reorderButton: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reorderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  reorderText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
