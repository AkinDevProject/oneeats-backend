import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NotificationSimulator } from '../../src/services/NotificationSimulator';

export default function ProfileMVP() {
  console.log('📋 Profile page rendering');

  const navigateToSection = (section: string) => {
    console.log(`Navigating to ${section}`);

    switch (section) {
      case 'account':
        router.push('/account');
        break;
      case 'favorites':
        // TODO: Créer la page favoris
        console.log('Page favoris à créer');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'support':
        // TODO: Créer la page aide & support
        console.log('Page aide & support à créer');
        break;
      default:
        console.log(`Section ${section} non implémentée`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mon Compte</Text>
          <Text style={styles.headerSubtitle}>Profil, favoris et paramètres</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
          {/* Menu principal */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="apps" size={20} color="#007AFF" />
                <Text style={styles.sectionTitle}>Menu</Text>
              </View>

              <TouchableOpacity style={styles.listItem} onPress={() => navigateToSection('account')}>
                <View style={styles.listLeft}>
                  <MaterialIcons name="account-circle" size={24} color="#666" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>Compte</Text>
                  <Text style={styles.listDescription}>Informations personnelles et statistiques</Text>
                </View>
                <View style={styles.listRight}>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.listItem} onPress={() => navigateToSection('favorites')}>
                <View style={styles.listLeft}>
                  <MaterialIcons name="favorite" size={24} color="#666" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>Favoris</Text>
                  <Text style={styles.listDescription}>Mes restaurants préférés</Text>
                </View>
                <View style={styles.listRight}>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.listItem} onPress={() => navigateToSection('settings')}>
                <View style={styles.listLeft}>
                  <MaterialIcons name="settings" size={24} color="#666" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>Réglages</Text>
                  <Text style={styles.listDescription}>Préférences et configuration</Text>
                </View>
                <View style={styles.listRight}>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.listItem} onPress={() => navigateToSection('support')}>
                <View style={styles.listLeft}>
                  <MaterialIcons name="help" size={24} color="#666" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>Aide & Support</Text>
                  <Text style={styles.listDescription}>Besoin d'aide ?</Text>
                </View>
                <View style={styles.listRight}>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  style={[styles.listItem, styles.testButton]}
                  onPress={() => NotificationSimulator.simulateNotifications()}
                >
                  <View style={styles.listLeft}>
                    <MaterialIcons name="notifications" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, styles.testText]}>🧪 Test Notifications</Text>
                    <Text style={styles.listDescription}>Simuler les notifications (dev seulement)</Text>
                  </View>
                  <View style={styles.listRight}>
                    <MaterialIcons name="play-arrow" size={24} color="#007AFF" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  section: {
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
  cardContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listLeft: {
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
  },
  listRight: {
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  testText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});