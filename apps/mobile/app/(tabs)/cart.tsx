import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Alert,
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
  SlideOutRight,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, TextInput, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';

import { useCart } from '../../src/contexts/CartContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { CartItem, mockRestaurants } from '../../src/data/mockData';

const promoSchema = yup.object({
  promoCode: yup.string(),
  specialInstructions: yup.string().max(200, 'Instructions trop longues'),
});

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const validPromoCodes: PromoCode[] = [
  { code: 'DELISH20', discount: 20, type: 'percentage', description: '20% de réduction' },
  { code: 'WELCOME10', discount: 10, type: 'fixed', description: '10€ de réduction' },
  { code: 'FIRST5', discount: 5, type: 'fixed', description: '5€ de réduction' },
];

export default function CartScreen() {
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, createOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useOrder();
  const { sendOrderNotification } = useNotification();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const checkoutScale = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    checkoutScale.value = withSpring(1, { damping: 15, mass: 0.8 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const checkoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkoutScale.value }],
    opacity: interpolate(checkoutScale.value, [0, 1], [0, 1]),
  }));

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const applyPromoCode = (code: string) => {
    const promo = validPromoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (promo) {
      setAppliedPromo(promo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Code invalide', 'Ce code promo n\'est pas valide ou a expiré.');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.type === 'percentage') {
      return totalPrice * (appliedPromo.discount / 100);
    } else {
      return Math.min(appliedPromo.discount, totalPrice);
    }
  };

  const deliveryFee = 2.99;
  const discount = calculateDiscount();
  const finalTotal = Math.max(0, totalPrice + deliveryFee - discount);

  const handleCheckout = async (values: { promoCode: string; specialInstructions: string }) => {
    if (!items.length) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour passer commande. Souhaitez-vous vous connecter ou continuer en tant qu\'invité ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Invité', onPress: () => router.push('/auth?mode=guest' as any) },
          { text: 'Se connecter', onPress: () => router.push('/auth' as any) },
        ]
      );
      return;
    }

    setIsCheckingOut(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Get restaurant ID from first item
      const restaurantId = items[0]?.menuItem.restaurantId;
      if (!restaurantId) throw new Error('Restaurant ID not found');

      // Create order
      const order = await createOrder(restaurantId, values.specialInstructions);
      if (!order) throw new Error('Failed to create order');

      // Add to order context
      addOrder(order);

      // Send notification
      await sendOrderNotification(order.id, 'pending', order.restaurant.name);

      // Navigate to order tracking
      router.push(`/order/${order.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#ff7e5f', '#feb47b']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Panier 🛒</Text>
            <Text style={styles.headerSubtitle}>
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </Text>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => {
    const restaurant = mockRestaurants.find(r => r.id === item.menuItem.restaurantId);
    
    return (
      <Animated.View
        entering={SlideInRight.delay(200 + index * 100).springify()}
        exiting={SlideOutRight.springify()}
        style={styles.cartItem}
      >
        <Card style={styles.cartItemCard}>
          <View style={styles.cartItemContent}>
            {/* Image */}
            <Image 
              source={{ uri: item.menuItem.image }} 
              style={styles.cartItemImage}
              resizeMode="cover"
            />

            {/* Content */}
            <View style={styles.cartItemInfo}>
              <View style={styles.cartItemHeader}>
                <View style={styles.cartItemTitleContainer}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.menuItem.name}
                  </Text>
                  <Text style={styles.cartItemRestaurant} numberOfLines={1}>
                    {restaurant?.name}
                  </Text>
                  {item.specialInstructions && (
                    <Text style={styles.specialInstructions} numberOfLines={2}>
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>

                <Pressable 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>

              {/* Price and Quantity */}
              <View style={styles.cartItemFooter}>
                <Text style={styles.cartItemPrice}>
                  {(item.menuItem.price * item.quantity).toFixed(2)} €
                </Text>

                <View style={styles.quantityControls}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#666" />
                  </Pressable>

                  <Animated.View
                    key={item.quantity}
                    entering={ZoomIn.springify()}
                    style={styles.quantityDisplay}
                  >
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </Animated.View>

                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color="#666" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderEmptyCart = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyCart}>
      <View style={styles.emptyCartIcon}>
        <Ionicons name="bag-outline" size={80} color="#cbd5e1" />
      </View>
      <Text style={styles.emptyCartTitle}>Votre panier est vide</Text>
      <Text style={styles.emptyCartText}>
        Découvrez nos délicieux restaurants et ajoutez vos plats préférés !
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/(tabs)/')}
        style={styles.emptyCartButton}
        labelStyle={styles.emptyCartButtonText}
      >
        Découvrir les restaurants
      </Button>
    </Animated.View>
  );

  const renderCheckoutSection = () => (
    <Animated.View style={[styles.checkoutSection, checkoutAnimatedStyle]}>
      <BlurView intensity={90} style={styles.checkoutBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
          style={styles.checkoutGradient}
        />
        
        <Formik
          initialValues={{ promoCode: '', specialInstructions: '' }}
          validationSchema={promoSchema}
          onSubmit={handleCheckout}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={styles.checkoutContent}>
              {/* Promo Code Section */}
              <View style={styles.promoSection}>
                <Text style={styles.sectionTitle}>Code promo</Text>
                {!appliedPromo ? (
                  <View style={styles.promoInputContainer}>
                    <TextInput
                      mode="outlined"
                      placeholder="Entrez votre code"
                      value={values.promoCode}
                      onChangeText={handleChange('promoCode')}
                      style={styles.promoInput}
                      outlineStyle={styles.promoInputOutline}
                      contentStyle={styles.promoInputContent}
                      right={
                        <TextInput.Icon 
                          icon="ticket-percent" 
                          onPress={() => {
                            if (values.promoCode.trim()) {
                              applyPromoCode(values.promoCode);
                            }
                          }}
                        />
                      }
                    />
                  </View>
                ) : (
                  <View style={styles.appliedPromo}>
                    <View style={styles.appliedPromoInfo}>
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                      <Text style={styles.appliedPromoText}>
                        {appliedPromo.code} appliqué - {appliedPromo.description}
                      </Text>
                    </View>
                    <Pressable onPress={removePromoCode}>
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Special Instructions */}
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>Instructions spéciales</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Commentaires pour le restaurant (optionnel)"
                  value={values.specialInstructions}
                  onChangeText={handleChange('specialInstructions')}
                  multiline
                  numberOfLines={3}
                  style={styles.instructionsInput}
                  outlineStyle={styles.instructionsInputOutline}
                  error={touched.specialInstructions && !!errors.specialInstructions}
                />
                {touched.specialInstructions && errors.specialInstructions && (
                  <Text style={styles.errorText}>{errors.specialInstructions}</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              {/* Price Breakdown */}
              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Sous-total ({totalItems} articles)</Text>
                  <Text style={styles.priceValue}>{totalPrice.toFixed(2)} €</Text>
                </View>
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Frais de service</Text>
                  <Text style={styles.priceValue}>{deliveryFee.toFixed(2)} €</Text>
                </View>

                {discount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, styles.discountLabel]}>
                      Réduction ({appliedPromo?.code})
                    </Text>
                    <Text style={[styles.priceValue, styles.discountValue]}>
                      -{discount.toFixed(2)} €
                    </Text>
                  </View>
                )}

                <Divider style={styles.totalDivider} />
                
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{finalTotal.toFixed(2)} €</Text>
                </View>
              </View>

              {/* Checkout Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isCheckingOut}
                disabled={isCheckingOut || items.length === 0}
                style={styles.checkoutButton}
                labelStyle={styles.checkoutButtonText}
                contentStyle={styles.checkoutButtonContent}
              >
                {isCheckingOut ? 'Traitement...' : 'Passer la commande'}
              </Button>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
                <Text style={styles.securityText}>Paiement sécurisé</Text>
              </View>
            </View>
          )}
        </Formik>
      </BlurView>
    </Animated.View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {renderEmptyCart()}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cartList}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </Animated.View>

      {renderCheckoutSection()}
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
  cartList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 400, // Space for checkout section
  },
  itemSeparator: {
    height: 16,
  },
  cartItem: {
    // Container for animated cart item
  },
  cartItemCard: {
    elevation: 2,
    borderRadius: 16,
  },
  cartItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartItemTitleContainer: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  cartItemRestaurant: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  specialInstructions: {
    fontSize: 12,
    color: '#4a5568',
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    marginLeft: 12,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  quantityDisplay: {
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyCartButton: {
    backgroundColor: '#ff7e5f',
    borderRadius: 25,
  },
  emptyCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  checkoutBlur: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  checkoutGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  checkoutContent: {
    // Container for checkout form content
  },
  promoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  promoInputContainer: {
    // Container for promo input
  },
  promoInput: {
    backgroundColor: 'white',
  },
  promoInputOutline: {
    borderRadius: 12,
  },
  promoInputContent: {
    paddingRight: 50,
  },
  appliedPromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
    marginLeft: 8,
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsInput: {
    backgroundColor: 'white',
  },
  instructionsInputOutline: {
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  divider: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 20,
  },
  priceBreakdown: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
  },
  discountLabel: {
    color: '#22c55e',
  },
  discountValue: {
    color: '#22c55e',
  },
  totalDivider: {
    backgroundColor: '#cbd5e1',
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: '#2d3748',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    color: '#ff7e5f',
    fontWeight: '800',
  },
  checkoutButton: {
    backgroundColor: '#ff7e5f',
    borderRadius: 16,
    marginBottom: 16,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});