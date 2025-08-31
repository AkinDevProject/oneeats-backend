import React from 'react';
import { View, StatusBar as RNStatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '../contexts/ThemeContext';

interface ThemedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  statusBarStyle?: 'auto' | 'light' | 'dark';
  safeArea?: boolean;
  backgroundColor?: string;
}

export const ThemedScreen: React.FC<ThemedScreenProps> = ({
  children,
  style,
  statusBarStyle = 'auto',
  safeArea = true,
  backgroundColor,
}) => {
  const { currentTheme } = useAppTheme();
  
  const screenStyle = {
    flex: 1,
    backgroundColor: backgroundColor || currentTheme.colors.background,
    ...style,
  };

  const Container = safeArea ? SafeAreaView : View;

  return (
    <>
      <StatusBar
        style={statusBarStyle}
        backgroundColor={backgroundColor || currentTheme.colors.background}
      />
      <Container style={screenStyle}>
        {children}
      </Container>
    </>
  );
};