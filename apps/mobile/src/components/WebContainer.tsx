import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface WebContainerProps {
  children: React.ReactNode;
  style?: any;
}

export const WebContainer: React.FC<WebContainerProps> = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, style]}>
        {children}
      </View>
    );
  }
  
  return <View style={style}>{children}</View>;
};

const styles = StyleSheet.create({
  webContainer: {
    width: '100vw',
    minHeight: '100vh',
    maxWidth: '100vw',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
});