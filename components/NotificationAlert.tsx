import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define the Notification interface
interface Notification {
  id: number;
  content: string;
  read: boolean;
  created_at: string;
  user_id: string;
  visit_id?: string;
}

interface NotificationAlertProps {
  notification: Notification | null;
  visible: boolean;
  onHide: () => void;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ 
  notification, 
  visible, 
  onHide 
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  
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

  // Animate in and out when visibility changes
  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      hideNotification();
    }
  }, [visible]);

  // Hide notification with animation
  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onHide) onHide();
    });
  };

  if (!notification || !visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.iconContainer}>
        <View style={styles.notificationIcon}>
          <Ionicons name="alert-circle" size={18} color="#fff" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.notificationText} numberOfLines={2}>
          {notification.content}
        </Text>
        <Text style={styles.timeText}>
          {formatNotificationDate(notification.created_at)}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={hideNotification}
      >
        <Ionicons name="close" size={16} color="#777" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // Positioned below header
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    padding: 12,
    zIndex: 9999,
    maxWidth: 500,
    alignSelf: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#003566',
  },
  iconContainer: {
    marginRight: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003566',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#252525',
    fontWeight: '500',
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});

export default NotificationAlert;