import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TextInput, TouchableRipple, ActivityIndicator, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';

// Validation helpers
const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'L\'email est requis';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Le mot de passe est requis';
  }
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  return null;
};

const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Veuillez confirmer votre mot de passe';
  }
  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Le nom est requis';
  }
  if (name.trim().length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }
  return null;
};

interface FormErrors {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  terms?: string | null;
  general?: string | null;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { register } = useAuth();
  const { currentTheme } = useAppTheme();

  // Validate single field
  const validateField = useCallback((field: string, value: string | boolean): string | null => {
    switch (field) {
      case 'name':
        return validateName(value as string);
      case 'email':
        return validateEmail(value as string);
      case 'password':
        return validatePassword(value as string);
      case 'confirmPassword':
        return validateConfirmPassword(password, value as string);
      case 'terms':
        return value ? null : 'Vous devez accepter les conditions d\'utilisation';
      default:
        return null;
    }
  }, [password]);

  // Handle field blur - mark as touched and validate
  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let value: string | boolean;
    switch (field) {
      case 'name': value = name; break;
      case 'email': value = email; break;
      case 'password': value = password; break;
      case 'confirmPassword': value = confirmPassword; break;
      case 'terms': value = termsAccepted; break;
      default: return;
    }

    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [name, email, password, confirmPassword, termsAccepted, validateField]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      terms: termsAccepted ? null : 'Vous devez accepter les conditions d\'utilisation',
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true, terms: true });

    return !Object.values(newErrors).some(error => error !== null);
  }, [name, email, password, confirmPassword, termsAccepted]);

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate all fields
    if (!validateAll()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: null }));

    try {
      const success = await register(name.trim(), email.trim().toLowerCase(), password);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors(prev => ({
          ...prev,
          general: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
        }));
      }
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('email_exists') || error.message.includes('409')) {
          setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: 'Une erreur est survenue. Veuillez réessayer.'
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Une erreur est survenue. Veuillez réessayer.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getInputStyle = (field: string) => {
    const hasError = touched[field] && errors[field];
    return {
      backgroundColor: currentTheme.colors.surfaceVariant,
      borderColor: hasError ? currentTheme.colors.error : 'transparent',
      borderWidth: hasError ? 1 : 0,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: currentTheme.colors.primaryContainer }]}>
              <Text style={styles.logoEmoji}>📝</Text>
            </View>
            <Text style={[styles.title, { color: currentTheme.colors.onSurface }]}>
              Créer un compte
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
              Rejoignez OneEats et commandez vos plats préférés
            </Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.form}>
            {/* General Error */}
            {errors.general && (
              <Animated.View entering={FadeInDown.duration(300)} style={[styles.errorBanner, { backgroundColor: currentTheme.colors.errorContainer }]}>
                <Text style={[styles.errorBannerText, { color: currentTheme.colors.onErrorContainer }]}>
                  {errors.general}
                </Text>
              </Animated.View>
            )}

            {/* Name Input */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <TextInput
                label="Nom complet"
                value={name}
                onChangeText={setName}
                onBlur={() => handleBlur('name')}
                mode="outlined"
                style={[styles.input, getInputStyle('name')]}
                outlineColor="transparent"
                activeOutlineColor={currentTheme.colors.primary}
                textColor={currentTheme.colors.onSurface}
                left={<TextInput.Icon icon="account" />}
                error={touched.name && !!errors.name}
                disabled={isLoading}
                autoCapitalize="words"
                testID="register-name-input"
              />
              {touched.name && errors.name && (
                <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                  {errors.name}
                </Text>
              )}
            </Animated.View>

            {/* Email Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => handleBlur('email')}
                mode="outlined"
                style={[styles.input, getInputStyle('email')]}
                outlineColor="transparent"
                activeOutlineColor={currentTheme.colors.primary}
                textColor={currentTheme.colors.onSurface}
                left={<TextInput.Icon icon="email" />}
                error={touched.email && !!errors.email}
                disabled={isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="register-email-input"
              />
              {touched.email && errors.email && (
                <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </Animated.View>

            {/* Password Input */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  // Re-validate confirmPassword if already touched
                  if (touched.confirmPassword) {
                    const error = validateConfirmPassword(text, confirmPassword);
                    setErrors(prev => ({ ...prev, confirmPassword: error }));
                  }
                }}
                onBlur={() => handleBlur('password')}
                mode="outlined"
                style={[styles.input, getInputStyle('password')]}
                outlineColor="transparent"
                activeOutlineColor={currentTheme.colors.primary}
                textColor={currentTheme.colors.onSurface}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                error={touched.password && !!errors.password}
                disabled={isLoading}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="register-password-input"
              />
              {touched.password && errors.password && (
                <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                  {errors.password}
                </Text>
              )}
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <TextInput
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                mode="outlined"
                style={[styles.input, getInputStyle('confirmPassword')]}
                outlineColor="transparent"
                activeOutlineColor={currentTheme.colors.primary}
                textColor={currentTheme.colors.onSurface}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                error={touched.confirmPassword && !!errors.confirmPassword}
                disabled={isLoading}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                testID="register-confirm-password-input"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              )}
            </Animated.View>

            {/* Terms Checkbox */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                  setTouched(prev => ({ ...prev, terms: true }));
                  if (!termsAccepted) {
                    setErrors(prev => ({ ...prev, terms: null }));
                  }
                }}
                disabled={isLoading}
                activeOpacity={0.7}
                testID="register-terms-checkbox"
              >
                <Checkbox
                  status={termsAccepted ? 'checked' : 'unchecked'}
                  color={currentTheme.colors.primary}
                  disabled={isLoading}
                />
                <Text style={[styles.termsText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  J'accepte les{' '}
                  <Text
                    style={[styles.termsLink, { color: currentTheme.colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // TODO: Navigate to terms page
                    }}
                  >
                    conditions d'utilisation
                  </Text>
                  {' '}et la{' '}
                  <Text
                    style={[styles.termsLink, { color: currentTheme.colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // TODO: Navigate to privacy page
                    }}
                  >
                    politique de confidentialité
                  </Text>
                </Text>
              </TouchableOpacity>
              {touched.terms && errors.terms && (
                <Text style={[styles.errorText, styles.termsError, { color: currentTheme.colors.error }]}>
                  {errors.terms}
                </Text>
              )}
            </Animated.View>

            {/* Register Button */}
            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <TouchableRipple
                onPress={handleRegister}
                disabled={isLoading}
                borderless
                style={[
                  styles.registerButton,
                  { backgroundColor: currentTheme.colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                testID="register-submit-button"
              >
                <View style={styles.registerButtonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={currentTheme.colors.onPrimary} />
                  ) : (
                    <>
                      <Text style={styles.registerButtonEmoji}>🚀</Text>
                      <Text style={[styles.registerButtonText, { color: currentTheme.colors.onPrimary }]}>
                        Créer mon compte
                      </Text>
                    </>
                  )}
                </View>
              </TouchableRipple>
            </Animated.View>
          </View>

          {/* Footer - Back to Login */}
          <Animated.View entering={FadeIn.delay(700).duration(400)} style={styles.footer}>
            <Text style={[styles.footerText, { color: currentTheme.colors.onSurfaceVariant }]}>
              Vous avez déjà un compte ?
            </Text>
            <TouchableOpacity
              onPress={handleGoToLogin}
              disabled={isLoading}
              style={styles.loginLink}
              testID="register-login-link"
            >
              <Text style={[styles.loginLinkText, { color: currentTheme.colors.primary }]}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Form
  form: {
    flex: 1,
    gap: 4,
  },
  input: {
    marginBottom: 4,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  termsLink: {
    fontWeight: '600',
  },
  termsError: {
    marginLeft: 40,
    marginTop: 0,
  },
  // Register Button
  registerButton: {
    borderRadius: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    minHeight: 60,
  },
  registerButtonEmoji: {
    fontSize: 24,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 15,
  },
  loginLink: {
    paddingVertical: 4,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
