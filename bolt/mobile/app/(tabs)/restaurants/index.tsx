import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Clock } from 'lucide-react-native';
import { mockRestaurants } from '@/data/mockData';

const cuisineTypes = [
  { id: 'all', name: 'Tous', color: '#FF6B35' },
  { id: 'italian', name: 'Italien', color: '#E74C3C' },
  { id: 'asian', name: 'Asiatique', color: '#3498DB' },
  { id: 'french', name: 'Français', color: '#9B59B6' },
  { id: 'american', name: 'Américain', color: '#F39C12' },
];

export default function RestaurantsScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredRestaurants = mockRestaurants.filter((restaurant) => {
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/(tabs)/restaurants/${restaurantId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants près de vous</Text>
        <Text style={styles.subtitle}>Découvrez de délicieux plats</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un restaurant..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisineContainer}>
        {cuisineTypes.map((cuisine) => (
          <TouchableOpacity
            key={cuisine.id}
            style={[
              styles.cuisineButton,
              {
                backgroundColor: selectedCuisine === cuisine.id ? cuisine.color : '#F3F4F6',
              },
            ]}
            onPress={() => setSelectedCuisine(cuisine.id)}
          >
            <Text
              style={[
                styles.cuisineText,
                {
                  color: selectedCuisine === cuisine.id ? '#FFFFFF' : '#374B5C',
                },
              ]}
            >
              {cuisine.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.restaurantsList} showsVerticalScrollIndicator={false}>
        {filteredRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.restaurantCard}
            onPress={() => handleRestaurantPress(restaurant.id)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
              
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFB800" fill="#FFB800" strokeWidth={2} />
                  <Text style={styles.rating}>{restaurant.rating}</Text>
                  <Text style={styles.reviewCount}>({restaurant.reviewCount})</Text>
                </View>
                
                <View style={styles.deliveryInfo}>
                  <Clock size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
                </View>
                
                <View style={styles.deliveryInfo}>
                  <MapPin size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.distance}>{restaurant.distance}</Text>
                </View>
              </View>
              
              {restaurant.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Populaire</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  cuisineContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cuisineButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});