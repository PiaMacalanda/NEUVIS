import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/logo';

interface Visitor {
  id: number;
  name: string;
  time_of_visit: string;
  time_out?: string;
  visit_id: string;
  purpose_of_visit?: string;
  phone_number?: string;
  card_type?: string;
  id_number?: string;
  visit_count?: number;
  visitors?: {
    id: number;
    name: string;
    phone_number?: string;
    card_type?: string;
    id_number?: string;
  };
}

const VisitorsLogs: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'completed'
  
  // Date picker states
  const [showDateModal, setShowDateModal] = useState(false);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState(formatDate(today));

  // Years for date picker
  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
 
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    fetchVisitors();
  }, [formattedDate, activeTab]);

  // Format date for display
  function formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  // Format time for display
  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
  }

  const handleDateSelection = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
    setFormattedDate(formatDate(newDate));
    setShowDateModal(false);
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);

      // Get start and end of selected date
      const startOfDay = new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(new Date(selectedDate).setHours(23, 59, 59, 999)).toISOString();
      
      // Modified query to fetch more visitor details
      let query = supabase
        .from('visits')
        .select(`
          id,
          time_of_visit,
          time_out,
          visit_id,
          purpose_of_visit,
          visitors(
            id, 
            name, 
            phone_number, 
            card_type, 
            id_number
          )
        `)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);
      
      // Filter based on active tab
      if (activeTab === 'ongoing') {
        query = query.is('time_out', null);
      } else {
        query = query.not('time_out', 'is', null);
      }
      
      const { data, error } = await query.order('time_of_visit', { ascending: false });
      
      if (error) throw error;

      // Transform data with comprehensive visitor details
      const formattedData = data
        .filter(item => item.visitors !== null)
        .map(item => ({
          id: item.id,
          name: item.visitors?.name || 'Unknown Visitor',
          time_of_visit: formatDateTime(item.time_of_visit),
          time_out: item.time_out ? formatDateTime(item.time_out) : undefined,
          visit_id: item.visit_id,
          purpose_of_visit: item.purpose_of_visit || '',
          phone_number: item.visitors?.phone_number || '',
          card_type: item.visitors?.card_type || '',
          id_number: item.visitors?.id_number || '',
          visit_count: 3 // This would ideally be dynamically fetched
        }));
            
      setVisitors(formattedData);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = async (id: number) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('visits')
        .update({ time_out: now })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      fetchVisitors();
      // Switch to completed tab to show the logged out visitor
      setActiveTab('completed');
    } catch (error) {
      console.error('Error updating time out:', error);
    }
  };

  const handleViewVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowVisitorModal(true);
  };

  const filteredVisitors = visitors.filter(visitor => 
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Visitor }) => (
    <View style={styles.visitorRow}>
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.name}</Text>
      </View>
      <View style={styles.timeInfo}>
        <Text style={[styles.timeText, styles.timeInText]}>{item.time_of_visit}</Text>
        {item.time_out && <Text style={[styles.timeText, styles.timeOutText]}>{item.time_out}</Text>}
      </View>
      <View style={styles.actionContainer}>
        {activeTab === 'ongoing' ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.timeOutButton]} 
            onPress={() => handleTimeOut(item.id)}
          >
            <Text style={styles.buttonText}>Time Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewVisitor(item)}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation - Moved to the top */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'ongoing' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'ongoing' && styles.activeTabButtonText
          ]}>Ongoing Visits</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'completed' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'completed' && styles.activeTabButtonText
          ]}>Completed Visits</Text>
        </TouchableOpacity>
      </View>
      
      {/* Search and date picker - Only visible in completed tab */}
      {activeTab === 'completed' && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Visitor"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContainer}>
            <Text>Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Ionicons name="calendar-outline" size={20} color="#252525" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>View Report</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.nameColumn]}>Visitor Name</Text>
        <Text style={[styles.headerText, styles.timeColumn]}>Time In/Time Out</Text>
        <Text style={[styles.headerText, styles.actionColumn]}>Action</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <FlatList
          data={filteredVisitors}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'ongoing' 
                  ? 'No ongoing visits found for this date' 
                  : 'No completed visits found for this date'}
              </Text>
            </View>
          }
        />
      )}
      
      
      {/* Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContainer2}>
              {/* Month Picker */}
              <ScrollView style={styles.pickerColumn}>
                {months.map((month, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.pickerItem,
                      selectedDate.getMonth() === index ? styles.selectedPickerItem : null
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(index);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={styles.pickerText}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Day Picker */}
              <ScrollView style={styles.pickerColumn}>
                {Array.from(
                  { length: getDaysInMonth(selectedDate.getMonth() + 1, selectedDate.getFullYear()) }, 
                  (_, i) => i + 1
                ).map(day => (
                  <TouchableOpacity 
                    key={day}
                    style={[
                      styles.pickerItem,
                      selectedDate.getDate() === day ? styles.selectedPickerItem : null
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={styles.pickerText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Year Picker */}
              <ScrollView style={styles.pickerColumn}>
                {years.map(year => (
                  <TouchableOpacity 
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedDate.getFullYear() === year ? styles.selectedPickerItem : null
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(year);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={styles.pickerText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                handleDateSelection(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                  selectedDate.getDate()
                );
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Visitor Details Modal */}
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
                {/* University Logo */}
                <View style={styles.logoContainer}>
                  <Logo size="small" style={styles.logoCircle} />
                  <Text style={styles.universityName}>New Era University</Text>
                </View>
                
                {/* Visitor Name and ID */}
                <View style={styles.visitorDetailsHeader}>
                  <Text style={styles.visitorDetailsName}>{selectedVisitor.name}</Text>
                  <Text style={styles.visitorId}>{selectedVisitor.visit_id}</Text>
                </View>

                <View style={styles.detailsContent}>
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Phone no:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitor.phone_number || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>ID Type</Text>
                    <Text style={styles.detailsValue}>{selectedVisitor.card_type || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>ID Number:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitor.id_number || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Entry:</Text>
                    <Text style={styles.detailsValue}>Main Entrance</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Purpose of Visit:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitor.purpose_of_visit || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Number of Visit:</Text>
                    <View style={styles.visitCountContainer}>
                      <Text style={styles.visitCountValue}>{selectedVisitor.visit_count || 1}</Text>
                      <TouchableOpacity>
                        <Text style={styles.viewLogLink}>View Visit Log</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Captured ID:</Text>
                    <View style={styles.visitCountContainer}>         
                      <TouchableOpacity>
                        <Text style={styles.viewLogLink}>View Image</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.timeSection}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Time In:</Text>
                      <Text style={styles.timeInValue}>{selectedVisitor.time_of_visit}</Text>
                    </View>
                    
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Time Out:</Text>
                      <Text style={styles.timeOutValue}>{selectedVisitor.time_out || 'Not Checked Out'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingLeft: 16,
  },
  searchButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  dateText: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  reportButton: {
    padding: 8,
  },
  reportButtonText: {
    color: '#000000',
    fontWeight: '500',
  },
  // Tab Navigation Styles - Modified to be at the top
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000000',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTabButton: {
    backgroundColor: '#000000',
  },
  tabButtonText: {
    fontWeight: '500',
    color: '#000000',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontWeight: '500',
    color: '#555',
  },
  nameColumn: {
    flex: 3,
  },
  timeColumn: {
    flex: 4,
    textAlign: 'center',
  },
  actionColumn: {
    flex: 2,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 80,
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
  },
  visitorName: {
    fontWeight: '500',
    fontSize: 15,
  },
  timeInfo: {
    flex: 4,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    textAlign: 'center',
  },
  timeInText: {
    color: '#4CD964', // Green color for time in
  },
  timeOutText: {
    color: '#FF3B30', // Red color for time out
  },
  actionContainer: {
    flex: 2,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeOutButton: {
    backgroundColor: '#D9534F',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#252525',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },


  // Date Picker Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  pickerText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Visitor Details Modal Styles
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
    paddingVertical: 2,
    paddingHorizontal: 2,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  visitorDetailsContainer: {
    width: '100%',
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
  visitorDetailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  visitorDetailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 11,
  },
  visitorId: {
    fontSize: 14,
    color: '#252525',
    textAlign: 'center',
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
    flex: 1.5,
    fontSize: 14,
    color: '#555',
  },
  detailsValue: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  visitCountContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitCountValue: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  viewLogLink: {
    color: '#4682B4',
    textDecorationLine: 'underline',
  },
  timeSection: {
    width: '100%',
    marginTop: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#555',
  },
  timeInValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CD964',
  },
  timeOutValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
});

export default VisitorsLogs;