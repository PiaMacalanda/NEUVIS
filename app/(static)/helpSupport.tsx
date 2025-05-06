import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FooterFull from '@/components/FooterFull';

const HelpSupport = () => {
  const faqs = [
    {
      question: 'What if the visitor forgot their ID?',
      answer: 'Use "Manually Log Visitor Entry" to input their details manually.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click “Reset Password” on the login page and follow the instructions sent to your NEU email.'
    },
    {
      question: 'Can I access old visitor logs?',
      answer: 'Yes. Use "View Visitor Log History" or "Search Visitor Logs" under Visitor Records Management.'
    },
    {
      question: 'Who can activate or deactivate user accounts?',
      answer: 'Only Superadmins can activate or deactivate security and admin accounts.'
    },
    {
      question: 'How do I contact an expired visitor?',
      answer: 'Use "Copy Visitor\'s Phone Number" in the Visitor Checkout Processing section.'
    },
    {
      question: "I created a security account and confirmed my email, but I still can't log in. Why?",
      answer: 'After email confirmation, you must wait for Admin approval before gaining access to NEUVIS.'
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Help & Support</Text>

      <Text style={styles.subheading}>Frequently Asked Questions</Text>
      {faqs.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Ionicons name="help-circle-outline" size={20} color="#003566" />
          <View style={styles.faqText}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.subheading}>For Queries and Concerns</Text>
      <TouchableOpacity 
        style={styles.contactItem} 
        onPress={() => Linking.openURL('mailto:admin@neu.edu.ph')}
      >
        <MaterialIcons name="admin-panel-settings" size={18} color="#003566" />
        <Text style={styles.contactText}>Email Admin: admin@neu.edu.ph</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.contactItem} 
        onPress={() => Linking.openURL('mailto:piav.macalanda@gmail.com')}
      >
        <Ionicons name="mail-outline" size={18} color="#003566" />
        <Text style={styles.contactText}>Email Developers: piav.macalanda@gmail.com</Text>
      </TouchableOpacity>
      <FooterFull />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003566',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#252525',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  faqText: {
    marginLeft: 10,
    flex: 1,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#252525',
  },
  answer: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#003566',
    textDecorationLine: 'underline',
  },
});

export default HelpSupport;
