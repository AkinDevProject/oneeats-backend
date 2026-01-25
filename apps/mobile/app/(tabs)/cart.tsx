import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
  withTiming,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import {
  Card,
  Button,
  TextInput,
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
import { useRestaurant } from '../../src/hooks/useRestaurant';
import EmptyState from '../../src/components/ui/EmptyState';

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

export default function CartScreen() {
  const [availableSlots] = useState(getAvailableTimeSlots());
  const [selectedPickupTime, setSelectedPickupTime] = useState(availableSlots[2]?.value);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = React.useRef<ScrollView>(null);

  const { items, totalItems, totalPrice, updateQuantity, removeItem, createOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addOrder, orders } = useOrder();
  const { currentTheme } = useAppTheme();

  // Récupérer le restaurant du panier
  const cartRestaurantId = items.length > 0 ? items[0].menuItem.restaurantId : undefined;
  const { restaurant: cartRestaurant } = useRestaurant(cartRestaurantId);

  // Nombre de commandes actives (seulement si connecte)
  const activeOrdersCount = isAuthenticated
    ? orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length
    : 0;

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, [headerOpacity]);

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
          { text: 'Se connecter', onPress: () => router.push('/auth/login?returnTo=cart' as any) },
        ]
      );
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const restaurantId = items[0]?.menuItem.restaurantId;
      if (!restaurantId) throw new Error('Restaurant non trouvé');

      const customerData = {
        customerName: values.customerName,
        customerPhone: values.phoneNumber,
        pickupTime: selectedPickupTime,
      };

      const order = await createOrder(restaurantId, values.specialInstructions || undefined, customerData);
      if (!order) throw new Error('Erreur création commande');

      const createdOrder = await addOrder(order);
      router.push(`/order/${createdOrder.id}`);

    } catch (error) {
      console.error('Erreur commande:', error);

      // Detecter les erreurs d'authentification
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAuthError = errorMessage.includes('Unauthorized') ||
                          errorMessage.includes('401') ||
                          errorMessage.includes('token');

      if (isAuthError) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter pour finaliser votre commande.',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Se reconnecter',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer la commande. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // État vide - Panier vide
  const renderEmptyCart = () => (
    <EmptyState
      variant="cart"
      actionLabel="Découvrir les restaurants"
      onAction={() => router.push('/(tabs)/' as any)}
      secondaryActionLabel={activeOrdersCount > 0 ? `Voir mes commandes (${activeOrdersCount})` : undefined}
      onSecondaryAction={activeOrdersCount > 0 ? () => router.push('/orders' as any) : undefined}
    />
  );

  // Contenu du panier avec articles
  const renderCartContent = () => (
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
            {/* Restaurant source */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <View style={styles.restaurantInfo}>
                  <View style={styles.restaurantDetails}>
                    <Text style={[styles.restaurantLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                      Commande chez
                    </Text>
                    <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>
                      {cartRestaurant?.name || 'Restaurant'}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      const restaurantId = items[0].menuItem.restaurantId;
                      router.push(`/restaurant/${restaurantId}` as any);
                    }}
                    style={styles.addMoreButton}
                    icon="plus"
                  >
                    Ajouter
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* Articles du panier */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  Vos articles ({totalItems})
                </Text>
                {items.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    layout={Layout.springify()}
                    style={styles.cartItem}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: currentTheme.colors.onSurface }]}>
                        {item.menuItem.name}
                      </Text>
                      {/* Options choisies */}
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
                      <IconButton
                        icon="delete-outline"
                        size={20}
                        onPress={() => handleRemoveItem(item.id)}
                        iconColor={currentTheme.colors.error}
                      />
                    </View>
                  </Animated.View>
                ))}
              </Card.Content>
            </Card>

            {/* Heure de récupération */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  Heure de retrait
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timeSlotsContainer}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.value}
                        selected={selectedPickupTime === slot.value}
                        onPress={() => setSelectedPickupTime(slot.value)}
                        style={[
                          styles.timeSlot,
                          selectedPickupTime === slot.value && { backgroundColor: currentTheme.colors.primaryContainer }
                        ]}
                        textStyle={selectedPickupTime === slot.value ? { color: currentTheme.colors.onPrimaryContainer } : undefined}
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
                  Vos informations
                </Text>
                <TextInput
                  label="Nom complet"
                  value={values.customerName}
                  onChangeText={handleChange('customerName')}
                  onFocus={() => scrollToInput(400)}
                  returnKeyType="next"
                  style={styles.input}
                  mode="outlined"
                  error={touched.customerName && !!errors.customerName}
                />
                <TextInput
                  label="Numéro de téléphone"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onFocus={() => scrollToInput(480)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  style={styles.input}
                  mode="outlined"
                  error={touched.phoneNumber && !!errors.phoneNumber}
                />
                <TextInput
                  label="Instructions spéciales (optionnel)"
                  value={values.specialInstructions}
                  onChangeText={handleChange('specialInstructions')}
                  onFocus={() => scrollToInput(560)}
                  multiline
                  numberOfLines={2}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  style={styles.input}
                  mode="outlined"
                />
              </Card.Content>
            </Card>

            {/* Récapitulatif et validation */}
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                    Sous-total
                  </Text>
                  <Text style={[styles.summaryValue, { color: currentTheme.colors.onSurface }]}>
                    {totalPrice.toFixed(2)}€
                  </Text>
                </View>
                <View style={[styles.totalRow, { borderTopColor: currentTheme.colors.outlineVariant }]}>
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
                  icon="check"
                >
                  Commander • Retrait {selectedPickupTime}
                </Button>
              </Card.Content>
            </Card>

            {/* Lien vers les commandes */}
            <View style={styles.ordersLinkContainer}>
              <Button
                mode="text"
                onPress={() => router.push('/orders' as any)}
                textColor={currentTheme.colors.primary}
                icon="clipboard-list"
              >
                Voir mes commandes
              </Button>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Formik>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Surface style={[styles.headerSurface, { backgroundColor: currentTheme.colors.surface }]} elevation={1}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
                Votre Panier
              </Text>
              {totalItems > 0 && (
                <Text style={[styles.headerSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {totalItems} article{totalItems > 1 ? 's' : ''} • {totalPrice.toFixed(2)}€
                </Text>
              )}
            </View>
            {totalItems > 0 && (
              <Avatar.Text
                size={40}
                label={totalItems.toString()}
                style={{ backgroundColor: currentTheme.colors.primaryContainer }}
                labelStyle={{ color: currentTheme.colors.onPrimaryContainer }}
              />
            )}
          </View>
        </Surface>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {items.length === 0 ? renderEmptyCart() : renderCartContent()}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartContent: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  // Restaurant info
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
  addMoreButton: {
    borderRadius: 8,
  },
  // Cart items
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 4,
  },
  optionText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  instructionsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
    minWidth: 24,
    textAlign: 'center',
  },
  // Time slots
  timeSlotsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  timeSlot: {
    marginRight: 4,
  },
  // Form inputs
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 12,
  },
  checkoutButtonContent: {
    height: 52,
  },
  // Orders link
  ordersLinkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  ordersLink: {
    marginTop: 16,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
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
