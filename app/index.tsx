import { Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Logo } from '../components';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabaseClient';

export default function HomeScreen() {
  const router = useRouter();

  // Function to handle Google Sign-in
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:8081/callback', // Replace with your deep link
      },
    });

    if (error) {
      console.error('Google Sign-in Error:', error.message);
    }
  }

  return (
    <>
      {/* Disable Header for This Page */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo size="small" />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>NEUVIS</Text>
          <Text style={styles.description}>
            New Era University Visitor Identification System
          </Text>
        </View>

        <View style={styles.heroImageContainer}>
        <Image 
          source={{ uri: 'https://i.imgur.com/4Gx6MdV.gif' }}  
          style={[styles.heroImage, { opacity: 0.9 }]} 
          resizeMode="contain"
        />

        </View>

        <View style={styles.section}>
          <View style={styles.buttonGroup}>
            <Button
              title="Sign in to Google Account (🚧)"
              variant="outline"
              icon="logo-google"
              onPress={signInWithGoogle} // Call Google Sign-in function
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Go as Security Guard"
              variant="outline"
              icon="shield-checkmark"
              onPress={() => router.push('/neuvisLanding')}// Call Google Sign-in function
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Go as Admin"
              variant="outline"
              icon="settings"
              onPress={() => router.push('/admin')}  // Call Google Sign-in function
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Privacy & Policy"
              variant="underline"
              onPress={() => router.push('/privacy')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 NEUVIS MDRPLT - All Rights Reserved</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  heroImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroImage: {
    width: '100%',
    height: 150,
    alignSelf: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#8a9aa8',
    fontSize: 12,
  },
});