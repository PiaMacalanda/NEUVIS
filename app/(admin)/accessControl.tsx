import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { colors } from '@/components/colors';
import supabase from '../lib/supabaseClient';

const roles = ['SC001', 'SC002', 'SC003'];
const gates = ['Main Gate', 'Back Gate'];

type roleType = 'SC001' | 'SC002' | 'SC003';
type gateType = 'Main Gate' | 'Back Gate';

type Security = {
  id: string;
  full_name: string;
  email: string;
  roles: roleType;
  assign_gate: gateType | null;
  active: boolean;
};

export default function AccessControlScreen() {
  const [security, setSecurity] = useState<Security[]>([]);
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<roleType>('SC001');
  const [selectedGate, setSelectedGate] = useState<gateType>('Main Gate');
  const [formError, setFormError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUser, setEditUser] = useState<Security | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Fetch security personnel from Supabase
  useEffect(() => {
    fetchSecurityPersonnel();
  }, []);

  const fetchSecurityPersonnel = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('security').select('*');
      
      if (error) {
        console.error('Error fetching security personnel:', error);
        Alert.alert('Error', 'Failed to load security personnel. Please try again.');
        return;
      }
      
     
      const validData = data?.map(item => ({
        ...item,
        // Set default values for any missing fields
        active: item.active !== undefined ? item.active : false,
        assign_gate: item.assign_gate || 'Main Gate',
        roles: item.roles || 'SC001',
      })) || [];
      
      setSecurity(validData);
    } catch (err) {
      console.error('Exception fetching security personnel:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (name: string, userEmail: string) => {
    if (!name.trim()) {
      return 'Full name is required.';
    }
    
    if (!userEmail.trim()) {
      return 'Email is required.';
    }
    
    if (!userEmail.trim().endsWith('@neu.edu.ph')) {
      return 'Only @neu.edu.ph email addresses are allowed.';
    }
    
    return null;
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('security')
        .update({ active: !currentActive })
        .eq('id', id);
      
      if (error) {
        console.error('Error toggling active status:', error);
        Alert.alert('Error', `Failed to update status: ${error.message}`);
        return;
      }

      // Update local state if Supabase update was successful
      setSecurity(prev =>
        prev.map(user =>
          user.id === id ? { ...user, active: !currentActive } : user
        )
      );
    } catch (err) {
      console.error('Exception toggling active status:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleEditUser = (user: Security) => {
    setEditUser({ ...user });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editUser) {
      try {
        setIsEditLoading(true);
        setFormError(null);

        // Validate form inputs
        const error = validateForm(editUser.full_name, editUser.email);
        if (error) {
          setFormError(error);
          setIsEditLoading(false);
          return;
        }

        // Update in Supabase
        const { error: supabaseError } = await supabase
          .from('security')
          .update({
            full_name: editUser.full_name,
            email: editUser.email,
            roles: editUser.roles,
            assign_gate: editUser.assign_gate,
           
            active: editUser.active
          })
          .eq('id', editUser.id);
        
        if (supabaseError) {
          console.error('Error updating security personnel:', supabaseError);
      
          if (supabaseError.code === '23505') {
            setFormError('A user with this email already exists.');
          } else {
            setFormError('Failed to update personnel: ' + supabaseError.message);
          }
          setIsEditLoading(false);
          return;
        }

        setSecurity(prev => prev.map(user => 
          user.id === editUser.id ? editUser : user
        ));
        
        setEditModalVisible(false);
        setFormError(null);
        Alert.alert('Success', 'Personnel updated successfully!');
      } catch (err) {
        console.error('Exception updating security personnel:', err);
        setFormError('An unexpected error occurred. Please try again.');
      } finally {
        setIsEditLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setFormError(null);
      
      const error = validateForm(full_name, email);
      if (error) {
        setFormError(error);
        setIsLoading(false);
        return;
      }
      

      const newUser = {
        full_name,
        email,
        roles: selectedRole,
        assign_gate: selectedGate,
        active: false 
      };
      
      // Insert into Supabase
      const { data, error: supabaseError } = await supabase
        .from('security')
        .insert([newUser])
        .select();
      
      if (supabaseError) {
        console.error('Error adding security personnel:', supabaseError);
        
       
        if (supabaseError.code === '23505') {
          setFormError('A user with this email already exists.');
        } else if (supabaseError.message.includes('active')) {
          // Handle the specific 'active' column error
          setFormError('Failed to add personnel: Could not find the "active" column. Make sure your database schema is updated.');
        } else {
          setFormError('Failed to add personnel: ' + supabaseError.message);
        }
        setIsLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        setFormError('Failed to add personnel: No data returned from server.');
        setIsLoading(false);
        return;
      }
      
   
      setSecurity(prevSecurity => [...prevSecurity, { ...newUser, id: data[0].id }]);
      
      
      setFullName('');
      setEmail('');
      setSelectedRole('SC001');
      setSelectedGate('Main Gate');
      
    
      Alert.alert('Success', 'Security personnel added successfully!');
    } catch (err) {
      console.error('Exception adding security personnel:', err);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
   
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this security personnel?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const { error } = await supabase
                .from('security')
                .delete()
                .eq('id', id);
              
              if (error) {
                console.error('Error deleting user:', error);
                Alert.alert('Error', 'Failed to delete user. Please try again.');
                return;
              }
              
              // Update local state
              setSecurity(prev => prev.filter(user => user.id !== id));
              Alert.alert('Success', 'Security personnel deleted successfully!');
            }
          }
        ]
      );
    } catch (err) {
      console.error('Exception deleting user:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };


  const CustomDropdown = ({ 
    selectedValue, 
    onValueChange, 
    items, 
    label 
  }: { 
    selectedValue: string, 
    onValueChange: (value: string) => void, 
    items: string[], 
    label: string 
  }) => {
    return (
      <View style={styles.dropdownContainer}>
        {label && <Text style={styles.dropdownLabel}>{label}</Text>}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            mode="dropdown"
          >
            {items.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  // Filter security personnel based on their active status
  const filteredSecurity = security.filter(entry => showInactive || entry.active);
  const activeCount = security.filter(entry => entry.active).length;

  return (
    <ScrollView style={styles.container}>
      <Header role="Administrator" name="Access Control Panel" />

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Security Personnel</Text>
        <TextInput 
          style={styles.input} 
          value={full_name} 
          onChangeText={setFullName} 
          placeholder="Enter full name" 
        />
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Enter email" 
          keyboardType="email-address"
          autoCapitalize="none" 
        />
        <CustomDropdown
          label="Assign Role:"
          selectedValue={selectedRole}
          onValueChange={(value) => setSelectedRole(value as roleType)}
          items={roles}
        />
        <CustomDropdown
          label="Assign Gate:"
          selectedValue={selectedGate}
          onValueChange={(value) => setSelectedGate(value as gateType)}
          items={gates}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.addButtonText}>Add Personnel</Text>
          )}
        </TouchableOpacity>
        {formError && <Text style={styles.error}>{formError}</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Security Personnel ({activeCount} active / {security.length} total)</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Show Inactive</Text>
          <Switch 
            value={showInactive} 
            onValueChange={setShowInactive}
            trackColor={{ false: "#d3d3d3", true: "#81b0ff" }}
            thumbColor={showInactive ? "#007bff" : "#f4f3f4"}
          />
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#00a824" />
          <Text style={styles.emptyText}>Loading personnel data...</Text>
        </View>
      ) : filteredSecurity.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {security.length === 0 ? 
              "No security personnel found. Add new personnel using the form above." : 
              "No active personnel found. Toggle 'Show Inactive' to view inactive personnel."}
          </Text>
        </View>
      ) : (
        filteredSecurity.map((entry) => (
          <View 
            key={entry.id} 
            style={[
              styles.userPane, 
              entry.active ? styles.activeUserPane : styles.inactiveUserPane
            ]}
          >
            <View style={styles.userDetails}>
              <Text 
                style={[
                  styles.userName, 
                  entry.active ? styles.activeUserText : styles.inactiveUserText
                ]}
              >
                {entry.full_name}
              </Text>
              <Text 
                style={[
                  styles.userEmail, 
                  entry.active ? styles.activeUserText : styles.inactiveUserText
                ]}
              >
                {entry.email}
              </Text>
              <Text 
                style={[
                  styles.userRole, 
                  entry.active ? styles.activeUserText : styles.inactiveUserText
                ]}
              >
                Role: {entry.roles}
              </Text>
              <Text 
                style={[
                  styles.userGate, 
                  entry.active ? styles.activeUserText : styles.inactiveUserText
                ]}
              >
                Gate: {entry.assign_gate}
              </Text>
              
              {/* Status badge */}
              <View style={[
                styles.statusBadge,
                entry.active ? styles.activeBadge : styles.inactiveBadge
              ]}>
                <Text style={styles.statusBadgeText}>
                  {entry.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity 
                onPress={() => handleToggleActive(entry.id, entry.active)} 
                style={[
                  styles.statusButton, 
                  entry.active ? styles.activeStatus : styles.inactiveStatus
                ]}
              >
                <Text style={styles.statusText}>
                  {entry.active ? 'Set Inactive' : 'Set Active'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => handleEditUser(entry)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteUser(entry.id)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setFormError(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Personnel</Text>
            <View style={styles.modalForm}>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editUser?.full_name}
                  onChangeText={(text) => setEditUser(prev => 
                    prev ? {...prev, full_name: text} : null
                  )}
                  placeholder="Full Name"
                />
              </View>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editUser?.email}
                  onChangeText={(text) => setEditUser(prev => 
                    prev ? {...prev, email: text} : null
                  )}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Role</Text>
                <CustomDropdown
                  label=""
                  selectedValue={editUser?.roles || 'SC001'}
                  onValueChange={(value) => setEditUser(prev => 
                    prev ? {...prev, roles: value as roleType} : null
                  )}
                  items={roles}
                />
              </View>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Assign Gate</Text>
                <CustomDropdown
                  label=""
                  selectedValue={editUser?.assign_gate || 'Main Gate'}
                  onValueChange={(value) => setEditUser(prev => 
                    prev ? {...prev, assign_gate: value as gateType} : null
                  )}
                  items={gates}
                />
              </View>
            </View>
            {formError && <Text style={styles.error}>{formError}</Text>}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setFormError(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
                disabled={isEditLoading}
              >
                {isEditLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#252525'
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#666'
  },
  addButton: {
    backgroundColor: '#00a824',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center'
  },
  userPane: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 5,
  },
  // Active user panel styles
  activeUserPane: {
    borderColor: '#00a824',
    shadowColor: '#00a824',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  // Inactive user panel styles
  inactiveUserPane: {
    borderColor: '#ff3b30',
    backgroundColor: '#f8f8f8',
    opacity: 0.8,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userDetails: {
    marginBottom: 15,
    position: 'relative',
  },
  userActions: {
    flexDirection: 'row',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5
  },
  userEmail: {
    color: '#666',
    marginBottom: 5
  },
  userRole: {
    color: '#666',
    marginBottom: 5
  },
  userGate: {
    color: '#666'
  },
  // Text styles for active/inactive states
  activeUserText: {
    color: '#252525',
  },
  inactiveUserText: {
    color: '#777',
  },
  // Status badge
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  activeBadge: {
    backgroundColor: 'rgba(0, 168, 36, 0.15)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center'
  },
  activeStatus: {
    backgroundColor: '#ff3b30'
  },
  inactiveStatus: {
    backgroundColor: '#00a824'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center'
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#252525'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },
  picker: {
    height: 50,
    width: '100%'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#252525',
    textAlign: 'center'
  },
  modalForm: {
    marginBottom: 20
  },
  modalFormGroup: {
    marginBottom: 15
  },
  modalLabel: {
    fontSize: 16,
    color: '#252525',
    marginBottom: 5,
    fontWeight: '500'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalSaveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#00a824',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalSaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
});
