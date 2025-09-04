import { Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

export const usePlatform = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const isDesktop = isWeb && dimensions.width > 768;
  
  return {
    platform: Platform.OS,
    isWeb,
    isMobile,
    isDesktop,
    dimensions,
    isLandscape: dimensions.width > dimensions.height,
  };
};