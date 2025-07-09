import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockDashboardStats } from '../../data/mockData';

const StatsPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const stats = mockDashboardStats;

  const restaurantData = [
    { name: 'Chez Luigi', value: 35, color: '#3B82F6' },
    { name: 'Sakura Sushi', value: 25, color: '#10B981' },
    { name: 'Burger Street', value: 20, color: '#F59E0B' },
    { name: 'Autres', value: 20, color: '#8B5CF6' }
  ];

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Commandes', 'Chiffre d\'affaires'],
      ...stats.weeklyData.map(item => [
        item.date,
        item.orders.toString(),
        item.revenue.toString()
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'statistiques.csv';
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 text-sm sm:text-base">Analysez les performances de votre plateforme</p>
        </div>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>
          <Button onClick={handleExport} variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Orders Chart */}
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Évolution des commandes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Chiffre d'affaires</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Restaurant Distribution */}
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Répartition par restaurant</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={restaurantData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {restaurantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Combined Chart */}
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;