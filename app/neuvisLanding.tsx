import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../app/lib/supabaseClient';

export default function NeuvisLanding() {
  const router = useRouter();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0, // Here naman, ts was expecting just number but got number | null
    loading: true
  });

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

  return (
    <View style={styles.mainContainer}>
      {/* Header Component */}
      <Header />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Visitor Management</Text>
          <Text style={styles.heroSubtitle}>Scan a valid ID or manually enter visitor details.</Text>
        </View>

        {/* Simple Stats Section */}
        <View style={styles.statsWrapper}>
          {stats.loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#252525" />
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
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchSimpleStats}
              >
                <Ionicons name="refresh-outline" size={16} color="#252525" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('/Scanner')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="scan-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Scan ID</Text>
              <Text style={styles.cardDescription}>Quickly process visitors by scanning their ID</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('/ManualForm')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="create-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manual Input</Text>
              <Text style={styles.cardDescription}>Enter visitor information manually</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push('./VisitorsLogs')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="book-outline" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Visitor Logs</Text>
              <Text style={styles.cardDescription}>View and manage all visitor records</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer with version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 NEUVIS MDRPLT - All Rights Reserved</Text>
        </View>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#252525',
    textAlign: 'center',
    maxWidth: '80%',
  },
  statsWrapper: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 15,
  },
  loadingContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#252525',
  },
  statLabel: {
    fontSize: 12,
    color: '#252525',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 5,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#252525',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#252525',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#252525',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});