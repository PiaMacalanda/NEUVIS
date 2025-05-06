import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabaseClient';
import { router } from 'expo-router'; // Import the router for navigation

// Define the Notification interface
interface Notification {
  id: string; 
  content: string;
  read: boolean;
  created_at: string;
  user_id: string;
  visit_id?: string;
}

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  updateBadgeCount?: (count: number) => void; // Added prop for updating badge
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  visible, 
  onClose,
  user,
  notifications,
  setNotifications,
  updateBadgeCount
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Update badge count whenever notifications change
  useEffect(() => {
    if (updateBadgeCount) {
      const unreadCount = notifications.filter(n => !n.read).length;
      updateBadgeCount(unreadCount);
    }
  }, [notifications, updateBadgeCount]);
  
  // Format date for better readability
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately for UI responsiveness
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      
      // Update badge count
      if (updateBadgeCount) {
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        updateBadgeCount(unreadCount);
      }
      
      // Then update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) {
        console.error('Error marking notification as read:', error);
        // Revert to original state if error
        fetchNotifications();
        return;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!user || notifications.length === 0) return;
      
      setIsLoading(true);
      
      // Check if there are any unread notifications
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Update local state immediately for UI responsiveness
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      
      // Update badge count - set to zero since all are now read
      if (updateBadgeCount) {
        updateBadgeCount(0);
      }
      
      // Get all notification IDs that are unread
      const unreadIds = unreadNotifications.map(n => n.id);
      
      // Update all unread notifications
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
        
      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Revert local state if there was an error
        fetchNotifications();
      } else {
        console.log('All notifications marked as read successfully');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert local state if there was an error
      fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!user) return;
      
      // Looking at notification.ts, we need to fetch security guard notifications 
      // based on the security_id associated with each visit
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      if (data) {
        // Map the database column names to our interface
        const formattedData = data.map(item => ({
          id: item.id,
          content: item.content,
          read: item.read,
          created_at: item.created_at,
          user_id: user.id, // Set this for our local data structure
          visit_id: item.visit_id
        }));
        setNotifications(formattedData);
        
        // Update badge count
        if (updateBadgeCount) {
          const unreadCount = formattedData.filter(n => !n.read).length;
          updateBadgeCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      if (!user || notifications.length === 0) return;
      
      setIsLoading(true);
      
      // Get all notification IDs
      const notificationIds = notifications.map(n => n.id);
      
      if (notificationIds.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Update local state immediately for UI responsiveness
      setNotifications([]);
      
      // Update badge count - set to zero since all notifications are gone
      if (updateBadgeCount) {
        updateBadgeCount(0);
      }
      
      // Delete from the database using notification IDs
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);
        
      if (error) {
        console.error('Error clearing notifications:', error);
        // Revert local state if there was an error
        fetchNotifications();
      } else {
        console.log('All notifications cleared successfully');
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to Notifications.tsx (ExpiredVisitors component)
  const navigateToExpiredVisitors = () => {
    // First close the notification panel
    onClose();
    // Navigate to the expired visitors page
    router.push('/Notifications');
  };

  // Check if there are any unread notifications
  const hasUnread = notifications.some(n => !n.read);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.notificationPanel}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>Notifications</Text>
                  <View style={styles.notificationActions}>
                    {notifications.length > 0 && hasUnread && (
                      <TouchableOpacity 
                        style={styles.markAllReadButton}
                        onPress={markAllAsRead}
                        disabled={isLoading}
                      >
                        <Text style={styles.markAllReadText}>
                          {isLoading ? 'Updating...' : 'Mark all as read'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <ScrollView 
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {isLoading ? (
                    <View style={styles.emptyNotificationContainer}>
                      <Text style={styles.emptyNotification}>Loading notifications...</Text>
                    </View>
                  ) : notifications.length === 0 ? (
                    <View style={styles.emptyNotificationContainer}>
                      <Ionicons name="notifications-off-outline" size={40} color="#aaa" />
                      <Text style={styles.emptyNotification}>No notifications</Text>
                      <Text style={styles.emptyNotificationSubtext}>You're all caught up!</Text>
                    </View>
                  ) : (
                    <View style={styles.notificationsContainer}>
                      {notifications.map((notification, index) => (
                        <TouchableOpacity 
                          key={`notification-${notification.id}-${index}`}
                          style={[
                            styles.notificationItem,
                            !notification.read && styles.unreadNotification
                          ]}
                          onPress={() => {
                            markAsRead(notification.id);
                            // Navigate to the Expired Visitors page
                            navigateToExpiredVisitors();
                          }}
                        >
                          <View style={styles.notificationIconContainer}>
                            <View style={[
                              styles.notificationIcon, 
                              !notification.read ? styles.unreadNotificationIcon : styles.readNotificationIcon
                            ]}>
                              <Ionicons 
                                name="alert-circle" 
                                size={18} 
                                color={!notification.read ? "#fff" : "#003566"} 
                              />
                            </View>
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={[
                              styles.notificationText,
                              !notification.read && styles.unreadNotificationText
                            ]}>
                              {notification.content}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {formatNotificationDate(notification.created_at)}
                            </Text>
                          </View>
                          {!notification.read && (
                            <View style={styles.unreadIndicator} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </ScrollView>
                
                {/* Clear All button at the bottom */}
                {notifications.length > 0 && (
                  <View style={styles.clearAllContainer}>
                    <TouchableOpacity 
                      style={styles.clearAllButton}
                      onPress={clearAllNotifications}
                      disabled={isLoading}
                    >
                      <Text style={styles.clearAllText}>
                        {isLoading ? 'Clearing...' : 'Clear All'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContainer: {
    marginTop: 60,
    marginRight: 20,
    width: 350,
    maxHeight: 500,
  },
  notificationPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllReadText: {
    fontSize: 12,
    color: '#003566',
    fontWeight: '600',
  },
  clearAllContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  clearAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#003566',
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: 380,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  notificationsContainer: {
    flexGrow: 1,
  },
  emptyNotificationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyNotification: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
    marginTop: 12,
  },
  emptyNotificationSubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0,53,102,0.04)',
  },
  notificationIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadNotificationIcon: {
    backgroundColor: '#003566',
  },
  readNotificationIcon: {
    backgroundColor: 'rgba(0,53,102,0.1)',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 4,
  },
  unreadNotificationText: {
    fontWeight: '600',
    color: '#111',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#003566',
    position: 'absolute',
    top: 14,
    right: 14,
  },
});

export default NotificationPanel;