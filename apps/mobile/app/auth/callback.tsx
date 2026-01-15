/**
 * Callback handler pour OAuth
 * Cette page reçoit le code d'autorisation après login Keycloak
 */
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Permet de fermer le navigateur après le callback
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    // Log les paramètres reçus pour debug
    console.log('[AuthCallback] Params received:', params);

    // Si on a un code, le flow continue automatiquement via expo-auth-session
    // Cette page sert juste de point d'entrée pour le redirect

    // Rediriger vers la page précédente ou home après un court délai
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200EE" />
      <Text style={styles.text}>Connexion en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
