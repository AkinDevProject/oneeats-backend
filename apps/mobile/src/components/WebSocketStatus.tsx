import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocketContext } from '../contexts/WebSocketContext';

export const WebSocketStatus: React.FC = () => {
  const {
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    reconnect
  } = useWebSocketContext();

  const getStatusColor = () => {
    if (isConnected) return '#10B981'; // Vert
    if (isReconnecting) return '#F59E0B'; // Jaune
    if (connectionError) return '#EF4444'; // Rouge
    return '#6B7280'; // Gris
  };

  const getStatusText = () => {
    if (isConnected) return '🟢 Connecté';
    if (isReconnecting) return `🟡 Reconnexion... (${reconnectAttempts}/10)`;
    if (connectionError) return '🔴 Déconnecté';
    return '⚪ En attente';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {(connectionError || !isConnected) && !isReconnecting && (
        <TouchableOpacity style={styles.reconnectButton} onPress={reconnect}>
          <Text style={styles.reconnectButtonText}>🔄 Reconnecter</Text>
        </TouchableOpacity>
      )}

      {connectionError && (
        <Text style={styles.errorText}>{connectionError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  reconnectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  reconnectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 4,
    fontStyle: 'italic',
  },
});