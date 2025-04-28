import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity, 
         ActivityIndicator, Modal, Pressable } from 'react-native';
import Header from '../../components/Header';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Footer from '@/components/Footer';
import { visit } from './types/visits';
import { fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet } from './api/notification-service/visits';
import { insertVisitExpirationNotificationWithoutTimeout, fetchUserNotifications } from './api/notification-service/notification';
import NotificationPanel from '../../components/NotificationPanel';
import NotificationAlert from '../../components/NotificationAlert';

//Notification
interface Notification {
  id: string;
  content: string;
  read: boolean;
  created_at: string;
  user_id: string;
  visit_id?: string;
}

export default function NeuvisLanding() {
  const [expiredUntimedoutVisitswithoutNotificationsSentYet, setExpiredUntimedoutVisitsWithoutNotificationsSentYet] = useState<visit[]>([]);
  const router = useRouter();
  const navigation = useNavigation();
  const { user, session } = useAuth();
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0,
    loading: true
  });
  
  // Notification states
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchSimpleStats();
  }, [navigation]);

  const fetchSimpleStats = async () => {
    try {
      // Get today's date at the start of the day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Format today's date for Supabase query
      const todayStr = today.toISOString();
      
      // Get today's visitors count
      const { count: todayCountResult, error: todayError } = await supabase
        .from('visits')
        .select('id', { count: 'exact' })
        .gte('time_of_visit', todayStr);
      
      if (todayError) throw todayError;

      // Get total visitors count
      const { count: totalCountResult, error: totalError } = await supabase
        .from('visits')
        .select('id', { count: 'exact' });
      
      if (totalError) throw totalError;

      // Fix: Handle null values by defaulting to 0
      const todayCount = todayCountResult || 0;
      const totalCount = totalCountResult || 0;

      setStats({
        todayCount,
        totalCount,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching visitor statistics:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

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

  useEffect(() => {
    const sendNotfications = async () => {
      const data = await fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet(user);
      
      if (data && data.length > 0) {
        for (const visit of data) {
          const notificationContent = `
            Visitor ID Expired but is not Timed Out!
            Visit ID: + ${visit.visit_id}
          `;
          
          await insertVisitExpirationNotificationWithoutTimeout(visit, notificationContent);
        }
      }
    }

    sendNotfications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <View style={styles.mainContainer}>
      {/* Header Component */}
      <Header />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Welcome to <Text style={styles.heroTitleAccent}>NEUVIS</Text></Text>
          <Text style={styles.heroSubtitle}>Scan a valid ID or manually enter visitor details.</Text>
        </View>

        {/* Simple Stats Section - Notification button moved to right controls */}
        <View style={styles.statsWrapper}>
          {stats.loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#003566" />
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.todayCount}</Text>
                <Text style={styles.statLabel}>Today's Visitors</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalCount}</Text>
                <Text style={styles.statLabel}>Total Visitors</Text>
              </View>
              <View style={styles.rightControlsContainer}>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchSimpleStats}
                >
                  <Ionicons name="refresh-outline" size={16} color="#003566" />
                </TouchableOpacity>
                {/* Notification bell moved here */}
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={handleNotificationPress}
                  onLongPress={testNotificationAlert} // Long press to test notification
                >
                  <Ionicons name="notifications" size={16} color="#003566" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('/Scanner')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.scanIcon]}>
              <Ionicons name="scan-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Scan ID</Text>
              <Text style={styles.cardDescription}>Quickly process visitors by scanning their ID</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#003566" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('/ManualForm')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.manualIcon]}>
              <Ionicons name="create-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manual Input</Text>
              <Text style={styles.cardDescription}>Enter visitor information manually</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#003566" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('./VisitorsLogs')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.logsIcon]}>
              <Ionicons name="book-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Visitor Logs</Text>
              <Text style={styles.cardDescription}>View and manage all visitor records</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#003566" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('./Notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.expiredIcon]}>
              <Ionicons name="alert-circle-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Expired ID</Text>
              <Text style={styles.cardDescription}>Expired ID</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#003566" style={styles.cardArrow} />
          </TouchableOpacity>
        </View>
        <Footer />
      </ScrollView>

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
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: '#003566',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#252525',
    textAlign: 'center',
    maxWidth: '80%',
    opacity: 0.8,
  },
  statsWrapper: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 18,
  },
  loadingContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#252525',
    left: -10
  },
  statLabel: {
    fontSize: 14,
    color: '#252525',
    marginTop: 4,
    opacity: 0.7,
    
  },
  statDivider: {
    width: 2,
    height: 50,
    backgroundColor: '#eeeeee',
  },
  rightControlsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
    marginLeft: 1,
    left: 5
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  refreshButton: {
    padding: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#252525',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scanIcon: {
    backgroundColor: '#003566',
  },
  manualIcon: {
    backgroundColor: '#ffc300',
  },
  logsIcon: {
    backgroundColor: '#003566',
    opacity: 0.9,
  },
  expiredIcon: {
    backgroundColor: '#ffc300',
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#252525',
    opacity: 0.7,
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 10,
  },
});