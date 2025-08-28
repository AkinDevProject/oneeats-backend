import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const DESIGNS = [
  {
    id: 'design-1',
    title: 'Grid Moderne',
    subtitle: 'Filtres avancés & recherche',
    description: 'Interface épurée avec système de filtres complet, tri dynamique et recherche en temps réel.',
    colors: ['#667eea', '#764ba2'],
    icon: 'grid-view',
    features: [
      'Filtres avancés extensibles',
      'Tri par note, temps, distance',
      'Recherche en temps réel',
      'Grid 2 colonnes optimisé',
      'Design minimaliste'
    ],
    route: '/designs/restaurants-design-1'
  },
  {
    id: 'design-2',
    title: 'Liste Organisée',
    subtitle: 'Catégories & sections',
    description: 'Navigation par sections avec filtres rapides et organisation claire par type de cuisine.',
    colors: ['#f093fb', '#f5576c'],
    icon: 'view-list',
    features: [
      'Navigation flottante par sections',
      'Recherches tendances',
      'Filtres rapides colorés',
      'Cartes horizontales détaillées',
      'Organisation par catégories'
    ],
    route: '/designs/restaurants-design-2'
  },
  {
    id: 'design-3',
    title: 'Carousel Immersif',
    subtitle: 'Expérience visuelle riche',
    description: 'Interface moderne type social media avec carousels, stories et sélection par humeur.',
    colors: ['#4facfe', '#00f2fe'],
    icon: 'view-carousel',
    features: [
      'Stories découverte automatiques',
      'Sélecteur d\'humeur interactif',
      'Hero carousel immersif',
      'Cartes météo contextuelles',
      'Animations riches'
    ],
    route: '/designs/restaurants-design-3'
  },
  {
    id: 'design-4',
    title: 'Borne Interactive',
    subtitle: 'Style McDonald\'s',
    description: 'Interface inspirée des bornes de commande avec processus step-by-step et guidage utilisateur.',
    colors: ['#ffcc02', '#da020e'],
    icon: 'touch-app',
    features: [
      'Processus de commande guidé',
      'Interface type borne tactile',
      'Barre de progression claire',
      'Catégories visuelles grandes',
      'Boutons d\'aide intégrés'
    ],
    route: '/designs/restaurants-design-4'
  },
  {
    id: 'design-5',
    title: 'Fusion Parfaite',
    subtitle: 'McDonald\'s + Organisation',
    description: 'Le meilleur des deux mondes : simplicité kiosk + découverte organisée par sections.',
    colors: ['#ffcc02', '#3498db'],
    icon: 'auto-awesome',
    features: [
      'Guidage McDonald\'s simplifié',
      'Navigation par sections fluide',
      'Tendances et recommandations',
      'Interface accessible et moderne',
      'Découverte optimisée'
    ],
    route: '/designs/restaurants-design-5'
  }
];

export default function DesignSelector() {
  const handleDesignSelect = (design: any) => {
    router.push(design.route as any);
  };

  const renderDesignCard = (design: any, index: number) => (
    <TouchableOpacity
      key={design.id}
      style={styles.designCard}
      onPress={() => handleDesignSelect(design)}
    >
      <LinearGradient
        colors={design.colors}
        style={styles.designGradient}
      >
        <View style={styles.designHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={design.icon as any} size={32} color="white" />
          </View>
          
          <View style={styles.designTitleContainer}>
            <Text style={styles.designTitle}>{design.title}</Text>
            <Text style={styles.designSubtitle}>{design.subtitle}</Text>
          </View>
          
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </View>
        
        <Text style={styles.designDescription}>{design.description}</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Caractéristiques :</Text>
          {design.features.slice(0, 3).map((feature: string, idx: number) => (
            <View key={idx} style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {design.features.length > 3 && (
            <Text style={styles.moreFeatures}>+{design.features.length - 3} autres...</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sélecteur de Design</Text>
          <Text style={styles.headerSubtitle}>Choisissez le style qui vous plaît</Text>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>🎨 5 Designs Uniques</Text>
          <Text style={styles.introText}>
            Explorez différentes approches pour votre page restaurants. 
            Chaque design offre une expérience utilisateur unique avec ses propres avantages.
          </Text>
        </View>

        <View style={styles.designsList}>
          {DESIGNS.map(renderDesignCard)}
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>💡 Instructions</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Appuyez sur une carte pour prévisualiser le design
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Testez les interactions et fonctionnalités
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Choisissez votre favori pour l'intégrer définitivement
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  designsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  designCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  designGradient: {
    padding: 24,
  },
  designHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  designTitleContainer: {
    flex: 1,
  },
  designTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  designSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  designDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  instructionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});