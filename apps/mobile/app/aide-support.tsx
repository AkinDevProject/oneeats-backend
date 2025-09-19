import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// Interface pour les questions FAQ
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'commande' | 'livraison' | 'paiement' | 'compte' | 'autre';
}

// Interface pour les méthodes de contact
interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  available: boolean;
  hours?: string;
}

export default function SupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Données FAQ
  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Comment passer une commande ?',
      answer: 'Parcourez les restaurants disponibles, sélectionnez vos plats, ajoutez-les au panier et procédez au paiement. Vous recevrez une confirmation par notification.',
      category: 'commande'
    },
    {
      id: '2',
      question: 'Quels sont les délais de livraison ?',
      answer: 'Les délais varient selon le restaurant et votre localisation, généralement entre 20-45 minutes. Le temps estimé est affiché avant la commande.',
      category: 'livraison'
    },
    {
      id: '3',
      question: 'Comment suivre ma commande ?',
      answer: 'Après confirmation, vous pouvez suivre votre commande en temps réel dans l\'onglet "Commandes". Vous recevrez des notifications à chaque étape.',
      category: 'commande'
    },
    {
      id: '4',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, Apple Pay, Google Pay et le paiement en espèces à la livraison.',
      category: 'paiement'
    },
    {
      id: '5',
      question: 'Que faire si ma commande est en retard ?',
      answer: 'Si votre commande dépasse le délai estimé de plus de 15 minutes, contactez-nous immédiatement. Nous vous proposerons une solution adaptée.',
      category: 'livraison'
    },
    {
      id: '6',
      question: 'Comment modifier mes informations de compte ?',
      answer: 'Rendez-vous dans l\'onglet "Profil" puis "Compte" pour modifier vos informations personnelles, adresse de livraison et moyens de paiement.',
      category: 'compte'
    },
    {
      id: '7',
      question: 'Puis-je annuler ma commande ?',
      answer: 'Vous pouvez annuler votre commande gratuitement dans les 5 minutes suivant la confirmation. Après ce délai, des frais peuvent s\'appliquer.',
      category: 'commande'
    },
    {
      id: '8',
      question: 'Comment ajouter un restaurant à mes favoris ?',
      answer: 'Appuyez sur l\'icône cœur sur la page du restaurant ou dans la liste des restaurants. Retrouvez tous vos favoris dans l\'onglet dédié.',
      category: 'autre'
    }
  ];

  // Méthodes de contact
  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      title: 'Email',
      subtitle: 'support@oneeats.com',
      icon: 'email',
      action: () => handleContact('email'),
      available: true,
      hours: 'Réponse sous 24h'
    },
    {
      id: 'phone',
      title: 'Téléphone',
      subtitle: '+33 1 23 45 67 89',
      icon: 'phone',
      action: () => handleContact('phone'),
      available: true,
      hours: 'Lun-Ven 9h-18h'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat en direct',
      icon: 'chat',
      action: () => handleContact('whatsapp'),
      available: true,
      hours: 'Lun-Dim 8h-22h'
    },
    {
      id: 'website',
      title: 'Site Web',
      subtitle: 'www.oneeats.com/support',
      icon: 'language',
      action: () => handleContact('website'),
      available: true
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'commande', label: 'Commandes' },
    { id: 'livraison', label: 'Livraison' },
    { id: 'paiement', label: 'Paiement' },
    { id: 'compte', label: 'Compte' },
    { id: 'autre', label: 'Autre' }
  ];

  const handleContact = async (method: string) => {
    try {
      switch (method) {
        case 'email':
          await Linking.openURL('mailto:support@oneeats.com?subject=Demande de support OneEats');
          break;
        case 'phone':
          await Linking.openURL('tel:+33123456789');
          break;
        case 'whatsapp':
          await Linking.openURL('https://wa.me/33123456789?text=Bonjour, j\'ai besoin d\'aide avec OneEats');
          break;
        case 'website':
          await Linking.openURL('https://www.oneeats.com/support');
          break;
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir cette méthode de contact');
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQ = selectedCategory === 'all'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact rapide */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="contact-support" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Contactez-nous</Text>
          </View>

          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactItem}
              onPress={method.action}
              disabled={!method.available}
            >
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, !method.available && styles.contactIconDisabled]}>
                  <MaterialIcons name={method.icon as any} size={20} color={method.available ? "#007AFF" : "#999"} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactTitle, !method.available && styles.contactTitleDisabled]}>
                    {method.title}
                  </Text>
                  <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                  {method.hours && (
                    <Text style={styles.contactHours}>{method.hours}</Text>
                  )}
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={method.available ? "#666" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="help" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Questions Fréquentes</Text>
          </View>

          {/* Filtres de catégories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Liste FAQ */}
          <View style={styles.faqContainer}>
            {filteredFAQ.map((item, index) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <MaterialIcons
                    name={expandedFAQ === item.id ? "expand-less" : "expand-more"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>

                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}

                {index < filteredFAQ.length - 1 && <View style={styles.faqDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Informations supplémentaires */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Informations Utiles</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.infoText}>Service client disponible 7j/7</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="security" size={16} color="#666" />
            <Text style={styles.infoText}>Vos données sont protégées et sécurisées</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="thumb-up" size={16} color="#666" />
            <Text style={styles.infoText}>Satisfaction client garantie à 100%</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="local-shipping" size={16} color="#666" />
            <Text style={styles.infoText}>Livraison gratuite dès 25€ d'achat</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactIconDisabled: {
    backgroundColor: '#f5f5f5',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  contactTitleDisabled: {
    color: '#999',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoriesContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  faqContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqItem: {
    marginVertical: 4,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingRight: 32,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});