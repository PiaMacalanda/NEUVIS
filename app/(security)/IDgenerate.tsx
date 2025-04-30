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
import Logo from '../../components/logo';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { generateVisitorPassHTML } from '../../components/htmlTemplates/visitorPassTemplate';

export default function IDgenerate() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [idData, setIdData] = useState({
    name: params.fullName as string || '',
    cellphone: params.cellphone as string || '',
    idType: params.idType as string || '',
    idNumber: params.idNumber as string || '',
    purposeOfVisit: params.purposeOfVisit as string || '',
    visitorID: params.visitID as string || '',
    dateOfVisit: params.formattedTimeOfVisit as string || '',
    expirationTime: params.formattedExpiration as string || ''
  });

  // Handle printing functionality
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      console.log('Generating visitor pass HTML...');
      
      // Generate the PDF file
      const { uri } = await Print.printToFileAsync({
        html: generateVisitorPassHTML(idData),
        base64: false
      });

      console.log('PDF generated at URI:', uri);
      
      // Check if device supports sharing
      const isAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing available:', isAvailable);
      
      if (isAvailable) {
        // Create a copy in app documents directory with a proper filename
        const pdfName = `${idData.visitorID}_pass.pdf`;
        const pdfDir = `${FileSystem.documentDirectory}pdfs/`;
        
        // Create directory if doesn't exist
        const dirInfo = await FileSystem.getInfoAsync(pdfDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(pdfDir, { intermediates: true });
          console.log('Directory created:', pdfDir);
        }
        
        const destination = `${pdfDir}${pdfName}`;
        console.log('Copying PDF to destination:', destination);
        await FileSystem.copyAsync({ from: uri, to: destination });
        console.log('Successfully copied PDF.');
        
        // Share the PDF
        await Sharing.shareAsync(destination, {
          mimeType: 'application/pdf',
          dialogTitle: 'View or Print Visitor Pass',
          UTI: 'com.adobe.pdf' // For iOS
        });
        
        Alert.alert(
          'Success',
          'Visitor pass is ready for printing or sharing',
          [{ text: 'OK' }]
        );
      } else {
        console.log('Successfully shared.');

        // If sharing isn't available, just show the URI
        Alert.alert(
          'PDF Created',
          `Visitor pass saved at: ${uri}`,
          [{ text: 'OK' }]
        );
      }

      console.log('Finished processing.'); // for debuging only
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating PDF:', error);
      Alert.alert(
        'Error',
        'Failed to create visitor pass PDF. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFinish = () => {
    router.replace('/(security)/neuvisLanding');
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
            <Logo size="large" style={styles.logoCircle} />
            
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
          <Text style={styles.actionButtonText}>Print / Save PDF</Text>
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
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    right: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#252525',
    marginTop: 8,
    right: 5
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    right: 5
  },
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
    color: '#252525',
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
    backgroundColor: '#003566',
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
    fontSize: 20,
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
  cardFooter: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#252525',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#003566',
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
    color: '#252525',
    paddingBottom: 20,
  },
});