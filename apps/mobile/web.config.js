// Configuration spécifique pour React Native Web
const webConfig = {
  // Désactiver les warnings de développement
  resolver: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  // Ajouter des polyfills si nécessaire
  web: {
    build: {
      root: 'web-build'
    }
  }
};

module.exports = webConfig;