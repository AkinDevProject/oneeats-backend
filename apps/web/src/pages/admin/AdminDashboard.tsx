import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Store, DollarSign, ShoppingCart, AlertCircle, Users, Clock, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockDashboardStats, mockRestaurants, mockOrders } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRealTime, setIsRealTime] = useState(true);
  
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRealTime]);
  
  const stats = mockDashboardStats;
  const inactiveRestaurants = mockRestaurants.filter(r => !r.isOpen);
  const pendingOrders = mockOrders.filter(o => o.status === 'pending');
  const activeOrders = mockOrders.filter(o => ['accepted', 'preparing'].includes(o.status));
  const todayOrders = mockOrders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
              <span className="text-xs sm:text-sm">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full bg-${color}-100 flex-shrink-0`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Vue d'ensemble de votre plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Commandes aujourd'hui"
          value={stats.todayOrders}
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.todayRevenue.toLocaleString('fr-FR')} €`}
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Restaurants actifs"
          value={stats.activeRestaurants}
          icon={Store}
          trend="up"
          trendValue="+2"
          color="purple"
        />
        <StatCard
          title="Commandes en attente"
          value={pendingOrders.length}
          icon={AlertCircle}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Commandes - 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Chiffre d'affaires - 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Alertes système</h3>
        <div className="space-y-3">
          {inactiveRestaurants.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-yellow-50 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <span className="text-sm text-yellow-800">
                  {inactiveRestaurants.length} restaurant(s) actuellement fermé(s)
                </span>
              </div>
              <Badge variant="warning">Action requise</Badge>
            </div>
          )}
          {pendingOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-blue-50 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  {pendingOrders.length} commande(s) en attente de traitement
                </span>
              </div>
              <Badge>Info</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;