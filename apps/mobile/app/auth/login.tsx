import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Surface,
  Button,
  TextInput,
  Card,
  Avatar,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';

// Schémas de validation
const loginSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Min 6 caractères').required('Mot de passe requis'),
});

const registerSchema = yup.object().shape({
  name: yup.string().min(2, 'Min 2 caractères').required('Nom requis'),
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Min 6 caractères').required('Mot de passe requis'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Mots de passe différents')
    .required('Confirmation requise'),
});

const guestSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
});

type AuthMode = 'login' | 'register' | 'guest';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginGuest } = useAuth();
  const { currentTheme } = useAppTheme();

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        router.replace('/(tabs)/');
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const success = await register(values.name, values.email, values.password);
      if (success) {
        router.replace('/(tabs)/');
      } else {
        Alert.alert('Erreur', 'Impossible de créer le compte');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const success = await loginGuest(values.email);
      if (success) {
        router.replace('/(tabs)/');
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter en invité');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Avatar.Icon 
        size={80} 
        icon="silverware-fork-knife" 
        style={[styles.logo, { backgroundColor: currentTheme.colors.primary }]}
      />
      <Text style={[styles.appName, { color: currentTheme.colors.onSurface }]}>
        OneEats
      </Text>
      <Text style={[styles.tagline, { color: currentTheme.colors.onSurfaceVariant }]}>
        Votre nourriture préférée, à emporter
      </Text>
    </View>
  );

  const renderModeSelector = () => (
    <Surface style={[styles.modeSelector, { backgroundColor: currentTheme.colors.surfaceVariant }]} elevation={1}>
      <View style={styles.modeTabs}>
        {[
          { key: 'login' as AuthMode, title: 'Connexion' },
          { key: 'register' as AuthMode, title: 'Inscription' },
          { key: 'guest' as AuthMode, title: 'Invité' },
        ].map(({ key, title }) => (
          <Button
            key={key}
            mode={mode === key ? 'contained' : 'text'}
            onPress={() => handleModeChange(key)}
            style={styles.modeTab}
            buttonColor={mode === key ? currentTheme.colors.primary : 'transparent'}
            textColor={mode === key ? currentTheme.colors.onPrimary : currentTheme.colors.onSurfaceVariant}
          >
            {title}
          </Button>
        ))}
      </View>
    </Surface>
  );

  const renderLoginForm = () => (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <Card style={[styles.formCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content style={styles.formContent}>
            <TextInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={touched.email && !!errors.email}
            />
            {touched.email && errors.email && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label="Mot de passe"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={touched.password && !!errors.password}
            />
            {touched.password && errors.password && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.password}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit as any}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              buttonColor={currentTheme.colors.primary}
            >
              Se connecter
            </Button>
          </Card.Content>
        </Card>
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
        <Card style={[styles.formCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content style={styles.formContent}>
            <TextInput
              label="Nom complet"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              mode="outlined"
              style={styles.input}
              error={touched.name && !!errors.name}
            />
            {touched.name && errors.name && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.name}
              </Text>
            )}

            <TextInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={touched.email && !!errors.email}
            />
            {touched.email && errors.email && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label="Mot de passe"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={touched.password && !!errors.password}
            />
            {touched.password && errors.password && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.password}
              </Text>
            )}

            <TextInput
              label="Confirmer mot de passe"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={touched.confirmPassword && !!errors.confirmPassword}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit as any}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              buttonColor={currentTheme.colors.primary}
            >
              Créer mon compte
            </Button>
          </Card.Content>
        </Card>
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
        <Card style={[styles.formCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Card.Content style={styles.formContent}>
            <Text style={[styles.guestInfo, { color: currentTheme.colors.onSurfaceVariant }]}>
              Commandez rapidement sans créer de compte
            </Text>

            <TextInput
              label="Email (pour notifications)"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={touched.email && !!errors.email}
            />
            {touched.email && errors.email && (
              <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                {errors.email}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit as any}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              buttonColor={currentTheme.colors.secondary}
            >
              Continuer en invité
            </Button>
          </Card.Content>
        </Card>
      )}
    </Formik>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderModeSelector()}
          
          <View style={styles.formContainer}>
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegisterForm()}
            {mode === 'guest' && renderGuestForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  modeSelector: {
    borderRadius: 16,
    marginBottom: 24,
    padding: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  modeTab: {
    flex: 1,
    borderRadius: 12,
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formContent: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  guestInfo: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  },
});