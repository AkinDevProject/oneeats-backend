import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  Text,
  Surface,
  Card,
  Button,
  Divider,
  Portal,
  Modal,
  Avatar,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Package,
  Truck,
  CheckCircle,
  Navigation,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '@/src/contexts/OrderContext';
import { restaurants } from '@/src/data/mockData';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useOrder();

  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const pulseAnimation = useSharedValue(1);
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find((o) => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        const foundRestaurant = restaurants.find((r) => r.id === foundOrder.restaurantId);
        setRestaurant(foundRestaurant);
        
        // Animate progress based on order status
        const progressValue = getProgressValue(foundOrder.status);
        progressAnimation.value = withTiming(progressValue, { duration: 1000 });
        
        // Pulse animation for active orders
        if (['confirmed', 'preparing', 'ready', 'delivered'].includes(foundOrder.status)) {
          pulseAnimation.value = withRepeat(
            withSequence(
              withTiming(1.1, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          );
        }
      }
    }
  }, [id, orders]);

  const getProgressValue = (status) => {
    switch (status) {
      case 'pending': return 0.25;
      case 'confirmed': return 0.5;
      case 'preparing': return 0.75;
      case 'ready': return 0.9;
      case 'delivered': return 1;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'preparing': return '#2196F3';
      case 'ready': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente de confirmation';
      case 'confirmed': return 'Commande confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête pour récupération';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return 'Statut inconnu';
    }
  };

  const getEstimatedTime = (status) => {
    switch (status) {
      case 'pending': return '5-10 min';
      case 'confirmed': return '25-35 min';
      case 'preparing': return '15-25 min';
      case 'ready': return 'Maintenant';
      case 'delivered': return 'Terminé';
      default: return '--';
    }
  };

  const handleCallRestaurant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate phone call
    setModalVisible(true);
  };

  const handleTrackOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate tracking
    router.push('/map');
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  if (!order || !restaurant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Commande non trouvée</Text>
      </View>
    );
  }

  const renderStatusIcon = (status) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'pending':
        return <Clock size={24} color={color} />;
      case 'confirmed':
        return <CheckCircle size={24} color={color} />;
      case 'preparing':
        return <Package size={24} color={color} />;
      case 'ready':
        return <Truck size={24} color={color} />;
      case 'delivered':
        return <CheckCircle size={24} color={color} />;
      default:
        return <Clock size={24} color={color} />;
    }
  };

  const renderTrackingSteps = () => {
    const steps = [
      { key: 'pending', label: 'Commande reçue', time: order.createdAt },
      { key: 'confirmed', label: 'Confirmée', time: order.confirmedAt },
      { key: 'preparing', label: 'En préparation', time: order.preparingAt },
      { key: 'ready', label: 'Prête', time: order.readyAt },
      { key: 'delivered', label: 'Récupérée', time: order.deliveredAt },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === order.status);

    return (
      <View style={styles.trackingContainer}>
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <View key={step.key} style={styles.trackingStep}>
              <View style={styles.trackingStepLine}>
                {index > 0 && (
                  <View style={[
                    styles.trackingLine,
                    { backgroundColor: isActive ? '#4CAF50' : '#E0E0E0' }
                  ]} />
                )}
                <Animated.View 
                  style={[
                    styles.trackingDot,
                    { backgroundColor: isActive ? '#4CAF50' : '#E0E0E0' },
                    isCurrent && animatedPulseStyle
                  ]}
                >
                  {isActive && <CheckCircle size={12} color="white" />}
                </Animated.View>
              </View>
              <View style={styles.trackingStepContent}>
                <Text style={[styles.trackingStepLabel, isActive && styles.activeStepLabel]}>
                  {step.label}
                </Text>
                {step.time && (
                  <Text style={styles.trackingStepTime}>
                    {new Date(step.time).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[getStatusColor(order.status), getStatusColor(order.status) + '80']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande #{order.id.slice(0, 8)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusContent}>
            <Animated.View style={[styles.statusIcon, animatedPulseStyle]}>
              {renderStatusIcon(order.status)}
            </Animated.View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
              <Text style={styles.statusTime}>
                Temps estimé: {getEstimatedTime(order.status)}
              </Text>
            </View>
          </Card.Content>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>
          </View>
        </Card>

        {/* Restaurant Info */}
        <Card style={styles.restaurantCard}>
          <Card.Content style={styles.restaurantContent}>
            <Avatar.Image size={60} source={{ uri: restaurant.image }} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.restaurantMeta}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.restaurantRating}>{restaurant.rating}</Text>
                <Text style={styles.restaurantSeparator}>•</Text>
                <MapPin size={16} color="#666" />
                <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
              </View>
            </View>
            <View style={styles.restaurantActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCallRestaurant}
              >
                <Phone size={20} color="#E53E3E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Tracking */}
        <Card style={styles.trackingCard}>
          <Card.Content>
            <Text style={styles.trackingTitle}>Suivi de commande</Text>
            {renderTrackingSteps()}
          </Card.Content>
        </Card>

        {/* Order Details */}
        <Card style={styles.orderCard}>
          <Card.Content>
            <Text style={styles.orderTitle}>Détails de la commande</Text>
            
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>{item.price * item.quantity}€</Text>
              </View>
            ))}
            
            <Divider style={styles.orderDivider} />
            
            <View style={styles.orderSummary}>
              <View style={styles.orderSummaryRow}>
                <Text style={styles.orderSummaryLabel}>Sous-total</Text>
                <Text style={styles.orderSummaryValue}>{order.subtotal}€</Text>
              </View>
              {order.deliveryFee > 0 && (
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Frais de livraison</Text>
                  <Text style={styles.orderSummaryValue}>{order.deliveryFee}€</Text>
                </View>
              )}
              {order.discount > 0 && (
                <View style={styles.orderSummaryRow}>
                  <Text style={[styles.orderSummaryLabel, { color: '#4CAF50' }]}>Remise</Text>
                  <Text style={[styles.orderSummaryValue, { color: '#4CAF50' }]}>-{order.discount}€</Text>
                </View>
              )}
              <View style={[styles.orderSummaryRow, styles.orderTotal]}>
                <Text style={styles.orderTotalLabel}>Total</Text>
                <Text style={styles.orderTotalValue}>{order.total}€</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        {order.status === 'ready' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleTrackOrder}
              style={styles.trackButton}
              icon={() => <Navigation size={20} color="white" />}
            >
              Voir sur la carte
            </Button>
          </View>
        )}

        {(order.status === 'pending' || order.status === 'confirmed') && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.cancelButton}
              textColor="#E53E3E"
            >
              Annuler la commande
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>Appeler le restaurant</Text>
            <Text style={styles.modalMessage}>
              Voulez-vous appeler {restaurant.name} pour plus d'informations sur votre commande ?
            </Text>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalCancelButton}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  // Simulate phone call
                }}
                style={styles.modalCallButton}
              >
                Appeler
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
    elevation: 4,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  statusIcon: {
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  restaurantCard: {
    marginBottom: 16,
    elevation: 4,
  },
  restaurantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  restaurantSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  restaurantDistance: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  restaurantActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  trackingCard: {
    marginBottom: 16,
    elevation: 4,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trackingContainer: {
    paddingLeft: 8,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingStepLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  trackingLine: {
    width: 2,
    height: 30,
    marginBottom: -22,
  },
  trackingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingStepContent: {
    flex: 1,
  },
  trackingStepLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeStepLabel: {
    color: '#333',
    fontWeight: 'bold',
  },
  trackingStepTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemQuantity: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderDivider: {
    marginVertical: 16,
  },
  orderSummary: {
    gap: 8,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  actions: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 4,
  },
  cancelButton: {
    borderColor: '#E53E3E',
    borderRadius: 8,
    paddingVertical: 4,
  },
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalCallButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
});

export default OrderDetailScreen;