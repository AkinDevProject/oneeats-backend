import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Clock, XCircle, Bell, Calendar } from 'lucide-react-native';
import { RestaurantSchedule, DaySchedule } from '../types';

// Jours de la semaine en français
const DAYS_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Calcule la prochaine ouverture du restaurant
 */
export const getNextOpenTime = (schedule?: RestaurantSchedule): string | null => {
  if (!schedule) return null;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Convertir l'index JavaScript (0=dimanche) vers notre format (0=lundi)
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5]; // JS Sunday=0 -> notre index 6
  const todayIndex = dayIndexMap[currentDay];

  // Chercher la prochaine ouverture dans les 7 prochains jours
  for (let i = 0; i < 7; i++) {
    const checkDayIndex = (todayIndex + i) % 7;
    const dayKey = DAYS_ORDER[checkDayIndex] as keyof RestaurantSchedule;
    const daySchedule = schedule[dayKey];

    if (daySchedule && daySchedule.openTime) {
      const [openHour, openMin] = daySchedule.openTime.split(':').map(Number);
      const openTimeMinutes = openHour * 60 + openMin;

      // Si c'est aujourd'hui, vérifier si l'heure d'ouverture n'est pas passée
      if (i === 0 && openTimeMinutes <= currentTime) {
        continue; // Déjà passé aujourd'hui
      }

      // Formater le résultat
      if (i === 0) {
        return `Ouvre à ${daySchedule.openTime}`;
      } else if (i === 1) {
        return `Ouvre demain à ${daySchedule.openTime}`;
      } else {
        return `Ouvre ${DAYS_FR[dayKey]} à ${daySchedule.openTime}`;
      }
    }
  }

  return null;
};

interface ClosedOverlayProps {
  nextOpenTime?: string | null;
  compact?: boolean;
}

/**
 * Overlay amélioré pour les restaurants fermés (sur les cartes)
 */
export const ClosedRestaurantOverlay: React.FC<ClosedOverlayProps> = ({
  nextOpenTime,
  compact = false,
}) => {
  return (
    <View style={[styles.overlay, compact && styles.overlayCompact]}>
      <View style={styles.overlayContent}>
        <Clock size={compact ? 16 : 24} color="#fff" />
        <Text style={[styles.overlayText, compact && styles.overlayTextCompact]}>
          Fermé
        </Text>
      </View>
      {nextOpenTime && !compact && (
        <Text style={styles.nextOpenText}>{nextOpenTime}</Text>
      )}
    </View>
  );
};

interface ClosedBannerProps {
  restaurantName: string;
  nextOpenTime?: string | null;
  schedule?: RestaurantSchedule;
  onNotifyMe?: () => void;
}

/**
 * Bannière améliorée pour la page restaurant (en haut)
 */
export const ClosedRestaurantBanner: React.FC<ClosedBannerProps> = ({
  restaurantName,
  nextOpenTime,
  schedule,
  onNotifyMe,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <Clock size={28} color="#DC2626" />
      </View>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Restaurant fermé</Text>
        <Text style={styles.bannerSubtitle}>
          {nextOpenTime || 'Consultez les horaires pour plus de détails'}
        </Text>
      </View>
      {onNotifyMe && (
        <TouchableOpacity style={styles.notifyButton} onPress={onNotifyMe}>
          <Bell size={18} color="#7C3AED" />
          <Text style={styles.notifyText}>Me notifier</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ClosedModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantName: string;
  nextOpenTime?: string | null;
  schedule?: RestaurantSchedule;
  onNotifyMe?: () => void;
}

/**
 * Modal affichée quand l'utilisateur essaie de commander dans un restaurant fermé
 */
export const ClosedRestaurantModal: React.FC<ClosedModalProps> = ({
  visible,
  onClose,
  restaurantName,
  nextOpenTime,
  schedule,
  onNotifyMe,
}) => {
  // Formater les horaires pour affichage
  const formattedSchedule = useMemo(() => {
    if (!schedule) return null;

    return DAYS_ORDER.map((dayKey) => {
      const daySchedule = schedule[dayKey as keyof RestaurantSchedule];
      return {
        day: DAYS_FR[dayKey],
        schedule: daySchedule
          ? `${daySchedule.openTime} - ${daySchedule.closeTime}`
          : 'Fermé',
        isClosed: !daySchedule,
      };
    });
  }, [schedule]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconCircle}>
              <Clock size={32} color="#DC2626" />
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <XCircle size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Restaurant fermé</Text>
          <Text style={styles.modalRestaurantName}>{restaurantName}</Text>

          {/* Next open time */}
          {nextOpenTime && (
            <View style={styles.nextOpenBadge}>
              <Calendar size={16} color="#7C3AED" />
              <Text style={styles.nextOpenBadgeText}>{nextOpenTime}</Text>
            </View>
          )}

          {/* Schedule */}
          {formattedSchedule && (
            <View style={styles.scheduleContainer}>
              <Text style={styles.scheduleTitle}>Horaires d'ouverture</Text>
              {formattedSchedule.map((item, index) => (
                <View key={item.day} style={styles.scheduleRow}>
                  <Text
                    style={[
                      styles.scheduleDay,
                      item.isClosed && styles.scheduleClosed,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.scheduleTime,
                      item.isClosed && styles.scheduleClosed,
                    ]}
                  >
                    {item.schedule}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.modalActions}>
            {onNotifyMe && (
              <TouchableOpacity
                style={styles.notifyMeButton}
                onPress={() => {
                  onNotifyMe();
                  onClose();
                }}
              >
                <Bell size={18} color="#fff" />
                <Text style={styles.notifyMeText}>Me notifier à l'ouverture</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Overlay styles (pour les cartes)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  overlayCompact: {
    gap: 4,
  },
  overlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayTextCompact: {
    fontSize: 14,
  },
  nextOpenText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Banner styles (pour la page restaurant)
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#B91C1C',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  notifyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalRestaurantName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  nextOpenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 20,
  },
  nextOpenBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  scheduleContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  scheduleDay: {
    fontSize: 14,
    color: '#374151',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  scheduleClosed: {
    color: '#9CA3AF',
  },
  modalActions: {
    gap: 12,
  },
  notifyMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  notifyMeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default ClosedRestaurantBanner;
