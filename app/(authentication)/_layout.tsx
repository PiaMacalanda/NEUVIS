import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';


export default function AuthenticationLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const checkForPasswordResetLink = async () => {
      const url = await Linking.getInitialURL();
      
      if (url && (url.includes('type=recovery') || url.includes('reset-password'))) {
        setIsPasswordReset(true);
        router.replace('/reset-password');
      }
    };
    
    checkForPasswordResetLink();
    
    const subscription = Linking.addEventListener('url', ({url}) => {
      if (url && (url.includes('type=recovery') || url.includes('reset-password'))) {
        setIsPasswordReset(true);
        router.replace('/reset-password');
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (user && !isPasswordReset) {
      const role = user.user_metadata?.role;
      
      switch (role) {
        case 'superadmin':
          router.replace('/(superadmin)/superadmin');
          break;
        case 'admin':
          router.replace('/(admin)/admin');
          break;
        case 'security':
          router.replace('/(security)/neuvisLanding');
          break;
        default:
          router.replace('/');
      }
    }
  }, [user, isPasswordReset]);

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
      <Stack.Screen name="forgot-password" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="reset-password" options={{ headerShown: true, title: ' ' }}/>
      <Stack.Screen name="verify" options={{ headerShown: true, title: ' ' }}/>
    </Stack>
  );
}
