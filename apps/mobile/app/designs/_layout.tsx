import { Stack } from 'expo-router';

export default function DesignsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="design-selector" />
      <Stack.Screen name="restaurants-design-1" />
      <Stack.Screen name="restaurants-design-2" />
      <Stack.Screen name="restaurants-design-3" />
      <Stack.Screen name="restaurants-design-4" />
      <Stack.Screen name="restaurants-design-5" />
    </Stack>
  );
}