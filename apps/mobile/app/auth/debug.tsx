/**
 * Écran de debug pour tester l'authentification Keycloak
 * Accès : /auth/debug dans l'app
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip } from 'react-native-paper';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import { ENV } from '../../src/config/env';
import authService from '../../src/services/authService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AuthDebugScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(`[AuthDebug] ${message}`);
  };

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    addLog('=== Configuration ===');
    addLog(`AUTH_ENABLED: ${ENV.AUTH_ENABLED}`);
    addLog(`MOCK_AUTH: ${ENV.MOCK_AUTH}`);
    addLog(`KEYCLOAK_URL: ${ENV.KEYCLOAK_URL}`);
    addLog(`CLIENT_ID: ${ENV.KEYCLOAK_CLIENT_ID}`);
    addLog(`APP_SCHEME: ${ENV.APP_SCHEME}`);

    // Générer le redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: ENV.APP_SCHEME,
      path: 'auth/callback',
    });
    addLog(`REDIRECT_URI: ${redirectUri}`);

    // Vérifier les tokens stockés
    const accessToken = await SecureStore.getItemAsync('oneeats_access_token');
    const refreshToken = await SecureStore.getItemAsync('oneeats_refresh_token');
    addLog(`ACCESS_TOKEN: ${accessToken ? 'Present (' + accessToken.substring(0, 20) + '...)' : 'None'}`);
    addLog(`REFRESH_TOKEN: ${refreshToken ? 'Present' : 'None'}`);

    // État auth context
    addLog(`isAuthenticated: ${isAuthenticated}`);
    addLog(`user: ${user ? user.email : 'null'}`);
  };

  const testKeycloakConnection = async () => {
    addLog('=== Test Keycloak Connection ===');
    try {
      const url = `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/.well-known/openid-configuration`;
      addLog(`Fetching: ${url}`);

      const response = await fetch(url);
      addLog(`Status: ${response.status}`);

      if (response.ok) {
        const config = await response.json();
        addLog(`✅ Keycloak accessible`);
        addLog(`Issuer: ${config.issuer}`);
        addLog(`Auth endpoint: ${config.authorization_endpoint}`);
      } else {
        addLog(`❌ Keycloak error: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Connection error: ${error}`);
    }
  };

  const testLogin = async () => {
    addLog('=== Test Login Flow ===');
    setIsLoading(true);

    try {
      addLog('Calling authService.login()...');
      const tokens = await authService.login();

      if (tokens) {
        addLog(`✅ Login SUCCESS`);
        addLog(`Access token: ${tokens.access_token.substring(0, 30)}...`);
        addLog(`Expires in: ${tokens.expires_in}s`);

        // Récupérer les infos utilisateur
        const userInfo = await authService.getUserInfo();
        if (userInfo) {
          addLog(`User: ${userInfo.email}`);
          addLog(`Name: ${userInfo.name}`);
          addLog(`Roles: ${userInfo.realm_access?.roles?.join(', ')}`);
        }
      } else {
        addLog(`❌ Login returned null (cancelled or failed)`);
      }
    } catch (error) {
      addLog(`❌ Login error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    addLog('=== Test Logout ===');
    try {
      await authService.logout();
      addLog('✅ Logout successful');
      await checkConfig(); // Refresh status
    } catch (error) {
      addLog(`❌ Logout error: ${error}`);
    }
  };

  const clearTokens = async () => {
    addLog('=== Clearing tokens ===');
    try {
      await SecureStore.deleteItemAsync('oneeats_access_token');
      await SecureStore.deleteItemAsync('oneeats_refresh_token');
      await SecureStore.deleteItemAsync('oneeats_token_expiry');
      await SecureStore.deleteItemAsync('oneeats_user_info');
      addLog('✅ Tokens cleared');
      await checkConfig();
    } catch (error) {
      addLog(`❌ Clear error: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Auth Debug</Text>

        {/* Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chips}>
              <Chip
                icon={isAuthenticated ? 'check' : 'close'}
                style={{ backgroundColor: isAuthenticated ? '#C8E6C9' : '#FFCDD2' }}
              >
                {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
              </Chip>
              <Chip icon="account">
                {user?.email || 'No user'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.buttons}>
              <Button
                mode="contained"
                onPress={testKeycloakConnection}
                style={styles.button}
              >
                Test Keycloak
              </Button>
              <Button
                mode="contained"
                onPress={testLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              >
                Test Login
              </Button>
              <Button
                mode="outlined"
                onPress={testLogout}
                style={styles.button}
              >
                Test Logout
              </Button>
              <Button
                mode="outlined"
                onPress={clearTokens}
                style={styles.button}
              >
                Clear Tokens
              </Button>
              <Button
                mode="text"
                onPress={checkConfig}
                style={styles.button}
              >
                Refresh Status
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Logs */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logHeader}>
              <Text style={styles.sectionTitle}>Logs</Text>
              <Button compact onPress={() => setLogs([])}>Clear</Button>
            </View>
            <View style={styles.logs}>
              {logs.map((log, index) => (
                <Text
                  key={index}
                  style={[
                    styles.logLine,
                    log.includes('✅') && styles.logSuccess,
                    log.includes('❌') && styles.logError,
                  ]}
                >
                  {log}
                </Text>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Navigation */}
        <Button
          mode="text"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          ← Back
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttons: {
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logs: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#E0E0E0',
    marginBottom: 4,
  },
  logSuccess: {
    color: '#81C784',
  },
  logError: {
    color: '#E57373',
  },
});
