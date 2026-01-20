import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import {
  MapPin,
  Store,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Clock,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export interface MapRestaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: 'online' | 'busy' | 'offline';
  todayOrders: number;
  todayRevenue: number;
  avgPrepTime: number;
  cuisineType?: string;
}

interface AdminMapViewProps {
  restaurants: MapRestaurant[];
  onRestaurantClick?: (restaurant: MapRestaurant) => void;
  className?: string;
}

type FilterStatus = 'all' | 'online' | 'busy' | 'offline';

const statusConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  online: { color: 'text-green-600', bg: 'bg-green-100', label: 'En ligne', dot: '#10b981' },
  busy: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Occupé', dot: '#f59e0b' },
  offline: { color: 'text-red-600', bg: 'bg-red-100', label: 'Hors ligne', dot: '#ef4444' },
};

// Simple coordinate transformation for Paris area (demo)
function transformCoords(lat: number, lng: number, zoom: number, width: number, height: number) {
  // Center around Paris (48.8566, 2.3522)
  const centerLat = 48.8566;
  const centerLng = 2.3522;

  const scale = zoom * 100;
  const x = width / 2 + (lng - centerLng) * scale;
  const y = height / 2 - (lat - centerLat) * scale;

  return { x, y };
}

function RestaurantMarker({
  restaurant,
  x,
  y,
  isSelected,
  onClick,
}: {
  restaurant: MapRestaurant;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = statusConfig[restaurant.status];

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer"
      style={{ transition: 'transform 0.2s' }}
    >
      {/* Pulse effect for busy/offline */}
      {restaurant.status !== 'online' && (
        <circle r={isSelected ? 20 : 14} fill={config.dot} opacity={0.3}>
          <animate attributeName="r" from={isSelected ? 16 : 10} to={isSelected ? 24 : 18} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main marker */}
      <circle
        r={isSelected ? 12 : 8}
        fill={config.dot}
        stroke="white"
        strokeWidth={2}
        className="transition-all"
      />

      {/* Orders count badge */}
      {restaurant.todayOrders > 0 && (
        <g transform="translate(8, -8)">
          <circle r={8} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={8}
            fontWeight="bold"
          >
            {restaurant.todayOrders > 9 ? '9+' : restaurant.todayOrders}
          </text>
        </g>
      )}

      {/* Hover label */}
      {isSelected && (
        <g transform="translate(0, -24)">
          <rect x={-50} y={-12} width={100} height={24} rx={4} fill="white" stroke="#e5e7eb" />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600" fill="#1f2937">
            {restaurant.name.length > 15 ? restaurant.name.substring(0, 15) + '...' : restaurant.name}
          </text>
        </g>
      )}
    </g>
  );
}

function RestaurantInfoPanel({
  restaurant,
  onClose,
}: {
  restaurant: MapRestaurant;
  onClose: () => void;
}) {
  const config = statusConfig[restaurant.status];

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-10 animate-slideUp">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bg)}>
          <Store className={cn('h-6 w-6', config.color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 truncate">{restaurant.name}</h4>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{restaurant.address}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <ShoppingCart className="h-3 w-3" />
              </div>
              <div className="text-lg font-bold text-gray-900">{restaurant.todayOrders}</div>
              <div className="text-xs text-gray-500">Commandes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <TrendingUp className="h-3 w-3" />
              </div>
              <div className="text-lg font-bold text-gray-900">{restaurant.todayRevenue}€</div>
              <div className="text-xs text-gray-500">Revenus</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Clock className="h-3 w-3" />
              </div>
              <div className="text-lg font-bold text-gray-900">{restaurant.avgPrepTime}m</div>
              <div className="text-xs text-gray-500">Préparation</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * AdminMapView - Vue carte des restaurants
 * Affiche les restaurants sur une carte avec leur statut
 */
export function AdminMapView({
  restaurants,
  onRestaurantClick,
  className,
}: AdminMapViewProps) {
  const [zoom, setZoom] = useState(5);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    if (filter === 'all') return restaurants;
    return restaurants.filter(r => r.status === filter);
  }, [restaurants, filter]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find(r => r.id === selectedId);
  }, [restaurants, selectedId]);

  const statusCounts = useMemo(() => ({
    online: restaurants.filter(r => r.status === 'online').length,
    busy: restaurants.filter(r => r.status === 'busy').length,
    offline: restaurants.filter(r => r.status === 'offline').length,
  }), [restaurants]);

  const mapWidth = 600;
  const mapHeight = 400;

  return (
    <Card className={cn(
      'overflow-hidden',
      isFullscreen && 'fixed inset-4 z-50 max-w-none',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Carte des restaurants</h3>
            <p className="text-xs text-gray-500">{restaurants.length} restaurants</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-2 py-1 text-xs font-medium rounded transition-colors',
                filter === 'all' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              Tous ({restaurants.length})
            </button>
            <button
              onClick={() => setFilter('online')}
              className={cn(
                'px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1',
                filter === 'online' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {statusCounts.online}
            </button>
            <button
              onClick={() => setFilter('busy')}
              className={cn(
                'px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1',
                filter === 'busy' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {statusCounts.busy}
            </button>
            <button
              onClick={() => setFilter('offline')}
              className={cn(
                'px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1',
                filter === 'offline' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {statusCounts.offline}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => setZoom(z => Math.min(z + 1, 10))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 1, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100" style={{ height: isFullscreen ? 'calc(100% - 60px)' : 400 }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Restaurant markers */}
          {filteredRestaurants.map(restaurant => {
            const { x, y } = transformCoords(restaurant.lat, restaurant.lng, zoom, mapWidth, mapHeight);
            return (
              <RestaurantMarker
                key={restaurant.id}
                restaurant={restaurant}
                x={x}
                y={y}
                isSelected={selectedId === restaurant.id}
                onClick={() => {
                  setSelectedId(selectedId === restaurant.id ? null : restaurant.id);
                  onRestaurantClick?.(restaurant);
                }}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Légende</div>
          <div className="space-y-1.5">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.dot }} />
                <span className="text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning banner if many offline */}
        {statusCounts.offline > 2 && (
          <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">
              {statusCounts.offline} restaurants hors ligne
            </span>
          </div>
        )}

        {/* Selected restaurant info panel */}
        {selectedRestaurant && (
          <RestaurantInfoPanel
            restaurant={selectedRestaurant}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </Card>
  );
}

export default AdminMapView;
