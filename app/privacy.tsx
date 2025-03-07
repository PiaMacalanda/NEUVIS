import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Import components
import Header from '../components/Header';

export default function PrivacyPolicy() {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
    
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Privacy Policy for NEUVIS</Text>
        <Text style={styles.date}>Last Updated: February 27, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          New Era University ("we," "our," or "us") respects your privacy and is committed to 
          protecting it through our compliance with this policy. This policy describes the types
          of information we may collect from you or that you may provide when you use the NEUVIS
          (New Era University Visitor Identification System) application.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect several types of information from and about users of our application, including:
        </Text>
        <Text style={styles.listItem}>• Personal information such as name, ID numbers, and contact details</Text>
        <Text style={styles.listItem}>• Information about your visit purpose and host within the university</Text>
        <Text style={styles.listItem}>• Images used for identification purposes</Text>
        <Text style={styles.listItem}>• Log data and device information</Text>
        
        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use information that we collect about you or that you provide to us:
        </Text>
        <Text style={styles.listItem}>• To manage campus security and visitor access</Text>
        <Text style={styles.listItem}>• To verify your identity when you enter university premises</Text>
        <Text style={styles.listItem}>• To maintain records of visitors for safety and security purposes</Text>
        <Text style={styles.listItem}>• To communicate with you regarding your visit</Text>
        
        <Text style={styles.sectionTitle}>4. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain visitor data for a period of 90 days after which it is automatically deleted from our active systems. 
          Backup records may be retained for up to one year for security purposes.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.contact}>New Era University</Text>
        <Text style={styles.contact}>No. 9 Central Avenue, New Era, Quezon City</Text>
        <Text style={styles.contact}>Email: privacy@neu.edu.ph</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34, // same width as back button for centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    marginLeft: 10,
    color: '#333',
  },
  contact: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});