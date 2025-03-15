import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { supabase } from './lib/supabaseClient';
import typography from '@/components/typography';
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

  const removeUser = async (userId: string) => {
    const { error } = await supabase.from('admins').delete().eq('user_id', userId);
    if (!error) {
      setAdmins((prev) => prev.filter((a) => a.user_id !== userId));
    }
  };

  const removeSecurity = async (securityId: string) => {
    const { error } = await supabase.from('security').delete().eq('id', securityId);
    if (!error) {
      setSecurity((prev) => prev.filter((s) => s.id !== securityId));
    }
  };

  const updateAdminRole = async (id: string, newRole: adminType) => {
    setAdmins((prev) => prev.map((entry) => (entry.user_id === id ? { ...entry, role_admin: newRole } : entry)));

    const { error } = await supabase.from('admins').update({ role_admin: newRole }).eq('user_id', id);
    if (error) fetchAdmins();
  };

  const updateRole = async (id: string, newRole: roleType) => {
    setSecurity((prev) => prev.map((entry) => (entry.id === id ? { ...entry, roles: newRole } : entry)));

    const { error } = await supabase.from('security').update({ roles: newRole }).eq('id', id);
    if (error) fetchSecurity();
  };

  const updateGate = async (id: string, newGate: gateType) => {
    setSecurity((prev) => prev.map((entry) => (entry.id === id ? { ...entry, assign_gate: newGate } : entry)));

    const { error } = await supabase.from('security').update({ assign_gate: newGate }).eq('id', id);
    if (error) fetchSecurity();
  };

  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control" />

      <Text style={styles.sectionTitle}>Administrator</Text>
      {admins.map((admin) => (
        <View key={admin.user_id} style={styles.adminCard}>
          <Text style={styles.adminName}>{admin.full_name}</Text>
          <Text style={styles.label}>Role</Text>
          <Picker
            selectedValue={admin.role_admin || adminRoles[0]}
            onValueChange={(value) => updateAdminRole(admin.user_id, value)}
            style={styles.picker}
          >
            {adminRoles.map((role) => (
              <Picker.Item key={role} label={role} value={role} />
            ))}
          </Picker>
        </View>
      ))}

      {/* Security Officers Section */}
      <Text style={styles.sectionTitle}>Security Officers</Text>
      {security.length === 0 ? (
        <Text style={styles.noData}>No security personnel found.</Text>
      ) : (
        security.map((entry, index) => (
          <View key={entry.id} style={styles.userPane}>
            <View style={styles.userPaneHeader}>
              <Text style={styles.userName}>
                {index + 1}. {entry.full_name}
              </Text>
              <TouchableOpacity onPress={() => removeSecurity(entry.id)}>
                <Ionicons name="trash-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Role</Text>
            <Picker
              selectedValue={entry.roles || roles[0]}
              onValueChange={(value: roleType) => updateRole(entry.id, value)}
              style={styles.picker}
            >
              {roles.map((role) => (
                <Picker.Item key={role} label={role} value={role} />
              ))}
            </Picker>

            <Text style={styles.label}>Assigned Gate</Text>
            <Picker
              selectedValue={entry.assign_gate || gates[0]}
              onValueChange={(value: string) => updateGate(entry.id, value as gateType)}
              style={styles.picker}
            >
              {gates.map((gate) => (
                <Picker.Item key={gate} label={gate} value={gate} />
              ))}
            </Picker>
          </View>
        ))
      )}
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
    backgroundColor: 'lightblue',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  adminName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  userPane: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
    paddingVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
  },
});