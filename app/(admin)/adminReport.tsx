import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header'; 
  import { supabase } from '../lib/supabaseClient';

// Define color constants to avoid themeColors errors
const colors = {
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
  gray: '#E0E0E0',
  mediumGray: '#9E9E9E',
  darkGray: '#616161',
  danger: '#FF3B30',
  dangerLight: '#FFEEEE',
  primary: '#007AFF',
  secondary: '#5856D6',
  cardBackground: '#F8F8F8'
};

interface Report {
  id: string;
  title: string;
  created: string;
  data: any[];
  filters: any;
}

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface SavedReport {
  id: string;
  title: string;
  created: string;
  data: any[]; // This will hold the data_snapshot contents
  filters: any;
}

// Simple button component to avoid type errors
const CustomButton: React.FC<ButtonProps> = ({ onPress, label, variant = 'primary' }) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary': return styles.primaryButton;
      case 'secondary': return styles.secondaryButton;
      case 'danger': return styles.dangerButton;
      default: return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary': 
      case 'danger': return styles.buttonTextLight;
      case 'secondary': return styles.buttonTextDark;
      default: return styles.buttonTextLight;
    }
  };

  return (
    <TouchableOpacity style={[styles.button, getButtonStyle()]} onPress={onPress}>
      <Text style={getTextStyle()}>{label}</Text>
    </TouchableOpacity>
  );
};

const AdminReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [reportToRename, setReportToRename] = useState<string | null>(null);
  const [newReportName, setNewReportName] = useState<string>('');
  const navigation = useNavigation();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [showMaximizeModal, setShowMaximizeModal] = useState<boolean>(false);



  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_reports')
          .select('*')
          .order('created_at', { ascending: false });
  
        if (error) {
          console.error('Error fetching reports:', error);
          throw error;
        }
  
        const formatted = (data || []).map(r => ({
          id: r.id,
          title: r.name, // Use 'name' field instead of 'title'
          created: new Date(r.created_at).toLocaleString(),
          data: r.data_snapshot, // Use 'data_snapshot' field instead of 'data'
          filters: r.filters
        }));
  
        setReports(formatted);
      } catch (error) {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
  
    fetchReports();
  
    // Optional: Update real-time listener to match table name
    const reportSubscription = supabase
      .channel('saved_reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_reports' }, () => {
        fetchReports();
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(reportSubscription);
    };
  }, []);

  const handleEdit = (reportId: string, currentTitle: string) => {
    setReportToRename(reportId);
    setNewReportName(currentTitle);
    setIsRenaming(true);
  };

  const handleRenameConfirm = async () => {
    if (!reportToRename || !newReportName.trim()) {
      setIsRenaming(false);
      return;
    }
  
    try {
      // Update the report name in Supabase
      const { error } = await supabase
        .from('saved_reports')
        .update({ name: newReportName })
        .eq('id', reportToRename);
  
      if (error) throw error;
  
      // Update report name locally
      const updatedReports = reports.map(report => 
        report.id === reportToRename 
          ? { ...report, title: newReportName } 
          : report
      );
      
      setReports(updatedReports);
      Alert.alert('Success', `Report renamed to "${newReportName}"`);
    } catch (error) {
      console.error('Error renaming report:', error);
      Alert.alert('Error', 'Failed to rename report');
    } finally {
      // Reset rename state
      setIsRenaming(false);
      setReportToRename(null);
      setNewReportName('');
    }
  };
  
  const confirmDelete = async (reportId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId);
  
      if (error) throw error;
  
      // Remove report locally
      setReports(reports.filter(report => report.id !== reportId));
      Alert.alert('Success', 'Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert('Error', 'Failed to delete report');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handlePrint = (id: string) => {
    Alert.alert('Print', 'Printing functionality not implemented yet');
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.reportsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading reports...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text>No reports found. Create a report from the Data section.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>created: {report.created}</Text>
              </View>
              
              <View style={styles.reportActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePrint(report.id)}
                >
                  <Ionicons name="print-outline" size={24} color={colors.black} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDelete(report.id)}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.black} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(report.id, report.title)}
                >
                  <Ionicons name="pencil" size={24} color={colors.black} />
                </TouchableOpacity>
                
                <TouchableOpacity 
             style={styles.actionButton}
              onPress={() => {
              const reportToView = reports.find(r => r.id === report.id);
              setSelectedReport(reportToView || null);
               setShowMaximizeModal(true);
              }}
              >
  <Ionicons name="expand" size={24} color={colors.black} />
</TouchableOpacity>
              </View>
              
              {showDeleteConfirm === report.id && (
                <View style={styles.confirmationContainer}>
                  <Text style={styles.confirmationText}>
                    Are you sure you want to delete this report?
                  </Text>
                  <View style={styles.confirmationButtons}>
                    <CustomButton 
                      label="Yes, delete" 
                      onPress={() => confirmDelete(report.id)}
                      variant="danger"
                    />
                    <CustomButton 
                      label="Cancel" 
                      onPress={() => setShowDeleteConfirm(null)}
                      variant="secondary"
                    />
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={isRenaming}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenaming(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Report</Text>
            <TextInput
              style={styles.input}
              value={newReportName}
              onChangeText={setNewReportName}
              placeholder="Enter new report name"
              placeholderTextColor={colors.mediumGray}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                label="Cancel"
                onPress={() => setIsRenaming(false)}
                variant="secondary"
              />
              <CustomButton
                label="Save"
                onPress={handleRenameConfirm}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Maximize Modal */}
<Modal
  visible={showMaximizeModal}
  transparent={false}
  animationType="slide"
  onRequestClose={() => setShowMaximizeModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalHeaderText}>
        {selectedReport?.title || 'Report Details'}
      </Text>
      <TouchableOpacity onPress={() => setShowMaximizeModal(false)}>
        <Ionicons name="close" size={24} color={colors.black} />
      </TouchableOpacity>
    </View>
    
    <ScrollView>
      {/* Table Header */}
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>ID</Text>
            <Text style={styles.headerCell}>Phone</Text>
            <Text style={styles.headerCell}>Purpose</Text>
            <Text style={styles.headerCell}>Gate</Text>
            <Text style={styles.headerCell}>Host</Text>
            <Text style={styles.headerCell}>Time In</Text>
            <Text style={styles.headerCell}>Time Out</Text>
            <Text style={styles.headerCell}>Date</Text>
          </View>
          
          {/* Table Rows */}
          {selectedReport?.data?.map((item, index) => (
            <View 
              key={index}
              style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
            >
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.id_number}</Text>
              <Text style={styles.cell}>{item.phone_number}</Text>
              <Text style={styles.cell}>{item.purpose_of_visit}</Text>
              <Text style={styles.cell}>{item.gate}</Text>
              <Text style={styles.cell}>{item.host}</Text>
              <Text style={styles.cell}>{item.time_in}</Text>
              <Text style={styles.cell}>{item.time_out}</Text>
              <Text style={styles.cell}>
                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          ))}
          
          {(!selectedReport?.data || selectedReport.data.length === 0) && (
            <View style={styles.emptyTableRow}>
              <Text style={styles.emptyTableText}>No data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.filterInfo}>
        <Text style={styles.filterInfoTitle}>Applied Filters:</Text>
        {selectedReport?.filters && (
          <View style={styles.filtersList}>
            <Text>Gate: {selectedReport.filters.gate || 'All'}</Text>
            <Text>Purpose: {selectedReport.filters.purpose || 'All'}</Text>
            <Text>Host: {selectedReport.filters.host || 'All'}</Text>
            {selectedReport.filters.date && (
              <Text>Date: {new Date(selectedReport.filters.date).toLocaleDateString()}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  reportsContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reportCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  reportInfo: {
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  reportDate: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  confirmationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  confirmationText: {
    marginBottom: 12,
    color: colors.black,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    color: colors.black,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.gray,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  buttonTextLight: {
    color: colors.white,
    fontWeight: '600',
  },
  buttonTextDark: {
    color: colors.black,
    fontWeight: '600',
  }, modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    backgroundColor: colors.primary,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  tableContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.darkGray,
    paddingVertical: 12,
  },
  headerCell: {
    width: 120,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  evenRow: {
    backgroundColor: colors.white,
  },
  oddRow: {
    backgroundColor: colors.lightGray,
  },
  cell: {
    width: 120,
    padding: 10,
    textAlign: 'center',
  },
  emptyTableRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTableText: {
    color: colors.mediumGray,
  },
  filterInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  filterInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filtersList: {
    marginTop: 8,
  },
});

export default AdminReport;