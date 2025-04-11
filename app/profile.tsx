import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ProfileEditor from '@/components/ProfileEditor';

export default function ProfileScreen() {
  // You can fetch the admin data from Supabase here later
  const adminData = {
    name: 'Administrator',
    email: 'admin@neu.edu.ph',
    role: 'Administrator'
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false 
      }} />
      <ProfileEditor initialData={adminData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});