import React from 'react';
import { DollarSign, ShoppingCart, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface QuickMetricsProps {
  totalRevenue: number;
  revenueChange: string;
  totalOrders: number;
  ordersChange: string;
  avgOrderValue: number;
  avgOrderChange: string;
  pendingOrdersCount: number;
}

const QuickMetrics: React.FC<QuickMetricsProps> = ({
  totalRevenue,
  revenueChange,
  totalOrders,
  ordersChange,
  avgOrderValue,
  avgOrderChange,
  pendingOrdersCount
}) => {
  const formatChange = (change: string) => {
    const isPositive = change.startsWith('+');
    return {
      text: change,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    };
  };

  const revenueChangeData = formatChange(revenueChange);
  const ordersChangeData = formatChange(ordersChange);
  const avgOrderChangeData = formatChange(avgOrderChange);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Chiffre d'affaires */}
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">€{totalRevenue.toFixed(0)}</div>
            <div className="text-blue-100 font-medium">Chiffre d'affaires</div>
          </div>
        </div>
        <div className="flex items-center text-blue-100 text-sm">
          {revenueChangeData.icon}
          <span className="ml-1">{revenueChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Commandes */}
      <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <ShoppingCart className="h-8 w-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{totalOrders}</div>
            <div className="text-green-100 font-medium">Commandes</div>
          </div>
        </div>
        <div className="flex items-center text-green-100 text-sm">
          {ordersChangeData.icon}
          <span className="ml-1">{ordersChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Panier moyen */}
      <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">€{avgOrderValue.toFixed(0)}</div>
            <div className="text-purple-100 font-medium">Panier moyen</div>
          </div>
        </div>
        <div className="flex items-center text-purple-100 text-sm">
          {avgOrderChangeData.icon}
          <span className="ml-1">{avgOrderChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Commandes en attente */}
      <Card className={`p-6 ${pendingOrdersCount > 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <Clock className="h-8 w-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{pendingOrdersCount}</div>
            <div className={`${pendingOrdersCount > 0 ? 'text-orange-100' : 'text-gray-100'} font-medium`}>En attente</div>
          </div>
        </div>
        <div className={`flex items-center ${pendingOrdersCount > 0 ? 'text-orange-100' : 'text-gray-100'} text-sm`}>
          <Clock className="h-4 w-4 mr-1" />
          <span>{pendingOrdersCount > 0 ? 'Action requise' : 'Tout traité'}</span>
        </div>
      </Card>
    </div>
  );
};

export default QuickMetrics;