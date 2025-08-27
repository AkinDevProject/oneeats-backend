import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Button, Badge, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';

import { useOrder } from '../../src/contexts/OrderContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { Order } from '../../src/data/mockData';

const statusConfig = {
  pending: {
    label: 'En attente',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: 'time-outline',
    progress: 0.2,
  },
  confirmed: {
    label: 'Confirmée',
    color: '#3b82f6',
    bgColor: '#dbeafe', 
    icon: 'checkmark-circle-outline',
    progress: 0.4,
  },
  preparing: {
    label: 'En préparation',
    color: '#f97316',
    bgColor: '#fed7aa',
    icon: 'restaurant-outline',
    progress: 0.7,
  },
  ready: {
    label: 'Prête',
    color: '#22c55e',
    bgColor: '#dcfce7',
    icon: 'bag-check-outline',
    progress: 1.0,
  },
  completed: {
    label: 'Récupérée',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: 'checkmark-done-outline',
    progress: 1.0,
  },
  cancelled: {
    label: 'Annulée',
    color: '#ef4444',
    bgColor: '#fecaca',
    icon: 'close-circle-outline',
    progress: 0,
  },
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [refreshing, setRefreshing] = useState(false);

  const { orders, currentOrder, isLoading } = useOrder();
  const { isAuthenticated } = useAuth();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'current' | 'history') => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOrderPress = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/order/${order.id}` as any);
  };

  const handleReorderPress = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would add the same items to cart
    router.push(`/restaurant/${order.restaurantId}` as any);
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#8b5cf6', '#a855f7']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Commandes 📋</Text>
            <Text style={styles.headerSubtitle}>
              {currentOrder ? 'Suivez votre commande' : 'Historique des commandes'}
            </Text>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <Pressable
        style={[
          styles.tab,
          activeTab === 'current' && styles.activeTab
        ]}
        onPress={() => handleTabChange('current')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'current' && styles.activeTabText
        ]}>
          Actuelle
        </Text>
        {currentOrder && (
          <Badge style={styles.tabBadge}>1</Badge>
        )}
      </Pressable>

      <Pressable
        style={[
          styles.tab,
          activeTab === 'history' && styles.activeTab
        ]}
        onPress={() => handleTabChange('history')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'history' && styles.activeTabText
        ]}>
          Historique
        </Text>
        {orders.length > (currentOrder ? 1 : 0) && (
          <Badge style={styles.tabBadge}>
            {orders.length - (currentOrder ? 1 : 0)}
          </Badge>
        )}
      </Pressable>
    </View>
  );

  const renderCurrentOrder = () => {
    if (!currentOrder) {
      return (
        <Animated.View entering={FadeIn.delay(300)} style={styles.noCurrentOrder}>
          <Ionicons name="receipt-outline" size={80} color="#cbd5e1" />
          <Text style={styles.noCurrentOrderTitle}>Aucune commande active</Text>
          <Text style={styles.noCurrentOrderText}>
            Passez une commande pour la suivre en temps réel !
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)/')}
            style={styles.orderButton}
            labelStyle={styles.orderButtonText}
          >
            Découvrir les restaurants
          </Button>
        </Animated.View>
      );
    }

    const config = statusConfig[currentOrder.status];
    const estimatedTime = new Date(currentOrder.pickupTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.currentOrderContainer}>
        <Card style={styles.currentOrderCard}>
          <LinearGradient
            colors={[config.bgColor, 'rgba(255,255,255,0.9)']}
            style={styles.currentOrderGradient}
          >
            {/* Order Header */}
            <View style={styles.currentOrderHeader}>
              <View style={styles.currentOrderInfo}>
                <Text style={styles.currentOrderRestaurant}>{currentOrder.restaurant.name}</Text>
                <Text style={styles.currentOrderTime}>
                  Commandé à {currentOrder.orderTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon as any} size={16} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <ProgressBar 
                progress={config.progress} 
                color={config.color} 
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {currentOrder.status === 'ready' 
                  ? 'Commande prête à récupérer !'
                  : `Récupération prévue vers ${estimatedTime}`
                }
              </Text>
            </View>

            {/* Order Items Preview */}
            <View style={styles.orderItemsPreview}>
              <Text style={styles.orderItemsTitle}>
                {currentOrder.items.length} article{currentOrder.items.length > 1 ? 's' : ''}
              </Text>
              <View style={styles.orderItemsList}>
                {currentOrder.items.slice(0, 3).map((item, index) => (
                  <Text key={index} style={styles.orderItemPreview} numberOfLines={1}>
                    {item.quantity}x {item.menuItem.name}
                  </Text>
                ))}
                {currentOrder.items.length > 3 && (
                  <Text style={styles.orderItemsMore}>
                    +{currentOrder.items.length - 3} autres
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.currentOrderActions}>
              <Button
                mode="outlined"
                onPress={() => handleOrderPress(currentOrder)}
                style={styles.trackButton}
                labelStyle={styles.trackButtonText}
                contentStyle={styles.buttonContent}
              >
                Suivre la commande
              </Button>
              
              {currentOrder.status === 'ready' && (
                <Button
                  mode="contained"
                  onPress={() => handleOrderPress(currentOrder)}
                  style={[styles.readyButton, { backgroundColor: config.color }]}
                  labelStyle={styles.readyButtonText}
                  contentStyle={styles.buttonContent}
                >
                  Je récupère
                </Button>
              )}
            </View>

            {/* Total */}
            <View style={styles.currentOrderTotal}>
              <Text style={styles.totalLabel}>Total payé</Text>
              <Text style={styles.totalAmount}>{currentOrder.total.toFixed(2)} €</Text>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const renderHistoryOrder = ({ item, index }: { item: Order; index: number }) => {
    const config = statusConfig[item.status];
    
    return (
      <Animated.View 
        entering={SlideInRight.delay(100 + index * 50).springify()}
        style={styles.historyOrderContainer}
      >
        <Pressable onPress={() => handleOrderPress(item)}>
          <Card style={styles.historyOrderCard}>
            <View style={styles.historyOrderContent}>
              {/* Restaurant Image */}
              <Image 
                source={{ uri: item.restaurant.image }} 
                style={styles.historyOrderImage}
                resizeMode="cover"
              />

              {/* Order Info */}
              <View style={styles.historyOrderInfo}>
                <View style={styles.historyOrderHeader}>
                  <Text style={styles.historyOrderRestaurant} numberOfLines={1}>
                    {item.restaurant.name}
                  </Text>
                  <View style={[styles.historyStatusBadge, { backgroundColor: config.bgColor }]}>
                    <Text style={[styles.historyStatusText, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.historyOrderDate}>
                  {item.orderTime.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>

                <Text style={styles.historyOrderItems}>
                  {item.items.length} article{item.items.length > 1 ? 's' : ''} • {item.total.toFixed(2)} €
                </Text>

                {/* Action Buttons */}
                <View style={styles.historyOrderActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleOrderPress(item)}
                    style={styles.detailsButton}
                    labelStyle={styles.detailsButtonText}
                    compact
                  >
                    Détails
                  </Button>
                  
                  <Button
                    mode="text"
                    onPress={() => handleReorderPress(item)}
                    style={styles.reorderButton}
                    labelStyle={styles.reorderButtonText}
                    compact
                  >
                    <Ionicons name="refresh-outline" size={14} color="#8b5cf6" />
                    {' '}Recommander
                  </Button>
                </View>
              </View>
            </View>
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

  const renderNotAuthenticated = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.notAuthenticated}>
      <Ionicons name="log-in-outline" size={80} color="#cbd5e1" />
      <Text style={styles.notAuthTitle}>Connexion requise</Text>
      <Text style={styles.notAuthText}>
        Connectez-vous pour voir vos commandes et suivre leur statut.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/auth')}
        style={styles.loginButton}
        labelStyle={styles.loginButtonText}
      >
        Se connecter
      </Button>
    </Animated.View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {renderNotAuthenticated()}
        </Animated.View>
      </SafeAreaView>
    );
  }

  const historyOrders = orders.filter(order => 
    order.id !== currentOrder?.id && 
    ['completed', 'cancelled'].includes(order.status)
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {renderTabs()}
        
        <FlatList
          data={activeTab === 'current' ? [] : historyOrders}
          renderItem={renderHistoryOrder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#8b5cf6']}
            />
          }
          contentContainerStyle={styles.ordersList}
          ListHeaderComponent={activeTab === 'current' ? renderCurrentOrder : null}
          ListEmptyComponent={
            activeTab === 'history' ? (
              <Animated.View entering={FadeIn.delay(300)} style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={80} color="#cbd5e1" />
                <Text style={styles.emptyHistoryTitle}>Aucun historique</Text>
                <Text style={styles.emptyHistoryText}>
                  Vos commandes terminées apparaîtront ici.
                </Text>
              </Animated.View>
            ) : null
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 140,
  },
  headerGradient: {
    flex: 1,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 1,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#ef4444',
    fontSize: 10,
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Current Order Styles
  noCurrentOrder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noCurrentOrderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noCurrentOrderText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  orderButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 25,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentOrderContainer: {
    marginBottom: 20,
  },
  currentOrderCard: {
    elevation: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  currentOrderGradient: {
    padding: 20,
  },
  currentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentOrderInfo: {
    flex: 1,
  },
  currentOrderRestaurant: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  currentOrderTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
  },
  orderItemsPreview: {
    marginBottom: 20,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  orderItemsList: {
    gap: 4,
  },
  orderItemPreview: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  orderItemsMore: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  currentOrderActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  trackButton: {
    flex: 1,
    borderColor: '#8b5cf6',
  },
  trackButtonText: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  readyButton: {
    flex: 1,
  },
  readyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  currentOrderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d3748',
  },

  // History Order Styles
  historyOrderContainer: {
    marginBottom: 12,
  },
  historyOrderCard: {
    elevation: 2,
    borderRadius: 16,
  },
  historyOrderContent: {
    flexDirection: 'row',
    padding: 16,
  },
  historyOrderImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  historyOrderInfo: {
    flex: 1,
  },
  historyOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyOrderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
  },
  historyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyOrderDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  historyOrderItems: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
    marginBottom: 12,
  },
  historyOrderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    borderColor: '#8b5cf6',
  },
  detailsButtonText: {
    color: '#8b5cf6',
    fontSize: 12,
  },
  reorderButton: {
    // Styles for reorder button
  },
  reorderButtonText: {
    color: '#8b5cf6',
    fontSize: 12,
  },

  // Empty States
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyHistoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  notAuthenticated: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAuthText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});