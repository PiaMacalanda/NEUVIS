import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Button } from '../components';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Admin = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Custom Header for Administrator */}
      <Header role="Administrator" name="Admin 1" />

      {/* Admin Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Ionicons name="shield-outline" size={50} color="black" />
        <Text style={styles.welcomeTitle}>Hello Admin</Text>
        <Text style={styles.welcomeSubtitle}>Welcome to NEUVIS Administration</Text>
      </View>

      {/* Section: Admin Dashboard Options */}
      <View style={styles.section}>
        <View style={styles.buttonGroup}>
          <Button title="Home" onPress={() => router.push('/adminHome')} />
        </View>

        <View style={styles.buttonGroup}>
          <Button title="Data" onPress={() => router.push('/adminData')} />
        </View>

        <View style={styles.buttonGroup}>
          <Button title="Saved Reports" onPress={() => router.push('/adminReport')} />
        </View>

        <View style={styles.buttonGroup}>
          <Button title="Access Control" onPress={() => router.push('/accessControl')} />
        </View>

        <View style={styles.buttonGroup}>
          <Button title="Logout" variant="outline" onPress={() => router.push('/')} />
        </View>
      </View>

      {/* New Section: Additional Message with Icon */}
      <View style={styles.messageContainer}>
        <Ionicons name="information-circle-outline" size={24} color="gray" />
        <Text style={styles.messageText}>
          Ensure all visitor logs are reviewed before logging out.
        </Text>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  section: {
    marginTop: 20,
    alignItems: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
  },
  messageContainer: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default Admin;
