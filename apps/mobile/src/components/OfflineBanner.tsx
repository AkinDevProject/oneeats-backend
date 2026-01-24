import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react-native';
import { useNetwork } from '../contexts/NetworkContext';

interface OfflineBannerProps {
  /** Position de la bannière */
  position?: 'top' | 'bottom';
  /** Afficher même si en ligne (pour montrer statut) */
  showOnline?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  position = 'top',
  showOnline = false,
}) => {
  const { isOnline, isChecking, checkNetwork } = useNetwork();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation d'entrée/sortie
  useEffect(() => {
    const shouldShow = !isOnline || showOnline;
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, showOnline, slideAnim]);

  // Animation de pulsation lors du chargement
  useEffect(() => {
    if (isChecking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isChecking, pulseAnim]);

  // Ne pas afficher si en ligne et showOnline est false
  if (isOnline && !showOnline) {
    return null;
  }

  const backgroundColor = isOnline ? '#10B981' : '#EF4444';
  const icon = isOnline ? (
    <Cloud size={18} color="#fff" />
  ) : (
    <CloudOff size={18} color="#fff" />
  );

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'bottom' ? styles.bottom : styles.top,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={styles.text}>
          {isOnline ? 'En ligne' : 'Mode hors connexion'}
        </Text>
        {!isOnline && (
          <Text style={styles.subtext}>
            Données en cache utilisées
          </Text>
        )}
      </View>

      {!isOnline && (
        <TouchableOpacity
          onPress={checkNetwork}
          style={styles.retryButton}
          disabled={isChecking}
        >
          <RefreshCw
            size={16}
            color="#fff"
            style={isChecking ? styles.spinning : undefined}
          />
          <Text style={styles.retryText}>
            {isChecking ? 'Vérification...' : 'Réessayer'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Composant compact pour affichage dans un header
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline, isChecking, checkNetwork } = useNetwork();

  if (isOnline) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={checkNetwork}
      style={styles.indicator}
      disabled={isChecking}
    >
      <WifiOff size={16} color="#EF4444" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        paddingTop: 50, // Pour le safe area
      },
      android: {
        paddingTop: 10,
      },
    }),
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  spinning: {
    // Animation de rotation gérée via Animated si nécessaire
  },
  indicator: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    marginHorizontal: 8,
  },
});

export default OfflineBanner;
