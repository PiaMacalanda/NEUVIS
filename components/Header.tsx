
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from './logo'; // Make sure this path is correct
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  role?: string;
  name?: string;
}

const Header: React.FC<HeaderProps> = ({ role = "Security Guard 1", name = "Main Gate" }) => {
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

      {/* Right Side: Security Guard Info */}
      <View style={styles.right}>
        <Ionicons name="person-outline" size={20} color="black" />
        <View style={styles.guardInfo}>
          <Text style={styles.guardTitle}>{role}</Text>
          <Text style={styles.guardSubtitle}>{name}</Text>
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

    //paddingHorizontal: 10, // Optional: Add horizontal padding for spacing
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
  guardInfo: {
    marginLeft: 5,
  },
  guardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  guardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});

export default Header;