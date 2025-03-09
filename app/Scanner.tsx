import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text, Modal } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const ID_TYPES = [
  'Phils ID',
  'Passport',
  'SSS ID',
  'UMID',
  'Postal ID',
  'Voter\'s ID',
  'Driver\'s License'
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
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('Photo taken:', photo.uri);

      router.push({
        pathname: '/Scanner',
        params: { imageUri: photo.uri },
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

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
        <CaptureButton onPress={takePicture} />
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
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {renderCameraView()}
    </View>
  );
}


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


const CaptureButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.captureButton} onPress={onPress}>
    <Ionicons name="camera" size={24} color="white" />
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
});