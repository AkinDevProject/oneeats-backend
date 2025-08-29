import React, { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock,
  Users, Star, Award, Target, BarChart3, PieChart,
  Calendar, Download, RefreshCw, Zap, Coffee
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Données simulées
  const dailyStats = {
    revenue: 2450.75,
    orders: 34,
    averageOrder: 72.08,
    customers: 28,
    satisfaction: 4.8,
    completionTime: 23
  };

  const weeklyData = [
    { day: 'Lun', orders: 25, revenue: 1800, satisfaction: 4.2 },
    { day: 'Mar', orders: 32, revenue: 2100, satisfaction: 4.5 },
    { day: 'Mer', orders: 28, revenue: 1950, satisfaction: 4.3 },
    { day: 'Jeu', orders: 38, revenue: 2650, satisfaction: 4.4 },
    { day: 'Ven', orders: 45, revenue: 3200, satisfaction: 4.8 },
    { day: 'Sam', orders: 52, revenue: 4100, satisfaction: 4.9 },
    { day: 'Dim', orders: 34, revenue: 2450, satisfaction: 4.6 }
  ];

  const topDishes = [
    { name: 'Pizza Margherita', orders: 45, revenue: 562.50, growth: 12 },
    { name: 'Pasta Carbonara', orders: 32, revenue: 448.00, growth: -5 },
    { name: 'Tiramisu', orders: 28, revenue: 168.00, growth: 23 },
    { name: 'Salade César', orders: 22, revenue: 264.00, growth: 8 },
    { name: 'Risotto aux champignons', orders: 18, revenue: 306.00, growth: 15 }
  ];

  const ordersByHour = [
    { hour: '8h', orders: 2 }, { hour: '9h', orders: 5 }, { hour: '10h', orders: 8 },
    { hour: '11h', orders: 12 }, { hour: '12h', orders: 25 }, { hour: '13h', orders: 30 },
    { hour: '14h', orders: 18 }, { hour: '15h', orders: 8 }, { hour: '16h', orders: 6 },
    { hour: '17h', orders: 10 }, { hour: '18h', orders: 15 }, { hour: '19h', orders: 28 },
    { hour: '20h', orders: 35 }, { hour: '21h', orders: 22 }, { hour: '22h', orders: 12 }
  ];

  const orderTypes = [
    { name: 'À emporter', value: 65, color: '#3B82F6' },
    { name: 'Sur place', value: 35, color: '#10B981' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const exportData = () => {
    // Simulate export
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Analytiques & Performance
          </h1>
          <p className="text-gray-600 mt-2 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Dernière mise à jour: {format(lastUpdated, 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>

          <Button
            onClick={refreshData}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Button
            onClick={exportData}
            className="bg-white text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {dailyStats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-sm text-gray-600 font-medium">CA aujourd'hui</div>
          <div className="flex items-center justify-center mt-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+12%</span>
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{dailyStats.orders}</div>
          <div className="text-sm text-gray-600 font-medium">Commandes</div>
          <div className="flex items-center justify-center mt-1 text-xs text-blue-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+8%</span>
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {dailyStats.averageOrder.toFixed(0)} €
          </div>
          <div className="text-sm text-gray-600 font-medium">Panier moyen</div>
          <div className="flex items-center justify-center mt-1 text-xs text-purple-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+5%</span>
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{dailyStats.customers}</div>
          <div className="text-sm text-gray-600 font-medium">Clients uniques</div>
          <div className="flex items-center justify-center mt-1 text-xs text-orange-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+15%</span>
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{dailyStats.satisfaction}</div>
          <div className="text-sm text-gray-600 font-medium">Satisfaction</div>
          <div className="flex items-center justify-center mt-1 text-xs text-yellow-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+0.2</span>
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <Zap className="h-8 w-8 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-600">{dailyStats.completionTime} min</div>
          <div className="text-sm text-gray-600 font-medium">Temps moyen</div>
          <div className="flex items-center justify-center mt-1 text-xs text-red-600">
            <TrendingDown className="h-3 w-3 mr-1" />
            <span>-3 min</span>
          </div>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Évolution du CA */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Évolution du chiffre d'affaires
            </h3>
            <Badge variant="success" className="bg-green-100 text-green-700">
              +18% vs semaine dernière
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value} €`, 'CA']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Nombre de commandes par jour */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
              Commandes par jour
            </h3>
            <Badge className="bg-blue-100 text-blue-700">
              Moyenne: 36 commandes/jour
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value}`, 'Commandes']}
              />
              <Bar
                dataKey="orders"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Commandes par heure */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Affluence par heure
            </h3>
            <Badge className="bg-purple-100 text-purple-700">
              🔥 Rush: 20h-21h
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value}`, 'Commandes']}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Types de commande */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-orange-600" />
              Types de commande
            </h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={orderTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                >
                  {orderTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Pourcentage']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top des plats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            🏆 Top 5 des plats les plus commandés
          </h3>
          <Badge className="bg-yellow-100 text-yellow-700">
            Cette semaine
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Plat</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Commandes</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">CA</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Évolution</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Coffee className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{dish.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      {dish.orders}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-gray-900">
                    {dish.revenue.toFixed(2)} €
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className={`inline-flex items-center space-x-1 text-sm font-medium ${
                      dish.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dish.growth > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(dish.growth)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
