import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  Card,
  Divider,
  ProgressBar,
  TouchableRipple,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  SlideInUp,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useOrder } from '../../src/contexts/OrderContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { Order } from '../../src/types';

const STATUS_CONFIG = {
  pending: {
    emoji: '⏳',
    icon: 'schedule',
    label: 'En attente',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    progress: 0.2,
    description: 'Votre commande est en cours de validation'
  },
  confirmed: {
    emoji: '✅',
    icon: 'check-circle',
    label: 'Confirmée',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    progress: 0.4,
    description: 'Commande acceptée, préparation bientôt'
  },
  preparing: {
    emoji: '👨‍🍳',
    icon: 'restaurant',
    label: 'En préparation',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    progress: 0.7,
    description: 'Nos chefs préparent votre commande'
  },
  ready: {
    emoji: '🔔',
    icon: 'done-all',
    label: 'Prête',
    color: '#8BC34A',
    bgColor: '#F1F8E9',
    progress: 0.9,
    description: 'Votre commande est prête à récupérer !'
  },
  completed: {
    emoji: '🎉',
    icon: 'celebration',
    label: 'Récupérée',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    progress: 1.0,
    description: 'Bon appétit ! Merci de votre confiance'
  },
  cancelled: {
    emoji: '❌',
    icon: 'cancel',
    label: 'Annulée',
    color: '#F44336',
    bgColor: '#FFEBEE',
    progress: 0,
    description: 'Commande annulée'
  },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, updateOrderStatus } = useOrder();
  const { currentTheme } = useAppTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (id) {
      const foundOrder = getOrderById(id);
      if (foundOrder) {
        setOrder(foundOrder);
        const statusConfig = STATUS_CONFIG[foundOrder.status];
        progressValue.value = withSpring(statusConfig.progress);
        calculateEstimatedTime(foundOrder);
      }
    }
  }, [id]);

  const calculateEstimatedTime = (orderData: Order) => {
    const now = new Date();
    const pickupTime = orderData.pickupTime;
    const diffMinutes = Math.ceil((pickupTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes > 0) {
      setEstimatedTime(`${diffMinutes} min`);
    } else {
      setEstimatedTime('Maintenant');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simuler actualisation données
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (id) {
      const updatedOrder = getOrderById(id);
      if (updatedOrder) {
        setOrder(updatedOrder);
        calculateEstimatedTime(updatedOrder);
      }
    }
    setRefreshing(false);
  };

  const handleCancelOrder = () => {
    if (!order) return;
    
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            updateOrderStatus(order.id, 'cancelled');
            setOrder({ ...order, status: 'cancelled' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      ]
    );
  };

  const handleCallRestaurant = () => {
    if (!order) return;
    
    Alert.alert(
      'Appeler le restaurant',
      `Contacter ${order.restaurant?.name || 'le restaurant'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            // Simuler numéro restaurant
            Linking.openURL('tel:+33123456789');
          }
        }
      ]
    );
  };

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color={currentTheme.colors.onSurfaceVariant} />
          <Text style={[styles.errorText, { color: currentTheme.colors.onSurface }]}>
            Commande non trouvée
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            buttonColor={currentTheme.colors.primary}
          >
            Retour
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];

  const handleOpenMaps = () => {
    if (!order?.restaurant) return;

    const address = order.restaurant.address || order.restaurant.name;
    const encodedAddress = encodeURIComponent(address);

    // Ouvrir dans Google Maps ou Apple Maps selon la plateforme
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderStatus = () => (
    <Animated.View entering={FadeIn.duration(600)}>
      <Card style={[styles.statusCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusEmojiContainer, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={styles.statusEmoji}>{statusConfig.emoji}</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              <Text style={[styles.statusDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                {statusConfig.description}
              </Text>
              {estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
                <View style={[styles.timeChipCustom, { backgroundColor: currentTheme.colors.primaryContainer }]}>
                  <Text style={{ fontSize: 14 }}>⏱️</Text>
                  <Text style={[styles.timeChipText, { color: currentTheme.colors.onPrimaryContainer }]}>
                    Prêt dans {estimatedTime}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={statusConfig.progress}
              color={statusConfig.color}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabelText, { color: currentTheme.colors.onSurfaceVariant }]}>
                Commandé
              </Text>
              <Text style={[styles.progressLabelText, { color: currentTheme.colors.onSurfaceVariant }]}>
                Prêt
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderOrderItems = () => (
    <Animated.View entering={SlideInUp.delay(200)}>
      <Card style={[styles.itemsCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            🛒 Votre commande ({order.items.length} article{order.items.length > 1 ? 's' : ''})
          </Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: currentTheme.colors.onSurface }]}>
                  {item.quantity}x {item.menuItem?.name || item.menuItemName || 'Article'}
                </Text>
                {item.options && item.options.length > 0 && (
                  <Text style={[styles.itemOptions, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {item.options.map(opt => 
                      opt.choices.map(choice => choice.choiceName).join(', ')
                    ).join(' • ')}
                  </Text>
                )}
                {item.specialInstructions && (
                  <Text style={[styles.itemInstructions, { color: currentTheme.colors.onSurfaceVariant }]}>
                    Note: {item.specialInstructions}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: currentTheme.colors.primary }]}>
                {(item.totalPrice || item.subtotal || 0).toFixed(2)}€
              </Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: currentTheme.colors.onSurface }]}>
              Total
            </Text>
            <Text style={[styles.totalPrice, { color: currentTheme.colors.primary }]}>
              {(order.total || order.totalAmount || 0).toFixed(2)}€
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderPickupInfo = () => (
    <Animated.View entering={SlideInUp.delay(400)}>
      <Card style={[styles.pickupCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            📍 Informations de retrait
          </Text>

          {/* Heure de retrait */}
          <View style={styles.pickupInfo}>
            <View style={[styles.pickupIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.pickupIcon}>🕐</Text>
            </View>
            <View style={styles.pickupTextContainer}>
              <Text style={[styles.pickupLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                Heure de retrait
              </Text>
              <Text style={[styles.pickupValue, { color: currentTheme.colors.onSurface }]}>
                {order.pickupTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Restaurant */}
          <View style={styles.pickupInfo}>
            <View style={[styles.pickupIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.pickupIcon}>🍽️</Text>
            </View>
            <View style={styles.pickupTextContainer}>
              <Text style={[styles.pickupLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                Restaurant
              </Text>
              <Text style={[styles.pickupValue, { color: currentTheme.colors.onSurface }]}>
                {order.restaurant?.name || 'Restaurant'}
              </Text>
            </View>
          </View>

          {/* Adresse */}
          <View style={styles.pickupInfo}>
            <View style={[styles.pickupIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.pickupIcon}>📍</Text>
            </View>
            <View style={styles.pickupTextContainer}>
              <Text style={[styles.pickupLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                Adresse
              </Text>
              <Text style={[styles.pickupValue, { color: currentTheme.colors.onSurface }]}>
                {order.restaurant?.address || '123 Rue Example, Paris'}
              </Text>
            </View>
          </View>

          {/* Bouton Itinéraire */}
          <TouchableRipple
            onPress={handleOpenMaps}
            borderless
            style={[styles.directionsButton, { backgroundColor: currentTheme.colors.primaryContainer }]}
          >
            <View style={styles.directionsContent}>
              <Text style={{ fontSize: 20 }}>🗺️</Text>
              <Text style={[styles.directionsText, { color: currentTheme.colors.onPrimaryContainer }]}>
                Voir l&apos;itinéraire
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={currentTheme.colors.onPrimaryContainer} />
            </View>
          </TouchableRipple>

          {order.customerNotes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                📝 Instructions spéciales
              </Text>
              <Text style={[styles.notesText, { color: currentTheme.colors.onSurface }]}>
                {order.customerNotes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderActions = () => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return (
        <Animated.View entering={SlideInUp.delay(600)}>
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              onPress={() => router.push('/(tabs)/' as any)}
              style={styles.actionButton}
              textColor={currentTheme.colors.primary}
            >
              Commander à nouveau
            </Button>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={SlideInUp.delay(600)}>
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            onPress={handleCallRestaurant}
            style={styles.actionButton}
            textColor={currentTheme.colors.primary}
            icon="phone"
          >
            Appeler le restaurant
          </Button>
          
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <Button
              mode="text"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              textColor={currentTheme.colors.error}
            >
              Annuler la commande
            </Button>
          )}
        </View>
      </Animated.View>
    );
  };

  // Numéro de commande pour le header
  const orderNumber = order.orderNumber
    ? order.orderNumber.split('-').pop()
    : order.id.slice(-4);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header cohérent avec les autres pages */}
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
          Commande #{orderNumber}
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatus()}
        {renderOrderItems()}
        {renderPickupInfo()}
        {renderActions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header cohérent
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
    padding: 16,
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Status Card
  statusCard: {
    borderRadius: 16,
  },
  statusContent: {
    gap: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 32,
  },
  statusInfo: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeChipCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
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
  progressLabelText: {
    fontSize: 11,
  },

  // Order Items Card
  itemsCard: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemOptions: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemInstructions: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Pickup Info Card
  pickupCard: {
    borderRadius: 16,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  pickupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupIcon: {
    fontSize: 20,
  },
  pickupTextContainer: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  pickupValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  directionsButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  directionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Actions
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
  },
  cancelButton: {
    borderRadius: 12,
  },
});