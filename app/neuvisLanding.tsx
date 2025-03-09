import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button } from '../components';
import Header from '../components/Header';
import { useRouter } from 'expo-router';

export default function NeuvisLanding() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header Component with Dynamic Role */}
      <Header role="Security Guard" name="Main Entrance" />

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image 
          source={require('../assets/SampleID.png')}  
          style={styles.heroImage} 
          resizeMode="contain"
        />
      </View>

      {/* Section: Generate Visitor ID */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>Scan a valid ID or manually enter visitor details.</Text>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <View style={styles.buttonGroup}>
          <Button 
            title="Scan ID" 
            icon="scan-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title="Manually Input Information" 
            icon="create-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title="Visitor Logs" 
            icon="book-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title="Log Out" 
            variant="outline" 
            icon="log-out-outline" 
            onPress={() => router.push('/')} // Redirect to home screen/index.tsx
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  heroContainer: {
    alignItems: 'center',  
    marginTop: 20, 
    marginBottom: 10, 
  },
  heroImage: {
    width: 200,  
    height: 120, 
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  text: {
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
  },
});

