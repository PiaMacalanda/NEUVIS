import { Stack } from 'expo-router';
import React from 'react';

export default function AuthenticationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#252525',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
      }}>
      <Stack.Screen name="admin-login" options={{ headerShown: true, title: ' ' }} />
      <Stack.Screen name="admin-signup" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="emailVerified" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="security-login" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="security-signup" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="superadmin-login" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="forgot-password" options={{ headerShown: true, title: 'Forgot Password' }}/>
      <Stack.Screen name="reset-password" options={{ headerShown: true, title: 'Reset Password' }}/>
      <Stack.Screen name="verify" />
    </Stack>
  );
}
