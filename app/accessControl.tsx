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
    admin1: { name: 'Maria Posada', role: 'Admin 1', type: 'Admin' },
    host1: { name: 'Juan dela Cruz', role: 'Security 1', gate: 'Main Gate', type: 'Security' },
    host2: { name: 'Cardo Dalisay', role: 'Security 2', gate: 'Back Gate', type: 'Security' },
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

      {/* Admin Panel */}
      <View style={styles.adminPanel}>
        <Text style={styles.adminTitle}>Administrator</Text>
        <View style={styles.adminPane}>
          <Text style={styles.officerName}>{userAccess.admin1.name}</Text>
          <Text style={styles.label}>Role</Text>
          <Picker
            selectedValue={userAccess.admin1.role}
            onValueChange={(value) =>
              setUserAccess((prev) => ({
                ...prev,
                admin1: { ...prev.admin1, role: value },
              }))
            }
            style={styles.picker}
          >
            {adminRoles.map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>
        </View>
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

      {Object.keys(userAccess).filter((id) => id !== 'admin1').map((userId) => (
        <View key={userId} style={styles.userPane}>
          <View style={styles.userPaneHeader}>
            <Text style={styles.officerName}>{userAccess[userId].name}</Text>
            <TouchableOpacity onPress={() => removeUser(userId)}>
              <Ionicons name="trash-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
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
  adminPanel: {
    backgroundColor: 'lightblue',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  adminPane: {
    backgroundColor: 'lightblue',
    padding: 15,
    borderRadius: 10,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  addUserContainer: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  picker: {
    backgroundColor: colors.background,
    marginVertical: 5,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  userPane: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  userPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
