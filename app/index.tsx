import { Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Logo } from '../components';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import FooterFull from '../components/FooterFull';

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
      <StatusBar barStyle="light-content" backgroundColor="#252525" />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo size="small" />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>NEUVIS</Text>
            <Text style={styles.subtitle}>New Era University Visitor Identification System</Text>
          </View>
        </View>

        <View style={styles.heroImageContainer}>
          <Image 
            source={{ uri: 'https://i.imgur.com/4Gx6MdV.gif' }}  
            style={styles.heroImage} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Select Login Type</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.routeButton, styles.primaryButton]}
              onPress={() => router.push('/security-login')}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Security Guard Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.routeButton, styles.primaryButton]}
              onPress={() => router.push('/admin-login')}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Administrator Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.routeButton, styles.darkButton]}
              onPress={() => router.push('/superadmin-login')}
            >
              <Ionicons name="person-outline" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.routeButtonText}>Superadmin Portal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FooterFull />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#003566',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  heroImageContainer: {
    position: 'relative',
    marginVertical: 20,
  },
  heroImage: {
    width: '100%',
    height: 180,
    alignSelf: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(37, 37, 37, 0.7)',
    paddingVertical: 12,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 350,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#003566',
  },
  darkButton: {
    backgroundColor: '#ffc300',
  },
  buttonIcon: {
    marginRight: 15,
  },
  routeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});