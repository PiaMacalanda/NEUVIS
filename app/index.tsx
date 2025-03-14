import { Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Button, colors, typography, Logo } from '../components';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Disable Header for This Page */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <View style={styles.titleSection}>
          <Text style={[typography.header.h1, styles.title]}>NEUVIS</Text>
          <Text style={[typography.body.small, styles.subtitle]}>
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

        <View style={styles.actionSection}>
          <Button
            title='Sign in with Google'
            variant="outline"
            icon="logo-google"
            onPress={() => router.push('/neuvisLanding')}
            style={styles.signInButton}
          />
          
          <Button
            title='Privacy Policy'
            variant="underline"
            onPress={() => router.push('/privacy')}
            style={styles.privacyButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    width: '100%',
  },
  titleSection: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.gray,
  },
  heroImageContainer: {
    width: '100%',
    marginBottom: 36,
    alignItems: 'center',
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.5,
    marginVertical: 16,
  },
  actionSection: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  signInButton: {
    width: '90%',
    marginBottom: 16,
    alignSelf: 'center',
  },
  privacyButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});