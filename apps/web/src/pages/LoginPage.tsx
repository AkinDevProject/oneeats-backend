import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ChefHat, Eye, EyeOff, Shield, Smartphone,
  Sparkles, Apple, Settings, X, LogIn
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Configuration
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(true);

  const { user, login, loginWithSSO } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/restaurant'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };


  // Quick Access Section - Easily Removable Component
  const QuickAccessSection = () => {
    const quickAccessUsers = [
      {
        name: 'Admin Restaurant',
        email: 'jean.dupont@oneats.dev',
        password: 'dev123',
        role: 'Admin',
        color: 'from-purple-500 to-pink-600',
        icon: Shield
      },
      {
        name: 'Utilisateur Restaurant',
        email: 'luigi@restaurant.com',
        password: 'resto123',
        role: 'Restaurant',
        color: 'from-blue-500 to-indigo-600',
        icon: ChefHat
      }
    ];

    const handleQuickLogin = (userType: 'admin' | 'restaurant') => {
      const credentials = {
        admin: { email: 'jean.dupont@oneats.dev', password: 'dev123' },
        restaurant: { email: 'luigi@restaurant.com', password: 'resto123' }
      };

      setEmail(credentials[userType].email);
      setPassword(credentials[userType].password);
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile Quick Access */}
        <div className="block sm:hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-700">Accès rapide</span>
            </div>
            <div className="space-y-2">
              {quickAccessUsers.map((user, index) => {
                const IconComponent = user.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickLogin(index === 0 ? 'admin' : 'restaurant')}
                    className={`w-full p-3 bg-gradient-to-r ${user.color} text-white rounded-lg transition-all duration-200 active:scale-95`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs opacity-90">{user.role}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Quick Access */}
        <div className="hidden sm:block">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-indigo-800">Accès rapide pour test</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                {quickAccessUsers.map((user, index) => {
                  const IconComponent = user.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickLogin(index === 0 ? 'admin' : 'restaurant')}
                      className={`group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${user.color} text-white shadow-lg`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 right-2 text-3xl opacity-20">🚀</div>
                      </div>
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full mx-auto bg-white bg-opacity-20">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="font-bold text-sm">{user.name}</div>
                        <div className="text-xs opacity-90">{user.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top-left Branding - Always visible */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm">
          <div className="p-1.5 bg-white bg-opacity-20 rounded-md">
            <ChefHat className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-base">DelishGo</span>
            <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
            <span className="text-sm text-blue-100">Connexion</span>
          </div>
        </div>
      </div>

      {/* Toggle Quick Access Button - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <button
          onClick={() => setShowQuickAccess(!showQuickAccess)}
          className={`p-2 rounded-lg shadow-sm transition-all duration-200 ${
            showQuickAccess 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title={showQuickAccess ? 'Masquer l\'accès rapide (vue production)' : 'Afficher l\'accès rapide (vue développement)'}
        >
          {showQuickAccess ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Content - Centered */}
      <div className="flex items-center justify-center min-h-screen px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className={`w-full transition-all duration-300 ${
          showQuickAccess ? 'max-w-6xl' : 'max-w-2xl'
        }`}>
          <div className={`grid gap-6 lg:gap-8 items-center ${
            showQuickAccess ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}>
            {/* Login Form - Always centered when quick access is hidden */}
            <div className={showQuickAccess ? 'order-2 lg:order-1' : ''}>
              <Card className="bg-white shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Connexion traditionnelle</h2>
                    <p className="text-sm text-gray-600">Connectez-vous avec votre email et mot de passe</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-4">
                      <Input
                        label="Adresse email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        placeholder="votre@email.com"
                        required
                      />

                      <div className="relative">
                        <Input
                          label="Mot de passe"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="Votre mot de passe"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-6"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : 
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          }
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-10 sm:h-12 text-sm sm:text-base"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                  </form>

                  {/* OAuth Buttons Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">Ou connectez-vous avec</p>
                    </div>
                    <div className="space-y-3">
                      {/* Keycloak SSO Button - Only shown when not in mock mode */}
                      {!MOCK_AUTH && (
                        <button
                          onClick={loginWithSSO}
                          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <LogIn className="w-5 h-5" />
                            <span>Se connecter avec Keycloak SSO</span>
                          </div>
                        </button>
                      )}

                      {/* Google Login Button - Redirect to Keycloak with Google IdP */}
                      <button
                        onClick={!MOCK_AUTH ? loginWithSSO : undefined}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>Continuer avec Google</span>
                          {MOCK_AUTH && <span className="text-xs text-gray-400 ml-2">(bientot)</span>}
                        </div>
                      </button>

                      {/* Apple Login Button */}
                      <button
                        onClick={!MOCK_AUTH ? loginWithSSO : undefined}
                        className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg shadow-sm text-sm font-medium hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Apple className="w-5 h-5" />
                          <span>Continuer avec Apple</span>
                          {MOCK_AUTH && <span className="text-xs text-gray-400 ml-2">(bientot)</span>}
                        </div>
                      </button>
                    </div>

                    {/* Mode indicator */}
                    {MOCK_AUTH && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Mode developpement - Auth mock active
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

            </div>

            {/* Quick Access Section - Conditionally rendered */}
            {showQuickAccess && (
              <div className="order-1 lg:order-2">
                <QuickAccessSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;