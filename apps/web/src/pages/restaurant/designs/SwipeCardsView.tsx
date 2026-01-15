import React, { useState } from 'react';
import { CheckCircle, X, Clock, ChefHat, ArrowRight, Timer, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useRestaurantData } from '../../../hooks/useRestaurantData';

const SwipeCardsView: React.FC = () => {
  const { orders: allOrders, loading, error, updateOrderStatus, refetch } = useRestaurantData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrer les commandes non complétées
  const orders = allOrders.filter(o => o.status !== 'COMPLETED');
  const currentOrder = orders[currentIndex];

  const handleAccept = async () => {
    if (currentOrder) {
      try {
        const newStatus = currentOrder.status === 'PENDING' ? 'PREPARING' : 'READY';
        await updateOrderStatus(currentOrder.id, newStatus);
        nextOrder();
      } catch (err) {
        console.error('Erreur lors de la mise à jour du statut:', err);
      }
    }
  };

  const handleReject = () => {
    // Pour la démo, on passe juste à la suivante
    nextOrder();
  };

  const nextOrder = () => {
    if (orders.length > 0) {
      setCurrentIndex(prev => (prev + 1) % orders.length);
    }
  };

  const getStatusInfo = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING':
        return {
          title: 'NOUVELLE COMMANDE',
          subtitle: 'Accepter pour commencer la préparation',
          color: 'from-orange-500 to-red-500',
          actionText: 'Commencer la préparation',
          actionIcon: ChefHat
        };
      case 'PREPARING':
        return {
          title: 'EN PRÉPARATION',
          subtitle: 'Marquer comme prêt quand terminé',
          color: 'from-blue-500 to-purple-500',
          actionText: 'Marquer prêt',
          actionIcon: CheckCircle
        };
      case 'READY':
        return {
          title: 'COMMANDE PRÊTE',
          subtitle: 'En attente de livraison',
          color: 'from-green-500 to-teal-500',
          actionText: 'Marquer livré',
          actionIcon: CheckCircle
        };
      default:
        return {
          title: 'COMMANDE',
          subtitle: '',
          color: 'from-gray-500 to-gray-600',
          actionText: 'Action',
          actionIcon: ArrowRight
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Toutes les commandes traitées !</h2>
          <p className="text-gray-600">Aucune commande en attente pour le moment.</p>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);
  const ActionIcon = statusInfo.actionIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue Cartes</h1>
          <p className="text-gray-600">Style Tinder pour commandes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{currentIndex + 1}</div>
            <div className="text-xs text-gray-600">sur {orders.length}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-white rounded-full p-1 shadow-sm">
        <div 
          className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / orders.length) * 100}%` }}
        />
      </div>

      {/* Order Card */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          {/* Card Header */}
          <div className={`bg-gradient-to-r ${statusInfo.color} p-6 text-white text-center`}>
            <div className="mb-2">
              <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                {currentOrder.id}
              </Badge>
            </div>
            <h2 className="text-xl font-bold mb-1">{statusInfo.title}</h2>
            <p className="text-sm opacity-90">{statusInfo.subtitle}</p>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Client Info */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {currentOrder.clientName.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{currentOrder.clientName}</h3>
              <p className="text-gray-600">{currentOrder.clientEmail}</p>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">€{currentOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>{currentOrder.estimatedTime}min</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Table {Math.floor(Math.random() * 20) + 1}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Articles commandés:</h4>
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Badge variant="primary" size="sm" className="font-bold">
                      {item.quantity}x
                    </Badge>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-700">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Time Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Reçue il y a {Math.floor((Date.now() - new Date(currentOrder.createdAt).getTime()) / 60000)} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleReject}
                variant="outline"
                size="lg"
                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                icon={<X className="h-5 w-5" />}
              >
                Reporter
              </Button>
              <Button
                onClick={handleAccept}
                variant="primary"
                size="lg"
                className={`bg-gradient-to-r ${statusInfo.color} hover:shadow-lg transform hover:scale-105 transition-all`}
                icon={<ActionIcon className="h-5 w-5" />}
              >
                {statusInfo.actionText}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {orders.slice(0, Math.min(5, orders.length)).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-blue-500 scale-125' 
                : index < currentIndex 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
        {orders.length > 5 && (
          <span className="text-gray-500 text-sm">+{orders.length - 5}</span>
        )}
      </div>
    </div>
  );
};

export default SwipeCardsView;