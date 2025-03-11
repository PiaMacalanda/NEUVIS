import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, colors, typography, Logo } from '../components';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/neuvisLanding'); // Redirect authenticated users
      }
    };
    checkUser();
  }, []);

  // Google Sign-In Function
  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      console.log('Sign-in successful');
    }

    setLoading(false);
  };

  return (
    <>
      {/* Disable Header for This Page */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <View style={styles.section}>
          <Text style={[typography.header.h1, styles.title]}>NEUVIS</Text>
          <Text style={typography.body.regular}>
            New Era University Visitor Identification System
          </Text>
        </View>

        <View style={styles.heroImage}>
          <Image 
            source={require('../assets/HeroImage.png')}  
            style={styles.heroImage} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.buttonGroup}>
            <Button
              title={loading ? "Signing in..." : "Sign in to Google Account"}
              variant="outline"
              icon="logo-google"
              onPress={signInWithGoogle}
              disabled={loading} // Disable button while loading
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Privacy & Policy"
              variant="underline"
              onPress={() => router.push('/privacy')}
            />
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
    marginBottom: 10,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  heroImage: {
    width: '100%',
    height: 150, // Adjust height as needed
    alignSelf: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
    alignSelf: 'center',
  },
});

