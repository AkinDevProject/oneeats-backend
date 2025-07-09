import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const RestaurantStatsPage: React.FC = () => {
  const weeklyData = [
    { day: 'Lun', orders: 12, revenue: 280 },
    { day: 'Mar', orders: 18, revenue: 420 },
    { day: 'Mer', orders: 15, revenue: 350 },
    { day: 'Jeu', orders: 22, revenue: 510 },
    { day: 'Ven', orders: 28, revenue: 650 },
    { day: 'Sam', orders: 35, revenue: 780 },
    { day: 'Dim', orders: 25, revenue: 580 }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: any) => (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-1 text-green-600">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="text-xs sm:text-sm">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full bg-${color}-100 flex-shrink-0`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const handleExport = () => {
    const csvContent = [
      ['Jour', 'Commandes', 'Chiffre d\'affaires'],
      ...weeklyData.map(item => [
        item.day,
        item.orders.toString(),
        item.revenue.toString()
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'statistiques-restaurant.csv';
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 text-sm sm:text-base">Suivez les performances de votre restaurant</p>
        </div>
        <Button onClick={handleExport} variant="secondary" size="sm">
          Export PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Commandes aujourd'hui"
          value="18"
          icon={ShoppingCart}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Chiffre d'affaires"
          value="420 €"
          icon={DollarSign}
          trend="+8%"
          color="green"
        />
        <StatCard
          title="Temps moyen"
          value="22 min"
          icon={Clock}
          trend="-2 min"
          color="purple"
        />
        <StatCard
          title="Taux d'acceptation"
          value="94%"
          icon={TrendingUp}
          trend="+2%"
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Commandes - 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Chiffre d'affaires - 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Métriques de performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">94%</div>
            <div className="text-xs sm:text-sm text-gray-600">Taux d'acceptation</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">22 min</div>
            <div className="text-xs sm:text-sm text-gray-600">Temps moyen de préparation</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">4.8/5</div>
            <div className="text-xs sm:text-sm text-gray-600">Note moyenne</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RestaurantStatsPage;