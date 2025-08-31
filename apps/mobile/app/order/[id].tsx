import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Surface,
  Button,
  Card,
  Avatar,
  IconButton,
  Chip,
  Divider,
  ProgressBar,
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
import { Order } from '../../src/data/mockData';

const STATUS_CONFIG = {
  pending: { 
    icon: 'schedule', 
    label: 'En attente', 
    color: '#FF9800', 
    progress: 0.2,
    description: 'Votre commande est en cours de validation'
  },
  confirmed: { 
    icon: 'check-circle', 
    label: 'Confirmée', 
    color: '#4CAF50', 
    progress: 0.4,
    description: 'Commande acceptée, préparation bientôt'
  },
  preparing: { 
    icon: 'restaurant', 
    label: 'En préparation', 
    color: '#2196F3', 
    progress: 0.7,
    description: 'Nos chefs préparent votre commande'
  },
  ready: { 
    icon: 'done-all', 
    label: 'Prête', 
    color: '#8BC34A', 
    progress: 0.9,
    description: 'Votre commande est prête à récupérer'
  },
  completed: { 
    icon: 'celebration', 
    label: 'Récupérée', 
    color: '#4CAF50', 
    progress: 1.0,
    description: 'Bon appétit ! Merci de votre confiance'
  },
  cancelled: { 
    icon: 'cancel', 
    label: 'Annulée', 
    color: '#F44336', 
    progress: 0,
    description: 'Commande annulée, remboursement en cours'
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
      `Contacter ${order.restaurant.name} ?`,
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

  const renderHeader = () => (
    <Surface style={[styles.header, { backgroundColor: currentTheme.colors.surface }]} elevation={2}>
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={currentTheme.colors.onSurface}
          onPress={() => router.back()}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
            Commande #{order.id.substring(0, 8)}
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            {order.restaurant.name}
          </Text>
        </View>
        <IconButton
          icon="phone"
          size={24}
          iconColor={currentTheme.colors.primary}
          onPress={handleCallRestaurant}
        />
      </View>
    </Surface>
  );

  const renderStatus = () => (
    <Animated.View entering={FadeIn.duration(600)}>
      <Card style={[styles.statusCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <Avatar.Icon
              size={60}
              icon={statusConfig.icon}
              style={[styles.statusIcon, { backgroundColor: statusConfig.color }]}
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: currentTheme.colors.onSurface }]}>
                {statusConfig.label}
              </Text>
              <Text style={[styles.statusDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                {statusConfig.description}
              </Text>
              {estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
                <Chip
                  icon="access-time"
                  style={[styles.timeChip, { backgroundColor: currentTheme.colors.primaryContainer }]}
                  textStyle={{ color: currentTheme.colors.onPrimaryContainer }}
                >
                  Prêt dans {estimatedTime}
                </Chip>
              )}
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={statusConfig.progress}
              color={statusConfig.color}
              style={styles.progressBar}
            />
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
            Votre commande ({order.items.length} articles)
          </Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: currentTheme.colors.onSurface }]}>
                  {item.quantity}x {item.menuItem.name}
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
                {item.totalPrice.toFixed(2)}€
              </Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: currentTheme.colors.onSurface }]}>
              Total
            </Text>
            <Text style={[styles.totalPrice, { color: currentTheme.colors.primary }]}>
              {order.total.toFixed(2)}€
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
            Informations de retrait
          </Text>
          
          <View style={styles.pickupInfo}>
            <MaterialIcons name="access-time" size={20} color={currentTheme.colors.primary} />
            <Text style={[styles.pickupText, { color: currentTheme.colors.onSurface }]}>
              Retrait prévu: {order.pickupTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          <View style={styles.pickupInfo}>
            <MaterialIcons name="location-on" size={20} color={currentTheme.colors.primary} />
            <Text style={[styles.pickupText, { color: currentTheme.colors.onSurface }]}>
              {order.restaurant.name}
            </Text>
          </View>
          
          {order.customerNotes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                Notes de commande:
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />
      
      {renderHeader()}
      
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
  
  // Header
  header: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  
  // Status
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
  statusIcon: {
    borderRadius: 30,
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
  timeChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  
  // Order Items
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
  
  // Pickup Info
  pickupCard: {
    borderRadius: 16,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pickupText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
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