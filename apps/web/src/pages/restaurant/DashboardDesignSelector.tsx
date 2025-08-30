import React, { useState } from 'react';
import { BarChart3, Layout, CreditCard, List, Receipt, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Import des différentes vues de gestion des commandes
import KitchenBoardView from './designs/KitchenBoardView';
import SwipeCardsView from './designs/SwipeCardsView';
import CompactListView from './designs/CompactListView';
import TicketPrintView from './designs/TicketPrintView';

const DashboardDesignSelector: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string | null>(null);

  const orderViews = [
    {
      id: 'kitchen-board',
      name: 'Vue Tableau Cuisine',
      description: 'Style Trello/Kanban avec colonnes par statut',
      icon: Layout,
      color: 'from-orange-500 to-red-500',
      preview: '🍳 Colonnes | Drag & Drop | Visual',
      component: KitchenBoardView,
      features: ['Colonnes par statut', 'Drag & Drop', 'Vue d\'ensemble', 'Idéal pour tablettes']
    },
    {
      id: 'swipe-cards',
      name: 'Vue Cartes (Swipe)',
      description: 'Style Tinder pour traiter une commande à la fois',
      icon: CreditCard,
      color: 'from-blue-500 to-purple-500',
      preview: '📱 Swipe | Une par une | Focus',
      component: SwipeCardsView,
      features: ['Une commande à la fois', 'Swipe pour action', 'Focus total', 'Parfait mobile']
    },
    {
      id: 'compact-list',
      name: 'Liste Compacte',
      description: 'Liste dense avec actions rapides',
      icon: List,
      color: 'from-green-500 to-teal-500',
      preview: '📋 Compact | Actions rapides | Efficace',
      component: CompactListView,
      features: ['Vue compacte', 'Actions rapides', 'Filtres par statut', 'Optimisé mobile']
    },
    {
      id: 'ticket-print',
      name: 'Système Tickets POS',
      description: 'Style caisse avec tickets d\'impression',
      icon: Receipt,
      color: 'from-gray-700 to-gray-900',
      preview: '🎫 Tickets | POS Style | Impression',
      component: TicketPrintView,
      features: ['Style POS/Caisse', 'Tickets imprimables', 'Vue urgence', 'Interface pro']
    }
  ];

  if (selectedView) {
    const view = orderViews.find(v => v.id === selectedView);
    if (view) {
      const Component = view.component;
      return (
        <div className="relative">
          {/* Back Button */}
          <div className="fixed top-4 left-4 z-50">
            <Button
              onClick={() => setSelectedView(null)}
              variant="outline"
              className="bg-white shadow-lg"
            >
              ← Retour aux styles
            </Button>
          </div>
          <Component />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Styles de Gestion des Commandes</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choisissez l'interface qui convient le mieux à votre restaurant et à vos appareils
        </p>
      </div>

      {/* Views Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {orderViews.map((view) => {
          const IconComponent = view.icon;
          
          return (
            <Card 
              key={view.id}
              className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden"
              onClick={() => setSelectedView(view.id)}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${view.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Style</div>
                    <div className="font-bold">{view.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{view.name}</h3>
                <p className="opacity-90">{view.description}</p>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Preview */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
                  <div className="text-2xl mb-2">{view.preview}</div>
                  <div className="text-sm text-gray-600">Aperçu du style</div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">Caractéristiques :</h4>
                  {view.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => setSelectedView(view.id)}
                  variant="primary"
                  className={`w-full bg-gradient-to-r ${view.color} hover:shadow-lg transform hover:scale-105 transition-all`}
                  size="lg"
                >
                  Tester cette vue
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <Card className="bg-white p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Conseil d'utilisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📱 Sur téléphone :</h4>
              <p className="text-gray-600">Les vues "Cartes" et "Liste Compacte" sont optimales</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📟 Sur tablette :</h4>
              <p className="text-gray-600">Le "Tableau Cuisine" et "Système Tickets" sont parfaits</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardDesignSelector;