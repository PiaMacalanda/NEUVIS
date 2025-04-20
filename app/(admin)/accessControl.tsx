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
  confirmed: boolean; // New field to track confirmed status
};

export default function AccessControlScreen() {
  const [security, setSecurity] = useState<Security[]>([]);
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
      // Modified: Remove role filter to see if that's causing the issue
      const { data, error } = await supabase
        .from('security')
        .select('*');
      
      if (error) {
        console.error('Error fetching security personnel:', error);
        // Enhanced error message with specific error details
        Alert.alert('Error', `Failed to load security personnel: ${error.message}`);
        return;
      }
      
      const validData = data?.map(item => ({
        ...item,
        // Set default values for any missing fields
        active: item.active !== undefined ? item.active : false,
        assign_gate: item.assign_gate || 'Main Gate',
        roles: item.roles || 'SC001',
        confirmed: item.confirmed !== undefined ? item.confirmed : false,
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

  // Function to confirm user access
  const handleConfirmAccess = async (id: string) => {
    try {
      // Update in Supabase - set both confirmed AND active to true
      const { error } = await supabase
        .from('security')
        .update({ 
          confirmed: true,
          active: true // Automatically set active to true when confirming
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error confirming user access:', error);
        Alert.alert('Error', `Failed to confirm access: ${error.message}`);
        return;
      }
  
      // Update local state - set both confirmed and active to true
      setSecurity(prev =>
        prev.map(user =>
          user.id === id ? { ...user, confirmed: true, active: true } : user
        )
      );
      
      Alert.alert('Success', 'User access confirmed and activated successfully!');
      
      // Refresh data after confirmation
      fetchSecurityPersonnel();
    } catch (err) {
      console.error('Exception confirming user access:', err);
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
            active: editUser.active,
            confirmed: editUser.confirmed
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

  // Filter out unconfirmed accounts for the recently created accounts section
  const unconfirmedUsers = security.filter(entry => !entry.confirmed);
  
  // Filter security personnel based on their active status for the active/inactive section
  const confirmedUsers = security.filter(entry => entry.confirmed);
  const filteredConfirmedUsers = confirmedUsers.filter(entry => showInactive || entry.active);
  const activeCount = confirmedUsers.filter(entry => entry.active).length;

  return (
    <ScrollView style={styles.container}>
      {/* Debug Info - Add this to help debug */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>Total Records: {security.length}</Text>
        <Text style={styles.debugText}>Unconfirmed: {unconfirmedUsers.length}</Text>
        <Text style={styles.debugText}>Confirmed: {confirmedUsers.length}</Text>
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={fetchSecurityPersonnel}
        >
          <Text style={styles.debugButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>

      {/* New Section: Recently Created Accounts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Created Accounts ({unconfirmedUsers.length})</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#00a824" />
          <Text style={styles.emptyText}>Loading account data...</Text>
        </View>
      ) : unconfirmedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending account confirmation requests.</Text>
        </View>
      ) : (
        unconfirmedUsers.map((entry) => (
          <View 
            key={entry.id} 
            style={[styles.userPane, styles.pendingUserPane]}
          >
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{entry.full_name}</Text>
              <Text style={styles.userEmail}>{entry.email}</Text>
              <Text style={styles.userRole}>Role: {entry.roles}</Text>
              <Text style={styles.userGate}>Gate: {entry.assign_gate}</Text>
              
              {/* Pending badge */}
              <View style={styles.pendingBadge}>
                <Text style={styles.statusBadgeText}>Pending Confirmation</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity 
                onPress={() => handleConfirmAccess(entry.id)} 
                style={styles.confirmButton}
              >
                <Text style={styles.statusText}>Confirm Access</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => handleEditUser(entry)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Active and Inactive Users Section (Only for confirmed users) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active and Inactive Users ({activeCount} active / {confirmedUsers.length} total)</Text>
        <View style={styles.toggleContainer}>
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
      ) : filteredConfirmedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {confirmedUsers.length === 0 ? 
              "No confirmed users found." : 
              "No active personnel found. Toggle 'Show Inactive' to view inactive personnel."}
          </Text>
        </View>
      ) : (
        filteredConfirmedUsers.map((entry) => (
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
                  selectedValue={editUser?.assign_gate || ''}
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
  // Debug section styles
  debugSection: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#add8e6'
  },
  debugTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  debugText: {
    fontSize: 14,
    marginBottom: 3
  },
  debugButton: {
    backgroundColor: '#4682b4',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
    alignItems: 'center'
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold'
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
  // Pending user panel style
  pendingUserPane: {
    borderColor: '#f5a623',
    shadowColor: '#f5a623',
    shadowOpacity: 0.2,
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
  // Status badges
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
  pendingBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
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
  confirmButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 48
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
