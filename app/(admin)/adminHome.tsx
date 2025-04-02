import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabaseClient';
import Header from '../../components/Header';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';


interface Visit {
  time_of_visit: string;
  visitor_id?: string;
  visit_id?: string;
  purpose_of_visit: string;
  gate?: string;
  host?: string;
  time_in?: string;
  time_out?: string;
}

interface Visitor {
  id?: string;
  id_number?: string;
  name: string;
  phone?: string;
}

interface VisitorStat {
  totalVisitors: number;
  dailyVisits: Array<{date: string; count: number}>;
  monthlyVisits: Array<{month: string; count: number}>;
  yearlyVisits: Array<{year: string; count: number}>;
  visitorFrequency: Array<{name: string; count: number; details?: VisitorDetail}>;
}

interface VisitorDetail {
  name: string;
  id_number?: string;
  phone?: string;
  visitHistory: Array<{
    date: string;
    time_in: string;
    time_out: string;
    purpose: string;
    gate?: string;
    host?: string;
  }>;
  visit_count: number;
}

interface VisitorTrends {
  mostCommonPurposes: Array<{purpose: string; count: number}>;
  topVisitors: Array<{name: string; count: number}>;
  peakHours: Array<{hour: string; count: number}>;
  topGates: Array<{gate: string; count: number}>;
}

export default function AdminHomeScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'trends'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<VisitorStat>({
    totalVisitors: 0,
    dailyVisits: [],
    monthlyVisits: [],
    yearlyVisits: [],
    visitorFrequency: []
  });
  const [visitorTrends, setVisitorTrends] = useState<VisitorTrends>({
    mostCommonPurposes: [],
    topVisitors: [],
    peakHours: [],
    topGates: []
  });
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetail | null>(null);

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
      const processedTrends = processVisitorTrends(visitsData as Visit[], visitorsData as Visitor[]);
      
      setVisitorStats(processedData);
      setVisitorTrends(processedTrends);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processVisitorData = (visitsData: Visit[], visitorsData: Visitor[]): VisitorStat => {
    // Maps to store daily, monthly, and yearly visits
    const dailyVisitsMap = new Map();
    const monthlyVisitsMap = new Map();
    const yearlyVisitsMap = new Map();
    
    // Map to store visitor frequency (case-insensitive)
    const visitorFrequencyMap = new Map();
    
    // Map for visitor details
    const visitorDetailsMap = new Map();
    
    // Process each visit
    visitsData.forEach(visit => {
      // Get visit date
      const visitDate = new Date(visit.time_of_visit);
      
      // Skip if not in selected date range
      if (!isDateInRange(visitDate)) {
        return;
      }

      // Date formats for different view modes
      const dateString = visitDate.toISOString().split('T')[0];
      const monthString = `${visitDate.getFullYear()}-${(visitDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const yearString = visitDate.getFullYear().toString();
      
      // Update daily visits count
      if (dailyVisitsMap.has(dateString)) {
        dailyVisitsMap.set(dateString, dailyVisitsMap.get(dateString) + 1);
      } else {
        dailyVisitsMap.set(dateString, 1);
      }
      
      // Update monthly visits count
      if (monthlyVisitsMap.has(monthString)) {
        monthlyVisitsMap.set(monthString, monthlyVisitsMap.get(monthString) + 1);
      } else {
        monthlyVisitsMap.set(monthString, 1);
      }
      
      // Update yearly visits count
      if (yearlyVisitsMap.has(yearString)) {
        yearlyVisitsMap.set(yearString, yearlyVisitsMap.get(yearString) + 1);
      } else {
        yearlyVisitsMap.set(yearString, 1);
      }
      
      // Find corresponding visitor (case-insensitive)
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
      
      // Get visitor name (or Unknown if not found)
      const visitorName = visitor ? visitor.name : 'Unknown Visitor';
      const normalizedName = visitorName.toLowerCase();
      
      // Update visitor frequency (case-insensitive)
      if (visitorFrequencyMap.has(normalizedName)) {
        visitorFrequencyMap.set(normalizedName, visitorFrequencyMap.get(normalizedName) + 1);
      } else {
        visitorFrequencyMap.set(normalizedName, 1);
      }
      
      // Update or create visitor details
      if (!visitorDetailsMap.has(normalizedName)) {
        visitorDetailsMap.set(normalizedName, {
          name: visitorName, // Use original casing for display
          id_number: visitor?.id_number || '',
          phone: visitor?.phone || '',
          visitHistory: [],
          visit_count: 0
        });
      }
      
      // Extract time information
      const timeIn = visit.time_in || new Date(visit.time_of_visit).toLocaleTimeString();
      const timeOut = visit.time_out || '';
      
      // Add visit to history
      visitorDetailsMap.get(normalizedName).visitHistory.push({
        date: dateString,
        time_in: timeIn,
        time_out: timeOut,
        purpose: visit.purpose_of_visit || 'Not specified',
        gate: visit.gate || '',
        host: visit.host || ''
      });
      
      // Increment visit count
      visitorDetailsMap.get(normalizedName).visit_count += 1;
    });
    
    // Convert maps to arrays and sort
    const dailyVisits = Array.from(dailyVisitsMap, ([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
    
    const monthlyVisits = Array.from(monthlyVisitsMap, ([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month));
    
    const yearlyVisits = Array.from(yearlyVisitsMap, ([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
    
    // Convert visitor frequency and add details
    const visitorFrequency = Array.from(visitorFrequencyMap, ([name, count]) => {
      return {
        name: visitorDetailsMap.get(name).name, // Use original casing
        count,
        details: visitorDetailsMap.get(name)
      };
    }).sort((a, b) => b.count - a.count);
    
    return {
      totalVisitors: visitorFrequency.length,
      dailyVisits,
      monthlyVisits,
      yearlyVisits,
      visitorFrequency
    };
  };

  const processVisitorTrends = (visitsData: Visit[], visitorsData: Visitor[]): VisitorTrends => {
    // Most Common Purposes
    const purposesMap = new Map<string, number>();
    const purposesFilter = visitsData.filter(visit => isDateInRange(new Date(visit.time_of_visit)));
    
    purposesFilter.forEach(visit => {
      const purpose = visit.purpose_of_visit || 'Unknown';
      purposesMap.set(purpose, (purposesMap.get(purpose) || 0) + 1);
    });
    
    const mostCommonPurposes = Array.from(purposesMap, ([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
      const gatesMap = new Map<string, number>();
      purposesFilter.forEach(visit => {
        const gate = visit.gate || 'Not Specified';
        gatesMap.set(gate, (gatesMap.get(gate) || 0) + 1);
      });
      
      const topGates = Array.from(gatesMap, ([gate, count]) => ({ gate, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Top Visitors
    const visitorsMap = new Map<string, number>();
    purposesFilter.forEach(visit => {
      const visitor = visitorsData.find(v => 
        (visit.visitor_id && v.id && visit.visitor_id === v.id) ||
        (visit.visit_id && v.id_number && visit.visit_id.includes(v.id_number))
      );
      
      const visitorName = visitor ? visitor.name.toLowerCase() : 'unknown visitor';
      visitorsMap.set(visitorName, (visitorsMap.get(visitorName) || 0) + 1);
    });

    const topVisitors = Array.from(visitorsMap, ([name, count]) => {
      const visitor = visitorsData.find(v => v.name.toLowerCase() === name);
      return { 
        name: visitor ? visitor.name : 'Unknown Visitor', 
        count 
      };
    })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Peak Hours
    const hoursMap = new Map<string, number>();
    purposesFilter.forEach(visit => {
      const hour = new Date(visit.time_of_visit).getHours();
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      hoursMap.set(hourLabel, (hoursMap.get(hourLabel) || 0) + 1);
    });

    const peakHours = Array.from(hoursMap, ([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      mostCommonPurposes,
      topVisitors,
      peakHours,
      topGates,
      
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

  const viewVisitorDetails = (visitor: VisitorDetail): void => {
    setSelectedVisitor(visitor);
    setDetailsModalVisible(true);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format month for display
  const formatMonth = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  };

  // Get the current chart data based on view mode
  const getCurrentChartData = () => {
    switch (viewMode) {
      case 'daily':
        return visitorStats.dailyVisits;
      case 'monthly':
        return visitorStats.monthlyVisits;
      case 'yearly':
        return visitorStats.yearlyVisits;
      default:
        return visitorStats.dailyVisits;
    }
  };

  // Get label formatter based on view mode
  const getLabelFormatter = (item: any): string => {
    switch (viewMode) {
      case 'daily':
        return new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case 'monthly':
        return formatMonth(item.month);
      case 'yearly':
        return item.year;
      default:
        return '';
    }
  };

  // Get value getter based on view mode
  const getValueGetter = (item: any): number => {
    switch (viewMode) {
      case 'daily':
        return item.count;
      case 'monthly':
        return item.count;
      case 'yearly':
        return item.count;
      default:
        return 0;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header role="Administrator" name="Visitor Management" />
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'stats' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={activeTab === 'stats' ? styles.activeTabText : styles.inactiveTabText}>
            Statistics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'trends' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={activeTab === 'trends' ? styles.activeTabText : styles.inactiveTabText}>
            Visitor Trends
          </Text>
        </TouchableOpacity>
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
      ) : activeTab === 'stats' ? (
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
          
          {/* Visits Chart with View Mode Selector */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {viewMode === 'daily' ? 'Daily' : viewMode === 'monthly' ? 'Monthly' : 'Yearly'} Visits
              </Text>
              <View style={styles.viewModeContainer}>
                <TouchableOpacity 
                  style={[styles.viewModeButton, viewMode === 'daily' ? styles.activeViewMode : {}]}
                  onPress={() => setViewMode('daily')}
                >
                  <Text style={viewMode === 'daily' ? styles.activeViewModeText : styles.viewModeText}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewModeButton, viewMode === 'monthly' ? styles.activeViewMode : {}]}
                  onPress={() => setViewMode('monthly')}
                >
                  <Text style={viewMode === 'monthly' ? styles.activeViewModeText : styles.viewModeText}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewModeButton, viewMode === 'yearly' ? styles.activeViewMode : {}]}
                  onPress={() => setViewMode('yearly')}
                >
                  <Text style={viewMode === 'yearly' ? styles.activeViewModeText : styles.viewModeText}>Yearly</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartContainer}>
                {getCurrentChartData().map((item, index) => {
                  // Calculate bar height (max height is 150)
                  const maxCount = Math.max(...getCurrentChartData().map(i => getValueGetter(i)));
                  const barHeight = maxCount > 0 
                    ? Math.max(30, (getValueGetter(item) / maxCount) * 150) 
                    : 30;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <Text style={styles.chartValue}>{getValueGetter(item)}</Text>
                      <View 
                        style={[
                          styles.bar, 
                          { height: barHeight }
                        ]} 
                      />
                      <Text style={styles.chartLabel}>
                        {getLabelFormatter(item)}
                      </Text>
                    </View>
                  );
                })}
                {getCurrentChartData().length === 0 && (
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
                    onPress={() => viewVisitorDetails(visitor.details!)}
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
      ) : (
        <View style={styles.trendsContainer}>
            
       {/* Most Common Purposes Pie Chart */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Most Common Visit Purposes</Text>
  {visitorTrends.mostCommonPurposes.length > 0 ? (
    <View>
      <PieChart
  data={visitorTrends.mostCommonPurposes.map((item, index) => {
    // Calculate percentage and round it to whole number
    const totalVisits = visitorTrends.mostCommonPurposes.reduce((sum, i) => sum + i.count, 0);
    const percentage = totalVisits > 0 ? Math.round((item.count / totalVisits) * 100) : 0;
    
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    

    console.log('Purpose:', item.purpose);
    
    // Modified name formation to avoid duplication
    return {
      // Try this simpler format without percentage
      name: `${item.purpose} (${item.count} visits)`,
      count: item.count,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
      // Try adding percentage as a separate property
      percentage: percentage
    };
  })}
        width={Dimensions.get('window').width - 70}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />
    </View>
  ) : (
    <Text style={styles.noDataText}>No purpose data available</Text>
  )}
</View>

    

          {/* Top Visitors Pie Chart */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Top Visitors</Text>
  {visitorTrends.topVisitors.length > 0 ? (
    <View>
      <PieChart
        data={visitorTrends.topVisitors.map((visitor, index) => {
          const colors = ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384', '#9966FF'];
          
          return {
            name: `${visitor.name} (${visitor.count} visits)`,
            count: visitor.count,
            color: colors[index % colors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
          };
        })}
        width={Dimensions.get('window').width - 70}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />
    </View>
  ) : (
    <Text style={styles.noDataText}>No visitor data available</Text>
  )}
</View>

       {/* Top Gates Pie Chart */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Top Gates</Text>
  {visitorTrends.topGates.length > 0 ? (
    <View>
      <PieChart
        data={visitorTrends.topGates.map((item, index) => {
          // Calculate percentage and round it to whole number
          const totalVisits = visitorTrends.topGates.reduce((sum, i) => sum + i.count, 0);
          const percentage = totalVisits > 0 ? Math.round((item.count / totalVisits) * 100) : 0;
          
          const colors = ['#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384', '#9966FF'];
          
          return {
            name: `${item.gate} (${item.count} visits)`,
            count: item.count,
            color: colors[index % colors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
            percentage: percentage
          };
        })}
        width={Dimensions.get('window').width - 70}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />
    </View>
  ) : (
    <Text style={styles.noDataText}>No gate data available</Text>
  )}
</View>

   


          {/* Peak Hours */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Peak Visiting Hours</Text>
            {visitorTrends.peakHours.map((hour, index) => (
              <View key={index} style={styles.trendRow}>
                <Text style={styles.trendLabel}>{hour.hour}</Text>
                <Text style={styles.trendValue}>{hour.count} visits</Text>
              </View>
            ))}
            {visitorTrends.peakHours.length === 0 && (
              <Text style={styles.noDataText}>No hour data available</Text>
            )}
          </View>
        </View>
      )}

      
     {/* Visitor Details Modal */}
     <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visitor Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID Number:</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.id_number || 'Not available'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.phone || 'Not available'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Visit Count:</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.visit_count}</Text>
                </View>
                
                <View style={styles.historySection}>
                  <Text style={styles.historySectionTitle}>Visit History</Text>
                  
                  {selectedVisitor.visitHistory.map((visit, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Text style={styles.historyDate}>
                        {formatDate(visit.date)} ({visit.time_in} - {visit.time_out || 'Not specified'})
                      </Text>
                      <Text style={styles.historyPurpose}>Purpose: {visit.purpose}</Text>
                      {visit.gate && <Text style={styles.historyDetail}>Gate: {visit.gate}</Text>}
                      {visit.host && <Text style={styles.historyDetail}>Host: {visit.host}</Text>}
                    </View>
                  ))}
                  
                  {selectedVisitor.visitHistory.length === 0 && (
                    <Text style={styles.noDataText}>No visit history available</Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  legendContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  viewModeButton: {
    padding: 6,
    paddingHorizontal: 12,
  },
  activeViewMode: {
    backgroundColor: '#3498db',
  },
  viewModeText: {
    fontSize: 12,
    color: '#555',
  },
  activeViewModeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
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
  chartValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    width: 50,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
  },
  trendsContainer: {
    paddingVertical: 10,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trendLabel: {
    fontSize: 14,
    color: '#333',
    flex: 3,
  },
  trendValue: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  inactiveTab: {
    borderBottomColor: 'transparent',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 22,
    color: '#777',
  },
  modalBody: {
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  historySection: {
    marginTop: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  historyPurpose: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  historyDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  }
});
