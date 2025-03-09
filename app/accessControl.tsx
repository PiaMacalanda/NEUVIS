import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Button, colors, typography } from '../components';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type UserType = 'Security' | 'Admin';

type UserAccessType = {
  [key: string]: { name: string; role: string; gate?: string; type: UserType };
};

export default function AccessControlScreen() {
  const router = useRouter();
  const [userAccess, setUserAccess] = useState<UserAccessType>({
    host1: { name: 'Juan dela Cruz', role: 'Security 1', gate: 'Main Gate', type: 'Security' },
    host2: { name: 'Cardo Dalisay', role: 'Security 2', gate: 'Back Gate', type: 'Security' },
    admin1: { name: 'Maria Posada', role: 'Admin 1', type: 'Admin' },
  });
  const [newUserType, setNewUserType] = useState<UserType>('Security');
  const [newUserName, setNewUserName] = useState('');

  const gates = ['Main Gate', 'Back Gate', 'Side Entrance'];
  const securityRoles = ['Security 1', 'Security 2', 'Security 3', 'Security 4'];
  const adminRoles = ['Admin 1', 'Admin 2', 'Admin 3', 'Admin 4'];

  const removeUser = (userId: string) => {
    setUserAccess((prev) => {
      const updatedUsers = { ...prev };
      delete updatedUsers[userId];
      return updatedUsers;
    });
  };

  const addUser = () => {
    if (!newUserName.trim()) return;
    const newUserId = `user${Object.keys(userAccess).length + 1}`;
    setUserAccess((prev) => ({
      ...prev,
      [newUserId]: {
        name: newUserName,
        role: newUserType === 'Security' ? 'Security 1' : 'Admin 1',
        gate: newUserType === 'Security' ? 'Main Gate' : undefined,
        type: newUserType,
      },
    }));
    setNewUserName('');
  };

  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control" />

      <View style={styles.header}>
        <Text style={[typography.header.h1, styles.title]}>Access Control</Text>
      </View>

      {/* Add User Section */}
      <View style={styles.addUserContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter user name"
          value={newUserName}
          onChangeText={setNewUserName}
        />
        <Picker selectedValue={newUserType} onValueChange={setNewUserType} style={styles.picker}>
          <Picker.Item label="Security Officer" value="Security" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        <Button title="Add User" onPress={addUser} />
      </View>

      {Object.keys(userAccess).map((userId) => (
        <View key={userId} style={styles.userPane}>
          {/* Header Row with Name and Trash Icon */}
          <View style={styles.userPaneHeader}>
            <Text style={styles.officerName}>{userAccess[userId].name}</Text>
            <TouchableOpacity onPress={() => removeUser(userId)}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Role Picker */}
          <Text style={styles.label}>Role</Text>
          <Picker
            selectedValue={userAccess[userId].role}
            onValueChange={(value) =>
              setUserAccess((prev) => ({
                ...prev,
                [userId]: { ...prev[userId], role: value },
              }))
            }
            style={styles.picker}
          >
            {(userAccess[userId].type === 'Security' ? securityRoles : adminRoles).map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>

          {/* Assigned Gate Picker (Only for Security) */}
          {userAccess[userId].type === 'Security' && (
            <>
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
            </>
          )}
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
  addUserContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.text.light,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
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
