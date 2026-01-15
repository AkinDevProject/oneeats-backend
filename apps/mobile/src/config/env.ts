import { Platform } from 'react-native';

const getApiUrl = () => {
  if (__DEV__) {
    // Pour appareil physique, utilisez l'IP de votre machine
    // IP trouvée: 192.168.1.36
    return 'http://192.168.1.36:8080/api';

    // Configuration alternative selon la plateforme :
    // if (Platform.OS === 'android') {
    //   // Android émulateur : return 'http://10.0.2.2:8080/api';
    //   // Appareil physique : return 'http://192.168.1.36:8080/api';
    // } else if (Platform.OS === 'ios') {
    //   // iOS simulateur : return 'http://localhost:8080/api';
    //   // Appareil physique : return 'http://192.168.1.36:8080/api';
    // }
  }
  return 'https://your-production-api.com/api';
};

const getKeycloakUrl = () => {
  if (__DEV__) {
    // Meme logique que l'API - utiliser l'IP reseau pour appareil physique
    return 'http://192.168.1.36:8180';
  }
  return 'https://auth.your-production.com';
};

export const ENV = {
  // Configuration de l'API
  API_URL: getApiUrl(),
  API_HOST: __DEV__ ? '192.168.1.36' : 'your-production-api.com',
  API_PORT: __DEV__ ? 8080 : 443,

  API_TIMEOUT: 10000,

  // Configuration de l'authentification
  AUTH_ENABLED: false,  // Mettre a true pour activer Keycloak
  MOCK_AUTH: true,      // Mettre a false pour utiliser Keycloak

  // Configuration Keycloak OIDC
  KEYCLOAK_URL: getKeycloakUrl(),
  KEYCLOAK_REALM: 'oneeats',
  KEYCLOAK_CLIENT_ID: 'oneeats-mobile',

  // Scheme pour deep linking OAuth callback (doit correspondre a app.json)
  APP_SCHEME: 'oneeats',

  // User ID fixe pour les tests sans auth (UUID valide)
  MOCK_USER_ID: '12345678-1234-1234-1234-123456789012',

  // User ID de développement avec vraies données API
  DEV_USER_ID: '4ffe5398-4599-4c33-98ec-18a96fd9e200',

  // Configuration des notifications push
  NOTIFICATIONS_ENABLED: __DEV__ ? false : true,

  // Configuration de l'analytics
  ANALYTICS_ENABLED: false,

  // Mode debug
  DEBUG_MODE: __DEV__,
};