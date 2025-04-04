import { Stack } from 'expo-router';
import React from 'react';

export default function AuthenticationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="admin-signup" />
      <Stack.Screen name="emailVerified" />
      <Stack.Screen name="security-login" />
      <Stack.Screen name="security-signup" />
      <Stack.Screen name="superadmin-login" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
