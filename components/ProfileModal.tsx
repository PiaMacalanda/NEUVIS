import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import { router } from 'expo-router';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    full_name: string;
    role: string;
  };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, userData }) => {
  const { signOut } = useAuth();

  const handleViewProfile = () => {
    onClose(); // Close the modal first
    router.push('/profile'); // Navigate to profile screen
  };

  const handleSignOut = async () => {
    try {
      await signOut(); // Sign out the user
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalAvatar}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <Text style={styles.modalName}>{userData.full_name}</Text>
            <Text style={styles.modalRole}>{userData.role}</Text>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>Help & Support</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity  
              style={[styles.modalOption, styles.logoutOption]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
              <Text style={[styles.modalOptionText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContainer: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 60,
    marginRight: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    backgroundColor: '#003566',
    padding: 20,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  modalContent: {
    padding: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  logoutOption: {
    marginTop: 5,
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default ProfileModal;