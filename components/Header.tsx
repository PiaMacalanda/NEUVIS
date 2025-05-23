import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Logo from './logo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/lib/supabaseClient';
  
interface HeaderProps {
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onProfilePress,
}) => {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    full_name: "Loading...",
    role: "Loading..."
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user && user.id) {
          const { data, error } = await supabase
            .from('users')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
            return;
          }
          
          if (data) {
            setUserData({
              full_name: data.full_name || "User",
              role: data.role || "No Role Assigned"
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleViewProfile = () => {
    setProfileModalVisible(false);
    // Navigate to ProfileEditor
    router.push('/profile');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 10 : 20 }]}>
      {/* Left Side: Logo & Title */}
      <View style={styles.left}>
        <Logo size="smallest" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            <Text style={styles.bold}>NEUVIS</Text>
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
          <View style={styles.guardInfo}>
            <Text style={styles.guardTitle} numberOfLines={1}>{userData.role}</Text>
            <Text style={styles.guardSubtitle} numberOfLines={1}>{userData.full_name}</Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#252525" />
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setProfileModalVisible(false)}
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
              >
                <Ionicons name="person-outline" size={20} color="#333" />
                <Text style={styles.modalOptionText}>View Profile</Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="settings-outline" size={20} color="#333" />
                <Text style={styles.modalOptionText}>Settings</Text>
              </TouchableOpacity> */}
              
              <TouchableOpacity style={styles.modalOption}
              onPress={() => {
                setProfileModalVisible(false);
                router.push('/(static)/helpSupport');
              }}>
                <Ionicons name="help-circle-outline" size={20} color="#333" />
                <Text style={styles.modalOptionText}>Help & Support</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity  
                style={[styles.modalOption, styles.logoutOption]}
                onPress={signOut}>
                <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
                <Text style={[styles.modalOptionText, styles.logoutText]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#252525',
  },
  subtitle: {
    fontSize: 12,
    color: '#252525',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },// Define the Notification interface
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003566',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardInfo: {
    marginLeft: 8,
    marginRight: 4,
    maxWidth: 120,
  },
  guardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  guardSubtitle: {
    fontSize: 10,
    color: '#252525',
  },
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

export default Header;