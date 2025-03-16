// accessControl.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Header from '../components/Header'; // Correct path
import Button from '../components/buttons'; // Correct path
import * as themeColors from '@components/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const colors = {
  background: '#f5f5f5',
  primary: '#3498db',
  secondary: '#e6f2f9', // Added for panel backgrounds
  accent: '#2980b9',    // Added for highlights
  border: '#d9e6f2',    // Added for borders
  text: { 
    light: '#fff',
    dark: '#333',
    gray: '#666'
  }
};

// Define typography styles with correct fontWeight types
const typography = {
  header: {
    h1: {
      fontSize: 24,
      fontWeight: 'bold' as const, // Type assertion to specific string literal
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold' as const,
    }
  },
  body: {
    regular: {
      fontSize: 16,
      lineHeight: 22,
    },
    small: {
      fontSize: 14,
      lineHeight: 18,
    }
  }
};

type UserType = 'Security' | 'Admin';
type UserAccessType = {
  [key: string]: { name: string; role: string; gate?: string; type: UserType };
};

export default function AccessControlScreen() {
  const [userAccess, setUserAccess] = useState<UserAccessType>({
    admin1: { name: 'Maria Posada', role: 'Admin 1', type: 'Admin' },
    host1: { name: 'Juan dela Cruz', role: 'Security 1', gate: 'Main Gate', type: 'Security' },
    host2: { name: 'Cardo Dalisay', role: 'Security 2', gate: 'Back Gate', type: 'Security' },
  });
  const [newUserType, setNewUserType] = useState<UserType>('Security');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Security 1');
  const [newUserGate, setNewUserGate] = useState('Main Gate');
  
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
    
    // Generate a unique ID based on type and timestamp for better uniqueness
    const newUserId = `${newUserType.toLowerCase()}_${Date.now()}`;
    
    setUserAccess((prev) => ({
      ...prev,
      [newUserId]: {
        name: newUserName,
        role: newUserType === 'Security' ? newUserRole : newUserRole,
        gate: newUserType === 'Security' ? newUserGate : undefined,
        type: newUserType,
      },
    }));
    
    // Reset form fields after adding
    setNewUserName('');
    setNewUserRole(newUserType === 'Security' ? 'Security 1' : 'Admin 1');
    setNewUserGate('Main Gate');
  };
  
  // Update role options when user type changes
  React.useEffect(() => {
    if (newUserType === 'Security') {
      setNewUserRole('Security 1');
    } else {
      setNewUserRole('Admin 1');
    }
  }, [newUserType]);
  
  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control" />
      
      <View style={styles.header}>
        <Text style={[typography.header.h1, styles.title]}>Access Control</Text>
      </View>
      
      {/* Admin Panel Section - Existing Admin */}
      <View style={styles.panelContainer}>
        <Text style={styles.sectionTitle}>Administrator</Text>
        <View style={styles.adminPane}>
          <Text style={styles.officerName}>{userAccess.admin1.name}</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userAccess.admin1.role}
                onValueChange={(value) =>
                  setUserAccess((prev) => ({
                    ...prev,
                    admin1: { ...prev.admin1, role: value },
                  }))
                }
                style={styles.picker}
                dropdownIconColor={colors.text.dark}
              >
                {adminRoles.map((role) => (
                  <Picker.Item 
                    key={role} 
                    label={role} 
                    value={role} 
                    style={styles.pickerItem} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>
      
      {/* Add User Section */}
      <View style={styles.panelContainer}>
        <Text style={styles.sectionTitle}>Add New User</Text>
        <View style={styles.addUserContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter user name"
              value={newUserName}
              onChangeText={setNewUserName}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>User Type</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={newUserType} 
                onValueChange={(value) => setNewUserType(value as UserType)} 
                style={styles.picker}
                dropdownIconColor={colors.text.dark}
              >
                <Picker.Item label="Security Officer" value="Security" style={styles.pickerItem} />
                <Picker.Item label="Admin" value="Admin" style={styles.pickerItem} />
              </Picker>
            </View>
          </View>
          
          {/* Show role selection based on user type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={newUserRole} 
                onValueChange={(value) => setNewUserRole(value)} 
                style={styles.picker}
                dropdownIconColor={colors.text.dark}
              >
                {newUserType === 'Security' 
                  ? securityRoles.map(role => (
                      <Picker.Item key={role} label={role} value={role} style={styles.pickerItem} />
                    ))
                  : adminRoles.map(role => (
                      <Picker.Item key={role} label={role} value={role} style={styles.pickerItem} />
                    ))
                }
              </Picker>
            </View>
          </View>
          
          {/* Show gate selection only for Security type */}
          {newUserType === 'Security' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gate</Text>
              <View style={styles.pickerContainer}>
                <Picker 
                  selectedValue={newUserGate} 
                  onValueChange={(value) => setNewUserGate(value)} 
                  style={styles.picker}
                  dropdownIconColor={colors.text.dark}
                >
                  {gates.map(gate => (
                    <Picker.Item key={gate} label={gate} value={gate} style={styles.pickerItem} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          
          <TouchableOpacity style={styles.addButton} onPress={addUser}>
            <Text style={styles.buttonText}>Add User</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Administrator List */}
      <View style={styles.panelContainer}>
        <Text style={styles.sectionTitle}>Administrators</Text>
        {Object.entries(userAccess)
          .filter(([userId, user]) => user.type === 'Admin' && userId !== 'admin1')
          .map(([userId, user]) => (
            <View key={userId} style={styles.userPane}>
              <View style={styles.userPaneHeader}>
                <Text style={styles.officerName}>{user.name}</Text>
                <TouchableOpacity 
                  onPress={() => removeUser(userId)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formDivider} />
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={user.role}
                    onValueChange={(value) =>
                      setUserAccess((prev) => ({
                        ...prev,
                        [userId]: { ...prev[userId], role: value },
                      }))
                    }
                    style={styles.picker}
                    dropdownIconColor={colors.text.dark}
                  >
                    {adminRoles.map((role) => (
                      <Picker.Item key={role} label={role} value={role} style={styles.pickerItem} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          ))}
          
        {Object.entries(userAccess)
          .filter(([userId, user]) => user.type === 'Admin' && userId !== 'admin1').length === 0 && (
          <Text style={styles.emptyListText}>No additional administrators yet.</Text>
        )}
      </View>
      
      {/* Security Officers List */}
      <View style={styles.panelContainer}>
        <Text style={styles.sectionTitle}>Security Officers</Text>
        {Object.entries(userAccess)
          .filter(([_, user]) => user.type === 'Security')
          .map(([userId, user]) => (
            <View key={userId} style={styles.userPane}>
              <View style={styles.userPaneHeader}>
                <Text style={styles.officerName}>{user.name}</Text>
                <TouchableOpacity 
                  onPress={() => removeUser(userId)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formDivider} />
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={user.role}
                    onValueChange={(value) =>
                      setUserAccess((prev) => ({
                        ...prev,
                        [userId]: { ...prev[userId], role: value },
                      }))
                    }
                    style={styles.picker}
                    dropdownIconColor={colors.text.dark}
                  >
                    {securityRoles.map((role) => (
                      <Picker.Item key={role} label={role} value={role} style={styles.pickerItem} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gate</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={user.gate}
                    onValueChange={(value) =>
                      setUserAccess((prev) => ({
                        ...prev,
                        [userId]: { ...prev[userId], gate: value },
                      }))
                    }
                    style={styles.picker}
                    dropdownIconColor={colors.text.dark}
                  >
                    {gates.map((gate) => (
                      <Picker.Item key={gate} label={gate} value={gate} style={styles.pickerItem} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          ))}
          
        {Object.entries(userAccess)
          .filter(([_, user]) => user.type === 'Security').length === 0 && (
          <Text style={styles.emptyListText}>No security officers yet.</Text>
        )}
      </View>
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
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  title: {
    color: colors.text.dark,
    marginBottom: 10,
  },
  panelContainer: {
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminPane: {
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.text.dark,
    marginBottom: 12,
    paddingLeft: 4,
  },
  addUserContainer: {
    backgroundColor: '#e8e8e8',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    backgroundColor: 'white',
  },
  pickerItem: {
    fontSize: 16,
    height: 50,
    padding: 10,
  },
  officerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.text.dark,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 6,
    color: colors.text.gray,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.text.light,
    fontWeight: 'bold' as const,
    fontSize: 16,
  },
  userPane: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  removeButton: {
    padding: 4,
  },
  emptyListText: {
    color: colors.text.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  }
});