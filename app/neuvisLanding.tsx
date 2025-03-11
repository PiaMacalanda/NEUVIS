import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '../components';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { supabase } from './supabase'; // Import supabase instance

export default function NeuvisLanding() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      router.replace('/'); // Redirect to home/index page
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Component */}
      <Header />

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
            title='Scan ID' 
            icon="scan-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title='Manually Input Information' 
            icon="create-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title='Visitor Logs' 
            icon="book-outline" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button 
            title='Log Out' 
            variant="outline" 
            icon="log-out-outline" 
            onPress={handleLogout} // Calls logout function
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
