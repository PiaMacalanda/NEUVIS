import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { visit } from '../(security)/types/visits';
import { fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet } from '../(security)/api/notification-service/visits';
import { insertVisitExpirationNotificationWithoutTimeout } from '../(security)/api/notification-service/notification';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Notifications() {
  const [expiredVisits, setExpiredVisits] = useState<visit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user, loading: authLoading } = useAuth(); // Add authLoading

  useEffect(() => {
    console.log('Notifications screen - Current user:', user);
    console.log('Auth loading:', authLoading);
    navigation.setOptions({ headerShown: false });

    // Wait for auth to finish loading
    if (!authLoading) {
      if (user) {
        fetchAndProcessNotifications();
      } else {
        console.log('No user logged in');
        setLoading(false);
      }
    }
  }, [navigation, authLoading, user]);

  const fetchAndProcessNotifications = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentHour = now.getHours();

      // Only proceed if it's after 10 PM
      if (currentHour >= 22) {
        console.log('Fetching expired visits for user:', user?.id);
        const data = await fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet(user);
        console.log('Fetched expired visits:', data);
        if (data && data.length > 0) {
          for (const visit of data) {
            const notificationContent = `Visitor ID Expired but is not Timed Out! Visit ID: ${visit.visit_id}`;
            console.log('Inserting notification for visit:', visit.visit_id);
            await insertVisitExpirationNotificationWithoutTimeout(visit, notificationContent);
          }
          setExpiredVisits(data);
        } else {
          console.log('No expired visits found');
          setExpiredVisits([]);
        }
      } else {
        console.log('Not yet 10 PM, skipping notification check');
        setExpiredVisits([]);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
      setExpiredVisits([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.mainContainer}>
        <Header />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#003566" />
        </View>
        <Footer />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.mainContainer}>
        <Header />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.noVisitsText}>Please log in to view notifications.</Text>
        </ScrollView>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Notifications</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#003566" />
        ) : expiredVisits.length > 0 ? (
          expiredVisits.map((visit) => (
            <View key={visit.id} style={styles.visitItem}>
              <Text style={styles.visitText}>Visit ID: {visit.visit_id}</Text>
              <Text style={styles.visitText}>Expired: {new Date(visit.expiration).toLocaleString()}</Text>
              <Text style={styles.visitText}>Status: Not Timed Out</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noVisitsText}>No expired visits without timeout.</Text>
        )}
      </ScrollView>
      <Footer />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 20,
    textAlign: 'center',
  },
  visitItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  visitText: {
    fontSize: 16,
    color: '#252525',
    marginBottom: 5,
  },
  noVisitsText: {
    fontSize: 16,
    color: '#252525',
    textAlign: 'center',
    marginTop: 20,
  },
});