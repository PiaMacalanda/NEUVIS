import { Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, colors, typography, Logo } from '../components';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

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
              title='Sign in to Google Account'
              variant="outline"
              icon="logo-google"
              onPress={() => router.push('/neuvisLanding')}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title='Privacy & Policy'
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
