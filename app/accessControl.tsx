import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors } from '@/components/colors';

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

  const handleToggleActive = (id: string) => {
    setSecurity(prev =>
      prev.map(user =>
        user.id === id ? { ...user, active: !user.active } : user
      )
    );
  };

  const handleEditUser = (user: Security) => {
    setEditUser({ ...user });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editUser) {
      setSecurity(prev => prev.map(user => 
        user.id === editUser.id ? editUser : user
      ));
      setEditModalVisible(false);
    }
  };

  const handleSubmit = () => {
    if (!full_name.trim() || !email.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (!email.trim().endsWith('@neu.edu.ph')) {
      setFormError('Only @neu.edu.ph email addresses are allowed.');
      return;
    }

    const newUser: Security = {
      id: Math.random().toString(),
      full_name,
      email,
      roles: selectedRole,
      assign_gate: selectedGate,
      active: true,
    };

    setSecurity([...security, newUser]);
    setFullName('');
    setEmail('');
    setFormError(null);
  };

  // Dropdown component for cross-platform compatibility
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
        />
        <CustomDropdown
          label="Assign Gate:"
          selectedValue={selectedGate}
          onValueChange={(value) => setSelectedGate(value as gateType)}
          items={gates}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>Add Personnel</Text>
        </TouchableOpacity>
        {formError && <Text style={styles.error}>{formError}</Text>}
      </View>

      <Text style={styles.sectionTitle}>Security Personnel</Text>
      {security.map((entry) => (
        <View 
          key={entry.id} 
          style={[
            styles.userPane, 
            !entry.active ? styles.inactiveUserPane : styles.activeUserPane
          ]}
        >
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{entry.full_name}</Text>
            <Text style={styles.userEmail}>{entry.email}</Text>
            <Text style={styles.userGate}>Gate: {entry.assign_gate}</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity 
              onPress={() => handleToggleActive(entry.id)} 
              style={[
                styles.statusButton, 
                entry.active ? styles.activeStatus : styles.inactiveStatus
              ]}
            >
              <Text style={[
                styles.statusText, 
                entry.active ? styles.activeStatusText : styles.inactiveStatusText
              ]}>
                {entry.active ? 'Active' : 'Inactive'}
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
      ))}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
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
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveButtonText}>Save Changes</Text>
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
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#252525'
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center'
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
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userDetails: {
    flex: 1,
    marginRight: 10
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  activeUserPane: {
    borderLeftWidth: 5,
    borderLeftColor: 'green'
  },
  inactiveUserPane: {
    borderLeftWidth: 5,
    borderLeftColor: 'red'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  userEmail: {
    color: '#666'
  },
  userGate: {
    color: '#666'
  },
  statusButton: {
    padding: 5,
    borderRadius: 5,
    marginRight: 10
  },
  activeStatus: {
    backgroundColor: 'green'
  },
  inactiveStatus: {
    backgroundColor: 'red'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold'
  },
  activeStatusText: {
    color: "green",
    fontWeight: "bold",
  },
  inactiveStatusText: {
    color: "red",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5
  },
  
  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#252525'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
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
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#252525',
    textAlign: 'left'
  },
  modalForm: {
    marginBottom: 15
  },
  modalFormGroup: {
    marginBottom: 10
  },
  modalLabel: {
    fontSize: 16,
    color: '#252525',
    marginBottom: 5,
    textAlign: 'left'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlign: 'left'
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#F44336',
    borderRadius: 5,
    alignItems: 'center'
  },
  modalCancelButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  modalSaveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center'
  },
  modalSaveButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});