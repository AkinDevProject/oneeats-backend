import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, TrendingDown, Store, DollarSign, ShoppingCart, AlertCircle, Users, Clock, Activity, 
  Zap, CheckCircle2, Eye, EyeOff, RefreshCw, Download, Calendar, Target, PieChart,
  BarChart3, Shield, Database, Server, Globe
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { useOrders } from '../../hooks/data/useOrders';

const AdminDashboard: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboard();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { orders, loading: ordersLoading } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRealTime, setIsRealTime] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRealTime]);
  
  const inactiveRestaurants = restaurants.filter(r => !r.isOpen);
  const pendingOrders = orders.filter(o => o.status === 'en_attente');
  const activeOrders = orders.filter(o => ['en_preparation', 'prete'].includes(o.status));
  const todayOrders = orders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const loading = statsLoading || restaurantsLoading || ordersLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center border-danger-200 bg-danger-50">
          <AlertCircle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{statsError}</p>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Analytics Data
  const analytics = {
    systemMetrics: {
      uptime: '99.8%',
      responseTime: '145ms',
      activeConnections: 1247,
      dataProcessed: '2.3TB'
    },
    
    performanceData: [
      { time: '00:00', requests: 120, errors: 2 },
      { time: '04:00', requests: 80, errors: 1 },
      { time: '08:00', requests: 340, errors: 5 },
      { time: '12:00', requests: 520, errors: 8 },
      { time: '16:00', requests: 680, errors: 12 },
      { time: '20:00', requests: 450, errors: 6 },
    ],

    topRestaurants: [
      { name: 'Luigi Pizza Palace', orders: 47, revenue: 2340, status: 'online' },
      { name: 'Burger Express', orders: 38, revenue: 1890, status: 'online' },
      { name: 'Sushi Zen', orders: 31, revenue: 2180, status: 'busy' },
      { name: 'Pasta Corner', orders: 28, revenue: 1650, status: 'online' }
    ],

    statusDistribution: [
      { status: 'En ligne', count: 8, color: '#10b981' },
      { status: 'Occupé', count: 3, color: '#f59e0b' },
      { status: 'Hors ligne', count: 1, color: '#ef4444' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Controls - Style Data-Driven */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Administration</h1>
              <p className="text-gray-600 mt-1">Supervision système et métriques de performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showAnalytics ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                icon={showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              >
                {showAnalytics ? 'Masquer Analytics' : 'Afficher Analytics'}
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
                Actualiser
              </Button>
              <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Key Metrics Row - Style Data-Driven */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.todayRevenue.toLocaleString('fr-FR')}€</div>
                <div className="text-purple-100 font-medium">Chiffre d'affaires</div>
              </div>
            </div>
            <div className="flex items-center text-purple-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+18.5% vs hier</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.todayOrders}</div>
                <div className="text-blue-100 font-medium">Commandes</div>
              </div>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% vs hier</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Store className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.activeRestaurants}</div>
                <div className="text-green-100 font-medium">Restaurants actifs</div>
              </div>
            </div>
            <div className="flex items-center text-green-100 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span>{restaurants.length - inactiveRestaurants.length} en ligne</span>
            </div>
          </Card>

          <Card className={`p-6 ${pendingOrders.length > 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white`}>
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{pendingOrders.length}</div>
                <div className={`${pendingOrders.length > 0 ? 'text-orange-100' : 'text-gray-100'} font-medium`}>Alertes système</div>
              </div>
            </div>
            <div className={`flex items-center ${pendingOrders.length > 0 ? 'text-orange-100' : 'text-gray-100'} text-sm`}>
              <Clock className="h-4 w-4 mr-1" />
              <span>{pendingOrders.length > 0 ? 'Action requise' : 'Tout opérationnel'}</span>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* System Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Performance Système</h3>
                <Server className="h-5 w-5 text-indigo-500" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {analytics.systemMetrics.uptime}
                  </div>
                  <div className="text-sm text-gray-600">Disponibilité</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics.systemMetrics.responseTime}
                  </div>
                  <div className="text-sm text-gray-600">Temps de réponse</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics.systemMetrics.activeConnections.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Connexions actives</div>
                  <div className="flex items-center mt-2 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+5.2% cette heure</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Restaurants */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Restaurants</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              
              <div className="space-y-4">
                {analytics.topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.name} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{restaurant.name}</div>
                      <div className="text-sm text-gray-600">{restaurant.orders} commandes</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€{restaurant.revenue}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        restaurant.status === 'online' ? 'bg-green-100 text-green-800' :
                        restaurant.status === 'busy' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.status === 'online' ? 'En ligne' : 
                         restaurant.status === 'busy' ? 'Occupé' : 'Hors ligne'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">État des Restaurants</h3>
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
              
              <div className="space-y-4">
                {analytics.statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium text-gray-900">
                    {analytics.statusDistribution.reduce((sum, item) => sum + item.count, 0)} restaurants
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Commandes - 7 derniers jours</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance Système - 24h</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requêtes" />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Erreurs" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* System Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">État du Système</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Système opérationnel</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-900">Base de données</div>
                  <div className="text-sm text-green-700">Opérationnelle</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-bold text-blue-900">API Services</div>
                  <div className="text-sm text-blue-700">Tous en ligne</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-bold text-purple-900">Sécurité</div>
                  <div className="text-sm text-purple-700">Protégé</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="font-bold text-orange-900">Monitoring</div>
                  <div className="text-sm text-orange-700">Actif</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        {(inactiveRestaurants.length > 0 || pendingOrders.length > 0) && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Alertes & Actions Requises</h3>
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="space-y-3">
              {inactiveRestaurants.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Store className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-900">
                      {inactiveRestaurants.length} restaurant{inactiveRestaurants.length > 1 ? 's' : ''} fermé{inactiveRestaurants.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Contacter
                  </Button>
                </div>
              )}
              {pendingOrders.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900">
                      {pendingOrders.length} commande{pendingOrders.length > 1 ? 's' : ''} en attente
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;