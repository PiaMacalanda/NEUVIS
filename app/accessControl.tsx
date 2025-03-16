import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { supabase } from './lib/supabaseClient';  // Ensure correct import path
import { useNavigation } from 'expo-router';
import { colors } from '@/components/colors';

const roles = ['SC001', 'SC002', 'SC003'];
const gates = ['Gate 1', 'Gate 2'];
const adminRoles = ['AD001', 'AD002', 'AD003'];

type roleType = 'SC001' | 'SC002' | 'SC003';
type adminType = 'AD001' | 'AD002' | 'AD003';
type gateType = 'Gate 1' | 'Gate 2';

type Admin = {
  user_id: string;
  full_name: string;
  email: string;
  role_admin: adminType;
};

type Security = {
  id: string;
  full_name: string;
  roles: roleType;
  assign_gate: gateType | null;
};

export default function AccessControlScreen() {
  const [security, setSecurity] = useState<Security[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<roleType>('SC001');
  const [selectedGate, setSelectedGate] = useState<gateType>('Gate 1');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurity();
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admins').select('*');
    if (error) {
      Alert.alert('Error', 'Failed to fetch admins.');
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  const fetchSecurity = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('security').select('id, full_name, roles, assign_gate');
    if (error) {
      Alert.alert('Error', 'Failed to fetch security personnel.');
    } else {
      setSecurity(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (full_name.trim() === '' || email.trim() === '') {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      // Include the required fields in your insert
      const { data, error } = await supabase.from('security').insert([{ 
        full_name, 
        email,
        roles: selectedRole,
        assign_gate: selectedGate
      }]);

      if (error) {
        console.error('Supabase Error:', error.message);
        setFormError(`Error adding new security personnel: ${error.message}`);
        return;
      }

      setFormError(null);
      setFullName('');
      setEmail('');
      setSelectedRole('SC001');
      setSelectedGate('Gate 1');
      fetchSecurity();
      Alert.alert('Success', 'Security personnel added successfully!');
    } catch (err) {
      console.error('Unexpected Error:', err);
      setFormError('An unexpected error occurred.');
    }
  };

  const removeAdmin = async (userId: string) => {
    const { error } = await supabase.from('admins').delete().eq('user_id', userId);
    if (!error) {
      fetchAdmins();
    }
  };

  const removeSecurity = async (securityId: string) => {
    const { error } = await supabase.from('security').delete().eq('id', securityId);
    if (!error) {
      fetchSecurity();
    }
  };

  const updateAdminRole = async (id: string, newRole: adminType) => {
    const { error } = await supabase.from('admins').update({ role_admin: newRole }).eq('user_id', id);
    if (!error) fetchAdmins();
  };

  const updateSecurityRole = async (id: string, newRole: roleType) => {
    const { error } = await supabase.from('security').update({ roles: newRole }).eq('id', id);
    if (!error) fetchSecurity();
  };

  const updateGateAssignment = async (id: string, newGate: gateType) => {
    const { error } = await supabase.from('security').update({ assign_gate: newGate }).eq('id', id);
    if (!error) fetchSecurity();
  };

  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control Panel" />

      {/* Admin Panel */}
      <Text style={styles.sectionTitle}>Admin Panel</Text>
      {admins.map((admin) => (
        <View key={admin.user_id} style={styles.adminCard}>
          <Text style={styles.adminName}>{admin.full_name}</Text>
          <Text style={styles.label}>Role</Text>
          <Picker selectedValue={admin.role_admin} onValueChange={(value) => updateAdminRole(admin.user_id, value)} style={styles.picker}>
            {adminRoles.map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>
          {/* <TouchableOpacity onPress={() => removeAdmin(admin.user_id)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity> */}
        </View>
      ))}

      {/* Add Security Personnel */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Security Personnel</Text>
        <TextInput style={styles.input} value={full_name} onChangeText={setFullName} placeholder="Enter full name" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address" />
        
        <Text style={styles.label}>Select Role</Text>
        <Picker
          selectedValue={selectedRole}
          onValueChange={(value) => setSelectedRole(value)}
          style={styles.picker}
        >
          {roles.map((role) => (
            <Picker.Item key={role} label={role} value={role} />
          ))}
        </Picker>
        
        <Text style={styles.label}>Assign Gate</Text>
        <Picker
          selectedValue={selectedGate}
          onValueChange={(value) => setSelectedGate(value)}
          style={styles.picker}
        >
          {gates.map((gate) => (
            <Picker.Item key={gate} label={gate} value={gate} />
          ))}
        </Picker>
        
        <Button title="Add Security Personnel" onPress={handleSubmit} />
        {formError && <Text style={styles.error}>{formError}</Text>}
      </View>

      {/* Security Personnel List */}
      <Text style={styles.sectionTitle}>Security Personnel</Text>
      {security.map((entry) => (
        <View key={entry.id} style={styles.userPane}>
          <View style={styles.userPaneHeader}>
            <Text style={styles.userName}>{entry.full_name}</Text>
            <TouchableOpacity onPress={() => removeSecurity(entry.id)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Role</Text>
          <Picker selectedValue={entry.roles} onValueChange={(value) => updateSecurityRole(entry.id, value)} style={styles.picker}>
            {roles.map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>
          <Text style={styles.label}>Assigned Gate</Text>
          <Picker selectedValue={entry.assign_gate || 'Gate 1'} onValueChange={(value) => updateGateAssignment(entry.id, value)} style={styles.picker}>
            {gates.map((gate) => (
              <Picker.Item key={gate} label={gate} value={gate} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adminCard: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  adminName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
  },
  userPane: {
    backgroundColor: '#e2e2e2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  userPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});