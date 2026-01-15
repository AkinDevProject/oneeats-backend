import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Share,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Dialog,
  Portal,
  Button,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAppTheme } from '../src/contexts/ThemeContext';

// Interface pour les questions FAQ
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  emoji: string;
}

export default function SupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const { currentTheme } = useAppTheme();

  // Données FAQ simplifiées
  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Comment passer une commande ?',
      answer: 'Parcourez les restaurants disponibles, sélectionnez vos plats, ajoutez-les au panier et procédez au paiement. Vous recevrez une confirmation par notification.',
      emoji: '🛒'
    },
    {
      id: '2',
      question: 'Quels sont les délais de préparation ?',
      answer: 'Les délais varient selon le restaurant, généralement entre 15-30 minutes. Le temps estimé est affiché avant la commande.',
      emoji: '⏱️'
    },
    {
      id: '3',
      question: 'Comment suivre ma commande ?',
      answer: 'Après confirmation, vous pouvez suivre votre commande en temps réel dans l\'onglet "Commandes". Vous recevrez des notifications à chaque étape.',
      emoji: '📱'
    },
    {
      id: '4',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, Apple Pay, Google Pay et le paiement en espèces sur place.',
      emoji: '💳'
    },
    {
      id: '5',
      question: 'Puis-je annuler ma commande ?',
      answer: 'Vous pouvez annuler votre commande gratuitement dans les 5 minutes suivant la confirmation. Après ce délai, contactez le restaurant.',
      emoji: '❌'
    },
    {
      id: '6',
      question: 'Comment ajouter un restaurant aux favoris ?',
      answer: 'Appuyez sur l\'icône cœur sur la page du restaurant. Retrouvez tous vos favoris depuis votre profil.',
      emoji: '❤️'
    }
  ];

  // Méthodes de contact
  const contactMethods = [
    {
      id: 'phone',
      emoji: '📞',
      label: 'Appeler',
      subtitle: '9h-18h',
      color: '#E8F5E9',
      action: () => Linking.openURL('tel:+33123456789'),
    },
    {
      id: 'whatsapp',
      emoji: '💬',
      label: 'WhatsApp',
      subtitle: '8h-22h',
      color: '#E3F2FD',
      action: () => Linking.openURL('https://wa.me/33123456789'),
    },
    {
      id: 'email',
      emoji: '📧',
      label: 'Email',
      subtitle: '24h',
      color: '#FFF3E0',
      action: () => Linking.openURL('mailto:support@oneeats.com'),
    },
    {
      id: 'web',
      emoji: '🌐',
      label: 'Site web',
      subtitle: 'FAQ',
      color: '#F3E5F5',
      action: () => Linking.openURL('https://www.oneeats.com/support'),
    },
  ];

  const handleContact = (method: typeof contactMethods[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    method.action();
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
      Alert.alert('Merci !', 'Votre commentaire a été envoyé.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le commentaire');
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Découvrez OneEats, votre app de commande à emporter préférée !',
        title: 'OneEats',
      });
    } catch (error) {
      // User cancelled
    }
  };

  const handleRate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Merci !', 'Cette fonctionnalité sera bientôt disponible sur les stores.');
  };

  // Composant bouton de contact
  const ContactButton = ({ method, delay }: { method: typeof contactMethods[0]; delay: number }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.contactButtonWrapper}>
      <TouchableRipple
        onPress={() => handleContact(method)}
        borderless
        style={[styles.contactButton, { backgroundColor: method.color }]}
      >
        <View style={styles.contactButtonContent}>
          <Text style={styles.contactEmoji}>{method.emoji}</Text>
          <Text style={[styles.contactLabel, { color: currentTheme.colors.onSurface }]}>
            {method.label}
          </Text>
          <Text style={[styles.contactSubtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            {method.subtitle}
          </Text>
        </View>
      </TouchableRipple>
    </Animated.View>
  );

  // Composant FAQ Item
  const FAQItemComponent = ({ item, index }: { item: FAQItem; index: number }) => {
    const isExpanded = expandedFAQ === item.id;

    return (
      <Animated.View entering={FadeInDown.delay(300 + index * 50).duration(400)}>
        <TouchableRipple
          onPress={() => toggleFAQ(item.id)}
          borderless
          style={[styles.faqItem, { backgroundColor: currentTheme.colors.surface }]}
        >
          <View>
            <View style={styles.faqHeader}>
              <View style={[styles.faqEmojiContainer, { backgroundColor: currentTheme.colors.surfaceVariant }]}>
                <Text style={styles.faqEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.faqQuestion, { color: currentTheme.colors.onSurface }]} numberOfLines={2}>
                {item.question}
              </Text>
              <MaterialIcons
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={currentTheme.colors.onSurfaceVariant}
              />
            </View>
            {isExpanded && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.faqAnswerContainer}>
                <Text style={[styles.faqAnswer, { color: currentTheme.colors.onSurfaceVariant }]}>
                  {item.answer}
                </Text>
              </Animated.View>
            )}
          </View>
        </TouchableRipple>
      </Animated.View>
    );
  };

  // Composant Action Button
  const ActionButton = ({ emoji, label, onPress, delay }: { emoji: string; label: string; onPress: () => void; delay: number }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.actionButtonWrapper}>
      <TouchableRipple
        onPress={onPress}
        borderless
        style={[styles.actionButton, { backgroundColor: currentTheme.colors.surface }]}
      >
        <View style={styles.actionButtonContent}>
          <Text style={styles.actionEmoji}>{emoji}</Text>
          <Text style={[styles.actionLabel, { color: currentTheme.colors.onSurface }]}>
            {label}
          </Text>
        </View>
      </TouchableRipple>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header cohérent */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>
          Aide & Support
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Contact Rapide */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            CONTACT RAPIDE
          </Text>
        </Animated.View>

        <View style={styles.contactGrid}>
          {contactMethods.map((method, index) => (
            <ContactButton key={method.id} method={method} delay={150 + index * 50} />
          ))}
        </View>

        {/* Section FAQ */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            QUESTIONS FRÉQUENTES
          </Text>
        </Animated.View>

        <View style={styles.faqList}>
          {faqData.map((item, index) => (
            <FAQItemComponent key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Section Votre Avis */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.onSurfaceVariant }]}>
            VOTRE AVIS COMPTE
          </Text>
        </Animated.View>

        <View style={styles.actionsRow}>
          <ActionButton emoji="⭐" label="Noter" onPress={handleRate} delay={650} />
          <ActionButton emoji="💬" label="Feedback" onPress={() => setShowFeedbackDialog(true)} delay={700} />
          <ActionButton emoji="📤" label="Partager" onPress={handleShare} delay={750} />
        </View>

        {/* Section À Propos */}
        <Animated.View entering={FadeInDown.delay(800).duration(400)}>
          <View style={[styles.aboutSection, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutEmoji}>ℹ️</Text>
              <Text style={[styles.aboutTitle, { color: currentTheme.colors.onSurface }]}>
                À Propos
              </Text>
            </View>
            <Text style={[styles.aboutVersion, { color: currentTheme.colors.onSurfaceVariant }]}>
              OneEats v1.0.0
            </Text>
            <View style={styles.aboutLinks}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://oneeats.com/terms')}
                style={styles.aboutLink}
              >
                <Text style={[styles.aboutLinkText, { color: currentTheme.colors.primary }]}>
                  CGU
                </Text>
              </TouchableOpacity>
              <Text style={[styles.aboutDot, { color: currentTheme.colors.onSurfaceVariant }]}>•</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://oneeats.com/privacy')}
                style={styles.aboutLink}
              >
                <Text style={[styles.aboutLinkText, { color: currentTheme.colors.primary }]}>
                  Confidentialité
                </Text>
              </TouchableOpacity>
              <Text style={[styles.aboutDot, { color: currentTheme.colors.onSurfaceVariant }]}>•</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://oneeats.com')}
                style={styles.aboutLink}
              >
                <Text style={[styles.aboutLinkText, { color: currentTheme.colors.primary }]}>
                  Site web
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(900)}>
          <Text style={[styles.footer, { color: currentTheme.colors.onSurfaceVariant }]}>
            © 2024 OneEats • Fait avec ❤️ à Paris
          </Text>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Dialog Feedback */}
      <Portal>
        <Dialog visible={showFeedbackDialog} onDismiss={() => setShowFeedbackDialog(false)}>
          <Dialog.Title>Votre Commentaire</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Partagez votre avis ou suggestions"
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
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 32,
  },
  headerSpacer: {
    width: 32,
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  // Section Title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  // Contact Grid
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  contactButtonWrapper: {
    width: '50%',
    padding: 6,
  },
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactButtonContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contactEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
  },
  // FAQ
  faqList: {
    gap: 8,
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  faqEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqEmoji: {
    fontSize: 18,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingLeft: 66,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  actionButtonWrapper: {
    flex: 1,
    padding: 6,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  // About Section
  aboutSection: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  aboutLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aboutLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutDot: {
    fontSize: 12,
  },
  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  // Dialog
  feedbackInput: {
    marginBottom: 8,
  },
});
