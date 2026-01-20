import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Home } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable', headerShown: false }} />
      <LinearGradient
        colors={['#E53E3E', '#C53030']}
        style={styles.container}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <Animated.Text entering={SlideInUp.delay(200)} style={styles.emoji}>
            🍕
          </Animated.Text>
          <Animated.Text entering={SlideInUp.delay(400)} style={styles.title}>
            Page introuvable
          </Animated.Text>
          <Animated.Text entering={SlideInUp.delay(600)} style={styles.subtitle}>
            Cette page n&apos;existe pas ou a été déplacée
          </Animated.Text>
          
          <Animated.View entering={SlideInUp.delay(800)} style={styles.buttonContainer}>
            <Link href="/" asChild>
              <Button 
                mode="contained" 
                style={styles.homeButton}
                labelStyle={styles.homeButtonText}
                icon={() => <Home size={20} color="#E53E3E" />}
                buttonColor="white"
              >
                Retour à l&apos;accueil
              </Button>
            </Link>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  homeButton: {
    borderRadius: 25,
    paddingVertical: 8,
  },
  homeButtonText: {
    color: '#E53E3E',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
