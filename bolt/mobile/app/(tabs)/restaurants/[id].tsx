import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus } from 'lucide-react-native';
import { mockRestaurants, mockMenuItems } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';

export default function RestaurantDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem, removeItem, getItemQuantity } = useCart();
  
  const restaurant = mockRestaurants.find(r => r.id === id);
  const menuItems = mockMenuItems.filter(item => item.restaurantId === id);
  
  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant non trouvé</Text>
      </SafeAreaView>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
        
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          
          <View style={styles.restaurantMeta}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFB800" fill="#FFB800" strokeWidth={2} />
              <Text style={styles.rating}>{restaurant.rating}</Text>
              <Text style={styles.reviewCount}>({restaurant.reviewCount} avis)</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.distance}</Text>
            </View>
          </View>
        </View>

        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {menuItems
              .filter(item => item.category === category)
              .map((item) => {
                const quantity = getItemQuantity(item.id);
                return (
                  <View key={item.id} style={styles.menuItem}>
                    <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                      <Text style={styles.menuItemPrice}>{item.price}€</Text>
                    </View>
                    <View style={styles.quantityContainer}>
                      {quantity > 0 ? (
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => removeItem(item.id)}
                          >
                            <Minus size={16} color="#FF6B35" strokeWidth={2} />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => addItem(item)}
                          >
                            <Plus size={16} color="#FF6B35" strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => addItem(item)}
                        >
                          <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  restaurantInfo: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingTop: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
});