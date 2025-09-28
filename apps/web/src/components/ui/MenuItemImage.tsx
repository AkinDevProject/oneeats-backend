import React from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { getMenuCardImageUrl } from '../../utils/imageUtils';

interface MenuItemImageProps {
  imageUrl?: string;
  itemName: string;
  className?: string;
  showOverlay?: boolean;
  onImageClick?: () => void;
}

export const MenuItemImage: React.FC<MenuItemImageProps> = ({
  imageUrl,
  itemName,
  className = '',
  showOverlay = false,
  onImageClick
}) => {
  const optimizedImageUrl = getMenuCardImageUrl(imageUrl);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-md bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
      onClick={onImageClick}
      style={{ cursor: onImageClick ? 'pointer' : 'default' }}
    >
      {optimizedImageUrl ? (
        <>
          <img
            src={optimizedImageUrl}
            alt={`Image de ${itemName}`}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback en cas d'erreur de chargement
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback caché par défaut */}
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
        </div>
      )}

      {/* Overlay au hover */}
      {showOverlay && onImageClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="text-white text-center">
            <Camera className="h-6 w-6 mx-auto mb-1" />
            <span className="text-xs">Modifier</span>
          </div>
        </div>
      )}

      {/* Shimmer effect pendant le chargement */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer opacity-20 pointer-events-none"></div>
    </div>
  );
};