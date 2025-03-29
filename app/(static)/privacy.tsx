import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Footer from '@/components/Footer';
import styles from './privacyStyles';

export default function PrivacyPolicy() {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };

  return (
      <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4a89dc" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
      
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
          
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on secure servers behind firewalls. Any personal information will be encrypted using industry-standard techniques.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.listItem}>• Access the personal data we hold about you</Text>
          <Text style={styles.listItem}>• Request correction of your personal data</Text>
          <Text style={styles.listItem}>• Request deletion of your data within legal and security constraints</Text>
          <Text style={styles.listItem}>• Object to processing of your personal data</Text>
          
          <Text style={styles.sectionTitle}>7. Developers</Text>
          <Text style={styles.paragraph}>
            NEUVIS was developed by a dedicated team of Computer Science students from the New Era University:
          </Text>
          <Text style={styles.listItem}>• Pia Macalanda - Lead Developer</Text>
          <Text style={styles.listItem}>• Jaime III Dy - Backend Developer & Security Specialist</Text>
          <Text style={styles.listItem}>• Aliyah Llana - UI/UX Designer</Text>
          <Text style={styles.listItem}>• Leo Rentazida - UI/UX Designer</Text>
          <Text style={styles.listItem}>• JLyrine Poliarco - Database Analyst</Text>
          <Text style={styles.listItem}>• Prof. Jeremias Esperanza - Project Advisor</Text>
          <Text style={styles.paragraph}>
            The development team adheres to best practices in software development, 
            data security, and privacy protection in the creation and maintenance of this application.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contact}>New Era University</Text>
          <Text style={styles.contact}>No. 9 Central Avenue, New Era, Quezon City</Text>
          <Text style={styles.contact}>Email: privacy@neu.edu.ph</Text>
          <Text style={styles.contact}>Phone: (02) 8981-4221</Text>
          
          <View style={styles.footerContainer}>
            <Footer />
          </View>
        </ScrollView>
      </SafeAreaView>
      </>
  );
}

