import { Stack } from 'expo-router';
import React from 'react';

export default function StaticLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#252525',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
      }}>
      <Stack.Screen name="privacy" options={{title: " "}}/>
    </Stack>
  );
}
