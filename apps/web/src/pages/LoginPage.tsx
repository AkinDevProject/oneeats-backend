import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Sparkles, Users, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, login } = useAuth();

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

  const quickLogin = (userType: 'admin' | 'restaurant') => {
    const credentials = {
      admin: { email: 'admin@delishgo.com', password: 'admin123' },
      restaurant: { email: 'luigi@restaurant.com', password: 'resto123' }
    };
    
    setEmail(credentials[userType].email);
    setPassword(credentials[userType].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header with enhanced branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <ChefHat className="h-14 w-14 sm:h-16 sm:w-16 text-primary-600 animate-bounce-gentle" />
            <Sparkles className="h-6 w-6 text-secondary-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          DelishGo
        </h1>
        <p className="mt-2 text-center text-base text-gray-600 font-medium">
          Plateforme de gestion de commandes
        </p>
        <p className="text-center text-sm text-gray-500 mt-1">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card variant="elevated" className="py-8 px-6 sm:px-10 bg-white/95 backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="votre@email.com"
                required
              />

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Accès rapide - Démonstration</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Users className="h-4 w-4" />}
                  onClick={() => quickLogin('admin')}
                  className="text-xs"
                >
                  Administrateur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Store className="h-4 w-4" />}
                  onClick={() => quickLogin('restaurant')}
                  className="text-xs"
                >
                  Restaurateur
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3" />
                  <span><strong>Admin:</strong> admin@delishgo.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Store className="h-3 w-3" />
                  <span><strong>Restaurant:</strong> luigi@restaurant.com</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>© 2024 DelishGo - Plateforme de commandes à emporter</p>
      </div>
    </div>
  );
};

export default LoginPage;