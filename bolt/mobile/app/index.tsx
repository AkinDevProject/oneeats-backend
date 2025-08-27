import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige automatiquement vers la page principale des restaurants
  return <Redirect href="/(tabs)/restaurants" />;
}

