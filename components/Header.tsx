import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from '../components/logo';
import { Ionicons } from '@expo/vector-icons';

// Define props for flexibility
interface HeaderProps {
  role?: string; // e.g., "Administrator" or "Security Guard"
  name?: string; // e.g., "Admin 1" or "Main Entrance"
}

const Header: React.FC<HeaderProps> = ({ role = "Security Guard", name = "Main Entrance" }) => {
  return (
    <View style={styles.container}>
      {/* Left Side: Logo & Title */}
      <View style={styles.left}>
        <Logo size="small" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            <Text style={styles.bold}>NEUVIS</Text>
          </Text>
          <Text style={styles.subtitle}>Visitor Identification System</Text>
        </View>
      </View>

      {/* Right Side: Dynamic User Info */}
      <View style={styles.right}>
        <Ionicons name="person-outline" size={20} color="black" />
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>{role}</Text>
          <Text style={styles.userSubtitle}>{name}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 5,
  },
  userTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});

export default Header;
