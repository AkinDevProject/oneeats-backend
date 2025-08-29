import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  ChefHat, Eye, EyeOff, Shield, Users, Store, 
  BarChart3, TrendingUp, Activity, Database,
  Zap, CheckCircle, ArrowRight
} from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Analytics Style */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12">
        <div className="flex flex-col justify-center w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DelishGo Analytics</h1>
                <p className="text-blue-100 text-sm">Plateforme de gestion intelligente</p>
              </div>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed">
              Accédez à votre dashboard analytics avec des métriques en temps réel, 
              des graphiques interactifs et un contrôle complet de votre activité.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <Store className="h-8 w-8 text-green-300" />
                <div>
                  <div className="text-white font-bold text-2xl">12+</div>
                  <div className="text-blue-100 text-sm">Restaurants</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-300" />
                <div>
                  <div className="text-white font-bold text-2xl">€2.4K</div>
                  <div className="text-blue-100 text-sm">CA aujourd'hui</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-orange-300" />
                <div>
                  <div className="text-white font-bold text-2xl">87</div>
                  <div className="text-blue-100 text-sm">Commandes</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-purple-300" />
                <div>
                  <div className="text-white font-bold text-2xl">48</div>
                  <div className="text-blue-100 text-sm">Utilisateurs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {[
              'Dashboard analytics en temps réel',
              'Gestion complète des commandes',
              'Statistiques détaillées et exports',
              'Interface responsive et moderne'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>

          {/* Real-time indicator */}
          <div className="mt-8 flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Données synchronisées en temps réel</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DelishGo</h1>
            <p className="text-gray-600 mt-2">Analytics Dashboard</p>
          </div>

          <Card className="bg-white shadow-xl border-0">
            {/* Card Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Connexion</h2>
              <p className="text-gray-600 text-center mt-1">
                Accédez à votre espace analytique
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-6">
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
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  {isLoading ? 'Connexion en cours...' : 'Accéder au Dashboard'}
                </Button>
              </form>
            </div>
          </Card>

          {/* Quick Access */}
          <Card className="mt-6 bg-gray-50 border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">
                Accès Rapide - Démonstration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('admin')}
                  className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg transition-all duration-200 group"
                >
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-purple-900">Admin</div>
                    <div className="text-xs text-purple-600">Panel système</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => quickLogin('restaurant')}
                  className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg transition-all duration-200 group"
                >
                  <ChefHat className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-blue-900">Restaurant</div>
                    <div className="text-xs text-blue-600">Gestion commandes</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Credentials info */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Shield className="h-3 w-3" />
                      <span>Admin:</span>
                    </span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded">admin@delishgo.com</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <ChefHat className="h-3 w-3" />
                      <span>Restaurant:</span>
                    </span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded">luigi@restaurant.com</code>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 DelishGo Analytics • Plateforme de gestion intelligente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;