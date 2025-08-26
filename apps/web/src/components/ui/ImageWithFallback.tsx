import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 ${className}`}>
        <Building2 className="h-8 w-8 mb-2" />
        <span className="text-xs font-medium text-center px-2">
          {fallbackText || 'Photo du restaurant'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default ImageWithFallback;
