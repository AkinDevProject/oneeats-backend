import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Leaf, Vegan, AlertTriangle, Info } from 'lucide-react-native';
import { AllergenType } from '../types';

// Configuration des allergènes avec icônes et couleurs
export const ALLERGEN_CONFIG: Record<AllergenType, { label: string; emoji: string; color: string }> = {
  GLUTEN: { label: 'Gluten', emoji: '🌾', color: '#D97706' },
  CRUSTACEANS: { label: 'Crustacés', emoji: '🦐', color: '#DC2626' },
  EGGS: { label: 'Œufs', emoji: '🥚', color: '#F59E0B' },
  FISH: { label: 'Poisson', emoji: '🐟', color: '#3B82F6' },
  PEANUTS: { label: 'Arachides', emoji: '🥜', color: '#92400E' },
  SOY: { label: 'Soja', emoji: '🫘', color: '#65A30D' },
  DAIRY: { label: 'Lait', emoji: '🥛', color: '#F3F4F6' },
  NUTS: { label: 'Fruits à coque', emoji: '🌰', color: '#78350F' },
  CELERY: { label: 'Céleri', emoji: '🥬', color: '#22C55E' },
  MUSTARD: { label: 'Moutarde', emoji: '🟡', color: '#EAB308' },
  SESAME: { label: 'Sésame', emoji: '⚪', color: '#A3A3A3' },
  SULPHITES: { label: 'Sulfites', emoji: '🧪', color: '#8B5CF6' },
  LUPIN: { label: 'Lupin', emoji: '🌸', color: '#EC4899' },
  MOLLUSCS: { label: 'Mollusques', emoji: '🦪', color: '#64748B' },
};

interface DietaryBadgesProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: AllergenType[];
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  onAllergenPress?: (allergen: AllergenType) => void;
}

export const DietaryBadges: React.FC<DietaryBadgesProps> = ({
  isVegetarian,
  isVegan,
  allergens = [],
  size = 'medium',
  showLabels = false,
  onAllergenPress,
}) => {
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 22;
  const badgeSize = size === 'small' ? 24 : size === 'medium' ? 32 : 40;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;

  const hasDietaryInfo = isVegetarian || isVegan || allergens.length > 0;

  if (!hasDietaryInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Badges végétarien/végétalien */}
      <View style={styles.dietaryRow}>
        {isVegan && (
          <View style={[styles.badge, styles.veganBadge, { minWidth: badgeSize, height: badgeSize }]}>
            <Text style={[styles.badgeEmoji, { fontSize: iconSize }]}>🌱</Text>
            {showLabels && <Text style={[styles.badgeLabel, { fontSize }]}>Végan</Text>}
          </View>
        )}
        {isVegetarian && !isVegan && (
          <View style={[styles.badge, styles.vegetarianBadge, { minWidth: badgeSize, height: badgeSize }]}>
            <Leaf size={iconSize} color="#16A34A" />
            {showLabels && <Text style={[styles.badgeLabel, { fontSize, color: '#16A34A' }]}>Végétarien</Text>}
          </View>
        )}
      </View>

      {/* Allergènes */}
      {allergens.length > 0 && (
        <View style={styles.allergensContainer}>
          {showLabels && (
            <View style={styles.allergenHeader}>
              <AlertTriangle size={12} color="#DC2626" />
              <Text style={styles.allergenTitle}>Allergènes:</Text>
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.allergenScroll}>
            <View style={styles.allergenRow}>
              {allergens.map((allergen) => {
                const config = ALLERGEN_CONFIG[allergen];
                if (!config) return null;

                return (
                  <TouchableOpacity
                    key={allergen}
                    style={[
                      styles.allergenBadge,
                      { minWidth: badgeSize, height: badgeSize },
                    ]}
                    onPress={() => onAllergenPress?.(allergen)}
                    disabled={!onAllergenPress}
                  >
                    <Text style={[styles.allergenEmoji, { fontSize: iconSize }]}>{config.emoji}</Text>
                    {showLabels && (
                      <Text style={[styles.allergenLabel, { fontSize: fontSize - 2 }]}>
                        {config.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

/**
 * Composant compact pour affichage en ligne (dans une card)
 */
interface DietaryIndicatorsProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergenCount?: number;
}

export const DietaryIndicators: React.FC<DietaryIndicatorsProps> = ({
  isVegetarian,
  isVegan,
  allergenCount = 0,
}) => {
  const hasInfo = isVegetarian || isVegan || allergenCount > 0;

  if (!hasInfo) {
    return null;
  }

  return (
    <View style={styles.indicatorsRow}>
      {isVegan && (
        <View style={[styles.indicator, styles.veganIndicator]}>
          <Text style={styles.indicatorEmoji}>🌱</Text>
        </View>
      )}
      {isVegetarian && !isVegan && (
        <View style={[styles.indicator, styles.vegetarianIndicator]}>
          <Leaf size={12} color="#16A34A" />
        </View>
      )}
      {allergenCount > 0 && (
        <View style={[styles.indicator, styles.allergenIndicator]}>
          <AlertTriangle size={10} color="#DC2626" />
          <Text style={styles.allergenCountText}>{allergenCount}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Modal/Tooltip pour détails des allergènes
 */
interface AllergenDetailsProps {
  allergens: AllergenType[];
  visible: boolean;
  onClose: () => void;
}

export const AllergenDetails: React.FC<AllergenDetailsProps> = ({
  allergens,
  visible,
  onClose,
}) => {
  if (!visible || allergens.length === 0) {
    return null;
  }

  return (
    <View style={styles.detailsOverlay}>
      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <AlertTriangle size={20} color="#DC2626" />
          <Text style={styles.detailsTitle}>Allergènes présents</Text>
        </View>
        <View style={styles.detailsList}>
          {allergens.map((allergen) => {
            const config = ALLERGEN_CONFIG[allergen];
            if (!config) return null;

            return (
              <View key={allergen} style={styles.detailItem}>
                <Text style={styles.detailEmoji}>{config.emoji}</Text>
                <Text style={styles.detailLabel}>{config.label}</Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  dietaryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    gap: 4,
  },
  veganBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  vegetarianBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  badgeEmoji: {
    textAlign: 'center',
  },
  badgeLabel: {
    fontWeight: '600',
    color: '#16A34A',
  },
  allergensContainer: {
    gap: 4,
  },
  allergenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  allergenTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  allergenScroll: {
    flexGrow: 0,
  },
  allergenRow: {
    flexDirection: 'row',
    gap: 6,
  },
  allergenBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 6,
  },
  allergenEmoji: {
    textAlign: 'center',
  },
  allergenLabel: {
    color: '#991B1B',
    fontWeight: '500',
    marginTop: 2,
  },
  // Indicateurs compacts
  indicatorsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  veganIndicator: {
    backgroundColor: '#DCFCE7',
  },
  vegetarianIndicator: {
    backgroundColor: '#F0FDF4',
  },
  allergenIndicator: {
    backgroundColor: '#FEF2F2',
    gap: 2,
    width: 'auto',
    paddingHorizontal: 6,
  },
  indicatorEmoji: {
    fontSize: 12,
  },
  allergenCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Détails modal
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  detailsList: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailEmoji: {
    fontSize: 24,
  },
  detailLabel: {
    fontSize: 16,
    color: '#374151',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DietaryBadges;
