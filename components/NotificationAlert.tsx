import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define the Notification interface
interface Notification {
  id: string;
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
  offsetIndex?: number; // For stacking multiple alerts
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ 
  notification, 
  visible, 
  onHide,
  offsetIndex = 0
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);
  
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

  // Handle visibility changes
  useEffect(() => {
    if (notification && visible) {
      // Ensure we render the component first
      setIsRendered(true);
      
      // Reset position before animating in
      slideAnim.setValue(-100);
      fadeAnim.setValue(0);
      
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 10000);
      
      return () => clearTimeout(timer);
    } else if (!visible) {
      // If becoming invisible, trigger hide animation
      hideNotification();
    }
  }, [notification, visible]);

  // Hide notification with animation
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsRendered(false);
      if (onHide) onHide();
    });
  };

  if (!isRendered) return null;

  // Calculate offset for stacking notifications
  const topPosition = offsetIndex * 60;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          top: 80 + topPosition, 
          zIndex: 9999 - offsetIndex 
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <View style={styles.notificationIcon}>
          <Ionicons name="notifications" size={18} color="#fff" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.notificationText} numberOfLines={2}>
          {notification?.content || ''}
        </Text>
        <Text style={styles.timeText}>
          {notification ? formatNotificationDate(notification.created_at) : ''}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={hideNotification}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close" size={16} color="#777" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    padding: 16,
    maxWidth: 500,
    alignSelf: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#003566',
    marginBottom: 8,
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
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    alignSelf: 'flex-start',
    marginTop: -4,
    marginRight: -4,
  },
});

export default NotificationAlert;