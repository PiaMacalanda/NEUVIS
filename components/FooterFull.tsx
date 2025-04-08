import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import Footer from './Footer';

type AuthorProps = {
  name: string;
  role: string;
  imageUrl?: string;
};

const Author: React.FC<AuthorProps> = ({ name, role, imageUrl }) => {
  return (
    <View style={styles.authorContainer}>
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.authorImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.authorInfo}>
        <Text style={styles.authorName}>{name}</Text>
        <Text style={styles.authorRole}>{role}</Text>
      </View>
    </View>
  );
};

export default function FooterFull() {
  const currentYear = new Date().getFullYear();
  
  const handlePrivacyPress = () => {
    Linking.openURL('https://your-privacy-policy-url.com');
  };
  
  const handleTermsPress = () => {
    Linking.openURL('https://your-terms-of-service-url.com');
  };

  const authors = [
    { name: "Pia Katleya Macalanda", role: "Scrum Master & Lead Developer", imageUrl: "https://via.placeholder.com/50" },
    { name: "Jaime III Dy", role: "Backend Developer & Security Specialist", imageUrl: "https://via.placeholder.com/50" },
    { name: "Leo Gabriel Rentazida", role: "UI/UX Designer", imageUrl: "https://via.placeholder.com/50" },
    { name: "Aliyah Aira Llan", role: "UI/UX Designer", imageUrl: "https://via.placeholder.com/50" },
    { name: "Lyrine Poliarco", role: "Database Analyst", imageUrl: "https://via.placeholder.com/50" },
    { name: "Angelica Toquero", role: "Database Analyst", imageUrl: "https://via.placeholder.com/50" },
  ];

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>NEUVIS</Text>
          <Text style={styles.footerSubtext}>Innovative solutions for tomorrow's challenges</Text>
        </View>
        
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>Contact</Text>
          <Text style={styles.footerText}>info@neuvis.com</Text>
          <Text style={styles.footerText}>+1 (555) 123-4567</Text>
        </View>
        
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>Links</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTermsPress}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.aboutSection}>
        <Text style={styles.footerHeading}>About Nameless</Text>
        <View style={styles.authorsGrid}>
          {authors.map((author, index) => (
            <Author 
              key={index}
              name={author.name}
              role={author.role}
              imageUrl={author.imageUrl}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.divider} />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  footerSection: {
    marginBottom: 30,
    minWidth: 180,
  },
  footerHeading: {
    color: '#252525',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  footerSubtext: {
    color: '#252525',
    fontSize: 12,
    opacity: 0.8,
    maxWidth: 200,
  },
  footerText: {
    color: '#252525',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  footerLink: {
    color: '#4a89dc',
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  aboutSection: {
    marginVertical: 8,
  },
  authorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 16,
    minWidth: 180,
  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  authorInfo: {
    justifyContent: 'center',
  },
  authorName: {
    color: '#252525',
    fontSize: 14,
    fontWeight: '600',
  },
  authorRole: {
    color: '#252525',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});