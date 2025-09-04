import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import {
  Card,
  Button,
  TextInput,
  Divider,
  Surface,
  Chip,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';

import { useCart } from '../../src/contexts/CartContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { mockRestaurants } from '../../src/data/mockData';

// Types pour les onglets MVP
type MVPTabType = 'cart' | 'current' | 'history';

// Schéma de validation pour la commande
const orderSchema = yup.object({
  customerName: yup.string().required('Nom requis'),
  phoneNumber: yup.string().required('Téléphone requis'),
  pickupTime: yup.string().required('Heure de récupération requise'),
  specialInstructions: yup.string().max(200, 'Instructions trop longues'),
});

// Créneaux horaires disponibles (tous les 15min, 8 créneaux)
const getAvailableTimeSlots = () => {
  const now = new Date();
  const slots = [];
  
  for (let i = 1; i <= 8; i++) {
    const time = new Date(now.getTime() + (i * 15 * 60000));
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    slots.push({
      value: `${hours}:${minutes}`,
      label: `${hours}h${minutes}`,
      available: true,
    });
  }
  
  return slots;
};

export default function CartMVP() {
  const [activeTab, setActiveTab] = useState<MVPTabType>('cart');
  const [availableSlots] = useState(getAvailableTimeSlots());
  const [selectedPickupTime, setSelectedPickupTime] = useState(availableSlots[2]?.value);
  const [isLoading, setIsLoading] = useState(false);
  
  // Référence au ScrollView
  const scrollViewRef = React.useRef<ScrollView>(null);

  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, createOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addOrder, orders, currentOrder } = useOrder();
  const { currentTheme } = useAppTheme();

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  // Fonction pour faire défiler vers un champ
  const scrollToInput = (yOffset: number) => {
    scrollViewRef.current?.scrollTo({
      x: 0,
      y: yOffset,
      animated: true,
    });
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Actions
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const handleCreateOrder = async (values: any) => {
    if (!items.length) return;

    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour commander.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const restaurantId = items[0]?.menuItem.restaurantId;
      if (!restaurantId) throw new Error('Restaurant non trouvé');

      const orderData = {
        ...values,
        pickupTime: selectedPickupTime,
        items: items,
        total: totalPrice,
      };

      const order = await createOrder(restaurantId, JSON.stringify(orderData));
      if (!order) throw new Error('Erreur création commande');

      addOrder(order);
      
      // Navigation directe vers la page de suivi de commande
      console.log('✅ Commande créée avec succès, navigation vers order/', order.id);
      router.push(`/order/${order.id}`);
      
    } catch (error) {
      console.error('Erreur commande:', error);
      Alert.alert('Erreur', 'Impossible de créer la commande.');
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu des onglets
  const renderTabs = () => (
    <Surface style={styles.tabsContainer} elevation={1}>
      <View style={styles.tabs}>
        {[
          { key: 'cart' as MVPTabType, title: 'Panier', count: totalItems },
          { key: 'current' as MVPTabType, title: 'En cours', count: currentOrder ? 1 : 0 },
          { key: 'history' as MVPTabType, title: 'Historique', count: orders.length },
        ].map(({ key, title, count }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeTab === key && { backgroundColor: currentTheme.colors.primaryContainer }
            ]}
            onPress={() => {
              setActiveTab(key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[
              styles.tabText,
              activeTab === key && { color: currentTheme.colors.onPrimaryContainer }
            ]}>
              {title}
            </Text>
            {count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: currentTheme.colors.primary }]}>
                <Text style={[styles.tabBadgeText, { color: currentTheme.colors.onPrimary }]}>
                  {count > 99 ? '99+' : count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  // Rendu du panier
  const renderCart = () => {
    if (!items.length) {
      return (
        <View style={styles.emptyState}>
          <Avatar.Icon size={80} icon="cart-outline" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
          <Text style={[styles.emptyTitle, { color: currentTheme.colors.onSurface }]}>
            Panier vide
          </Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            Ajoutez des plats depuis un restaurant
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)/' as any)}
            style={styles.emptyButton}
            buttonColor={currentTheme.colors.primary}
          >
            Découvrir les restaurants
          </Button>
        </View>
      );
    }

    return (
      <Formik
        initialValues={{
          customerName: user?.name || '',
          phoneNumber: user?.phone || '',
          pickupTime: selectedPickupTime,
          specialInstructions: '',
        }}
        validationSchema={orderSchema}
        onSubmit={handleCreateOrder}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <ScrollView 
              ref={scrollViewRef}
              style={styles.cartContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
            >
            {/* Bouton retour restaurant */}
            {items.length > 0 && (
              <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantDetails}>
                      <Text style={[styles.restaurantLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                        Commande chez
                      </Text>
                      <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>
                        {mockRestaurants.find(r => r.id === items[0].menuItem.restaurantId)?.name || 'Restaurant'}
                      </Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => {
                        const restaurantId = items[0].menuItem.restaurantId;
                        router.push(`/restaurant/${restaurantId}` as any);
                      }}
                      style={styles.continueShoppingButton}
                      buttonColor={currentTheme.colors.primary}
                      icon="plus"
                    >
                      Ajouter des plats
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Articles du panier */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  Vos articles ({totalItems})
                </Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: currentTheme.colors.onSurface }]}>
                        {item.menuItem.name}
                      </Text>
                      {/* Affichage des options choisies */}
                      {item.options && item.options.length > 0 && (
                        <View style={styles.optionsContainer}>
                          {item.options.map((option) => (
                            <Text key={option.optionId} style={[styles.optionText, { color: currentTheme.colors.onSurfaceVariant }]}>
                              {option.optionName}: {option.choices.map(choice => choice.choiceName).join(', ')}
                            </Text>
                          ))}
                        </View>
                      )}
                      {/* Instructions spéciales */}
                      {item.specialInstructions && (
                        <Text style={[styles.instructionsText, { color: currentTheme.colors.onSurfaceVariant }]}>
                          Note: {item.specialInstructions}
                        </Text>
                      )}
                      <Text style={[styles.itemPrice, { color: currentTheme.colors.primary }]}>
                        {item.totalPrice.toFixed(2)}€
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <IconButton
                        icon="minus"
                        size={20}
                        onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                        style={styles.quantityButton}
                      />
                      <Text style={[styles.quantity, { color: currentTheme.colors.onSurface }]}>
                        {item.quantity}
                      </Text>
                      <IconButton
                        icon="plus"
                        size={20}
                        onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                      />
                      {/* Bouton modifier pour les items avec options */}
                      {item.menuItem.options && item.menuItem.options.length > 0 && (
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => router.push(`/menu/${item.menuItem.id}?editItemId=${item.id}` as any)}
                          iconColor={currentTheme.colors.primary}
                        />
                      )}
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleRemoveItem(item.id)}
                        iconColor={currentTheme.colors.error}
                      />
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Heure de récupération */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  ⏰ Heure de récupération
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timeSlotsContainer}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.value}
                        selected={selectedPickupTime === slot.value}
                        onPress={() => setSelectedPickupTime(slot.value)}
                        style={styles.timeSlot}
                        selectedColor={currentTheme.colors.onPrimaryContainer}
                        showSelectedOverlay={false}
                      >
                        {slot.label}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </Card.Content>
            </Card>

            {/* Informations client */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  📞 Vos informations
                </Text>
                <TextInput
                  label="Nom complet"
                  value={values.customerName}
                  onChangeText={handleChange('customerName')}
                  onFocus={() => scrollToInput(250)}
                  returnKeyType="next"
                  returnKeyLabel="Suivant"
                  style={styles.input}
                  error={touched.customerName && !!errors.customerName}
                />
                <TextInput
                  label="Numéro de téléphone"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onFocus={() => scrollToInput(320)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  returnKeyLabel="Suivant"
                  style={styles.input}
                  error={touched.phoneNumber && !!errors.phoneNumber}
                />
                <TextInput
                  label="Instructions spéciales (optionnel)"
                  value={values.specialInstructions}
                  onChangeText={handleChange('specialInstructions')}
                  onFocus={() => scrollToInput(400)}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  returnKeyLabel="Terminé"
                  blurOnSubmit={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  style={styles.input}
                />
              </Card.Content>
            </Card>

            {/* Total et validation */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: currentTheme.colors.onSurface }]}>
                    Total
                  </Text>
                  <Text style={[styles.totalPrice, { color: currentTheme.colors.primary }]}>
                    {totalPrice.toFixed(2)}€
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={isLoading}
                  disabled={isLoading || !selectedPickupTime}
                  style={styles.checkoutButton}
                  buttonColor={currentTheme.colors.primary}
                  contentStyle={styles.checkoutButtonContent}
                >
                  Confirmer la commande - {selectedPickupTime}
                </Button>
              </Card.Content>
            </Card>
            
            {/* Espace en bas */}
            <View style={{ height: 50 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Formik>
    );
  };

  // Rendu commandes en cours
  const renderCurrentOrders = () => {
    if (!currentOrder && orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length === 0) {
      return (
        <View style={styles.emptyState}>
          <Avatar.Icon size={80} icon="clock-outline" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
          <Text style={[styles.emptyTitle, { color: currentTheme.colors.onSurface }]}>
            Aucune commande en cours
          </Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            Vos commandes actives apparaîtront ici
          </Text>
        </View>
      );
    }

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    return (
      <ScrollView style={styles.ordersContent}>
        {activeOrders.map((order) => (
          <Card key={order.id} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderTitle, { color: currentTheme.colors.onSurface }]}>
                  {order.restaurant.name}
                </Text>
                <Chip 
                  icon={order.status === 'ready' ? 'check' : 'clock'}
                  style={{ backgroundColor: order.status === 'ready' ? currentTheme.colors.primary : currentTheme.colors.secondary }}
                >
                  {order.status === 'pending' ? 'En attente' : 
                   order.status === 'preparing' ? 'En préparation' : 'Prête !'}
                </Chip>
              </View>
              <Text style={[styles.orderSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                Commande #{order.id.substring(0, 8)} • {order.total.toFixed(2)}€
              </Text>
              <Button
                mode="outlined"
                onPress={() => router.push(`/order/${order.id}`)}
                style={styles.orderButton}
              >
                Voir les détails
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  // Rendu historique
  const renderHistory = () => {
    const completedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    if (completedOrders.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Avatar.Icon size={80} icon="history" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
          <Text style={[styles.emptyTitle, { color: currentTheme.colors.onSurface }]}>
            Pas d'historique
          </Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            Vos commandes terminées s'afficheront ici
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.ordersContent}>
        {completedOrders.map((order) => (
          <Card key={order.id} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Card.Content>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderTitle, { color: currentTheme.colors.onSurface }]}>
                  {order.restaurant.name}
                </Text>
                <Text style={[styles.orderDate, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {new Date(order.orderTime).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.orderSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                {order.total.toFixed(2)}€ • {order.items.length} articles
              </Text>
              <View style={styles.historyActions}>
                <Button
                  mode="outlined"
                  onPress={() => router.push(`/order/${order.id}`)}
                  style={styles.historyButton}
                >
                  Voir détails
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    // TODO: Ajouter reorder functionality
                    Alert.alert('Recommander', 'Fonctionnalité bientôt disponible');
                  }}
                  style={styles.historyButton}
                  buttonColor={currentTheme.colors.primary}
                >
                  Recommander
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="dark" backgroundColor={currentTheme.colors.background} />
      
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Surface style={[styles.headerSurface, { backgroundColor: currentTheme.colors.surface }]} elevation={1}>
            <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
              Mes Commandes
            </Text>
            <Text style={[styles.headerSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
              Panier, suivi et historique
            </Text>
          </Surface>
        </Animated.View>

        {/* Tabs */}
        {renderTabs()}

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'cart' && renderCart()}
          {activeTab === 'current' && renderCurrentOrders()}
          {activeTab === 'history' && renderHistory()}
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
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartContent: {
    flex: 1,
  },
  ordersContent: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    margin: 0,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  timeSlot: {
    marginRight: 8,
  },
  input: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 12,
  },
  checkoutButtonContent: {
    height: 50,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  orderSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 12,
  },
  orderButton: {
    borderRadius: 8,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  historyButton: {
    flex: 1,
    borderRadius: 8,
  },
  // Nouveaux styles pour les options
  optionsContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  instructionsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  // Styles pour la section restaurant
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantDetails: {
    flex: 1,
    marginRight: 16,
  },
  restaurantLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    borderRadius: 8,
  },
});