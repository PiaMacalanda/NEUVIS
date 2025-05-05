import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Logo from '../../components/logo';
import Footer from '@/components/Footer';
import { visit } from './types/visits';
import { fetchExpiredUntimedoutVisits } from './api/notification-service/visits';
import { insertVisitExpirationNotificationWithoutTimeout } from './api/notification-service/notification';

interface VisitorDetails {
  id: number;
  name: string;
  phone_number?: string;
  card_type?: string;
  id_number?: string;
}

interface ExtendedVisit extends visit {
  [x: string]: any;
  visitorDetails?: VisitorDetails;
  formattedExpiration?: string;
  formattedVisitTime?: string;
}

const ExpiredVisitors: React.FC = () => {
  const [expiredVisits, setExpiredVisits] = useState<ExtendedVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<ExtendedVisit | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchExpiredVisitors();
  }, []);

  const fetchExpiredVisitors = async () => {
    try {
      setLoading(true);

      const data = await fetchExpiredUntimedoutVisits();
      
      const enhancedData = await Promise.all(
        data.map(async (visit) => {
          const { data: visitorData, error } = await supabase
            .from('visitors')
            .select('*')
            .eq('id', visit.visitor_id)
            .single();
          
          if (error) console.error('Error fetching visitor details:', error);
          
          return {
            ...visit,
            visitorDetails: visitorData || undefined,
            
            formattedVisitTime: formatDateTime(visit.time_of_visit)
          };
        })
      );
      
      setExpiredVisits(enhancedData);
    } catch (error) {
      console.error('Error fetching expired visits:', error);
    } finally {
      setLoading(false);
    }
  };

  function formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
  }

  const handleTimeOut = async (visit: ExtendedVisit) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('visits')
        .update({ time_out: now })
        .eq('id', visit.id);
      
      if (error) throw error;
      fetchExpiredVisitors();
    } catch (error) {
      console.error('Error updating time out:', error);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      Clipboard.setString(text);
    }
  };

  const handleViewVisitor = (visitor: ExtendedVisit) => {
    setSelectedVisitor(visitor);
    setShowVisitorModal(true);
  };

  const renderItem = ({ item }: { item: ExtendedVisit }) => (
    <View style={styles.visitorRow}>
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.visitorDetails?.name || 'Unknown Visitor'}</Text>
      </View>
      <View style={styles.timeInfo}>
        <Text style={styles.timeLabel}>Visit time:</Text>
        <Text style={styles.timeValue}>{item.formattedVisitTime}</Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]} 
          onPress={() => handleViewVisitor(item)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Expired Visitors</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchExpiredVisitors}
          >
            <Ionicons name="refresh-outline" size={24} color="#003566" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {expiredVisits.length} expired visitor{expiredVisits.length !== 1 ? 's' : ''} found
          </Text>
        </View>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 3 }]}>Visitor</Text>
          <Text style={[styles.headerText, { flex: 4 }]}>Time In</Text>
          <Text style={[styles.headerText, { flex: 3 }]}>Actions</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#003566" />
          </View>
        ) : (
          <FlatList
            data={expiredVisits}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expired and untimed-out visitors found</Text>
              </View>
            }
          />
        )}
      </View>
      
      <Modal
        visible={showVisitorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVisitorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.visitorModalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowVisitorModal(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            
            {selectedVisitor && (
              <View style={styles.visitorDetailsContainer}>
                <View style={styles.logoContainer}>
                  <Logo size="small" style={styles.logoCircle} />
                  <Text style={styles.universityName}>New Era University</Text>
                </View>
                
                <View style={styles.visitorDetailsHeader}>
                  <Text style={styles.visitorDetailsName}>
                    {selectedVisitor.visitorDetails?.name || 'Unknown Visitor'}
                  </Text>
                  <Text style={styles.visitorId}>{selectedVisitor.visit_id}</Text>
                </View>

                <View style={styles.detailsContent}>
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Phone no:</Text>
                    <View style={styles.phoneContainer}>
                      <Text style={styles.detailsValue}>
                        {selectedVisitor.visitorDetails?.phone_number || 'N/A'}
                      </Text>
                      {selectedVisitor.visitorDetails?.phone_number && (
                        <TouchableOpacity onPress={() => copyToClipboard(selectedVisitor.visitorDetails?.phone_number)}>
                          <Ionicons name="copy-outline" size={20} color="#4682B4" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>ID Type:</Text>
                    <Text style={styles.detailsValue}>
                      {selectedVisitor.visitorDetails?.card_type || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>ID Number:</Text>
                    <Text style={styles.detailsValue}>
                      {selectedVisitor.visitorDetails?.id_number || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Purpose of Visit:</Text>
                    <Text style={styles.detailsValue}>
                      {selectedVisitor.purpose_of_visit || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.timeSection}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Time In:</Text>
                      <Text style={styles.timeInValue}>{selectedVisitor.formattedVisitTime}</Text>
                    </View>
                    
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Status:</Text>
                      <Text style={styles.expiredStatus}>Expired - Not Timed Out</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.timeOutModalButton]} 
                    onPress={() => {
                      handleTimeOut(selectedVisitor);
                      setShowVisitorModal(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Time Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  universityInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  universityName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003566',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsText: {
    fontSize: 16,
    color: '#252525',
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontWeight: '600',
    color: '#252525',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  visitorRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    alignItems: 'center',
  },
  visitorInfo: {
    flex: 3,
    paddingRight: 8,
  },
  visitorName: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 4,
  },
  visitorId: {
    fontSize: 14,
    color: '#252525',
    textAlign: 'center',
  },
  timeInfo: {
    flex: 4,
    paddingHorizontal: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#d32f2f',
  },
  actionContainer: {
    flex: 3,
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#003566',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  visitorDetailsContainer: {
    width: '100%',
  },
  visitorDetailsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  visitorDetailsName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsContent: {
    width: '100%',
  },
  detailsSection: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  detailsLabel: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  detailsValue: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  phoneContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSection: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timeInValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  expiredStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d32f2f',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  timeOutModalButton: {
    backgroundColor: '#d32f2f',
  },
  notifyModalButton: {
    backgroundColor: '#ffc300',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExpiredVisitors;