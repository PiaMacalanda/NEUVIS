import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    
    if (!user ) {
      const role = user.user_metadata?.role;
      if (role !== 'superadmin') {
        router.replace('/superadmin-login');
        return;
      }
    }
  }, [user]);

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
      <Stack.Screen name="admin-create" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="superadmin" options={{ headerShown: true, title: ' ' }} />
      <Stack.Screen name="transfer_superadmin" options={{ headerShown: true, title: 'Transfer Superadmin' }} />
    </Stack>
  );
}
