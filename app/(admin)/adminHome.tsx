import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Button from '../components/buttons';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './lib/supabaseClient';
import { format } from 'date-fns';

interface Visit {
  time_of_visit: string;
  visitor_id?: string;
  visit_id?: string;
}

interface Visitor {
  id?: string;
  id_number?: string;
  name: string;
}

interface VisitorStat {
  totalVisitors: number;
  dailyVisits: Array<{date: string; count: number}>;
  visitorFrequency: Array<{name: string; count: number}>;
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<VisitorStat>({
    totalVisitors: 0,
    dailyVisits: [],
    visitorFrequency: []
  });
  const [dateFilter, setDateFilter] = useState<string>('all'); 

  // Add this after your state definitions
  useEffect(() => {
  fetchVisitorData();
  }, [dateFilter]);
  
  const fetchVisitorData = async () => {
    setIsLoading(true);
    try {
      // Fetch from visits table
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*');
  
      if (visitsError) throw visitsError;
  
      // Fetch from visitors table
      const { data: visitorsData, error: visitorsError } = await supabase
        .from('visitors')
        .select('*');
  
      if (visitorsError) throw visitorsError;
  
      // Process data
      const processedData = processVisitorData(visitsData as Visit[], visitorsData as Visitor[]);
      setVisitorStats(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processVisitorData = (visitsData: Visit[], visitorsData: Visitor[]): VisitorStat => {
    // Map to store daily visits
    const dailyVisitsMap = new Map();
    
    // Map to store visitor frequency
    const visitorFrequencyMap = new Map();
    
    // Process each visit
    visitsData.forEach(visit => {
      // Get visit date (without time)
      const visitDate = new Date(visit.time_of_visit);
      const dateString = visitDate.toISOString().split('T')[0];
      
      // Filter based on selected date range
      if (!isDateInRange(visitDate)) {
        return;
      }

      // Update daily visits count
      if (dailyVisitsMap.has(dateString)) {
        dailyVisitsMap.set(dateString, dailyVisitsMap.get(dateString) + 1);
      } else {
        dailyVisitsMap.set(dateString, 1);
      }
      
      // Find corresponding visitor
      const visitor = visitorsData.find(v => {
        // Try different matching strategies
        if (visit.visitor_id && v.id && visit.visitor_id === v.id) return true;
        
        if (visit.visit_id && v.id) {
          const visitorIdFromVisit = visit.visit_id.split('-')[1];
          return visitorIdFromVisit === v.id;
        }
        
        if (visit.visit_id && v.id_number) {
          return v.id_number.includes(visit.visit_id) || 
                visit.visit_id.includes(v.id_number);
        }
        
        return false;
      });
      
      // Update visitor frequency
      const visitorName = visitor ? visitor.name : 'Unknown Visitor';
      if (visitorFrequencyMap.has(visitorName)) {
        visitorFrequencyMap.set(visitorName, visitorFrequencyMap.get(visitorName) + 1);
      } else {
        visitorFrequencyMap.set(visitorName, 1);
      }
    });
    
    // Convert maps to arrays and sort
    const dailyVisits = Array.from(dailyVisitsMap, ([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
    
    const visitorFrequency = Array.from(visitorFrequencyMap, ([name, count]) => ({ name, count }))
    .sort((a, b) => Number(b.count) - Number(a.count));
    
    return {
      totalVisitors: visitorFrequency.length,
      dailyVisits,
      visitorFrequency
    };
  };
  
  const isDateInRange = (date: Date | string): boolean => {
    if (dateFilter === 'all') return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const visitDate = new Date(date);
    visitDate.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      return visitDate.getTime() === today.getTime();
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return visitDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return visitDate >= oneMonthAgo;
    }
    
    return true;
  };

  const navigateToVisitorDetails = (visitorName: string): void => {
    console.log(`Navigate to details for ${visitorName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header role="Administrator" name="Statistical Report" />
      </View>
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Time Period:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dateFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setDateFilter(itemValue)}>
            <Picker.Item label="All Time" value="all" />
            <Picker.Item label="Today" value="today" />
            <Picker.Item label="Last 7 Days" value="week" />
            <Picker.Item label="Last 30 Days" value="month" />
          </Picker>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading statistics...</Text>
        </View>
      ) : (
        <>
          {/* Summary Statistics */}
          <View style={styles.summaryContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Unique Visitors</Text>
              <Text style={styles.statValue}>{visitorStats.totalVisitors}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Visits</Text>
              <Text style={styles.statValue}>
                {visitorStats.visitorFrequency.reduce((total, visitor) => total + visitor.count, 0)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg. Visits Per Person</Text>
              <Text style={styles.statValue}>
                {visitorStats.totalVisitors > 0 
                  ? (visitorStats.visitorFrequency.reduce((total, visitor) => total + visitor.count, 0) / 
                     visitorStats.totalVisitors).toFixed(1)
                  : '0'}
              </Text>
            </View>
          </View>
          
          {/* Daily Visits Chart */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Daily Visits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartContainer}>
                {visitorStats.dailyVisits.map((day, index) => {
                  // Calculate bar height (max height is 150)
                  const maxCount = Math.max(...visitorStats.dailyVisits.map(d => d.count));
                  const barHeight = maxCount > 0 
                    ? Math.max(30, (day.count && maxCount) ? (day.count / maxCount) * 150 : 30) 
                     : 30;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <Text style={styles.chartValue}>{day.count}</Text>
                      <View 
                        style={[
                          styles.bar, 
                          { height: barHeight }
                        ]} 
                      />
                      <Text style={styles.chartLabel}>
                        {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  );
                })}
                {visitorStats.dailyVisits.length === 0 && (
                  <Text style={styles.noDataText}>No visit data for selected period</Text>
                )}
              </View>
            </ScrollView>
          </View>
          
          {/* Visitor Frequency List */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Visitor Frequency</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Visitor Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Visit Count</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actions</Text>
            </View>
            {visitorStats.visitorFrequency.map((visitor, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index % 2 === 0 ? styles.evenRow : styles.oddRow
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>{visitor.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{visitor.count}</Text>
                <View style={[styles.tableCellAction, { flex: 1 }]}>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => navigateToVisitorDetails(visitor.name)}
                  >
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {visitorStats.visitorFrequency.length === 0 && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No visitor data for selected period</Text>
              </View>
            )}
          </View>
        </>
      )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
    width: 100,
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
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
    paddingBottom: 10,
  },
  chartBar: {
    alignItems: 'center',
    marginRight: 12,
    width: 50,
  },
  bar: {
    width: 30,
    backgroundColor: '#3498db',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  chartValue: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  tableCellAction: {
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
  },
});
