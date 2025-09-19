import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Card,
  List,
  Divider,
  Dialog,
  Portal,
  Button,
  Chip,
  IconButton,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

import { useAppTheme } from '../src/contexts/ThemeContext';

type SupportSection = 'contact' | 'faq' | 'feedback' | 'about';

// Interface pour les questions FAQ
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'commande' | 'livraison' | 'paiement' | 'compte' | 'autre';
  emoji: string;
}

// Interface pour les méthodes de contact
interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  action: () => void;
  available: boolean;
  hours?: string;
  color: string;
}

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<SupportSection | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const { currentTheme } = useAppTheme();

  // Données FAQ
  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Comment passer une commande ?',
      answer: 'Parcourez les restaurants disponibles, sélectionnez vos plats, ajoutez-les au panier et procédez au paiement. Vous recevrez une confirmation par notification.',
      category: 'commande',
      emoji: '🛒'
    },
    {
      id: '2',
      question: 'Quels sont les délais de livraison ?',
      answer: 'Les délais varient selon le restaurant et votre localisation, généralement entre 20-45 minutes. Le temps estimé est affiché avant la commande.',
      category: 'livraison',
      emoji: '🚚'
    },
    {
      id: '3',
      question: 'Comment suivre ma commande ?',
      answer: 'Après confirmation, vous pouvez suivre votre commande en temps réel dans l\'onglet "Commandes". Vous recevrez des notifications à chaque étape.',
      category: 'commande',
      emoji: '📱'
    },
    {
      id: '4',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, Apple Pay, Google Pay et le paiement en espèces à la livraison.',
      category: 'paiement',
      emoji: '💳'
    },
    {
      id: '5',
      question: 'Que faire si ma commande est en retard ?',
      answer: 'Si votre commande dépasse le délai estimé de plus de 15 minutes, contactez-nous immédiatement. Nous vous proposerons une solution adaptée.',
      category: 'livraison',
      emoji: '⏰'
    },
    {
      id: '6',
      question: 'Comment modifier mes informations de compte ?',
      answer: 'Rendez-vous dans l\'onglet "Profil" puis "Compte" pour modifier vos informations personnelles, adresse de livraison et moyens de paiement.',
      category: 'compte',
      emoji: '👤'
    },
    {
      id: '7',
      question: 'Puis-je annuler ma commande ?',
      answer: 'Vous pouvez annuler votre commande gratuitement dans les 5 minutes suivant la confirmation. Après ce délai, des frais peuvent s\'appliquer.',
      category: 'commande',
      emoji: '❌'
    },
    {
      id: '8',
      question: 'Comment ajouter un restaurant à mes favoris ?',
      answer: 'Appuyez sur l\'icône cœur sur la page du restaurant ou dans la liste des restaurants. Retrouvez tous vos favoris dans l\'onglet dédié.',
      category: 'autre',
      emoji: '❤️'
    }
  ];

  // Méthodes de contact
  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'support@oneeats.com',
      description: 'Réponse garantie sous 24h',
      icon: 'email',
      action: () => handleContact('email'),
      available: true,
      hours: 'Réponse sous 24h',
      color: '#2196F3'
    },
    {
      id: 'phone',
      title: 'Support Téléphonique',
      subtitle: '+33 1 23 45 67 89',
      description: 'Assistance directe avec nos experts',
      icon: 'phone',
      action: () => handleContact('phone'),
      available: true,
      hours: 'Lun-Ven 9h-18h',
      color: '#4CAF50'
    },
    {
      id: 'whatsapp',
      title: 'Chat WhatsApp',
      subtitle: 'Chat en temps réel',
      description: 'Support instantané via WhatsApp',
      icon: 'chat',
      action: () => handleContact('whatsapp'),
      available: true,
      hours: 'Lun-Dim 8h-22h',
      color: '#25D366'
    },
    {
      id: 'website',
      title: 'Centre d\'Aide Web',
      subtitle: 'www.oneeats.com/support',
      description: 'Documentation complète et guides',
      icon: 'language',
      action: () => handleContact('website'),
      available: true,
      color: '#FF9800'
    }
  ];

  const categories = [
    { id: 'all', label: '🌍 Toutes', count: faqData.length },
    { id: 'commande', label: '🛒 Commandes', count: faqData.filter(f => f.category === 'commande').length },
    { id: 'livraison', label: '🚚 Livraison', count: faqData.filter(f => f.category === 'livraison').length },
    { id: 'paiement', label: '💳 Paiement', count: faqData.filter(f => f.category === 'paiement').length },
    { id: 'compte', label: '👤 Compte', count: faqData.filter(f => f.category === 'compte').length },
    { id: 'autre', label: '❓ Autre', count: faqData.filter(f => f.category === 'autre').length }
  ];

  const handleSectionPress = (section: SupportSection) => {
    setActiveSection(section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goBack = () => {
    if (activeSection) {
      setActiveSection(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      router.back();
    }
  };

  const handleContact = async (method: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre commentaire');
      return;
    }

    try {
      await Share.share({
        message: `Feedback OneEats: ${feedbackText}`,
        title: 'Feedback OneEats',
      });

      setShowFeedbackDialog(false);
      setFeedbackText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Merci !', 'Votre commentaire a été envoyé avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le commentaire');
    }
  };

  const filteredFAQ = selectedCategory === 'all'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  // Menu principal
  const renderMainMenu = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Contact rapide */}
      <Animated.View entering={FadeIn.delay(100)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Nous Contacter"
            description="Email, téléphone, chat et support web"
            left={(props) => <List.Icon {...props} icon="contact-support" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('contact')}
          />
        </Card>
      </Animated.View>

      {/* FAQ */}
      <Animated.View entering={FadeIn.delay(200)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Questions Fréquentes"
            description={`${faqData.length} questions et réponses détaillées`}
            left={(props) => <List.Icon {...props} icon="help" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('faq')}
          />
        </Card>
      </Animated.View>

      {/* Feedback */}
      <Animated.View entering={FadeIn.delay(300)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="Envoyer un Commentaire"
            description="Partagez vos suggestions et améliorations"
            left={(props) => <List.Icon {...props} icon="feedback" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('feedback')}
          />
        </Card>
      </Animated.View>

      {/* À propos */}
      <Animated.View entering={FadeIn.delay(400)}>
        <Card style={[styles.menuCard, { backgroundColor: currentTheme.colors.surface }]}>
          <List.Item
            title="À Propos de OneEats"
            description="Informations, version et mentions légales"
            left={(props) => <List.Icon {...props} icon="info" color={currentTheme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSectionPress('about')}
          />
        </Card>
      </Animated.View>

      {/* Contact urgent */}
      <Animated.View entering={FadeIn.delay(500)}>
        <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
              🚨 Contact Urgent
            </Text>

            <List.Item
              title="Problème avec ma commande"
              description="Support prioritaire pour les commandes"
              left={(props) => <List.Icon {...props} icon="priority-high" />}
              right={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => handleContact('phone')}
            />

            <Divider />

            <List.Item
              title="Signaler un problème"
              description="Incident technique ou sécurité"
              left={(props) => <List.Icon {...props} icon="report-problem" />}
              right={(props) => <List.Icon {...props} icon="email" />}
              onPress={() => handleContact('email')}
            />
          </Card.Content>
        </Card>
      </Animated.View>
    </ScrollView>
  );

  // Section Contact
  const renderContactSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            📞 Nous Contacter
          </Text>
          <Text style={[styles.sectionDescription, { color: currentTheme.colors.onSurfaceVariant }]}>
            Choisissez le moyen de contact qui vous convient le mieux
          </Text>

          {contactMethods.map((method, index) => (
            <View key={method.id}>
              <List.Item
                title={method.title}
                description={`${method.subtitle}\n${method.description}`}
                left={(props) => <List.Icon {...props} icon={method.icon} color={method.color} />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={method.action}
                titleNumberOfLines={2}
                descriptionNumberOfLines={3}
              />
              {index < contactMethods.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Section FAQ
  const renderFAQSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            ❓ Questions Fréquentes
          </Text>

          {/* Filtres de catégories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                selected={selectedCategory === category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.categoryChip}
              >
                {category.label} ({category.count})
              </Chip>
            ))}
          </ScrollView>

          {/* Liste FAQ */}
          {filteredFAQ.map((item, index) => (
            <View key={item.id}>
              <List.Item
                title={`${item.emoji} ${item.question}`}
                titleNumberOfLines={2}
                onPress={() => toggleFAQ(item.id)}
                right={(props) => (
                  <MaterialIcons
                    name={expandedFAQ === item.id ? "expand-less" : "expand-more"}
                    size={24}
                    color={currentTheme.colors.onSurfaceVariant}
                  />
                )}
              />

              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { color: currentTheme.colors.onSurfaceVariant }]}>
                    {item.answer}
                  </Text>
                </View>
              )}

              {index < filteredFAQ.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Section Feedback
  const renderFeedbackSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            💭 Votre Avis Compte
          </Text>

          <Button
            mode="contained"
            icon="star"
            onPress={() => Alert.alert('Évaluer', 'Merci ! Cette fonctionnalité sera bientôt disponible.')}
            style={styles.actionButton}
          >
            Évaluer l'application
          </Button>

          <Button
            mode="outlined"
            icon="feedback"
            onPress={() => setShowFeedbackDialog(true)}
            style={styles.actionButton}
          >
            Envoyer un commentaire
          </Button>

          <Button
            mode="outlined"
            icon="share"
            onPress={async () => {
              try {
                await Share.share({
                  message: 'Découvrez OneEats, votre app de livraison de repas préférée !',
                  title: 'OneEats - Livraison de repas',
                });
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de partager');
              }
            }}
            style={styles.actionButton}
          >
            Partager l'application
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Section À propos
  const renderAboutSection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurface }]}>
            ℹ️ À Propos
          </Text>

          <List.Item
            title="Version de l'application"
            description="OneEats v1.0.0 (Build 1)"
            left={(props) => <List.Icon {...props} icon="information" />}
          />

          <Divider />

          <List.Item
            title="Conditions d'utilisation"
            description="Lire les CGU"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL('https://oneeats.com/terms')}
          />

          <Divider />

          <List.Item
            title="Politique de confidentialité"
            description="Protection de vos données"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL('https://oneeats.com/privacy')}
          />

          <Divider />

          <List.Item
            title="© 2024 OneEats"
            description="Tous droits réservés"
            left={(props) => <List.Icon {...props} icon="copyright" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        {activeSection && (
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={currentTheme.colors.onSurface}
            onPress={goBack}
          />
        )}
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
            {activeSection
              ? {
                  contact: 'Nous Contacter',
                  faq: 'Questions Fréquentes',
                  feedback: 'Votre Avis',
                  about: 'À Propos',
                }[activeSection]
              : 'Aide & Support'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            {activeSection
              ? 'Nous sommes là pour vous aider'
              : 'FAQ, contact et assistance complète'}
          </Text>
        </View>
      </View>

      <Animated.View entering={SlideInRight} style={styles.content}>
        {activeSection === null && renderMainMenu()}
        {activeSection === 'contact' && renderContactSection()}
        {activeSection === 'faq' && renderFAQSection()}
        {activeSection === 'feedback' && renderFeedbackSection()}
        {activeSection === 'about' && renderAboutSection()}
      </Animated.View>

      {/* Dialog Feedback */}
      <Portal>
        <Dialog visible={showFeedbackDialog} onDismiss={() => setShowFeedbackDialog(false)}>
          <Dialog.Title>Votre Commentaire</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Partagez votre avis ou vos suggestions"
              value={feedbackText}
              onChangeText={setFeedbackText}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.feedbackInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFeedbackDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleFeedback}>Envoyer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  menuCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  feedbackInput: {
    marginBottom: 8,
  },
});