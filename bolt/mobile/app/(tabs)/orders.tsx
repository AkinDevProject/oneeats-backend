import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Clock, CircleCheck as CheckCircle, Truck } from 'lucide-react-native';
import { useCart } from '@/hooks/useCart';
import { mockOrders } from '@/data/mockData';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'preparing':
      return <Clock size={20} color="#F59E0B" strokeWidth={2} />;
    case 'ready':
      return <CheckCircle size={20} color="#10B981" strokeWidth={2} />;
    case 'completed':
      return <CheckCircle size={20} color="#6B7280" strokeWidth={2} />;
    default:
      return <Clock size={20} color="#9CA3AF" strokeWidth={2} />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'preparing':
      return 'En préparation';
    case 'ready':
      return 'Prête';
    case 'completed':
      return 'Récupérée';
    default:
      return 'En attente';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'preparing':
      return '#F59E0B';
    case 'ready':
      return '#10B981';
    case 'completed':
      return '#6B7280';
    default:
      return '#9CA3AF';
  }
};

export default function OrdersScreen() {
  const router = useRouter();
  const { items, total, getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes commandes</Text>
        <Text style={styles.subtitle}>Suivez vos commandes en cours</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItemCount > 0 && (
          <View style={styles.currentCartSection}>
            <Text style={styles.sectionTitle}>Panier actuel</Text>
            <TouchableOpacity
              style={styles.cartCard}
              onPress={() => router.push('/cart')}
              activeOpacity={0.8}
            >
              <View style={styles.cartInfo}>
                <Text style={styles.cartTitle}>
                  {cartItemCount} article(s) dans votre panier
                </Text>
                <Text style={styles.cartTotal}>Total: {total.toFixed(2)}€</Text>
              </View>
              <View style={styles.cartIcon}>
                <ShoppingBag size={24} color="#FF6B35" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes récentes</Text>
          {mockOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.8}
            >
              <Image source={{ uri: order.restaurantImage }} style={styles.orderImage} />
              
              <View style={styles.orderInfo}>
                <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                <Text style={styles.orderItems}>{order.items.join(', ')}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
                
                <View style={styles.orderStatus}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{order.total}€</Text>
                {order.status === 'ready' && (
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyText}>À récupérer</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {mockOrders.length === 0 && (
            <View style={styles.emptyState}>
              <ShoppingBag size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptySubtitle}>
                Explorez nos restaurants pour passer votre première commande
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/restaurants')}
              >
                <Text style={styles.exploreButtonText}>Explorer les restaurants</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
    paddingTop: 24,
  },
  currentCartSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  section: {
    marginHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  cartCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  cartInfo: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  cartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  readyBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});