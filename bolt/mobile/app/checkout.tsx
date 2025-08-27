import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Clock, CreditCard, Check } from 'lucide-react-native';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const pickupTimes = [
  '15-20 min',
  '20-25 min',
  '25-30 min',
  '30-35 min',
];

const paymentMethods = [
  { id: 'card', name: 'Carte bancaire', icon: '💳' },
  { id: 'apple', name: 'Apple Pay', icon: '📱' },
  { id: 'cash', name: 'Espèces', icon: '💵' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedPickupTime, setSelectedPickupTime] = useState(pickupTimes[0]);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isLoading, setIsLoading] = useState(false);

  const handleOrder = () => {
    setIsLoading(true);
    
    // Simulate order processing
    setTimeout(() => {
      clearCart();
      setIsLoading(false);
      
      Alert.alert(
        'Commande confirmée !',
        `Votre commande sera prête dans ${selectedPickupTime}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/(tabs)/orders') 
          }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finaliser</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pickup Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récupération</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MapPin size={20} color="#6B7280" strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse de récupération</Text>
                <Text style={styles.infoValue}>Restaurant Le Gourmet</Text>
                <Text style={styles.infoSubtext}>123 Rue de Rivoli, 75001 Paris</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pickup Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heure de récupération</Text>
          <View style={styles.card}>
            <View style={styles.timeGrid}>
              {pickupTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedPickupTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => setSelectedPickupTime(time)}
                >
                  <Clock 
                    size={16} 
                    color={selectedPickupTime === time ? '#FFFFFF' : '#6B7280'} 
                    strokeWidth={2} 
                  />
                  <Text
                    style={[
                      styles.timeText,
                      selectedPickupTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.card}>
            <Text style={styles.customerName}>{user?.name}</Text>
            <Text style={styles.customerEmail}>{user?.email}</Text>
            {user?.phone && <Text style={styles.customerPhone}>{user.phone}</Text>}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          <View style={styles.card}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPayment === method.id && styles.paymentOptionSelected,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <Text style={styles.paymentText}>{method.name}</Text>
                {selectedPayment === method.id && (
                  <Check size={20} color="#FF6B35" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          <View style={styles.card}>
            {items.map((item) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {(item.price * item.quantity).toFixed(2)}€
                </Text>
              </View>
            ))}
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalText}>Total</Text>
              <Text style={styles.summaryTotalAmount}>{total.toFixed(2)}€</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.orderButton, isLoading && styles.orderButtonDisabled]} 
          onPress={handleOrder}
          disabled={isLoading}
        >
          <Text style={styles.orderButtonText}>
            {isLoading ? 'Traitement...' : `Confirmer la commande • ${total.toFixed(2)}€`}
          </Text>
        </TouchableOpacity>
      </View>
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    width: '48%',
    justifyContent: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#FF6B35',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FEF3F2',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});