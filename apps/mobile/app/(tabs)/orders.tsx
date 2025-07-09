import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, Package } from 'lucide-react-native';
import { useOrder } from '@/context/OrderContext';
import { router } from 'expo-router';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock color="#FFC107" size={20} />;
    case 'preparing':
      return <Package color="#1E90FF" size={20} />;
    case 'ready':
      return <CheckCircle color="#4CAF50" size={20} />;
    case 'completed':
      return <CheckCircle color="#4CAF50" size={20} />;
    case 'cancelled':
      return <XCircle color="#F44336" size={20} />;
    default:
      return <Clock color="#6B7280" size={20} />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Order Placed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#FFC107';
    case 'preparing':
      return '#1E90FF';
    case 'ready':
      return '#4CAF50';
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    default:
      return '#6B7280';
  }
};

export default function OrdersScreen() {
  const { orders, currentOrder } = useOrder();

  const handleOrderPress = (orderId: string) => {
    router.push(`/order-tracking/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Orders</Text>
        </View>
        <View style={styles.emptyState}>
          <Package color="#9CA3AF" size={64} />
          <Text style={styles.emptyStateText}>No orders yet</Text>
          <Text style={styles.emptyStateSubtext}>
            When you place an order, it will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentOrder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Order</Text>
            <TouchableOpacity
              style={[styles.orderCard, styles.currentOrderCard]}
              onPress={() => handleOrderPress(currentOrder.id)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderRestaurant}>{currentOrder.restaurantName}</Text>
                  <Text style={styles.orderDate}>
                    {currentOrder.orderTime.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  {getStatusIcon(currentOrder.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(currentOrder.status) }]}>
                    {getStatusText(currentOrder.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderItems}>
                  {currentOrder.items.length} item{currentOrder.items.length > 1 ? 's' : ''}
                </Text>
                <Text style={styles.orderTotal}>${currentOrder.total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order History</Text>
          {orders
            .filter(order => order.id !== currentOrder?.id)
            .sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime())
            .map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleOrderPress(order.id)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                    <Text style={styles.orderDate}>
                      {order.orderTime.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.orderStatus}>
                    {getStatusIcon(order.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderItems}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentOrderCard: {
    borderColor: '#1E90FF',
    borderWidth: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderRestaurant: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E90FF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});