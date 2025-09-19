import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService } from '../../src/services/api';
import { ENV } from '../../src/config/env';

// Interface pour les données utilisateur
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les statistiques
interface UserStats {
  ordersCount: number;
  favoriteRestaurantsCount: number;
  totalSpent: number;
}

interface EditModalProps {
  visible: boolean;
  title: string;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

function EditModal({ visible, title, value, onSave, onCancel, keyboardType = 'default', multiline = false }: EditModalProps) {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier {title}</Text>

          <TextInput
            style={[styles.modalInput, multiline && styles.modalInputMultiline]}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
              <Text style={styles.modalSaveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats>({
    ordersCount: 0,
    favoriteRestaurantsCount: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    field: string;
    title: string;
    value: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    multiline?: boolean;
  }>({
    visible: false,
    field: '',
    title: '',
    value: '',
  });

  // Charger les données utilisateur
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données utilisateur
      const userData = await apiService.users.getById(ENV.DEV_USER_ID);
      setUser(userData);

      // Récupérer les commandes pour calculer les stats
      const orders = await apiService.orders.getByUserId(ENV.DEV_USER_ID);

      // Calculer les statistiques
      const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      const ordersCount = orders.length;

      // TODO: Récupérer les vrais favoris depuis l'API
      const favoriteRestaurantsCount = 3; // Valeur simulée pour correspondre aux favoris mock

      setStats({
        ordersCount,
        favoriteRestaurantsCount,
        totalSpent,
      });

    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setError('Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string, title: string, value: string, keyboardType?: 'default' | 'email-address' | 'phone-pad', multiline?: boolean) => {
    setEditModal({
      visible: true,
      field,
      title,
      value,
      keyboardType,
      multiline,
    });
  };

  const handleSave = (value: string) => {
    if (user) {
      setUser(prev => prev ? ({
        ...prev,
        [editModal.field]: value,
      }) : null);
      setEditModal(prev => ({ ...prev, visible: false }));
      Alert.alert('Succès', 'Informations mises à jour avec succès');
      // TODO: Sauvegarder via API
    }
  };

  const handleCancel = () => {
    setEditModal(prev => ({ ...prev, visible: false }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
            // TODO: Implémentation réelle de suppression + déconnexion
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Affichage du loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de votre profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage de l'erreur
  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Utilisateur non trouvé'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <View style={styles.card}>
          <View style={styles.profileSummary}>
            <View style={styles.avatar}>
              <MaterialIcons name="account-circle" size={80} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.fullName}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.joinDate}>Membre depuis {formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="analytics" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Mes Statistiques</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.ordersCount}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favoriteRestaurantsCount}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSpent.toFixed(2)}€</Text>
              <Text style={styles.statLabel}>Dépensé</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Informations Personnelles</Text>
          </View>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => handleEdit('firstName', 'prénom', user.firstName)}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="badge" size={20} color="#666" />
              <Text style={styles.infoLabel}>Prénom</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{user.firstName}</Text>
              <MaterialIcons name="edit" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => handleEdit('lastName', 'nom', user.lastName)}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="badge" size={20} color="#666" />
              <Text style={styles.infoLabel}>Nom</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{user.lastName}</Text>
              <MaterialIcons name="edit" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => handleEdit('email', 'email', user.email, 'email-address')}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="email" size={20} color="#666" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{user.email}</Text>
              <MaterialIcons name="edit" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => handleEdit('phone', 'téléphone', user.phone, 'phone-pad')}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <Text style={styles.infoLabel}>Téléphone</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{user.phone || 'Non renseigné'}</Text>
              <MaterialIcons name="edit" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => handleEdit('address', 'adresse', user.address || '', 'default', true)}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.infoLabel}>Adresse</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{user.address || 'Non renseignée'}</Text>
              <MaterialIcons name="edit" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="dashboard" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Actions Rapides</Text>
          </View>


          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="history" size={20} color="#666" />
              <Text style={styles.actionLabel}>Historique des commandes</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={styles.actionBadge}>{stats.ordersCount}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.actionLabel}>Mes adresses</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="security" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Sécurité</Text>
          </View>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="lock" size={20} color="#666" />
              <Text style={styles.actionLabel}>Changer le mot de passe</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="privacy-tip" size={20} color="#666" />
              <Text style={styles.actionLabel}>Confidentialité</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="download" size={20} color="#666" />
              <Text style={styles.actionLabel}>Exporter mes données</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="warning" size={20} color="#FF3B30" />
            <Text style={[styles.cardTitle, styles.dangerTitle]}>Zone de Danger</Text>
          </View>

          <TouchableOpacity style={styles.dangerActionItem} onPress={handleDeleteAccount}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="delete-forever" size={20} color="#FF3B30" />
              <Text style={[styles.actionLabel, styles.dangerText]}>Supprimer mon compte</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Modal */}
      <EditModal
        visible={editModal.visible}
        title={editModal.title}
        value={editModal.value}
        onSave={handleSave}
        onCancel={handleCancel}
        keyboardType={editModal.keyboardType}
        multiline={editModal.multiline}
      />
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
  dangerCard: {
    borderColor: '#FF3B30',
    borderWidth: 1,
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
  dangerTitle: {
    color: '#FF3B30',
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    marginRight: 8,
    textAlign: 'right',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dangerActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    color: '#000',
    marginLeft: 12,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  dangerText: {
    color: '#FF3B30',
  },
  bottomSpacer: {
    height: 32,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  // Loading et Error styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});