import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, ScrollView, SafeAreaView, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/logo';
import { Visitor, fetchVisitors, updateVisitorTimeOut, formatDate } from './api/notification-service/visitorsApi';
import styles from '../../assets/VisitorsLogsStyles';

const VisitorsLogs: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  
  const [showDateModal, setShowDateModal] = useState(false);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState(formatDate(today));

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
        
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
        
  useEffect(() => {
    loadVisitors();
  }, [formattedDate, activeTab]);
        
  const loadVisitors = async () => {
    try {
      setLoading(true);
      const visitorData = await fetchVisitors(selectedDate, activeTab);
      // Sort visitors by time_of_visit in descending order (newest first)
      const sortedVisitors = [...visitorData].sort((a, b) => {
        // Convert time strings to Date objects for comparison
        const timeA = new Date(`${selectedDate.toDateString()} ${a.time_of_visit}`);
        const timeB = new Date(`${selectedDate.toDateString()} ${b.time_of_visit}`);
        return timeB.getTime() - timeA.getTime();
      });
      setVisitors(sortedVisitors);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  };
     
  const handleDateSelection = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
    setFormattedDate(formatDate(newDate));
    setShowDateModal(false);
  };

  const handleTimeOut = async (id: number) => {
    try {
      await updateVisitorTimeOut(id);
      
      setShowVisitorModal(false);
      loadVisitors();
      setActiveTab('completed');
    } catch (error) {
      console.error('Error handling time out:', error);
    }
  };

  const handleViewVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowVisitorModal(true);
  };

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      Clipboard.setString(text);
    }
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
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewVisitor(item)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
      
      {activeTab === 'completed' && (
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Ionicons name="calendar-outline" size={20} color="#252525" />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.nameColumn]}>Visitor Name</Text>
        <Text style={[styles.headerText, styles.timeColumn]}>Time In/Time Out</Text>
        <Text style={[styles.headerText, styles.actionColumn]}></Text>
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
                  <Text style={styles.visitorDetailsName}>{selectedVisitor.name}</Text>
                  <Text style={styles.visitorId}>{selectedVisitor.visit_id}</Text>
                </View>

                <View style={styles.detailsContent}>
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Phone no:</Text>
                    <View style={styles.visitCountContainer}>
                      <Text style={styles.detailsValue}>{selectedVisitor.phone_number || 'N/A'}</Text>
                      {selectedVisitor.phone_number && (
                        <TouchableOpacity onPress={() => copyToClipboard(selectedVisitor.phone_number)}>
                          <Ionicons name="copy-outline" size={20} color="#4682B4" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                      )}
                    </View>
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
                    <Text style={styles.detailsValue}>{selectedVisitor.entry_gate || 'Unknown Gate'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Purpose of Visit:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitor.purpose_of_visit || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Number of Visit:</Text>
                    <View style={styles.visitCountContainer}>
                      <Text style={styles.visitCountValue}>{selectedVisitor.visit_count || 1}</Text>
                      
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
                  
                  {activeTab === 'ongoing' && !selectedVisitor.time_out && (
                    <TouchableOpacity 
                      style={styles.timeOutModalButton}
                      onPress={() => handleTimeOut(selectedVisitor.id)}
                    >
                      <Text style={styles.timeOutModalButtonText}>Time Out</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.footer}></View>
    </SafeAreaView>
  );
};

export default VisitorsLogs;