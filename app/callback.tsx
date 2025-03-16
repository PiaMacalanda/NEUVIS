import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabaseClient';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Callback: Checking auth session"); // Debugging
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth session error:", error.message); // Debugging
          router.replace('/?error=auth_failed');
          return;
        }

        if (!data?.session?.user?.email) {
          console.log("No user email found in session"); // Debugging
          router.replace('/?error=auth_failed');
          return;
        }

        const userEmail = data.session.user.email;
        console.log("User email:", userEmail); // Debugging

        if (!userEmail.endsWith('@neu.edu.ph')) {
          console.log("Invalid email domain"); // Debugging
          await supabase.auth.signOut();
          router.replace('/?error=invalid_email');
          return;
        }

        // Fetch user role
        console.log("Fetching user role"); // Debugging
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('email', userEmail)
          .single();

        if (roleError) {
          console.error("Role fetch error:", roleError.message); // Debugging
        }

        if (!userData?.role) {
          console.log("No role assigned"); // Debugging
          await supabase.auth.signOut();
          router.replace('/?error=no_role');
          return;
        }

        console.log("User role:", userData.role); // Debugging
        // Redirect to role-based page
        router.replace(userData.role === 'admin' ? '/admin' : '/neuvisLanding');
      } catch (error) {
        console.error("Unexpected error:", error); // Debugging
        router.replace('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#252525" />
      <Text style={styles.text}>Processing login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  }
});