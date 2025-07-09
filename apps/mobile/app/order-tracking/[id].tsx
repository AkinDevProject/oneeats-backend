import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { ArrowLeft, Clock, CircleCheck as CheckCircle, Package, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useOrder } from '@/context/OrderContext';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(getOrderById(id as string));
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    const currentOrder = getOrderById(id as string);
    setOrder(currentOrder);
    
    if (currentOrder?.estimatedTime) {
      const timeLeft = currentOrder.estimatedTime.getTime() - Date.now();
      if (timeLeft > 0) {
        setEstimatedTime(`${Math.ceil(timeLeft / 60000)} minutes`);
      } else {
        setEstimatedTime('Ready now');
      }
    }
  }, [id]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStepStatus = (stepKey: string) => {
    const steps = ['pending', 'preparing', 'ready'];
    const currentIndex = steps.indexOf(order.status);
    const stepIndex = steps.indexOf(stepKey);
    
    if (stepIndex <= currentIndex) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.id}</Text>
          <Text style={styles.restaurantName}>{order.restaurantName}</Text>
          <Text style={styles.orderType}>
            {order.type === 'takeaway' ? 'Takeaway' : 'Dine In'}
          </Text>
          {estimatedTime && (
            <View style={styles.estimatedTimeContainer}>
              <Clock color="#1E90FF" size={16} />
              <Text style={styles.estimatedTime}>
                Estimated time: {estimatedTime}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusTimeline}>
            {statusSteps.map((step, index) => {
              const status = getStepStatus(step.key);
              const Icon = step.icon;
              const isActive = order.status === step.key;
              
              return (
                <View key={step.key} style={styles.statusStep}>
                  <View style={styles.statusStepLeft}>
                    <View
                      style={[
                        styles.statusIcon,
                        status === 'completed' && styles.statusIconCompleted,
                        isActive && styles.statusIconActive,
                      ]}
                    >
                      <Icon
                        color={
                          status === 'completed' || isActive ? '#FFFFFF' : '#6B7280'
                        }
                        size={20}
                      />
                    </View>
                    {index < statusSteps.length - 1 && (
                      <View
                        style={[
                          styles.statusLine,
                          status === 'completed' && styles.statusLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.statusStepContent}>
                    <Text
                      style={[
                        styles.statusStepText,
                        (status === 'completed' || isActive) && styles.statusStepTextActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text style={styles.statusStepSubtext}>
                        {order.status === 'pending' && 'Your order has been received'}
                        {order.status === 'preparing' && 'Chef is preparing your order'}
                        {order.status === 'ready' && 'Your order is ready for pickup'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
  },
  estimatedTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E90FF',
    marginLeft: 8,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusTimeline: {
    paddingLeft: 4,
  },
  statusStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statusStepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusIconCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusIconActive: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  statusLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  statusLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusStepContent: {
    flex: 1,
    paddingTop: 8,
  },
  statusStepText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statusStepTextActive: {
    color: '#1F2937',
  },
  statusStepSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  itemsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E90FF',
  },
  totalSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E90FF',
  },
});