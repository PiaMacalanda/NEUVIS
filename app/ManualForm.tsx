import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormDataType {
  name: string;
  dateofVisit: string;
  cellphone: string;
  idType: string;
  idNumber: string;
  purpose: string;
}

const ManualForm: React.FC = () => {
  
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDateModal, setShowDateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    dateofVisit: formatDate(today),
    cellphone: '',
    idType: 'Phils ID',
    idNumber: '',
    purpose: ''
  });

  
  const [errors, setErrors] = useState({
    name: false,
    cellphone: false,
    idNumber: false,
    purpose: false
  });
  
  const [errorMessages, setErrorMessages] = useState({
    name: 'Name is required',
    cellphone: 'Cellphone number is required',
    idNumber: 'ID number is required',
    purpose: 'Purpose of visit is required'
  });
  
  const [touched, setTouched] = useState({
    name: false,
    cellphone: false,
    idNumber: false,
    purpose: false
  });

  
  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const ID_TYPES = [
    'Phils ID',
    'Passport',
    'SSS ID',
    'UMID',
    'Postal ID',
    'Voter\'s ID',
    'Driver\'s License'
  ];

  function formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleDateSelection = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
    setFormData({
      ...formData,
      dateofVisit: formatDate(newDate)
    });
    setShowDateModal(false);
  };

  const formatPhoneNumber = (text: string): string => {
    const digits = text.replace(/\s/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  };

 
  const formatIdNumber = (text: string): string => {
    const digits = text.replace(/\s/g, '');
    let formatted = '';
    
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9\s]/g, '').replace(/\s/g, '').slice(0, 10);
    const formattedValue = formatPhoneNumber(sanitizedValue);
    
    setFormData({
      ...formData,
      cellphone: formattedValue
    });
    
    setTouched({
      ...touched,
      cellphone: true
    });
    
    const digits = formattedValue.replace(/\s/g, '');
    const isEmpty = digits.trim() === '';
    const isInvalidLength = digits.length > 0 && digits.length < 10;
    
    let errorMessage = '';
    if (isEmpty) {
      errorMessage = 'Cellphone number is required';
    } else if (isInvalidLength) {
      errorMessage = 'Cellphone number must be 10 digits';
    }
    
    setErrorMessages({
      ...errorMessages,
      cellphone: errorMessage
    });
    
    setErrors({
      ...errors,
      cellphone: isEmpty || isInvalidLength
    });
  };

  
  const handleIdNumberChange = (value: string) => {
   
    const sanitizedValue = value.replace(/[^0-9\s]/g, '');
    
    
    const digitsOnly = sanitizedValue.replace(/\s/g, '');
    
   
    const truncatedValue = digitsOnly.slice(0, 16);
    
 
    const formattedValue = formatIdNumber(truncatedValue);
    
    setFormData({
      ...formData,
      idNumber: formattedValue
    });
    
    setTouched({
      ...touched,
      idNumber: true
    });
    
  
    setErrors({
      ...errors,
      idNumber: truncatedValue.trim() === ''
    });
  };

  const handleChange = (field: keyof FormDataType, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    setTouched({
      ...touched,
      [field]: true
    });
    
    setErrors({
      ...errors,
      [field]: value.trim() === ''
    });
  };

  const handleBlur = (field: keyof typeof errors) => {
    setTouched({
      ...touched,
      [field]: true
    });
    
    if (field === 'cellphone') {
      const digits = formData.cellphone.replace(/\s/g, '');
      const isEmpty = digits.trim() === '';
      const isInvalidLength = digits.length > 0 && digits.length < 10;
      
      let errorMessage = '';
      if (isEmpty) {
        errorMessage = 'Cellphone number is required';
      } else if (isInvalidLength) {
        errorMessage = 'Cellphone number must be 10 digits';
      }
      
      setErrorMessages({
        ...errorMessages,
        cellphone: errorMessage
      });
      
      setErrors({
        ...errors,
        cellphone: isEmpty || isInvalidLength
      });
    } else {
      setErrors({
        ...errors,
        [field]: formData[field as keyof FormDataType].trim() === ''
      });
    }
  };

  const validateForm = () => {
    const nameIsEmpty = formData.name.trim() === '';
    const digits = formData.cellphone.replace(/\s/g, '');
    const cellphoneIsEmpty = digits.trim() === '';
    const cellphoneIsInvalidLength = digits.length > 0 && digits.length < 10;
    const idNumberIsEmpty = formData.idNumber.replace(/\s/g, '').trim() === ''; 
    const purposeIsEmpty = formData.purpose.trim() === '';
    
    const newErrors = {
      name: nameIsEmpty,
      cellphone: cellphoneIsEmpty || cellphoneIsInvalidLength,
      idNumber: idNumberIsEmpty,
      purpose: purposeIsEmpty
    };
    
    const newErrorMessages = {
      name: 'Name is required',
      cellphone: cellphoneIsEmpty ? 'Cellphone number is required' : 
                 cellphoneIsInvalidLength ? 'Cellphone number must be 10 digits' : '',
      idNumber: 'ID number is required',
      purpose: 'Purpose of visit is required'
    };
    
    setErrorMessages(newErrorMessages);
    setErrors(newErrors);
    setTouched({
      name: true,
      cellphone: true,
      idNumber: true,
      purpose: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Success', 'Your form has been submitted successfully!');
      }, 2000); 
    } else {
      Alert.alert('Error', 'Please fill in all required fields correctly');
    }
  };

  const selectIdOption = (option: string): void => {
    setFormData({
      ...formData,
      idType: option
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={70} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.formField}>
            <Text style={styles.label}>
              Full Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                (touched.name && errors.name) && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your full name"
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errorMessages.name}</Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date of Visit</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.dateText}>{formData.dateofVisit}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>
              Cellphone Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[
              styles.phoneInputContainer,
              (touched.cellphone && errors.cellphone) && styles.inputError
            ]}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+63</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={formData.cellphone}
                onChangeText={handlePhoneChange}
                onBlur={() => handleBlur('cellphone')}
                keyboardType="phone-pad"
                placeholder="XXX XXX XXXX"
              />
            </View>
            {touched.cellphone && errors.cellphone && (
              <Text style={styles.errorText}>{errorMessages.cellphone}</Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>ID Type</Text>
            <View style={styles.idTypeContainer}>
              {ID_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.idTypeOption,
                    formData.idType === type && styles.selectedIdType
                  ]}
                  onPress={() => selectIdOption(type)}
                >
                  <Text 
                    style={[
                      styles.idTypeText,
                      formData.idType === type && styles.selectedIdTypeText
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          
          <View style={styles.formField}>
            <Text style={styles.label}>
              ID Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                (touched.idNumber && errors.idNumber) && styles.inputError
              ]}
              value={formData.idNumber}
              onChangeText={handleIdNumberChange}
              onBlur={() => handleBlur('idNumber')}
              placeholder="Enter your ID number"
              keyboardType="numeric"
            />
            {touched.idNumber && errors.idNumber && (
              <Text style={styles.errorText}>{errorMessages.idNumber}</Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>
              Purpose of Visit <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.purposeInput,
                (touched.purpose && errors.purpose) && styles.inputError
              ]}
              placeholder="Enter purpose of visit"
              value={formData.purpose}
              onChangeText={(value) => handleChange('purpose', value)}
              onBlur={() => handleBlur('purpose')}
              multiline={true}
              textAlignVertical="top"
            />
            {touched.purpose && errors.purpose && (
              <Text style={styles.errorText}>{errorMessages.purpose}</Text>
            )}
          </View>

          {(errors.name || errors.cellphone || errors.idNumber || errors.purpose) && 
           touched.name && touched.cellphone && touched.idNumber && touched.purpose && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Text style={styles.errorSummary}>Please fill all required fields</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.submitButton,
              (errors.name || errors.cellphone || errors.idNumber || errors.purpose) ? styles.submitButtonDisabled : null
            ]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Date Picker Modal */}
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
            
            <View style={styles.datePickerContainer}>
              {/* Month Picker */}
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
              
              {/* Day Picker */}
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
              
              {/* Year Picker */}
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

      {/* Loading Modal */}
      <Modal
        visible={isLoading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingModalContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing, please wait...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  scrollView: {
    flex: 1,
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
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  formField: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  requiredStar: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  idTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  idTypeOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedIdType: {
    borderColor: '#22c55e',
    backgroundColor: '#e6f7ff',
  },
  idTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedIdTypeText: {
    color: '#22c55e',
    fontWeight: '500',
  },
  purposeInput: {
    height: 120,
    paddingTop: 15,
    paddingBottom: 15,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  phonePrefix: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f8',
    borderWidth: 1,
    borderColor: '#ffdddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorSummary: {
    color: '#ff3b30',
    marginLeft: 10,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  pickerText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default ManualForm;