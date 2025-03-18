import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from './lib/supabaseClient';
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

  console.log(visitors);

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

  const filteredVisitors = visitors.filter(visitor => 
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Visitor }) => (
    <View style={styles.visitorRow}>
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.name}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>Time In: {item.time_of_visit}</Text>
          {item.time_out && <Text style={styles.timeText}>Time Out: {item.time_out}</Text>}
        </View>
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
          <TouchableOpacity style={styles.actionButton}>
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
          <Ionicons name="calendar-outline" size={20} color="#666" />
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
    flex: 7,
  },
  visitorName: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 4,
  },
  timeContainer: {
    marginTop: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
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
    color: '#666',
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
});

export default VisitorsLogs;