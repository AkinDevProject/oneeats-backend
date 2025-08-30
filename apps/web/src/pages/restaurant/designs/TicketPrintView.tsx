import React, { useState } from 'react';
import { Printer, Check, Clock, AlertTriangle, ChefHat, Receipt, Play, Pause, RotateCcw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { mockOrders } from '../../../data/mockData';
import { Order } from '../../../types';

const TicketPrintView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handlePrint = (order: Order) => {
    // Simulation d'impression
    window.print();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'border-l-orange-500 bg-orange-50', 
          headerColor: 'bg-orange-500',
          label: 'NOUVELLE COMMANDE',
          priority: '🔥 URGENT'
        };
      case 'preparing':
        return { 
          color: 'border-l-blue-500 bg-blue-50', 
          headerColor: 'bg-blue-500',
          label: 'EN COURS DE PRÉPARATION',
          priority: '⚡ EN COURS'
        };
      case 'ready':
        return { 
          color: 'border-l-green-500 bg-green-50', 
          headerColor: 'bg-green-500',
          label: 'PRÊT POUR LIVRAISON',
          priority: '✅ PRÊT'
        };
      default:
        return { 
          color: 'border-l-gray-500 bg-gray-50', 
          headerColor: 'bg-gray-500',
          label: 'COMMANDE',
          priority: ''
        };
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeDiff = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    return diff;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Système de Tickets</h1>
              <p className="text-sm text-gray-400">Interface POS Restaurant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold">{orders.length}</div>
              <div className="text-xs text-gray-400">TICKETS</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => {
          const config = getStatusConfig(order.status);
          const timeDiff = getTimeDiff(new Date(order.createdAt));
          const isUrgent = timeDiff > 15;
          
          return (
            <Card 
              key={order.id} 
              className={`${config.color} border-l-4 bg-white text-black hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 ${
                selectedOrder === order.id ? 'ring-4 ring-blue-500' : ''
              } ${isUrgent ? 'animate-pulse' : ''}`}
              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            >
              {/* Ticket Header */}
              <div className={`${config.headerColor} text-white p-3 -m-4 mb-4 font-mono`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4" />
                    <span className="font-bold text-sm">TICKET #{order.id.split('-')[1]}</span>
                  </div>
                  {isUrgent && (
                    <AlertTriangle className="h-4 w-4 text-yellow-300 animate-bounce" />
                  )}
                </div>
                <div className="text-xs opacity-90">{config.label}</div>
                {config.priority && (
                  <div className="text-xs font-bold mt-1">{config.priority}</div>
                )}
              </div>

              {/* Ticket Content */}
              <div className="font-mono text-sm space-y-3">
                {/* Time and Client */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">HEURE:</span>
                    <span>{formatTime(new Date(order.createdAt))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">CLIENT:</span>
                    <span className="truncate ml-2">{order.clientName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">TEMPS:</span>
                    <span className={`${isUrgent ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      {timeDiff}min
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-1">
                  <div className="font-bold border-b border-gray-200">COMMANDE:</div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="font-bold">{item.quantity}x</span>
                      <span className="flex-1 mx-2 truncate">{item.name}</span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>TOTAL:</span>
                    <span>€{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                  <div className="flex items-center justify-center space-x-2 text-yellow-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-bold">TEMPS ESTIMÉ: {order.estimatedTime}min</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {order.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'preparing');
                      }}
                      variant="success"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 font-mono text-xs"
                      icon={<Play className="h-3 w-3" />}
                    >
                      COMMENCER
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(order);
                      }}
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs border-gray-300"
                      icon={<Printer className="h-3 w-3" />}
                    >
                      IMPRIMER
                    </Button>
                  </div>
                )}

                {order.status === 'preparing' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'ready');
                      }}
                      variant="primary"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 font-mono text-xs"
                      icon={<Check className="h-3 w-3" />}
                    >
                      TERMINER
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'pending');
                      }}
                      variant="warning"
                      size="sm"
                      className="font-mono text-xs"
                      icon={<Pause className="h-3 w-3" />}
                    >
                      PAUSE
                    </Button>
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'completed');
                      }}
                      variant="success"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 font-mono text-xs"
                      icon={<Check className="h-3 w-3" />}
                    >
                      LIVRER
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'preparing');
                      }}
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs border-gray-300"
                      icon={<RotateCcw className="h-3 w-3" />}
                    >
                      RETOUR
                    </Button>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${
                  order.status === 'pending' ? 'bg-orange-400' :
                  order.status === 'preparing' ? 'bg-blue-400 animate-pulse' :
                  order.status === 'ready' ? 'bg-green-400' :
                  'bg-gray-400'
                }`} />
              </div>

              {/* Urgent Indicator */}
              {isUrgent && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-8 font-mono text-sm">
          <div className="text-center">
            <div className="text-orange-400 text-lg font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-gray-400 text-xs">NOUVELLES</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-lg font-bold">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
            <div className="text-gray-400 text-xs">EN COURS</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 text-lg font-bold">
              {orders.filter(o => o.status === 'ready').length}
            </div>
            <div className="text-gray-400 text-xs">PRÊTES</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-lg font-bold">
              {orders.filter(o => getTimeDiff(new Date(o.createdAt)) > 15).length}
            </div>
            <div className="text-gray-400 text-xs">URGENTES</div>
          </div>
        </div>
      </div>

      {/* Print Styles - Hidden */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-ticket, .print-ticket * {
            visibility: visible;
          }
          .print-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            font-family: monospace;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketPrintView;