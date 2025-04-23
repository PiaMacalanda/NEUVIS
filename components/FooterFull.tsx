import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import Footer from './Footer';

type AuthorProps = {
  name: string;
  role: string;
  imageUrl?: string;
  githubUrl?: string;
};

const Author: React.FC<AuthorProps> = ({ name, role, imageUrl, githubUrl }) => {
  const handleNamePress = () => {
    if (githubUrl) {
      Linking.openURL(githubUrl);
    }
  };  

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
        <TouchableOpacity onPress={handleNamePress}>
          <Text style={[styles.authorName, {color: '#4a89dc'}]}>{name}</Text>
        </ TouchableOpacity>
        <Text style={styles.authorRole}>{role}</Text>
      </View>
    </View>
  );
};

export default function FooterFull() {
  
  const authors = [
    { name: "Pia Katleya Macalanda", role: "Scrum Master & Lead Developer", githubUrl: 'https://github.com/PiaMacalanda', imageUrl: "https://static.wikia.nocookie.net/brainrotnew/images/b/bb/Espressora_Signora.jpg/revision/latest?cb=20250422100132" },
    { name: "Jaime III Dy", role: "Backend Developer & Security Specialist", githubUrl: "https://github.com/JaimeDyIII", imageUrl: "https://static.wikia.nocookie.net/brainrotnew/images/e/e3/Bombini_Gusini.jpg/revision/latest?cb=20250416185048" },
    { name: "Leo Gabriel Rentazida", role: "UI/UX Designer", githubUrl: "https://github.com/Doc-Leo", imageUrl: "https://media1.tenor.com/m/riuW5lq1bt0AAAAC/tralalero-tralala.gif" },
    { name: "Aliyah Aira Llana", role: "UI/UX Designer", githubUrl: "https://github.com/AliyahAira", imageUrl: "https://th.bing.com/th/id/OIF.HN1FQwewVhjXJE79r2ZXxw?rs=1&pid=ImgDetMain" },
    { name: "Lyrine Poliarco", role: "Database Analyst", githubUrl: "https://github.com/LyrinePoliarco", imageUrl: "https://static.wikia.nocookie.net/brainrotnew/images/3/37/CrocoPotato.jpg/revision/latest?cb=20250415130348" },
    { name: "Angelica Toquero", role: "Database Analyst", githubUrl: "https://github.com/AngelicaToquero",imageUrl: "https://static.wikia.nocookie.net/brainrotnew/images/3/38/Hq720.jpg/revision/latest?cb=20250405141658" },
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
          <TouchableOpacity onPress={() => router.push('/privacy')}>
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
              githubUrl={author.githubUrl}
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