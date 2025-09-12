import React, { useState, useEffect } from 'react';
import { 
  X, Clock, User, MapPin, Phone, Truck, AlertTriangle, 
  CheckCircle2, XCircle, PlayCircle, History, DollarSign
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Order } from '../../../types';
import { formatDistance, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (orderId: string, action: 'accept' | 'cancel' | 'prete' | 'recuperee' | 'reactivate') => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onAction
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="bg-orange-100 text-orange-800 text-lg px-3 py-1">⏳ En attente</Badge>;
      case 'CONFIRMED':
        return <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">✅ Confirmée</Badge>;
      case 'PREPARING':
        return <Badge variant="primary" className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">👨‍🍳 En préparation</Badge>;
      case 'READY':
        return <Badge variant="success" className="bg-green-100 text-green-800 text-lg px-3 py-1">✅ Prête</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" className="bg-gray-100 text-gray-800 text-lg px-3 py-1">✅ Récupérée</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" className="bg-red-100 text-red-800 text-lg px-3 py-1">❌ Annulée</Badge>;
      default:
        return <Badge variant="default" className="text-lg px-3 py-1">{status}</Badge>;
    }
  };

  const getElapsedTime = () => {
    const orderTime = new Date(order.createdAt);
    const elapsed = Math.floor((currentTime.getTime() - orderTime.getTime()) / (1000 * 60));
    return elapsed;
  };

  const getUrgencyLevel = () => {
    const elapsed = getElapsedTime();
    if (elapsed > 30) return { color: 'text-red-600', bg: 'bg-red-50', level: 'URGENT' };
    if (elapsed > 15) return { color: 'text-orange-600', bg: 'bg-orange-50', level: 'ATTENTION' };
    return { color: 'text-green-600', bg: 'bg-green-50', level: 'NORMAL' };
  };

  const urgency = getUrgencyLevel();
  const elapsed = getElapsedTime();

  const getActionButtons = () => {
    const handleAction = (action: 'accept' | 'cancel' | 'prete' | 'recuperee' | 'reactivate') => {
      onAction(order.id, action);
      onClose();
    };

    switch (order.status) {
      case 'PENDING':
        return (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              size="lg" 
              variant="primary" 
              className="bg-blue-600 hover:bg-blue-700 flex-1 w-full sm:w-auto"
              icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('accept')}
            >
              <span className="text-sm sm:text-base">Accepter la commande</span>
            </Button>
            <Button 
              size="lg" 
              variant="danger" 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              icon={<XCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('cancel')}
            >
              <span className="text-sm sm:text-base">Annuler</span>
            </Button>
          </div>
        );
      case 'PREPARING':
        return (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              size="lg" 
              variant="success"
              className="bg-green-600 hover:bg-green-700 flex-1 w-full sm:w-auto"
              icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('prete')}
            >
              <span className="text-sm sm:text-base">Marquer comme prête</span>
            </Button>
            <Button 
              size="lg" 
              variant="danger" 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              icon={<XCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('cancel')}
            >
              <span className="text-sm sm:text-base">Annuler</span>
            </Button>
          </div>
        );
      case 'READY':
        return (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              size="lg" 
              variant="success"
              className="bg-blue-600 hover:bg-blue-700 flex-1 w-full sm:w-auto"
              icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('recuperee')}
            >
              <span className="text-sm sm:text-base">Marquer comme récupérée</span>
            </Button>
            <Button 
              size="lg" 
              variant="danger" 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              icon={<XCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              onClick={() => handleAction('cancel')}
            >
              <span className="text-sm sm:text-base">Annuler</span>
            </Button>
          </div>
        );
      case 'CANCELLED':
        return (
          <Button 
            size="lg" 
            variant="primary"
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            onClick={() => handleAction('reactivate')}
          >
            <span className="text-sm sm:text-base">Réactiver la commande</span>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b border-gray-200 ${urgency.bg}`}>
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0 truncate">
                Commande {order.orderNumber || `#${order.id.substring(0, 8)}...`}
              </h2>
              <div className="sm:hidden">
                {getStatusBadge(order.status)}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <div className="hidden sm:block">
                {getStatusBadge(order.status)}
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {/* Timer and Urgency */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${urgency.color}`} />
              <span className={`text-sm sm:text-base font-medium ${urgency.color}`}>
                {elapsed} minutes écoulées
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${urgency.color} ${urgency.bg} border`}>
                {urgency.level}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Reçue {format(new Date(order.createdAt), 'HH:mm', { locale: fr })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Customer Information */}
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Informations client
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">{order.clientName}</span>
              </div>
              
              {order.deliveryAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-700 font-medium">Livraison à domicile</span>
                  </div>
                  <div className="flex items-start space-x-2 ml-6">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700">{order.deliveryAddress}</span>
                  </div>
                  {order.clientPhone && (
                    <div className="flex items-center space-x-2 ml-6">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{order.clientPhone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 font-medium">Commande sur place</span>
                </div>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-between text-sm sm:text-base">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                Détail de la commande
              </span>
              <span className="text-base sm:text-lg font-bold text-gray-900">€{order.total.toFixed(2)}</span>
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                      {item.quantity}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</div>
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs sm:text-sm text-gray-600 truncate">
                          Options: {item.options.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-900 text-sm sm:text-base">€{item.totalPrice.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">€{(item.totalPrice / item.quantity).toFixed(2)} / unité</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-orange-50 border-orange-200">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium text-orange-900 mb-1 text-sm sm:text-base">Instructions spéciales</h4>
                  <p className="text-orange-800 text-sm sm:text-base break-words">{order.specialInstructions}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Order Timeline */}
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <History className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
              Historique de la commande
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-gray-600">
                  Commande reçue - {format(new Date(order.createdAt), 'HH:mm', { locale: fr })}
                </span>
              </div>
              {(order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COMPLETED') && (
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">Préparation en cours</span>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="ghost" size="lg" onClick={onClose} className="sm:order-1">
              Fermer
            </Button>
            <div className="sm:order-2">
              {getActionButtons()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;