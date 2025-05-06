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
import { supabase } from '../lib/supabaseClient';
import { router } from 'expo-router';

interface FormDataType {
  lastname: string;
  firstname: string;
  mi: string;
  dateofVisit: string;
  cellphone: string;
  idType: string;
  idNumber: string;
  purposeOfVisit: string;
  time_of_visit: string;
  expiration: string;
}

const ManualForm: React.FC = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDateModal, setShowDateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    lastname: '',
    firstname: '',
    mi: '',
    cellphone: '',
    dateofVisit: formatDate(today),
    idType: 'Phils ID',
    idNumber: '',
    purposeOfVisit: '',
    time_of_visit: formatDate(today),
    expiration: ''
  });

  const [errors, setErrors] = useState({
    lastname: false,
    firstname: false,
    cellphone: false,
    idNumber: false,
    purposeOfVisit: false
  });

  const [errorMessages, setErrorMessages] = useState({
    lastname: 'Last name is required',
    firstname: 'First name is required',
    cellphone: 'Cellphone number is required',
    idNumber: 'ID number is required',
    purposeOfVisit: 'Purpose of visit is required'
  });

  const [touched, setTouched] = useState({
    lastname: false,
    firstname: false,
    cellphone: false,
    idNumber: false,
    purposeOfVisit: false
  });

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const ID_TYPES = [
    'Phils ID',
    'Driver\'s License',
    'UMID',
    // 'SSS ID',
    // 'Passport',
    // 'Postal ID',
    // 'Voter\'s ID',
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
      dateofVisit: formatDate(newDate),
      time_of_visit: formatDate(newDate)
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
    const raw = text.replace(/\s|-/g, '').toUpperCase();
    let formatted = '';
  
    switch (formData.idType) {
      case 'Phils ID':
        for (let i = 0; i < raw.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formatted += '-';
          }
          formatted += raw[i];
        }
        break;
  
      case "Driver's License":
        if (raw.length >= 11) {
          const l = raw[0]; // Letter
          const part1 = raw.slice(1, 3); // 2 Digits
          const part2 = raw.slice(3, 7); // 4 Digitss
          const part3 = raw.slice(7, 11); // 4 Digits
          formatted = `${l}${part1}-${part2}-${part3}`;
        } else {
          formatted = raw;
        }
        break;
  
      case 'UMID':
        if (raw.length >= 12) {
          const part1 = raw.slice(0, 3); // 'CRN'
          const part2 = raw.slice(3, 7); // 4 digits
          const part3 = raw.slice(7, 14); // 7 digits
          const part4 = raw.slice(14, 15); // 1 digit
  
          formatted = `${part1}-${part2}-${part3}-${part4}`;
        } else {
          formatted = raw;
        }
        break;  

      default:
        formatted = raw;
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
    let sanitizedValue = '';
    if(formData.idType === 'Phils ID'){
      sanitizedValue = value.replace(/[^0-9\s]/g, '');
    } else if(formData.idType === 'Driver\'s License'){
      sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
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

  const handleNameChange = (field: 'lastname' | 'firstname' | 'mi', value: string) => {
    const uppercaseValue = value.toUpperCase();
    
    setFormData({
      ...formData,
      [field]: uppercaseValue
    });
    
    if (field === 'lastname' || field === 'firstname') {
      setTouched({
        ...touched,
        [field]: true
      });
      
      setErrors({
        ...errors,
        [field]: uppercaseValue.trim() === ''
      });
    }
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
    const lastnameIsEmpty = formData.lastname.trim() === '';
    const firstnameIsEmpty = formData.firstname.trim() === '';
    const digits = formData.cellphone.replace(/\s/g, '');
    const cellphoneIsEmpty = digits.trim() === '';
    const cellphoneIsInvalidLength = digits.length > 0 && digits.length < 10;
    const idNumberIsEmpty = formData.idNumber.replace(/\s/g, '').trim() === ''; 
    const purposeIsEmpty = formData.purposeOfVisit.trim() === '';
    
    const newErrors = {
      lastname: lastnameIsEmpty,
      firstname: firstnameIsEmpty,
      cellphone: cellphoneIsEmpty || cellphoneIsInvalidLength,
      idNumber: idNumberIsEmpty,
      purposeOfVisit: purposeIsEmpty
    };
    
    const newErrorMessages = {
      lastname: 'Last name is required',
      firstname: 'First name is required',
      cellphone: cellphoneIsEmpty ? 'Cellphone number is required' : 
                 cellphoneIsInvalidLength ? 'Cellphone number must be 10 digits' : '',
      idNumber: 'ID number is required',
      purposeOfVisit: 'Purpose of visit is required'
    };
    
    setErrorMessages(newErrorMessages);
    setErrors(newErrors);
    setTouched({
      lastname: true,
      firstname: true,
      cellphone: true,
      idNumber: true,
      purposeOfVisit: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const formatDateTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const insertVisit = async (visitorID: number, visitID: string, time_of_visit: Date, expirationpht: Date) => {
    const { error } = await supabase
      .from('visits')
      .insert([
        {
          visit_id: visitID,
          visitor_id: visitorID,
          purpose_of_visit: formData['purposeOfVisit'],
          time_of_visit: time_of_visit.toISOString(),
          expiration: expirationpht.toISOString(),
        },
      ])
      .select()
      
    if(error) console.error('Error inserting visits: ', error);
  }

  const insertVisitor = async () => {
    const { data: existingVisitor, error: searchError } = await supabase
      .from('visitors')
      .select('id')
      .eq('id_number', formData['idNumber'])
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error searching for existing visitor:', searchError);
      return null;
    }

    if (existingVisitor) {
      console.log('Visitor already exists with ID:', existingVisitor.id);
      return existingVisitor.id;
    }    

    const fullName = `${formData.lastname}, ${formData.firstname}${formData.mi ? ' ' + formData.mi : ''}`;

    const { data, error } = await supabase
      .from('visitors')
      .insert([
        { 
          name: fullName,
          card_type: formData['idType'],
          id_number: formData['idNumber'],
          phone_number: '0' + formData['cellphone'],
        },
      ])
      .select()
    
    if(error) {
      console.error('Error inserting visitor:', error);
      return null;
    }

    if (data && data.length > 0) {
      const newVisitorId = data[0].id;
      console.log('New visitor ID:', newVisitorId);
      return newVisitorId;
    }

    return null;
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
  
      const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();
      const visitID = `VST-${randomID}`;
      
      const time_of_visit = new Date();
      const expiration = new Date();
      const expirationpht = new Date(expiration.getTime() - (8 * 60 * 60 * 1000));
      expirationpht.setHours(22, 0, 0, 0)
  
      const formattedTimeOfVisit = formatDateTime(time_of_visit);
      const formattedExpiration = formatDateTime(expirationpht);
  
      
      const fullName = `${formData.lastname}, ${formData.firstname}${formData.mi ? ' ' + formData.mi : ''}`;
      
      const visitorID = await insertVisitor();
      await insertVisit(visitorID, visitID, time_of_visit, expirationpht);
  
      setTimeout(() => {
        setIsLoading(false);
      
        router.push({
          pathname: '/IDgenerate',
          params: {
            ...formData,
            fullName,
            visitID,
            formattedTimeOfVisit,
            formattedExpiration,
          }
        });
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
            <View style={styles.nameFieldsContainer}>
              <View style={styles.nameFieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.lastnameInput,
                    (touched.lastname && errors.lastname) && styles.inputError
                  ]}
                  value={formData.lastname}
                  onChangeText={(value) => handleNameChange('lastname', value)}
                  onBlur={() => handleBlur('lastname')}
                  placeholder="Lastname"
                  autoCapitalize="characters"
                />
                {touched.lastname && errors.lastname && (
                  <Text style={styles.errorText}>{errorMessages.lastname}</Text>
                )}
              </View>
              
              <View style={styles.nameFieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.firstnameInput,
                    (touched.firstname && errors.firstname) && styles.inputError
                  ]}
                  value={formData.firstname}
                  onChangeText={(value) => handleNameChange('firstname', value)}
                  onBlur={() => handleBlur('firstname')}
                  placeholder="Firstname"
                  autoCapitalize="characters"
                />
                {touched.firstname && errors.firstname && (
                  <Text style={styles.errorText}>{errorMessages.firstname}</Text>
                )}
              </View>
              
              <View style={styles.miFieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.miInput
                  ]}
                  value={formData.mi}
                  onChangeText={(value) => handleNameChange('mi', value)}
                  placeholder="M.I"
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date of Visit</Text>
            <View style={styles.datePickerButton}>
              <Text style={styles.dateText}>{formData.dateofVisit}</Text>
              <Ionicons name="calendar-outline" size={20} color="#252525" />
            </View>
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
              keyboardType={
                formData.idType === 'Phils ID' ? 'numeric' :
                formData.idType === 'Driver\'s License' || 'UMID' ? 'default' :
                'default'
              }
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
                (touched.purposeOfVisit && errors.purposeOfVisit) && styles.inputError
              ]}
              placeholder="Enter purpose of visit"
              value={formData.purposeOfVisit}
              onChangeText={(value) => handleChange('purposeOfVisit', value)}
              onBlur={() => handleBlur('purposeOfVisit')}
              multiline={true}
              textAlignVertical="top"
            />
            {touched.purposeOfVisit && errors.purposeOfVisit && (
              <Text style={styles.errorText}>{errorMessages.purposeOfVisit}</Text>
            )}
          </View>

          {(errors.lastname || errors.firstname || errors.cellphone || errors.idNumber || errors.purposeOfVisit) && 
           touched.lastname && touched.firstname && touched.cellphone && touched.idNumber && touched.purposeOfVisit && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Text style={styles.errorSummary}>Please fill all required fields</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.submitButton,
              (errors.lastname || errors.firstname || errors.cellphone || errors.idNumber || errors.purposeOfVisit) ? styles.submitButtonDisabled : null
            ]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    color: '#252525',
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
    color: '#252525',
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
    backgroundColor: '#003566',
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
  },
  nameFieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nameFieldWrapper: {
    flex: 2,
    marginRight: 10,
  },
  miFieldWrapper: {
    flex: 0.9,
  },
  lastnameInput: {
    marginBottom: 0,
  },
  firstnameInput: {
    marginBottom: 0,
  },
  miInput: {
    textAlign: 'center',
  },
});

export default ManualForm;  