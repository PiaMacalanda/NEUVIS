import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Logo from './logo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/lib/supabaseClient';
import NotificationPanel from './NotificationPanel';
import NotificationAlert from './NotificationAlert';

// Define the Notification interface
interface Notification {
  id: string;  // Using string type for id
  content: string;
  read: boolean;
  created_at: string;
  user_id: string;
  visit_id?: string;
}

interface HeaderProps {
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onProfilePress,
  onNotificationPress,
}) => {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
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

  // Fetch initial notifications and set up real-time subscription
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (user && user.id) {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('read', false)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching notifications:', error);
            return;
          }
          
          if (data) {
            setNotifications(data as Notification[]);
            
            // Show the most recent notification as an alert if it exists
            if (data.length > 0) {
              showNewNotificationAlert(data[0] as Notification);
            }
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };
    
    fetchInitialNotifications();
    
    // Set up real-time subscription for new notifications
    const setupNotificationSubscription = () => {
      if (!user?.id) return null;
      
      return supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          // Handle new notification directly
          const newNotification = payload.new as unknown as Notification;
          console.log("New notification received:", newNotification);
          
          // Add to notifications array
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show notification alert - this is critical for the popup!
          showNewNotificationAlert(newNotification);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          // Handle updated notification directly
          const updatedNotification = payload.new as unknown as Notification;
          
          // Update the notification in our local state
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id ? updatedNotification : notification
            ).filter(notification => !notification.read)
          );
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          // Handle deleted notification
          const deletedNotification = payload.old as unknown as Notification;
          
          // Remove from our local state
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          );
        })
        .subscribe();
    };
    
    const subscription = setupNotificationSubscription();
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  // Function to show notification alert for new notifications
  const showNewNotificationAlert = (notification: Notification) => {
    console.log("Showing notification alert for:", notification.content);
    
    // Only show alert for unread notifications
    if (!notification.read) {
      setLatestNotification(notification);
      setShowNotificationAlert(true);
    }
  };

  // Handle notification icon press
  const handleNotificationPress = () => {
    setNotificationModalVisible(prev => !prev); // Toggle notification panel
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  // For testing - show a test notification alert
  const testNotificationAlert = () => {
    const testNotification: Notification = {
      id: "test-" + Date.now().toString(),  // Generate unique string ID
      content: "This is a test notification to verify the alert is working correctly.",
      read: false,
      created_at: new Date().toISOString(),
      user_id: user?.id || "test-user"
    };
    
    console.log("Triggering test notification alert");
    // Add to notifications array so it appears in the list too
    setNotifications(prev => [testNotification, ...prev]);
    showNewNotificationAlert(testNotification);
  };

  // Handle when notification alert is closed
  const handleHideNotificationAlert = () => {
    console.log("Hiding notification alert");
    setShowNotificationAlert(false);
    setLatestNotification(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          onLongPress={testNotificationAlert} // Long press to test notification
        >
          <Ionicons name="notifications" size={20} color="#252525" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
          activeOpacity={0.7}
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
      <ProfileModal 
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
              
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="settings-outline" size={20} color="#333" />
                <Text style={styles.modalOptionText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption}>
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

      {/* Notification Panel */}
      <NotificationPanel
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        user={user}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* Notification Alert - Make sure it's the last component to ensure proper z-index layering */}
      {showNotificationAlert && latestNotification && (
        <NotificationAlert
          notification={latestNotification}
          visible={showNotificationAlert}
          onHide={handleHideNotificationAlert}
        />
      )}
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    marginRight: 12,
    padding: 8,
    zIndex: 11, 
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff', // Add white border for better contrast
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center', // Ensure text is centered
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