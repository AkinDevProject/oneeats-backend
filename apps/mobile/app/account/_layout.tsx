import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // On gère le header nous-mêmes dans index.tsx
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Compte",
          headerShown: true,
        }}
      />
    </Stack>
  );
}