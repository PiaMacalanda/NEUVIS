import { Stack } from 'expo-router';
import React from 'react';

export default function AuthenticationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4a89dc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
      }}>
      <Stack.Screen name="accessControl" options={{ title: 'Access Control' }} />
      <Stack.Screen name="admin" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="adminData" options={{ title: 'Admin Data' }} />
      <Stack.Screen name="adminHome" options={{ title: 'Welcome Admin!' }} />
      <Stack.Screen name="adminReport" options={{ title: 'Admin Reports' }} />
      
    </Stack>
  );
}
