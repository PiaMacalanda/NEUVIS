import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
  cardBackground: '#F8F8F8',
  navyBlue: '#0A3B75', // Added dark blue color to match Admin Reports header
};

interface Report {
  id: string;
  title: string;
  created: string;
  data: any[];
  filters: any;
  created_by: {
    name: string;
  };
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
  created_by: {
    name: string;
  };
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
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [reportToRename, setReportToRename] = useState<string | null>(null);
  const [newReportName, setNewReportName] = useState<string>('');
  const navigation = useNavigation();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [showMaximizeModal, setShowMaximizeModal] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGate, setFilterGate] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        const currentUser = userData?.user;
        
        const { data, error } = await supabase
        .from('saved_reports')
        .select(`
          id,
          name,
          created_at,
          created_by:users (
            full_name
          ),
          data_snapshot,
          filters
        `);
      
        if (error) {
          console.error('Error fetching reports:', error);
          throw error;
        }
        const formatted = (data || []).map(r => ({
          id: r.id,
          title: r.name || 'Untitled Report',
          created: new Date(r.created_at).toISOString(),
          created_by: {
            name: r.created_by?.full_name || 'Unknown'
          },
          data: r.data_snapshot || [],
          filters: r.filters || {}
        }));
        
        setReports(formatted);
        setFilteredReports(formatted);
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

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterGate, reports]);

  const applyFilters = () => {
    let results = [...reports];
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(report => 
        report.title.toLowerCase().includes(lowercasedSearch) ||
        report.created_by.name.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply gate filter if selected
    if (filterGate) {
      results = results.filter(report => 
        report.filters?.gate?.toLowerCase().includes(filterGate.toLowerCase())
      );
    }
    
    setFilteredReports(results);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterGate('');
    setFilteredReports(reports);
  };

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
      setFilteredReports(prevFiltered => 
        prevFiltered.map(report => 
          report.id === reportToRename 
            ? { ...report, title: newReportName } 
            : report
        )
      );
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
      setFilteredReports(filteredReports.filter(report => report.id !== reportId));
      Alert.alert('Success', 'Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert('Error', 'Failed to delete report');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  // Function to generate HTML for printing
  const generatePrintHTML = (report: SavedReport | null) => {
    if (!report) return '';

    // Generate table rows for the report data
    const tableRows = report.data.map((item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f8f8f8' : '#ffffff'}; border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 8px; text-align: center;">${item.name || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.id_number || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.phone_number || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.purpose_of_visit || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.gate || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.host || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.time_in || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.time_out || 'N/A'}</td>
        <td style="padding: 8px; text-align: center;">${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `).join('');

    // Get filter information
    const filters = report.filters || {};

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #0A3B75;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .report-info {
              margin-bottom: 30px;
            }
            .report-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .filter-section {
              background-color: #f8f8f8;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .filter-section h2 {
              font-size: 16px;
              margin-top: 0;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th {
              background-color: #0A3B75;
              color: white;
              padding: 10px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>${report.title}</h1>
          
          <div class="report-info">
            <p><strong>Created:</strong> ${new Date(report.created).toLocaleString()}</p>
            <p><strong>Created by:</strong> ${report.created_by?.name || 'Unknown'}</p>
          </div>
          
          <div class="filter-section">
            <h2>Applied Filters:</h2>
            <p><strong>Gate:</strong> ${filters.gate || 'All'}</p>
            <p><strong>Purpose:</strong> ${filters.purpose || 'All'}</p>
            <p><strong>Host:</strong> ${filters.host || 'All'}</p>
            ${filters.date ? `<p><strong>Date:</strong> ${new Date(filters.date).toLocaleDateString()}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Gate</th>
                <th>Host</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.length > 0 ? tableRows : '<tr><td colspan="9" style="text-align: center; padding: 20px;">No data available</td></tr>'}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Report generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Function to print the report
  const printReport = async (report: SavedReport | null) => {
    if (!report) {
      Alert.alert('Error', 'No report selected for printing');
      return;
    }

    try {
      setIsPrinting(true);
      const html = generatePrintHTML(report);
      
      // Print the PDF
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF file saved to:', uri);
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // Share the PDF
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${report.title} Report`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Success', 'PDF created successfully!');
      }
    } catch (error) {
      console.error('Error printing report:', error);
      Alert.alert('Error', 'Failed to print report');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Filters Section at the top */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={colors.mediumGray}
          />
          <TouchableOpacity 
            style={styles.filterToggleButton} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name={showFilters ? "options" : "options-outline"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={styles.advancedFilters}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Gate:</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity 
                  style={[
                    styles.filterOption, 
                    filterGate === 'Gate 1' && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilterGate(filterGate === 'Gate 1' ? '' : 'Gate 1')}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      filterGate === 'Gate 1' && styles.filterOptionTextSelected
                    ]}
                  >
                    Gate 1
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.filterOption, 
                    filterGate === 'Gate 2' && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilterGate(filterGate === 'Gate 2' ? '' : 'Gate 2')}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      filterGate === 'Gate 2' && styles.filterOptionTextSelected
                    ]}
                  >
                    Gate 2
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.reportsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text>No reports found. Create a report from the Data section.</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>created: {report.created}</Text>
                <Text style={styles.reportName}>created by: {report.created_by.name}</Text>
              </View>
              
              <View style={styles.reportActions}>
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
                
                {/* Print Button */}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    const reportToPrint = reports.find(r => r.id === report.id);
                    printReport(reportToPrint || null);
                  }}
                >
                  <Ionicons name="print-outline" size={24} color={colors.black} />
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
            <View style={styles.modalHeaderActions}>
              {/* Print Button */}
              <TouchableOpacity 
                style={styles.modalHeaderButton}
                onPress={() => printReport(selectedReport)}
                disabled={isPrinting}
              >
                <Ionicons 
                  name="print-outline" 
                  size={24} 
                  color={colors.white} 
                />
              </TouchableOpacity>
              
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.modalHeaderButton}
                onPress={() => setShowMaximizeModal(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={colors.white} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Filters Section - Positioned above the ScrollView */}
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
          </ScrollView>
          
          {/* Print loading indicator */}
          {isPrinting && (
            <View style={styles.printingOverlay}>
              <View style={styles.printingContent}>
                <Text style={styles.printingText}>Generating PDF...</Text>
              </View>
            </View>
          )}
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
  // New Filter styles
  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.black,
    backgroundColor: colors.lightGray,
  },
  filterToggleButton: {
    padding: 8,
    marginLeft: 8,
  },
  advancedFilters: {
    marginTop: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.black,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.white,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: colors.black,
  },
  filterOptionTextSelected: {
    color: colors.white,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportInfo: {
    flex: 1,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.black,
  },
  reportDate: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 2,
  },
  reportName: {
    fontSize: 14,
    color: colors.darkGray,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  confirmationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
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
  }, 
  modalContainer: {
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
    backgroundColor: colors.navyBlue, // Updated to navyBlue to match Admin Reports header
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderButton: {
    marginLeft: 16,
    padding: 4,
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
  // New styles for printing
  printingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  printingContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  printingText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
});

export default AdminReport;