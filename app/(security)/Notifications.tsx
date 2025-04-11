import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Pressable, Alert, Image } from 'react-native';
import { useNavigation } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { visit } from './types/visits';
import { fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet } from './api/notification-service/visits';
import { insertVisitExpirationNotificationWithoutTimeout } from './api/notification-service/notification';
import Header from '../../components/Header';
import Footer from '@/components/Footer';
import supabase from "@/app/lib/supabaseClient";
import { Ionicons } from '@expo/vector-icons';

export default function Notifications() {
  const [expiredVisits, setExpiredVisits] = useState<visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<visit | null>(null);
  const [processingTimeout, setProcessingTimeout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchAndProcessNotifications();

    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchAndProcessNotifications(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [navigation]);

  const fetchAndProcessNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet(user);
      
      if (data && data.length > 0) {
        // Process notifications for newly expired visits
        for (const visit of data) {
          const formattedExpiration = new Date(visit.expiration).toLocaleString();
          const notificationContent = `Visitor ID Expired but is not Timed Out! Visit ID: ${visit.visit_id} | Expired: ${formattedExpiration}`;
          
          await insertVisitExpirationNotificationWithoutTimeout(visit, notificationContent);
        }
        setExpiredVisits(data);
      } else {
        setExpiredVisits([]);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
      if (!silent) {
        Alert.alert(
          "Error",
          "Failed to load notifications. Please try again later.",
          [{ text: "OK" }]
        );
      }
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAndProcessNotifications(true);
  };

  const handleViewDetails = (visit: visit) => {
    setSelectedVisit(visit);
    setModalVisible(true);
  };

  const handleTimeOut = async () => {
    if (!selectedVisit) return;
    
    try {
      setProcessingTimeout(true);
      
      // Update the visit with current time as time_out
      const { error } = await supabase
        .from('visits')
        .update({ 
          time_out: new Date().toISOString() 
        })
        .eq('id', selectedVisit.id);
      
      if (error) {
        throw new Error('Error timing out visit: ' + error.message);
      }
      
      // Update local state to remove this visit from the list
      setExpiredVisits(prevVisits => 
        prevVisits.filter(visit => visit.id !== selectedVisit.id)
      );
      
      Alert.alert(
        "Success",
        `Visit ID: ${selectedVisit.visit_id} has been successfully timed out.`,
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
    } catch (error) {
      console.error('Error during timeout process:', error);
      Alert.alert(
        "Error",
        "Failed to time out the visit. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setProcessingTimeout(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString: string | Date) => {
    if (!dateString) return "";
    const now = new Date();
    const expiredDate = new Date(dateString);
    const diffMs = now.getTime() - expiredDate.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={22} color="#003566" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#003566" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {expiredVisits.length > 0 ? (
            expiredVisits.map((visit) => (
              <View key={visit.id} style={styles.notificationItem}>
                <View style={styles.notificationIconContainer}>
                  <Ionicons name="alert-circle" size={28} color="#d00000" />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>Visitor ID Expired</Text>
                    <Text style={styles.timeAgo}>{getTimeSince(visit.expiration)}</Text>
                  </View>
                  <Text style={styles.visitText}>
                    <Text style={styles.visitLabel}>Visit ID:</Text> {visit.visit_id}
                  </Text>
                  <Text style={styles.visitText}>
                    <Text style={styles.visitLabel}>Expired:</Text> {formatDate(visit.expiration)}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewDetails(visit)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={60} color="#4BB543" />
              <Text style={styles.noVisitsText}>No expired visits without timeout</Text>
              <Text style={styles.noVisitsSubText}>All visitor passes are currently valid or properly timed out</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal for displaying visit details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visit Details</Text>
              <TouchableOpacity 
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#252525" />
              </TouchableOpacity>
            </View>
            
            {selectedVisit && (
              <ScrollView style={styles.detailsScrollView}>
                <View style={styles.statusContainer}>
                  <Ionicons name="warning" size={22} color="#d00000" />
                  <Text style={styles.statusAlert}>Expired, Not Timed Out</Text>
                </View>
                
                {selectedVisit.image_url && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: selectedVisit.image_url }} 
                      style={styles.visitorImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                
                <View style={styles.visitDetails}>
                  
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Visit ID:</Text>
                    <Text style={styles.detailValue}>{selectedVisit.visit_id}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Visitor ID:</Text>
                    <Text style={styles.detailValue}>{selectedVisit.visitor_id}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purpose:</Text>
                    <Text style={styles.detailValue}>{selectedVisit.purpose_of_visit}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time of Visit:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedVisit.time_of_visit)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expiration:</Text>
                    <Text style={[styles.detailValue, styles.expiredText]}>
                      {formatDate(selectedVisit.expiration)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created At:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedVisit.created_at)}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
            
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
              
              <Pressable
                style={[styles.timeOutButton, processingTimeout && styles.disabledButton]}
                onPress={handleTimeOut}
                disabled={processingTimeout}
              >
                {processingTimeout ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={16} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.timeOutButtonText}>Time Out</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e7f0ff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#252525',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  notificationIconContainer: {
    marginRight: 12,
    paddingTop: 3,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#d00000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  visitText: {
    fontSize: 14,
    color: '#252525',
    marginBottom: 5,
  },
  visitLabel: {
    fontWeight: '600',
    color: '#444',
  },
  viewButton: {
    backgroundColor: '#003566',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noVisitsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    textAlign: 'center',
    marginTop: 16,
  },
  noVisitsSubText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003566',
  },
  closeIcon: {
    padding: 5,
  },
  detailsScrollView: {
    maxHeight: '60%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f8',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 16,
    marginTop: 10,
  },
  statusAlert: {
    color: '#d00000',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  imageContainer: {
    alignItems: 'center',
    margin: 16,
  },
  visitorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#eee',
  },
  visitDetails: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#252525',
  },
  expiredText: {
    color: '#d00000',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#f1f3f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  closeButtonText: {
    color: '#252525',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeOutButton: {
    backgroundColor: '#d00000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  timeOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#dc9f9f',
    opacity: 0.7,
  },
});