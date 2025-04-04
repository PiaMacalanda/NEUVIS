import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        
        <Stack screenOptions={{ 
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#252525',
            headerTitleStyle: { fontWeight: 'bold' },
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(static)" options={{ headerShown: false }} />
          <Stack.Screen name="(security)" options={{ headerShown: false }} />
          <Stack.Screen name="(authentication)" options={{ headerShown: false }}/>
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />


        </Stack>
      </GestureHandlerRootView>
    </AuthProvider>
    );
}
