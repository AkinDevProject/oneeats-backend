import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  TextInput,
  Divider,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Mot de passe trop court')
    .required('Mot de passe requis'),
});

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Nom trop court')
    .required('Nom requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Mot de passe trop court')
    .required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation requise'),
});

const guestSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
});

const AuthScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, register, loginGuest } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleModeChange = (newMode: 'login' | 'register' | 'guest') => {
    if (newMode === authMode) return;

    translateX.value = withTiming(newMode === 'register' ? -width : newMode === 'guest' ? width : 0, {
      duration: 300,
    });
    
    opacity.value = withTiming(0, { duration: 150 }, () => {
      setAuthMode(newMode);
      opacity.value = withTiming(1, { duration: 150 });
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        showSnackbar('Email ou mot de passe incorrect');
      }
    } catch (error) {
      showSnackbar('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const success = await register(values.name, values.email, values.password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        showSnackbar('Erreur lors de l\'inscription');
      }
    } catch (error) {
      showSnackbar('Erreur de création de compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const success = await loginGuest(values.email);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        showSnackbar('Erreur de connexion invité');
      }
    } catch (error) {
      showSnackbar('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email && !!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <Mail size={20} color="#666" />} />}
            style={styles.input}
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Mot de passe"
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            error={touched.password && !!errors.password}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon={() => <Lock size={20} color="#666" />} />}
            right={
              <TextInput.Icon
                icon={() => showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            Se connecter
          </Button>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );

  const renderRegisterForm = () => (
    <Formik
      initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
      validationSchema={registerSchema}
      onSubmit={handleRegister}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Nom complet"
            value={values.name}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            error={touched.name && !!errors.name}
            left={<TextInput.Icon icon={() => <User size={20} color="#666" />} />}
            style={styles.input}
          />
          {touched.name && errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Email"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email && !!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <Mail size={20} color="#666" />} />}
            style={styles.input}
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Mot de passe"
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            error={touched.password && !!errors.password}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon={() => <Lock size={20} color="#666" />} />}
            right={
              <TextInput.Icon
                icon={() => showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Confirmer le mot de passe"
            value={values.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            error={touched.confirmPassword && !!errors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            left={<TextInput.Icon icon={() => <Lock size={20} color="#666" />} />}
            right={
              <TextInput.Icon
                icon={() => showConfirmPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            Créer un compte
          </Button>
        </View>
      )}
    </Formik>
  );

  const renderGuestForm = () => (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={guestSchema}
      onSubmit={handleGuestLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.form}>
          <Text style={styles.guestDescription}>
            Continuez en tant qu'invité avec juste votre email. Vous pourrez créer un compte plus tard.
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email && !!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <Mail size={20} color="#666" />} />}
            style={styles.input}
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            Continuer en tant qu'invité
          </Button>
        </View>
      )}
    </Formik>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#E53E3E', '#C53030']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DelishGo</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, authMode === 'login' && styles.activeTab]}
              onPress={() => handleModeChange('login')}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.activeTabText]}>
                Connexion
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, authMode === 'register' && styles.activeTab]}
              onPress={() => handleModeChange('register')}
            >
              <Text style={[styles.tabText, authMode === 'register' && styles.activeTabText]}>
                Inscription
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, authMode === 'guest' && styles.activeTab]}
              onPress={() => handleModeChange('guest')}
            >
              <Text style={[styles.tabText, authMode === 'guest' && styles.activeTabText]}>
                Invité
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={animatedStyle}>
            {authMode === 'login' && renderLoginForm()}
            {authMode === 'register' && renderRegisterForm()}
            {authMode === 'guest' && renderGuestForm()}
          </Animated.View>

          <Divider style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En continuant, vous acceptez nos conditions d'utilisation
            </Text>
          </View>
        </Surface>
      </ScrollView>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#E53E3E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#E53E3E',
    fontSize: 14,
  },
  guestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: '#E53E3E',
  },
});

export default AuthScreen;