import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthenticationLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/admin-login');
      return;
    }
  }, [user]);
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#003566',
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
