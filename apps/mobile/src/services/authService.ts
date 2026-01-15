/**
 * Service d'authentification Keycloak pour React Native
 * Utilise le flow Authorization Code avec PKCE
 */
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { ENV } from '../config/env';

// Permet au navigateur de se fermer apres l'auth
WebBrowser.maybeCompleteAuthSession();

// Cles de stockage securise
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'oneeats_access_token',
  REFRESH_TOKEN: 'oneeats_refresh_token',
  TOKEN_EXPIRY: 'oneeats_token_expiry',
  USER_INFO: 'oneeats_user_info',
};

// Types
export interface KeycloakTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token?: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
}

// Configuration OIDC Keycloak
const getDiscoveryDocument = (): AuthSession.DiscoveryDocument => {
  const baseUrl = `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect`;
  return {
    authorizationEndpoint: `${baseUrl}/auth`,
    tokenEndpoint: `${baseUrl}/token`,
    revocationEndpoint: `${baseUrl}/logout`,
    userInfoEndpoint: `${baseUrl}/userinfo`,
    endSessionEndpoint: `${baseUrl}/logout`,
  };
};

// URI de redirection pour le callback OAuth
const getRedirectUri = () => {
  return AuthSession.makeRedirectUri({
    scheme: ENV.APP_SCHEME,
    path: 'auth/callback',
  });
};

class AuthService {
  private discovery: AuthSession.DiscoveryDocument;
  private redirectUri: string;

  constructor() {
    this.discovery = getDiscoveryDocument();
    this.redirectUri = getRedirectUri();
    console.log('🔐 AuthService initialized');
    console.log('📍 Redirect URI:', this.redirectUri);
    console.log('🌐 Keycloak URL:', ENV.KEYCLOAK_URL);
  }

  /**
   * Demarre le flow d'authentification OAuth avec PKCE
   */
  async login(): Promise<KeycloakTokens | null> {
    try {
      console.log('🔐 Starting OAuth login flow...');

      // Creer la requete d'autorisation avec PKCE
      const request = new AuthSession.AuthRequest({
        clientId: ENV.KEYCLOAK_CLIENT_ID,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        redirectUri: this.redirectUri,
        usePKCE: true,
        responseType: AuthSession.ResponseType.Code,
      });

      // Prompt pour l'authentification
      const result = await request.promptAsync(this.discovery);
      console.log('📱 Auth result type:', result.type);

      if (result.type === 'success' && result.params.code) {
        // Echanger le code contre des tokens
        const tokens = await this.exchangeCodeForTokens(
          result.params.code,
          request.codeVerifier!
        );

        if (tokens) {
          await this.saveTokens(tokens);
          console.log('✅ Login successful, tokens saved');
          return tokens;
        }
      } else if (result.type === 'error') {
        console.error('❌ Auth error:', result.error);
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('⚠️ Auth cancelled by user');
      }

      return null;
    } catch (error) {
      console.error('❌ Login error:', error);
      return null;
    }
  }

  /**
   * Echange le code d'autorisation contre des tokens
   */
  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<KeycloakTokens | null> {
    try {
      console.log('🔄 Exchanging code for tokens...');

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: ENV.KEYCLOAK_CLIENT_ID,
          code,
          redirectUri: this.redirectUri,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        this.discovery
      );

      return {
        access_token: tokenResult.accessToken,
        refresh_token: tokenResult.refreshToken || '',
        expires_in: tokenResult.expiresIn || 900,
        refresh_expires_in: 604800, // 7 jours par defaut
        token_type: tokenResult.tokenType,
        id_token: tokenResult.idToken,
      };
    } catch (error) {
      console.error('❌ Token exchange error:', error);
      return null;
    }
  }

  /**
   * Rafraichit le token d'acces
   */
  async refreshTokens(): Promise<KeycloakTokens | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        console.log('⚠️ No refresh token available');
        return null;
      }

      console.log('🔄 Refreshing tokens...');

      const tokenResult = await AuthSession.refreshAsync(
        {
          clientId: ENV.KEYCLOAK_CLIENT_ID,
          refreshToken,
        },
        this.discovery
      );

      const tokens: KeycloakTokens = {
        access_token: tokenResult.accessToken,
        refresh_token: tokenResult.refreshToken || refreshToken,
        expires_in: tokenResult.expiresIn || 900,
        refresh_expires_in: 604800,
        token_type: tokenResult.tokenType,
        id_token: tokenResult.idToken,
      };

      await this.saveTokens(tokens);
      console.log('✅ Tokens refreshed successfully');
      return tokens;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      // Si le refresh echoue, nettoyer les tokens
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Deconnexion - revoque les tokens et nettoie le stockage
   */
  async logout(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      if (accessToken) {
        // Tenter de revoquer le token cote serveur
        try {
          await AuthSession.revokeAsync(
            { token: accessToken, tokenTypeHint: AuthSession.TokenTypeHint.AccessToken },
            this.discovery
          );
        } catch (revokeError) {
          console.warn('⚠️ Token revocation failed:', revokeError);
        }
      }

      await this.clearTokens();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Nettoyer les tokens meme en cas d'erreur
      await this.clearTokens();
    }
  }

  /**
   * Recupere les informations utilisateur depuis Keycloak
   */
  async getUserInfo(): Promise<KeycloakUserInfo | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }

      const response = await fetch(this.discovery.userInfoEndpoint!, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('❌ UserInfo request failed:', response.status);
        return null;
      }

      const userInfo = await response.json();
      // Sauvegarder les infos utilisateur
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('❌ Get user info error:', error);
      return null;
    }
  }

  /**
   * Retourne le token d'acces actuel (avec refresh automatique si expire)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);

      if (!token) {
        return null;
      }

      // Verifier l'expiration (avec 30 secondes de marge)
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        const now = Date.now();
        if (now >= expiry - 30000) {
          console.log('⏰ Token expired, refreshing...');
          const refreshed = await this.refreshTokens();
          return refreshed?.access_token || null;
        }
      }

      return token;
    } catch (error) {
      console.error('❌ Get access token error:', error);
      return null;
    }
  }

  /**
   * Verifie si l'utilisateur est authentifie
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Recupere les infos utilisateur depuis le cache
   */
  async getCachedUserInfo(): Promise<KeycloakUserInfo | null> {
    try {
      const userInfoStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
      return null;
    } catch (error) {
      console.error('❌ Get cached user info error:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les tokens de maniere securisee
   */
  private async saveTokens(tokens: KeycloakTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      if (tokens.refresh_token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      }
      // Calculer et sauvegarder l'expiration
      const expiry = Date.now() + tokens.expires_in * 1000;
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    } catch (error) {
      console.error('❌ Save tokens error:', error);
    }
  }

  /**
   * Nettoie tous les tokens stockes
   */
  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.error('❌ Clear tokens error:', error);
    }
  }

  /**
   * Parse le JWT pour extraire les claims (sans verification de signature)
   */
  parseToken(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Extrait les roles depuis le token
   */
  async getRoles(): Promise<string[]> {
    const token = await this.getAccessToken();
    if (!token) {
      return [];
    }

    const payload = this.parseToken(token);
    if (!payload) {
      return [];
    }

    // Roles du realm
    const realmRoles = (payload.realm_access as { roles?: string[] })?.roles || [];

    // Roles du client
    const resourceAccess = payload.resource_access as Record<string, { roles?: string[] }> | undefined;
    const clientRoles = resourceAccess?.[ENV.KEYCLOAK_CLIENT_ID]?.roles || [];

    return [...new Set([...realmRoles, ...clientRoles])];
  }
}

// Export singleton
const authService = new AuthService();
export default authService;
