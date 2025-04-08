import { Stack } from 'expo-router';
import React from 'react';

export default function SecurityLayout() {
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
      <Stack.Screen name="IDgenerate" options={{ title: 'Generated ID' }}/>
      <Stack.Screen name="ManualForm" options={{ title: 'Manual Form' }} />
      <Stack.Screen name="neuvisLanding" options={{ headerShown: false }} />
      <Stack.Screen name="Scanner"/>
      <Stack.Screen name="ScannerOutput" options={{title: ''}} />
      <Stack.Screen name="VisitorsLogs" options={{ title: 'Visitor Logs' }} />
      <Stack.Screen name="apitest" options={{ title: 'Api Call Testing' }} />
    </Stack>
  );
}
