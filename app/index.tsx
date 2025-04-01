import { Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Logo } from '../components';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/Footer';

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
          {/* <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={signInWithGoogle}
            >
              <Ionicons name="logo-google" size={20} color="#333" style={styles.buttonIcon} />
              <Text style={styles.googleButtonText}>Sign in with Google Account (🚧)</Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.routeButton}
              onPress={() => router.push('/security-login')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Security Guard Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.routeButton}
              onPress={() => router.push('/admin-login')}
            >
              <Ionicons name="settings-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Administrator Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.routeButton}
              // onPress={() => router.push('/superadmin-login')}
              onPress={() => router.push('/superadmin')}
            >
              <Ionicons name="person-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Superadmin Page</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.underlineButton}
              onPress={() => router.push('/privacy')}
            >
              <Text style={styles.underlineButtonText}>Privacy & Policy</Text>
            </TouchableOpacity>
          </View>
          <Footer />
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
    width: '100%',
    maxWidth: 400,
  },
  buttonIcon: {
    marginRight: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a89dc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  underlineButton: {
    alignItems: 'center',
  },
  underlineButtonText: {
    color: '#4a89dc',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});