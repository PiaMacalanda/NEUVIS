import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function IDgenerate() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [idData, setIdData] = useState({
    name: params.name as string || '',
    cellphone: params.cellphone as string || '',
    dateOfVisit: params.dateOfVisit as string || '',
    idType: params.idType as string || '',
    idNumber: params.idNumber as string || '',
    purposeOfVisit: params.purposeOfVisit as string || '',
    visitorID: '',
    expirationTime: ''
  });


  useEffect(() => {
   
    setTimeout(() => {
 
      const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();
      const visitorID = `VST-${randomID}`;
      
     
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      const formattedExpiration = formatDateTime(expirationDate);
      
      setIdData({
        ...idData,
        visitorID,
        expirationTime: formattedExpiration
      });
      
      setIsLoading(false);
    }, 2000);
  }, []);

  const formatDateTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handlePrint = () => {
   
    Alert.alert(
      'Print',
      'Sending visitor pass to printer...',
      [{ text: 'OK' }]
    );
  };

  const handleDownload = () => {
    
    Alert.alert(
      'Success',
      'Visitor ID has been saved to your device',
      [{ text: 'OK' }]
    );
  };

  const handleFinish = () => {
   
    router.replace('/');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Generating your visitor pass...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={100} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visitor Pass Generated</Text>
        <Text style={styles.headerSubtitle}>Your visitor pass is ready</Text>
      </View>
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>VISITOR</Text>
            </View>
            <View>
              <Text style={styles.idNumber}>{idData.visitorID}</Text>
              <Text style={styles.validUntil}>Valid until: {idData.expirationTime}</Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            
            <View style={styles.qrPlaceholder}>
              <View style={styles.qrGrid}>
                {Array(5).fill(0).map((_, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.qrRow}>
                    {Array(5).fill(0).map((_, colIndex) => (
                      <View 
                        key={`cell-${rowIndex}-${colIndex}`} 
                        style={[
                          styles.qrCell,
                       
                          ((rowIndex === 0 && colIndex === 0) || 
                           (rowIndex === 0 && colIndex === 4) ||
                           (rowIndex === 4 && colIndex === 0) ||
                           (rowIndex === 2 && colIndex === 2) ||
                           (rowIndex % 2 === 0 && colIndex % 2 === 0)) ? 
                            styles.qrCellFilled : {}
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <Text style={styles.scanText}>SCAN ME</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>NAME</Text>
              <Text style={styles.infoValue}>{idData.name}</Text>
              
              <Text style={styles.infoLabel}>CONTACT</Text>
              <Text style={styles.infoValue}>+63 {idData.cellphone}</Text>
              
              <Text style={styles.infoLabel}>DATE OF VISIT</Text>
              <Text style={styles.infoValue}>{idData.dateOfVisit}</Text>
              
              <Text style={styles.infoLabel}>PURPOSE</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{idData.purposeOfVisit}</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              This pass must be presented upon entry. Valid for one day only.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={24} color="white" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={24} color="white" />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>
      
      <Text style={styles.noteText}>
        Please keep this ID handy during your visit. Security personnel may ask to scan the QR code.
      </Text>
    </SafeAreaView>
  );
}

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => (
  <View style={styles.progressBarContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progress, { width: `${progress}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progress: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#000',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  idNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  validUntil: {
    color: '#ccc',
    fontSize: 12,
  },
  cardBody: {
    padding: 20,
    flexDirection: 'row',
  },
  // QR code placeholder styling
  qrPlaceholder: {
    width: 120,
    height: 140,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrGrid: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    padding: 5,
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrCell: {
    flex: 1,
    margin: 1,
    backgroundColor: '#f0f0f0',
  },
  qrCellFilled: {
    backgroundColor: '#000',
  },
  scanText: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  cardFooter: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  finishButton: {
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    paddingBottom: 20,
  },
});