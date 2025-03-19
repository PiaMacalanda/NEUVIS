import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text, Modal, Image, TextInput, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextRecognition from "@react-native-ml-kit/text-recognition";

interface ImageType {
  uri: string;
  width: number;
  height: number;
  exif?: any;
  base64?: string;
}

interface ProcessedDataType {
    card_type: string;
    id_number: string | null;
    last_name: string | null;
    first_name: string | null;
    middle_name: string | null;
    full_name: string | null;
}

const ID_TYPES = [
  'Phils ID',
  'Driver\'s License',
  'UMID',
  // 'Passport',
  // 'Postal ID',
  // 'Voter\'s ID',
];

export default function Scanner() {
  
  const [cameraState, setCameraState] = useState({
    isStarted: false,
    hasPermission: null as boolean | null,
  });
  
  const [idSelection, setIdSelection] = useState({
    selectedOption: 'Phils ID',
    primaryOption: 'Phils ID',
    secondaryOption: 'Other',
    showOptionsModal: false,
  });

  const [imageTaken, setImageTaken] = useState<ImageType | null>(null);

  const [processedData, setProcessedData] = useState<ProcessedDataType | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showResultsOverlay, setShowResultsOverlay] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setCameraState({
          isStarted: true,
          hasPermission: true,
        });
      } else {
        Alert.alert('Camera Access Denied', 'Permission to use camera was denied');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const takePicture = async () => {
    setIsPhotoProcessing(true);
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('Photo taken:', photo.uri);
      setCapturedPhoto(photo.uri);

      const extractedData = await handleImageCaptured(photo);
      if (extractedData) {
        setProcessedData(extractedData);
        setShowResultsOverlay(true);
      } else {
        Alert.alert('Error', 'Failed to extract data from the image. Please try again.');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const handleImageCaptured = async (photo: ImageType) => {
    if(!photo || !photo.uri) {
      console.error('No image captured!');
      return null;
    }

    setImageTaken(photo);
    const extractedText = await extractText(photo);
    return extractedText;
  }

  const extractText= async (photo: ImageType) => {
    if(!photo || !photo.uri) {
      console.error('Image does not exist!')
      return null;
    };

    try{
        if(idSelection.selectedOption == 'Phils ID'){
            const idNoPattern = /\b(\d{4}-\d{4}-\d{4}-\d{4})\b/;
            const lastNamePattern = /(?<=Apelyido\/(?:Last|Lost) (?:Name|Nome)\s*\n)([^\n]+)/;
            const firstNamePattern = /(?<=Mga Pangalan\/Given Names\s*\n)([^\n]+)/;
            const middleNamePattern = /(?<=Gitnang Apelyido\/(?:Middle Name|Middle Nome)\s*\n)([^\n]+)/;

            const result = await TextRecognition.recognize(photo.uri);
            console.log("OCR Raw output:\n", result);

            const idNoMatch = result.text.match(idNoPattern);
            const lastNameMatch = result.text.match(lastNamePattern);
            const firstNameMatch = result.text.match(firstNamePattern);
            const middleNameMatch = result.text.match(middleNamePattern);

            const postProcessedData = {
                card_type: "Philippine Identification Card",
                id_number: idNoMatch ? idNoMatch[1] : null,
                last_name: lastNameMatch ? lastNameMatch[0] : null,
                first_name: firstNameMatch ? firstNameMatch[0] : null,
                middle_name: middleNameMatch ? middleNameMatch[0] : null,
                full_name: null
            };

            return postProcessedData;
        } 
        
        else if(idSelection.selectedOption === 'Driver\'s License'){
            const idNoPattern = /\b[A-Z0-9]{3}-\d{2}-\d{6}\b/;
            const namePattern = /\b[A-Z]+(?:\s+[A-Z]+)*,\s*[A-Z]+(?:\s+[A-Z]+)*(?:\s+[A-Z]+)?\b/;
            
            const result = await TextRecognition.recognize(photo.uri);
            console.log("OCR Raw output:\n", result);

            const idNoMatch = result.text.match(idNoPattern);
            const fullNameMatch = result.text.match(namePattern);

            const postProcessedData = {
                card_type: "Driver\'s License",
                id_number: idNoMatch ? idNoMatch[0] : null,
                last_name: null,
                first_name: null,
              middle_name: null,
              full_name: fullNameMatch ? fullNameMatch[0] : null
          };

          return postProcessedData;
        } 
        
        else if(idSelection.selectedOption === 'UMID'){
          const idNoPattern = /\b(CRN-\d{4}-\d{7}-\d)\b/; // Highly likely for the OCR to read the ID incorrectly
          const lastNamePattern = /(?<=SURNAME\s*\n)([^\n]+)/i;
          const firstNamePattern = /(?<=GIVEN NAME\s*\n)([^\n]+)/i;
          const middleNamePattern = /(?<=MIDDLE NAME\s*\n)([^\n]+)/i;

          const result = await TextRecognition.recognize(photo.uri);
          console.log("OCR Raw output:\n", result);

          const idNoMatch = result.text.match(idNoPattern);
          const lastNameMatch = result.text.match(lastNamePattern);
          const firstNameMatch = result.text.match(firstNamePattern);
          const middleNameMatch = result.text.match(middleNamePattern);

          const postProcessedData = {
              card_type: "UMID",
              id_number: idNoMatch ? idNoMatch[1] : null,
              last_name: lastNameMatch ? lastNameMatch[0] : null,
              first_name: firstNameMatch ? firstNameMatch[0] : null,
              middle_name: middleNameMatch ? middleNameMatch[0] : null,
              full_name: null
          };

          return postProcessedData;
        } 
        
        else {
            console.log("Either this id scanning doesn/'t exist in the system or it is not created yet!");
        }
    } catch (error){
        console.error('Error Extracting Text: ', error);
        return null;
    }
  }

  const selectIdOption = (option: string) => {
    setIdSelection(prev => ({
      ...prev,
      primaryOption: option,
      selectedOption: prev.selectedOption === prev.primaryOption ? option : prev.selectedOption,
      secondaryOption: 'Other',
      showOptionsModal: false,
    }));
  };

  const handlePrimaryButtonPress = () => {
    setIdSelection(prev => ({
      ...prev,
      selectedOption: prev.primaryOption,
    }));
  };

  const handleSecondaryButtonPress = () => {
    if (idSelection.secondaryOption === 'Other') {
      setIdSelection(prev => ({
        ...prev,
        showOptionsModal: true,
      }));
    } else {
      setIdSelection(prev => ({
        ...prev,
        selectedOption: prev.secondaryOption,
      }));
    }
  };

  const handleRetake = () => {
    setShowResultsOverlay(false);
    setCapturedPhoto(null);
    setProcessedData(null);
  };

  const handleConfirm = () => {
    if (processedData) {
      router.push({
        pathname: '/ScannerOutput',
        params: { 
          card_type: processedData.card_type || null,
          id_number: processedData.id_number || null,
          last_name: processedData.last_name || null,
          first_name: processedData.first_name || null,
          middle_name: processedData.middle_name || null,
          full_name: processedData.full_name || null,
          image_uri: imageTaken?.uri || null
        },
      });

      setImageTaken(null);
    }
  };

  const updateProcessedData = (field: keyof ProcessedDataType, value: string) => {
    if (processedData) {
      setProcessedData({
        ...processedData,
        [field]: value,
      });
    }
  };

  const renderOptionsList = () => {
    return ID_TYPES.filter(idType => idType !== idSelection.primaryOption).map((idType, index, array) => (
      <React.Fragment key={idType}>
        <TouchableOpacity 
          style={styles.optionItem} 
          onPress={() => selectIdOption(idType)}
        >
          <Text style={styles.optionText}>{idType}</Text>
        </TouchableOpacity>
        {index < array.length - 1 && <View style={styles.optionSeparator} />}
      </React.Fragment>
    ));
  };

  const renderCameraView = () => {
    if (!cameraState.isStarted || !cameraState.hasPermission) {
      return null;
    }

    return (
            <CameraView style={styles.cameraView} ref={cameraRef} facing="back">
                <ProgressBar progress={45} />
                <BackButton onPress={() => router.push('/neuvisLanding')} />
                <CaptureButton onPress={takePicture} disabled={isPhotoProcessing} />
                <DocumentFrame />
                <IDSelectionButtons
                  primaryLabel={idSelection.primaryOption}
                  secondaryLabel={idSelection.secondaryOption}
                  selectedOption={idSelection.selectedOption}
                  onPrimaryPress={handlePrimaryButtonPress}
                  onSecondaryPress={handleSecondaryButtonPress}
                />
                <OptionsModal
                  visible={idSelection.showOptionsModal}
                  onClose={() => setIdSelection(prev => ({ ...prev, showOptionsModal: false }))}
                >
                  {renderOptionsList()}
                </OptionsModal>
                
                <LoadingOverlay visible={isPhotoProcessing} />

                {showResultsOverlay && processedData && (
                  <ResultsOverlay 
                    data={processedData} 
                    imageUri={capturedPhoto}
                    onRetake={handleRetake}
                    onConfirm={handleConfirm}
                    onUpdateData={updateProcessedData}
                  />
                )}
            </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {renderCameraView()}
    </View>
  );
}

interface ResultsOverlayProps {
  data: ProcessedDataType;
  imageUri: string | null;
  onRetake: () => void;
  onConfirm: () => void;
  onUpdateData: (field: keyof ProcessedDataType, value: string) => void;
}

const LoadingOverlay: React.FC<{visible: boolean}> = ({visible}) => {
  return (
    <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
    >
      <View style={styles.loadingModalContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Processing, please wait...</Text>
      </View>
    </Modal>
  )
};

const ResultsOverlay = ({ data, imageUri, onRetake, onConfirm, onUpdateData }: ResultsOverlayProps) => (
  <View style={styles.resultsOverlay}>
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Extracted Data</Text>
      
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}
      
      <View style={styles.dataContainer}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Card Type:</Text>
          <TextInput
            style={styles.dataInput}
            value={data.card_type || ''}
            onChangeText={(text) => onUpdateData('card_type', text)}
          />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>ID Number:</Text>
          <TextInput
            style={styles.dataInput}
            value={data.id_number || ''}
            onChangeText={(text) => onUpdateData('id_number', text)}
            placeholder="Not recognized"
            placeholderTextColor="#999"
          />
        </View>
        {!data.full_name ? (
        <>  
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Last Name:</Text>
            <TextInput
              style={styles.dataInput}
              value={data.last_name || ''}
              onChangeText={(text) => onUpdateData('last_name', text)}
              placeholder="Not recognized"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>First Name:</Text>
            <TextInput
              style={styles.dataInput}
              value={data.first_name || ''}
              onChangeText={(text) => onUpdateData('first_name', text)}
              placeholder="Not recognized"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Middle Name:</Text>
            <TextInput
              style={styles.dataInput}
              value={data.middle_name || ''}
              onChangeText={(text) => onUpdateData('middle_name', text)}
              placeholder="Not recognized"
              placeholderTextColor="#999"
            />
          </View>
        </>
        ) : (
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Full Name:</Text>
          <TextInput
            style={styles.dataInput}
            value={data.full_name || ''}
            onChangeText={(text) => onUpdateData('full_name', text)}
            placeholder="Not recognized"
            placeholderTextColor="#999"
          />
        </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.retakeButton]} 
          onPress={onRetake}
        >
          <Text style={styles.actionButtonText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.confirmButton]} 
          onPress={onConfirm}
        >
          <Text style={styles.actionButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressBarContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progress, { width: `${progress}%` }]} />
    </View>
  </View>
);


const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress}>
    <Ionicons name="arrow-back" size={24} color="white" />
  </TouchableOpacity>
);


const CaptureButton = ({ onPress, disabled }: { onPress: () => void, disabled: boolean }) => (
  <TouchableOpacity style={styles.captureButton} onPress={onPress} disabled={disabled}>
    {disabled ? 
      <Ionicons name="ban" size={24} color="white" />
      :
      <Ionicons name="camera" size={24} color="white" />
    }
  </TouchableOpacity>
);


const DocumentFrame = () => (
  <View style={styles.overlay}>
    <View style={styles.cornerTopLeft} />
    <View style={styles.cornerTopRight} />
    <View style={styles.cornerBottomLeft} />
    <View style={styles.cornerBottomRight} />
  </View>
);

interface IDSelectionButtonsProps {
  primaryLabel: string;
  secondaryLabel: string;
  selectedOption: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}

const IDSelectionButtons = ({
  primaryLabel,
  secondaryLabel,
  selectedOption,
  onPrimaryPress,
  onSecondaryPress
}: IDSelectionButtonsProps) => (
  <View style={styles.buttonGroup}>
    <TouchableOpacity
      style={[
        styles.button,
        selectedOption === primaryLabel && styles.selectedButton,
        styles.firstButton,
      ]}
      onPress={onPrimaryPress}
    >
      {selectedOption === primaryLabel && (
        <Ionicons name="checkmark" size={20} color="white" style={styles.checkIcon} />
      )}
      <Text style={styles.buttonText}>{primaryLabel}</Text>
    </TouchableOpacity>

    <View style={styles.separator} />

    <TouchableOpacity
      style={[
        styles.button, 
        selectedOption === secondaryLabel && 
        secondaryLabel !== 'Other' && 
        styles.selectedButton,
        styles.lastButton
      ]}
      onPress={onSecondaryPress}
    >
      {selectedOption === secondaryLabel && secondaryLabel !== 'Other' && (
        <Ionicons name="checkmark" size={20} color="white" style={styles.checkIcon} />
      )}
      <Text style={styles.buttonText}>{secondaryLabel}</Text>
    </TouchableOpacity>
  </View>
);


interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const OptionsModal = ({ visible, onClose, children }: OptionsModalProps) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.optionsContainer}>
        {children}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close-circle" size={28} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraView: {
    flex: 1,
    width: '100%'
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progress: {
    height: '100%',
    backgroundColor: '#22c55e', 
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 75,
    height: 110,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerTopRight: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: 75,
    height: 110,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '30%',
    left: '10%',
    width: 75,
    height: 110,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '30%',
    right: '10%',
    width: 75,
    height: 110,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonGroup: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '85%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkIcon: {
    marginRight: 5,
  },
  firstButton: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  lastButton: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  separator: {
    width: 2,
    backgroundColor: 'white',
    height: '100%',
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    position: 'relative',
  },
  optionItem: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  optionText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
  optionSeparator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)', 
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  
  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  resultsContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: -160,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  previewImage: {
    width: '34%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOpacity: 1,
  },
  dataContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  dataLabel: {
    flex: 1,
    fontWeight: 'bold',
    color: '#555',
  },
  dataValue: {
    flex: 2,
    color: '#333',
  },
  dataInput: {
    flex: 2,
    color: '#333',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    height: 36,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  retakeButton: {
    backgroundColor: '#808080',

  },
  confirmButton: {
    backgroundColor: '#000000',
    opacity: 0.9,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  }
});