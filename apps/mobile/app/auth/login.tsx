import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../../src/contexts/AuthContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { ENV } from '../../src/config/env';

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, loginWithSSO } = useAuth();
  const { currentTheme } = useAppTheme();

  // Validation email
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('Email requis');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Format email invalide');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validation password
  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Mot de passe requis');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Login avec email/password
  const handleCredentialLogin = async () => {
    setLoginError('');
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsLoading(true);
    setLoadingProvider('credentials');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await login(email.trim().toLowerCase(), password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        setLoginError('Connexion échouée. Veuillez réessayer.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (error instanceof Error) {
        if (error.message === 'invalid_credentials') {
          setLoginError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Network')) {
          setLoginError('Erreur réseau. Vérifiez votre connexion.');
        } else {
          setLoginError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        setLoginError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Login avec SSO
  const handleLogin = async (provider?: string) => {
    setIsLoading(true);
    setLoadingProvider(provider || 'main');
    setLoginError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await loginWithSSO(provider);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Forgot password - ouvre Keycloak dans le navigateur
  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const resetUrl = `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/login-actions/reset-credentials?client_id=${ENV.KEYCLOAK_CLIENT_ID}`;
    Alert.alert(
      'Mot de passe oublié',
      'Vous allez être redirigé vers la page de récupération de mot de passe.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => {
            // Ouvrir dans le navigateur externe
            import('expo-web-browser').then(WebBrowser => {
              WebBrowser.openBrowserAsync(resetUrl);
            });
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  // Bouton de connexion principal
  const MainButton = ({
    emoji,
    label,
    onPress,
    bgColor,
    textColor = '#FFF',
    delay = 0,
    provider,
  }: {
    emoji: string;
    label: string;
    onPress: () => void;
    bgColor: string;
    textColor?: string;
    delay?: number;
    provider?: string;
  }) => {
    const isButtonLoading = isLoading && loadingProvider === (provider || 'main');

    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <TouchableRipple
          onPress={onPress}
          disabled={isLoading}
          borderless
          style={[
            styles.mainButton,
            { backgroundColor: bgColor },
            isLoading && loadingProvider !== (provider || 'main') && styles.buttonDisabled,
          ]}
        >
          <View style={styles.mainButtonContent}>
            {isButtonLoading ? (
              <ActivityIndicator size="small" color={textColor} />
            ) : (
              <>
                <Text style={styles.buttonEmoji}>{emoji}</Text>
                <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
              </>
            )}
          </View>
        </TouchableRipple>
      </Animated.View>
    );
  };

  // Bouton social (plus petit)
  const SocialButton = ({
    emoji,
    label,
    onPress,
    bgColor,
    textColor = '#000',
    delay = 0,
    provider,
  }: {
    emoji: string;
    label: string;
    onPress: () => void;
    bgColor: string;
    textColor?: string;
    delay?: number;
    provider: string;
  }) => {
    const isButtonLoading = isLoading && loadingProvider === provider;

    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.socialButtonWrapper}>
        <TouchableRipple
          onPress={onPress}
          disabled={isLoading}
          borderless
          style={[
            styles.socialButton,
            { backgroundColor: bgColor },
            isLoading && loadingProvider !== provider && styles.buttonDisabled,
          ]}
        >
          <View style={styles.socialButtonContent}>
            {isButtonLoading ? (
              <ActivityIndicator size="small" color={textColor} />
            ) : (
              <>
                <Text style={styles.socialEmoji}>{emoji}</Text>
                <Text style={[styles.socialText, { color: textColor }]}>{label}</Text>
              </>
            )}
          </View>
        </TouchableRipple>
      </Animated.View>
    );
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header avec Logo */}
            <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: currentTheme.colors.primaryContainer }]}>
                <Text style={styles.logoEmoji}>🍔</Text>
              </View>
              <Text style={[styles.appName, { color: currentTheme.colors.onSurface }]}>
                OneEats
              </Text>
              <Text style={[styles.tagline, { color: currentTheme.colors.onSurfaceVariant }]}>
                Commandez, récupérez, savourez
              </Text>
            </Animated.View>

            {/* Section principale */}
            <View style={styles.buttonsSection}>
              {/* Titre */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Text style={[styles.title, { color: currentTheme.colors.onSurface }]}>
                  Bienvenue !
                </Text>
                <Text style={[styles.subtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Connectez-vous pour commander vos plats préférés
                </Text>
              </Animated.View>

              {/* Formulaire Email/Password */}
              <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.colors.surfaceVariant,
                        color: currentTheme.colors.onSurface,
                        borderColor: emailError ? currentTheme.colors.error : currentTheme.colors.outline,
                      },
                    ]}
                    placeholder="votre@email.com"
                    placeholderTextColor={currentTheme.colors.onSurfaceVariant}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                      setLoginError('');
                    }}
                    onBlur={() => validateEmail(email)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    testID="login-email-input"
                  />
                  {emailError ? (
                    <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                      {emailError}
                    </Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: currentTheme.colors.onSurfaceVariant }]}>
                    Mot de passe
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: currentTheme.colors.surfaceVariant,
                          color: currentTheme.colors.onSurface,
                          borderColor: passwordError ? currentTheme.colors.error : currentTheme.colors.outline,
                        },
                      ]}
                      placeholder="••••••••"
                      placeholderTextColor={currentTheme.colors.onSurfaceVariant}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) validatePassword(text);
                        setLoginError('');
                      }}
                      onBlur={() => validatePassword(password)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      testID="login-password-input"
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                      {passwordError}
                    </Text>
                  ) : null}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordButton}
                  disabled={isLoading}
                >
                  <Text style={[styles.forgotPasswordText, { color: currentTheme.colors.primary }]}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>

                {/* Login Error Message */}
                {loginError ? (
                  <Animated.View entering={FadeIn.duration(300)} style={styles.loginErrorContainer}>
                    <Text style={[styles.loginErrorText, { color: currentTheme.colors.error }]}>
                      ⚠️ {loginError}
                    </Text>
                  </Animated.View>
                ) : null}

                {/* Login Button */}
                <MainButton
                  emoji="🔐"
                  label="Se connecter"
                  onPress={handleCredentialLogin}
                  bgColor={currentTheme.colors.primary}
                  textColor={currentTheme.colors.onPrimary}
                  delay={0}
                  provider="credentials"
                />
              </Animated.View>

              {/* Divider */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.dividerContainer}
              >
                <View style={[styles.dividerLine, { backgroundColor: currentTheme.colors.outlineVariant }]} />
                <Text style={[styles.dividerText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  ou continuer avec
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: currentTheme.colors.outlineVariant }]} />
              </Animated.View>

              {/* Boutons Social Login */}
              <View style={styles.socialRow}>
                <SocialButton
                  emoji="G"
                  label="Google"
                  onPress={() => handleLogin('google')}
                  bgColor="#FFFFFF"
                  textColor="#000000"
                  delay={400}
                  provider="google"
                />
                <SocialButton
                  emoji="🍎"
                  label="Apple"
                  onPress={() => handleLogin('apple')}
                  bgColor="#000000"
                  textColor="#FFFFFF"
                  delay={500}
                  provider="apple"
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              {/* Create Account Button */}
              <Animated.View entering={FadeIn.delay(600).duration(400)}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/auth/register');
                  }}
                  style={styles.createAccountButton}
                  disabled={isLoading}
                  testID="login-create-account-button"
                >
                  <Text style={[styles.createAccountText, { color: currentTheme.colors.primary }]}>
                    Créer un compte
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Skip - Continuer sans compte */}
              <Animated.View entering={FadeIn.delay(650).duration(400)}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton} disabled={isLoading}>
                  <Text style={[styles.skipText, { color: currentTheme.colors.onSurfaceVariant }]}>
                    Continuer sans compte
                  </Text>
                  <Text style={[styles.skipArrow, { color: currentTheme.colors.primary }]}>→</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Info */}
              <Animated.View entering={FadeIn.delay(700).duration(400)}>
                <Text style={[styles.infoText, { color: currentTheme.colors.onSurfaceVariant }]}>
                  Vous pourrez vous connecter plus tard pour passer commande
                </Text>
              </Animated.View>

              {/* Mode dev indicator */}
              {ENV.MOCK_AUTH && (
                <Animated.View entering={FadeIn.delay(800)} style={styles.devModeIndicator}>
                  <Text style={styles.devModeText}>
                    🛠️ Mode développement
                  </Text>
                </Animated.View>
              )}

              {/* Debug link - visible in dev */}
              {__DEV__ && (
                <Animated.View entering={FadeIn.delay(900)}>
                  <TouchableOpacity
                    onPress={() => router.push('/auth/debug')}
                    style={styles.debugLink}
                  >
                    <Text style={[styles.debugLinkText, { color: currentTheme.colors.outline }]}>
                      🔧 Debug Auth
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  // Header
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 55,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Buttons Section
  buttonsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  // Form styles
  formContainer: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginErrorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loginErrorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  // Main Button
  mainButton: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    minHeight: 60,
  },
  buttonEmoji: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  // Social Buttons
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialButton: {
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
    minHeight: 56,
  },
  socialEmoji: {
    fontSize: 20,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Footer
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  createAccountButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  skipArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Dev mode
  devModeIndicator: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  devModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F57C00',
  },
  // Debug link
  debugLink: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  debugLinkText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
