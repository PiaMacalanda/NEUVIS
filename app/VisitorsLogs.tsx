import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, ScrollView, SafeAreaView, Image } from 'react-native';
import { supabase } from '../app/lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

interface Visitor {
  id: number;
  name: string;
  time_of_visit: string;
  time_out?: string;
  visit_id: string;
}

const VisitorsLogs: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  
  // Date picker states
  const [showDateModal, setShowDateModal] = useState(false);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState(formatDate(today));

  // Date picker data
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
  }, [formattedDate]);

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
      
      // Modified query to properly handle the visitor data
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          time_of_visit,
          expiration,
          visit_id,
          visitors(id, name)
        `)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('time_of_visit', { ascending: false });
      
      if (error) throw error;

      // Fix for the "Cannot read property 'name' of null" error
      // Transform data with null check for visitors
        const formattedData = data
          .filter(item => item.visitors !== null)
          .map(item => ({
            id: item.id,
            name: item.visitors?.name || 'Unknown Visitor',
            time_of_visit: formatDateTime(item.time_of_visit),
            time_out: item.expiration ? formatDateTime(item.expiration) : undefined,
            visit_id: item.visit_id,
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
        .update({ expiration: now })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      fetchVisitors();
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
        {!item.time_out ? (
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#000" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Visitor Logs</Text>
      </View>
      
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
        <Text>Pick Date</Text>
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
      
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.nameColumn]}>Visitor Name</Text>
        <Text style={[styles.headerText, styles.timeColumn]}>Time In/Time Out</Text>
        <Text style={[styles.headerText, styles.actionColumn]}>Action</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4682B4" />
        </View>
      ) : (
        <FlatList
          data={filteredVisitors}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No visitors found for this date</Text>
            </View>
          }
        />
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Custom Date Picker Modal */}
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

      {/* Visitor Details Modal - Adjusted to match the screenshots */}
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
                  <View style={styles.logoCircle}>
                    {/* Placeholder for the logo */}
                    <Text style={styles.universityInitials}>NEU</Text>
                  </View>
                  <Text style={styles.universityName}>New Era University</Text>
                </View>
                
                {/* Visitor Name and ID */}
                <View style={styles.visitorDetailsHeader}>
                  <Text style={styles.visitorDetailsName}>{selectedVisitor.name}</Text>
                  <Text style={styles.visitorId}>{selectedVisitor.visit_id}</Text>
                </View>

                <View style={styles.detailsContent}>
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Cellphone #:</Text>
                    <Text style={styles.detailsValue}>+63 9123 456</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Type of ID Received:</Text>
                    <Text style={styles.detailsValue}></Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>ID Number:</Text>
                    <Text style={styles.detailsValue}></Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Entry:</Text>
                    <Text style={styles.detailsValue}>Main Entrance</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Purpose of Visit:</Text>
                    <Text style={styles.detailsValue}></Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Number of Visit:</Text>
                    <View style={styles.visitCountContainer}>
                      <Text style={styles.visitCountValue}>3</Text>
                      <TouchableOpacity>
                        <Text style={styles.viewLogLink}>View Visit Log</Text>
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
                      <Text style={styles.timeOutValue}>{selectedVisitor.time_out || ''}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
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
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#4682B4',
    fontWeight: '500',
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
    backgroundColor: '#4682B4',
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
  scanButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '500',
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
  
  // Updated Visitor Details Modal Styles to match screenshots
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4682B4',
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
    marginBottom: 4,
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