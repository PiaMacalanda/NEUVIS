import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Button from '../components/buttons';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define types for our data
type VisitorData = {
  id: number;
  name: string;
  id_number: string;
  phone_number: string;
  purpose_of_visit: string;
  visit_id: string;
  gate: string;
  host: string;
  time_in: string;
  time_out: string;
  date: Date;
}

type SortConfig = {
  key: keyof VisitorData | null;
  direction: 'ascending' | 'descending';
}

type FilterConfig = {
  gate: string;
  purpose: string;
  host: string;
  date: Date | null;
}

export default function AdminDataScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    gate: 'all',
    purpose: 'all',
    host: 'all',
    date: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Placeholder data
  const [tableData, setTableData] = useState<VisitorData[]>([
    {
      id: 1,
      name: 'Justin Bieber',
      id_number: '123456',
      phone_number: '78676887',
      purpose_of_visit: 'Cashier',
      visit_id: 'V001',
      gate: 'main',
      host: 'SG001',
      time_in: '8:20 AM',
      time_out: '4:45 PM',
      date: new Date(2025, 2, 10) // March 10, 2025
    },
    {
      id: 2,
      name: 'John Doe',
      id_number: '654321',
      phone_number: '55512345',
      purpose_of_visit: 'Meeting',
      visit_id: 'V002',
      gate: 'side',
      host: 'SG002',
      time_in: '9:30 AM',
      time_out: '2:15 PM',
      date: new Date(2025, 2, 11) // March 11, 2025
    },
    {
      id: 3,
      name: 'Jane Smith',
      id_number: '987654',
      phone_number: '77788899',
      purpose_of_visit: 'Interview',
      visit_id: 'V003',
      gate: 'main',
      host: 'SG001',
      time_in: '10:00 AM',
      time_out: '11:30 AM',
      date: new Date(2025, 2, 12) // March 12, 2025
    },
  ]);

  // Get unique gates, purposes, and hosts for filtering
  const gates = ['all', ...new Set(tableData.map(item => item.gate))];
  const purposes = ['all', ...new Set(tableData.map(item => item.purpose_of_visit))];
  const hosts = ['all', ...new Set(tableData.map(item => item.host))];

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFilterConfig({...filterConfig, date: selectedDate});
    }
  };

  // Filter function for search and filters
  const filteredData = tableData.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.id_number.toLowerCase().includes(searchLower) ||
      item.phone_number.toLowerCase().includes(searchLower) ||
      item.purpose_of_visit.toLowerCase().includes(searchLower) ||
      item.visit_id.toLowerCase().includes(searchLower) ||
      item.gate.toLowerCase().includes(searchLower) ||
      item.host.toLowerCase().includes(searchLower) ||
      item.date.toLocaleDateString().toLowerCase().includes(searchLower);
    
    const matchesGate = filterConfig.gate === 'all' || item.gate === filterConfig.gate;
    const matchesPurpose = filterConfig.purpose === 'all' || item.purpose_of_visit === filterConfig.purpose;
    const matchesHost = filterConfig.host === 'all' || item.host === filterConfig.host;
    
    let matchesDate = true;
    if (filterConfig.date) {
      const filterDate = filterConfig.date;
      matchesDate = (
        item.date.getFullYear() === filterDate.getFullYear() &&
        item.date.getMonth() === filterDate.getMonth() &&
        item.date.getDate() === filterDate.getDate()
      );
    }
    
    return matchesSearch && matchesGate && matchesPurpose && matchesHost && matchesDate;
  });

  // Sorting function
  const sortData = (key: keyof VisitorData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterConfig({
      gate: 'all',
      purpose: 'all',
      host: 'all',
      date: null
    });
    setSearchQuery('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header role="Administrator" name="Admin Data" />
      </View>
      
      {/* Search and Filter */}
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Text style={styles.buttonText}>Filters</Text>
          <Ionicons name="filter" size={18} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Expanded filter options */}
      {showFilters && (
        <View style={styles.expandedFilters}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Gate:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterConfig.gate}
                style={styles.picker}
                onValueChange={(itemValue) => setFilterConfig({...filterConfig, gate: itemValue})}>
                {gates.map(gate => (
                  <Picker.Item key={gate} label={gate.charAt(0).toUpperCase() + gate.slice(1)} value={gate} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Purpose:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterConfig.purpose}
                style={styles.picker}
                onValueChange={(itemValue) => setFilterConfig({...filterConfig, purpose: itemValue})}>
                {purposes.map(purpose => (
                  <Picker.Item key={purpose} label={purpose.charAt(0).toUpperCase() + purpose.slice(1)} value={purpose} />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Host filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Host:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterConfig.host}
                style={styles.picker}
                onValueChange={(itemValue) => setFilterConfig({...filterConfig, host: itemValue})}>
                {hosts.map(host => (
                  <Picker.Item key={host} label={host} value={host} />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Date filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Date:</Text>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text>
                {filterConfig.date ? filterConfig.date.toLocaleDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {filterConfig.date && (
              <TouchableOpacity 
                style={styles.clearDateButton} 
                onPress={() => setFilterConfig({...filterConfig, date: null})}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={filterConfig.date || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Data Table */}
      <View style={styles.tableContainerWrapper}>
        <View style={styles.tableContainer}>
          <ScrollView horizontal contentContainerStyle={styles.tableScrollContent}>
            <View style={styles.tableFullWidth}>
              <View style={styles.tableHeader}>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('name')}>
                  <Text style={styles.headerText}>Name</Text>
                  <Ionicons 
                    name={sortConfig.key === 'name' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('id_number')}>
                  <Text style={styles.headerText}>ID</Text>
                  <Ionicons 
                    name={sortConfig.key === 'id_number' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('phone_number')}>
                  <Text style={styles.headerText}>Phone</Text>
                  <Ionicons 
                    name={sortConfig.key === 'phone_number' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('purpose_of_visit')}>
                  <Text style={styles.headerText}>Purpose</Text>
                  <Ionicons 
                    name={sortConfig.key === 'purpose_of_visit' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('visit_id')}>
                  <Text style={styles.headerText}>Visit ID</Text>
                  <Ionicons 
                    name={sortConfig.key === 'visit_id' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('gate')}>
                  <Text style={styles.headerText}>Gate</Text>
                  <Ionicons 
                    name={sortConfig.key === 'gate' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('host')}>
                  <Text style={styles.headerText}>Host</Text>
                  <Ionicons 
                    name={sortConfig.key === 'host' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('time_in')}>
                  <Text style={styles.headerText}>Time In</Text>
                  <Ionicons 
                    name={sortConfig.key === 'time_in' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('time_out')}>
                  <Text style={styles.headerText}>Time Out</Text>
                  <Ionicons 
                    name={sortConfig.key === 'time_out' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => sortData('date')}>
                  <Text style={styles.headerText}>Date</Text>
                  <Ionicons 
                    name={sortConfig.key === 'date' 
                      ? (sortConfig.direction === 'ascending' ? 'arrow-down' : 'arrow-up') 
                      : 'swap-vertical'} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
              
              {sortedData.map((item, index) => (
                <View 
                  key={item.id} 
                  style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
                >
                  <View style={styles.cell}>
                    <Text>{item.name}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.id_number}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.phone_number}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.purpose_of_visit}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.visit_id}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.gate}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.host}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.time_in}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.time_out}</Text>
                  </View>
                  <View style={styles.cell}>
                    <Text>{item.date.toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
              
              {sortedData.length === 0 && (
                <View style={styles.noDataRow}>
                  <Text style={styles.noDataText}>No matching records found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    padding: 8,
  },
  filterButton: {
    backgroundColor: '#2c3e50',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginRight: 5,
  },
  tableContainerWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  tableContainer: {
    width: '95%', // Increased from 90% to 95%
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableScrollContent: {
    flexGrow: 1,
  },
  tableFullWidth: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
  },
  headerCell: {
    padding: 15,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  cell: {
    padding: 12,
    width: 120,
    justifyContent: 'center',
  },
  expandedFilters: {
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    width: 80,
    fontWeight: '500',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  datePickerButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  clearDateButton: {
    padding: 5,
    marginLeft: 5,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  noDataRow: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  noDataText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});