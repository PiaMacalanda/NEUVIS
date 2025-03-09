import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, colors, typography } from '../components';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type UserAccessType = {
  [key: string]: { gate: string; role: string };
};

export default function AccessControlScreen() {
  const router = useRouter();
  const [userAccess, setUserAccess] = useState<UserAccessType>({
    host1: { gate: 'Main Gate', role: 'Host 1' },
    host2: { gate: 'Back Gate', role: 'Host 2' },
  });

  const gates = ['Main Gate', 'Back Gate', 'Side Entrance'];
  const roles = ['Host 1', 'Host 2', 'Host 3', 'Admin 1', 'Admin 2'];

  const removeUser = (userId: string) => {
    setUserAccess((prev) => {
      const updatedUsers = { ...prev };
      delete updatedUsers[userId];
      return updatedUsers;
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control" />

      <View style={styles.header}>
        <Text style={[typography.header.h1, styles.title]}>Access Control</Text>
      </View>

      {Object.keys(userAccess).map((userId) => (
        <View key={userId} style={styles.userPane}>
          {/* Header Row with Name and Trash Icon */}
          <View style={styles.userPaneHeader}>
            <Text style={styles.officerName}>
              {userId === 'host1' ? 'Officer Juan Martinez' : 'Officer Maria Sta Jose'}
            </Text>
            <TouchableOpacity onPress={() => removeUser(userId)}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Assigned Gate Picker */}
          <Text style={styles.label}>Assigned Gate</Text>
          <Picker
            selectedValue={userAccess[userId]?.gate}
            onValueChange={(value) =>
              setUserAccess((prev) => ({
                ...prev,
                [userId]: { ...prev[userId], gate: value },
              }))
            }
            style={styles.picker}
          >
            {gates.map((gate) => (
              <Picker.Item key={gate} label={gate} value={gate} />
            ))}
          </Picker>

          {/* Access Level Picker */}
          <Text style={styles.label}>Access Level</Text>
          <Picker
            selectedValue={userAccess[userId]?.role}
            onValueChange={(value) =>
              setUserAccess((prev) => ({
                ...prev,
                [userId]: { ...prev[userId], role: value },
              }))
            }
            style={styles.picker}
          >
            {roles.map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
  },
  userPane: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  userPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.light,
  },
  picker: {
    backgroundColor: colors.background,
    marginVertical: 5,
  },
});

