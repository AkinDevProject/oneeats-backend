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
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import { mockRestaurants, mockMenuItems } from '@/data/mockData';

const recentSearches = [
  'Pizza',
  'Sushi',
  'Burger',
  'Salade',
];

const popularSearches = [
  'Tacos',
  'Pasta',
  'Pad Thai',
  'Sandwich',
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const searchResults = searchQuery.length > 0 ? [
    ...mockRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(restaurant => ({ ...restaurant, type: 'restaurant' })),
    ...mockMenuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({ ...item, type: 'dish' }))
  ] : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/(tabs)/restaurants/${restaurantId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher</Text>
        <Text style={styles.subtitle}>Trouvez vos plats préférés</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurant, plat, cuisine..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isSearching ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Recherches récentes</Text>
              </View>
              <View style={styles.tagsContainer}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleSearch(search)}
                  >
                    <Text style={styles.tagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Recherches populaires</Text>
              </View>
              <View style={styles.tagsContainer}>
                {popularSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tag, styles.popularTag]}
                    onPress={() => handleSearch(search)}
                  >
                    <Text style={[styles.tagText, styles.popularTagText]}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} résultat(s) pour "{searchQuery}"
            </Text>
            
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => {
                  if (result.type === 'restaurant') {
                    handleRestaurantPress(result.id);
                  } else {
                    const restaurant = mockRestaurants.find(r => r.id === result.restaurantId);
                    if (restaurant) {
                      handleRestaurantPress(restaurant.id);
                    }
                  }
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: result.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultDescription}>
                    {result.type === 'restaurant' ? result.description : 
                     `${result.price}€ • ${mockRestaurants.find(r => r.id === result.restaurantId)?.name}`}
                  </Text>
                  {result.type === 'restaurant' && (
                    <View style={styles.resultMeta}>
                      <Star size={14} color="#FFB800" fill="#FFB800" strokeWidth={2} />
                      <Text style={styles.resultRating}>{result.rating}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {searchResults.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
                <Text style={styles.noResultsSubtext}>
                  Essayez une recherche différente
                </Text>
              </View>
            )}
          </View>
        )}
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
    backgroundColor: '#FFFFFF',
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
    marginTop: 16,
    marginBottom: 24,
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularTag: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FF6B35',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  popularTagText: {
    color: '#FF6B35',
  },
  resultsContainer: {
    paddingHorizontal: 24,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});