import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ProfileEditor from '@/components/ProfileEditor';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { ActivityIndicator } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    role: 'Loading...'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        if (!user || !user.id) {
          console.log('No user ID available');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching user data for ID:', user.id);
        
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          setUserData({
            name: "Error loading",
            email: user?.email || "Error loading",
            role: "Try again later"
          });
          setIsLoading(false);
          return;
        }
        
        if (data) {
          console.log('User data fetched successfully:', data);
          setUserData({
            name: data.full_name || "User",
            email: user?.email || data.email || "No email",
            role: data.role || "No Role Assigned"
          });
        } else {
          console.log('No user data found');
          setUserData({
            name: "Unknown User",
            email: user?.email || "No email",
            role: "No Data Found"
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUserData({
          name: "Error",
          email: "Connection issue",
          role: "Connection issue"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false 
      }} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003566" />
        </View>
      ) : (
        <ProfileEditor initialData={userData} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
