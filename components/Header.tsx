import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Logo from './logo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  notifications?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  onProfilePress,
  onNotificationPress,
  notifications = 0
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    full_name: "Loading...",
    role: "Loading..."
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user && user.id) {
          // Fetch the user data from Supabase using the authenticated user's ID
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

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top +10 : 20 }]}>
      {/* Left Side: Logo & Title */}
      <View style={styles.left}>
        <Logo size="smallest" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            <Text style={styles.bold}>NEUVIS</Text>
          </Text>
        </View>
      </View>

      {/* Right Side: Profile */}
      <View style={styles.right}>
        {/* Profile Button */}
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

      {/* Profile Modal as a separate component */}
      <ProfileModal 
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userData={userData}
      />
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
  },
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
});

export default Header;