import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import {
  Card,
  Button,
  Surface,
  Chip,
  Avatar,
  IconButton,
  RadioButton,
  Checkbox,
  Divider,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';

import { useCart } from '../../src/contexts/CartContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { mockMenuItems, mockRestaurants, MenuItemOption, MenuItemChoice } from '../../src/data/mockData';

const { width } = Dimensions.get('window');

export default function MenuItemDetail() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItem, setMenuItem] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { addItem } = useCart();
  const { currentTheme } = useAppTheme();

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    loadMenuData();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [quantity, selectedOptions, menuItem]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const foundMenuItem = mockMenuItems.find(item => item.id === id);
      if (foundMenuItem) {
        setMenuItem(foundMenuItem);
        const foundRestaurant = mockRestaurants.find(r => r.id === foundMenuItem.restaurantId);
        setRestaurant(foundRestaurant);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!menuItem) return;
    
    let price = menuItem.price;

    // Ajouter le prix des options sélectionnées
    if (menuItem.options) {
      menuItem.options.forEach(option => {
        const selected = selectedOptions[option.id] || [];
        selected.forEach(choiceId => {
          const choice = option.choices.find(c => c.id === choiceId);
          if (choice) {
            price += choice.price;
          }
        });
      });
    }

    setTotalPrice(price * quantity);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Chargement de l'article...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!menuItem || !restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.errorState}>
          <Avatar.Icon size={80} icon="alert-circle" style={{ backgroundColor: currentTheme.colors.surfaceVariant }} />
          <Text style={[styles.errorTitle, { color: currentTheme.colors.onSurface }]}>
            Article introuvable
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
            buttonColor={currentTheme.colors.primary}
          >
            Retour
          </Button>
        </View>
      </SafeAreaView>
    );
  }


  const handleOptionChange = (optionId: string, choiceId: string, isMultiple: boolean) => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      
      if (isMultiple) {
        // Pour les options multiples (checkboxes)
        const newSelection = current.includes(choiceId)
          ? current.filter(id => id !== choiceId)
          : [...current, choiceId];
        return { ...prev, [optionId]: newSelection };
      } else {
        // Pour les options simples (radio buttons)
        return { ...prev, [optionId]: [choiceId] };
      }
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToCart = () => {
    console.log('🛒 Bouton cliqué - Ajout au panier:', menuItem.name);
    
    // Valider les options requises
    if (menuItem.options) {
      for (const option of menuItem.options) {
        if (option.isRequired && (!selectedOptions[option.id] || selectedOptions[option.id].length === 0)) {
          Alert.alert(
            'Option requise',
            `Veuillez sélectionner une option pour "${option.name}"`
          );
          return;
        }
      }
    }

    try {
      // Version simplifiée pour test
      console.log('✅ Tentative d\'ajout au panier...');
      
      // Juste ajouter l'item de base sans options complexes pour tester
      addItem(menuItem, quantity);
      
      console.log('✅ Ajout réussi!');
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Version simplifiée pour test sur web
      console.log('📱 Ajout réussi, navigation automatique vers le restaurant');
      
      // Navigation directe vers le restaurant après 500ms pour laisser le temps à l'utilisateur de voir l'action
      setTimeout(() => {
        console.log('🔙 Navigation vers le restaurant (router.back())');
        router.back();
      }, 500);
    } catch (error) {
      console.error('❌ Erreur ajout panier:', error);
      Alert.alert('Erreur', `Impossible d'ajouter au panier: ${error}`);
    }
  };

  const renderOption = (option: MenuItemOption) => {
    const isMultiple = option.type === 'extra' || (option.maxChoices && option.maxChoices > 1);
    const selectedChoices = selectedOptions[option.id] || [];

    return (
      <Card key={option.id} style={[styles.optionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <View style={styles.optionHeader}>
            <Text style={[styles.optionTitle, { color: currentTheme.colors.onSurface }]}>
              {option.name}
              {option.isRequired && <Text style={{ color: currentTheme.colors.error }}> *</Text>}
            </Text>
            {option.maxChoices && option.maxChoices > 1 && (
              <Chip
                compact
                style={{ backgroundColor: currentTheme.colors.primaryContainer }}
                textStyle={{ color: currentTheme.colors.onPrimaryContainer }}
              >
                Max {option.maxChoices}
              </Chip>
            )}
          </View>
          
          {option.choices.map((choice) => {
            const isSelected = selectedChoices.includes(choice.id);
            const canSelect = !option.maxChoices || 
                            selectedChoices.length < option.maxChoices || 
                            isSelected;

            return (
              <View key={choice.id} style={styles.choiceItem}>
                <View style={styles.choiceInfo}>
                  {isMultiple ? (
                    <Checkbox
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => canSelect && handleOptionChange(option.id, choice.id, true)}
                      disabled={!canSelect}
                    />
                  ) : (
                    <RadioButton
                      value={choice.id}
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange(option.id, choice.id, false)}
                    />
                  )}
                  <View style={styles.choiceText}>
                    <Text style={[
                      styles.choiceName,
                      { color: currentTheme.colors.onSurface },
                      !canSelect && { opacity: 0.5 }
                    ]}>
                      {choice.name}
                    </Text>
                    {choice.price > 0 && (
                      <Text style={[
                        styles.choicePrice,
                        { color: currentTheme.colors.primary },
                        !canSelect && { opacity: 0.5 }
                      ]}>
                        +{choice.price.toFixed(2)}€
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image de l'article */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: menuItem.image }} style={styles.itemImage} />
          <View style={styles.imageOverlay}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="white"
              style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => router.back()}
            />
            {menuItem.popular && (
              <Surface style={[styles.popularBadge, { backgroundColor: currentTheme.colors.tertiary }]} elevation={2}>
                <Text style={[styles.popularText, { color: currentTheme.colors.onTertiary }]}>
                  ⭐ Populaire
                </Text>
              </Surface>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Informations de base */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.basicInfo}>
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleContainer}>
                    <Text style={[styles.itemName, { color: currentTheme.colors.onSurface }]}>
                      {menuItem.name}
                    </Text>
                    <Text style={[styles.itemPrice, { color: currentTheme.colors.primary }]}>
                      {menuItem.price.toFixed(2)}€
                    </Text>
                  </View>
                  <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {restaurant.name}
                  </Text>
                </View>
                
                <Text style={[styles.itemDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {menuItem.description}
                </Text>
                
                <View style={styles.itemBadges}>
                  <Chip
                    icon="tag"
                    compact
                    style={{ backgroundColor: currentTheme.colors.secondaryContainer }}
                    textStyle={{ color: currentTheme.colors.onSecondaryContainer }}
                  >
                    {menuItem.category}
                  </Chip>
                  {!menuItem.available && (
                    <Chip
                      icon="clock-alert"
                      compact
                      style={{ backgroundColor: currentTheme.colors.errorContainer }}
                      textStyle={{ color: currentTheme.colors.onErrorContainer }}
                    >
                      Non disponible
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Options de personnalisation */}
          {menuItem.options && menuItem.options.length > 0 && (
            <Animated.View entering={FadeIn.delay(400)} style={styles.optionsSection}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                🛠️ Personnalisation
              </Text>
              {menuItem.options.map(renderOption)}
            </Animated.View>
          )}

          {/* Contrôle quantité et prix */}
          <Animated.View entering={FadeIn.delay(600)} style={styles.orderSection}>
            <Card style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
                  📦 Quantité et total
                </Text>
                
                <View style={styles.quantityControl}>
                  <Text style={[styles.quantityLabel, { color: currentTheme.colors.onSurface }]}>
                    Quantité
                  </Text>
                  <View style={styles.quantityButtons}>
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      style={[styles.quantityButton, { backgroundColor: currentTheme.colors.surfaceVariant }]}
                    />
                    <Text style={[styles.quantityText, { color: currentTheme.colors.onSurface }]}>
                      {quantity}
                    </Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() => handleQuantityChange(1)}
                      style={[styles.quantityButton, { backgroundColor: currentTheme.colors.surfaceVariant }]}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

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
                  onPress={handleAddToCart}
                  disabled={!menuItem.available}
                  style={styles.addToCartButton}
                  buttonColor={currentTheme.colors.primary}
                  contentStyle={styles.addToCartContent}
                >
                  {menuItem.available ? 'Ajouter au panier' : 'Non disponible'}
                </Button>
              </Card.Content>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Dialog de confirmation */}
      <Portal>
        <Dialog visible={showSuccessDialog} onDismiss={() => setShowSuccessDialog(false)}>
          <Dialog.Title>Ajouté au panier ! 🎉</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{menuItem?.name} x{quantity}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                console.log('🔙 Navigation vers le restaurant (router.back())');
                setShowSuccessDialog(false);
                router.back();
              }}
            >
              Continuer mes achats
            </Button>
            <Button 
              mode="contained"
              onPress={() => {
                console.log('🛒 Navigation vers le panier');
                setShowSuccessDialog(false);
                router.push('/(tabs)/cart');
              }}
            >
              Voir le panier
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  popularBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 20,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  basicInfo: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '600',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  choiceItem: {
    marginBottom: 8,
  },
  choiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceText: {
    flex: 1,
    marginLeft: 8,
  },
  choiceName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  choicePrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderSection: {
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  addToCartButton: {
    borderRadius: 12,
  },
  addToCartContent: {
    height: 50,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});