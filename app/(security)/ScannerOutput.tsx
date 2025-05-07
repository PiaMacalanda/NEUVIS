import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import * as FileSystem from 'expo-file-system';

export default function ScannerOutput() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const card_type = params.card_type as string || '';
    const id_number = params.id_number as string || '';
    const last_name = params.last_name as string || '';
    const first_name = params.first_name as string || '';
    const middle_name = params.middle_name as string || '';
    const full_name = params.full_name as string || '';
    const image_uri = params.image_uri as string || '';

  
    const middleInitial = middle_name ? middle_name.charAt(0) : '';
    const fullName = full_name || `${last_name}, ${first_name}${middleInitial ? ' ' + middleInitial : ''}`;

    const [showDateModal, setShowDateModal] = useState(false);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today);

    const [formData, setFormData] = useState({
        name: fullName, 
        cellphone: '',
        dateOfVisit: formatDate(today),
        idType: card_type,
        idNumber: id_number,
        purposeOfVisit: '',
        expiration: ''
    });

    const [errors, setErrors] = useState({
        cellphone: false,
        purposeOfVisit: false
    });

    const [errorMessages, setErrorMessages] = useState({
        cellphone: 'Cellphone number is required',
        purposeOfVisit: 'Purpose of visit is required'
    });

    const [touched, setTouched] = useState({
        cellphone: false,
        purposeOfVisit: false
    });

    function formatDate(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const formatPhoneNumber = (text: string): string => {
        const digits = text.replace(/\s/g, '');
        if (digits.length <= 3) return digits;
        else if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        else return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    };

    const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
    
    const handleDateSelection = (year: number, month: number, day: number) => {
        const newDate = new Date(year, month - 1, day);
        setSelectedDate(newDate);
        setFormData({ ...formData, dateOfVisit: formatDate(newDate) });
        setShowDateModal(false);
    };

    const handlePhoneChange = (value: string) => {
        const sanitizedValue = value.replace(/[^0-9\s]/g, '').replace(/\s/g, '').slice(0, 10);
        const formattedValue = formatPhoneNumber(sanitizedValue);
        setFormData({ ...formData, cellphone: formattedValue });
        setTouched({ ...touched, cellphone: true });
        const digits = formattedValue.replace(/\s/g, '');
        const isEmpty = digits.trim() === '';
        const isInvalidLength = digits.length > 0 && digits.length < 10;
        let errorMessage = isEmpty ? 'Cellphone number is required' : isInvalidLength ? 'Cellphone number must be 10 digits' :'';
        setErrorMessages({ ...errorMessages, cellphone: errorMessage });
        setErrors({ ...errors, cellphone: isEmpty || isInvalidLength });
    };

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        setTouched({ ...touched, [field]: true });
        setErrors({ ...errors, [field]: value.trim() === '' });
    };

    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });
        if (field === 'cellphone') {
            const digits = formData.cellphone.replace(/\s/g, '');
            const isEmpty = digits.trim() === '';
            const isInvalidLength = digits.length > 0 && digits.length < 10;
            let errorMessage = isEmpty ? 'Cellphone number is required' : isInvalidLength ? 'Cellphone number must be 10 digits' : '';
            setErrorMessages({ ...errorMessages, cellphone: errorMessage });
            setErrors({ ...errors, cellphone: isEmpty || isInvalidLength });
        } else {
            setErrors({ ...errors, [field]: formData[field as keyof typeof formData].trim() === '' });
        }
    };

    const validateForm = () => {
        const digits = formData.cellphone.replace(/\s/g, '');
        const cellphoneIsEmpty = digits.trim() === '';
        const cellphoneIsInvalidLength = digits.length > 0 && digits.length < 10;
        const purposeIsEmpty = formData.purposeOfVisit.trim() === '';
        const newErrors = {
            cellphone: cellphoneIsEmpty || cellphoneIsInvalidLength,
            purposeOfVisit: purposeIsEmpty
        };
        const newErrorMessages = {
            cellphone: cellphoneIsEmpty ? 'Cellphone number is required' : cellphoneIsInvalidLength ? 'Cellphone number must be 10 digits' : '',
            purposeOfVisit: 'Purpose of visit is required'
        };
        setErrorMessages(newErrorMessages);
        setErrors(newErrors);
        setTouched({ cellphone: true, purposeOfVisit: true });
        return !Object.values(newErrors).some(error => error);
    };

    const formatDateTime = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = { 
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const uploadImage = async (imageUri: string) => {
        try {
            if (!imageUri) {
                console.error("No image URI provided");
                return null;
            }
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
                console.error("File does not exist");
                return null;
            }
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
            const uniqueFileName = `id_image_${Date.now()}.jpg`;
            const { data, error } = await supabase.storage.from('id-images').upload(uniqueFileName, decode(base64), { contentType: 'image/jpeg' });
            if (error) {
                console.error("Supabase upload error:", error);
                throw error;
            }
            const { data: urlData } = supabase.storage.from('id-images').getPublicUrl(uniqueFileName);
            return urlData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    function decode(base64String: string) {
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    const insertVisits = async (visitorID: number, visitID: string, time_of_visit: Date, expirationpht: Date, imageUrl: string | null) => {
        const { error } = await supabase
            .from('visits')
            .insert([
                {
                    visitor_id: visitorID,
                    visit_id: visitID,
                    purpose_of_visit: formData['purposeOfVisit'],
                    time_of_visit: time_of_visit.toISOString(),
                    expiration: expirationpht.toISOString(),
                    image_url: imageUrl
                },
            ])
            .select();
        if (error) console.error('Error inserting visits: ', error);
    };

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
        const { data, error } = await supabase
            .from('visitors')
            .insert([
                { 
                    name: formData['name'],
                    card_type: formData['idType'],
                    id_number: formData['idNumber'],
                    phone_number: '0' + formData['cellphone'],
                },
            ])
            .select();
        if (error) {
            console.error('Error inserting visitor:', error);
            return null;
        }
        if (data && data.length > 0) {
            const newVisitorId = data[0].id;
            console.log('New visitor ID:', newVisitorId);
            return newVisitorId;
        }
        return null;
    };

    const handleSubmit = async () => {
        try {
            if (validateForm()) {
                setIsLoading(true);
                const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();
                const visitID = `VST-${randomID}`;
                const time_of_visit = new Date();
                const expiration = new Date();
                const expirationpht = new Date(expiration.getTime() - (8 * 60 * 60 * 1000));
                expirationpht.setHours(22, 0, 0, 0);
                const formattedTimeOfVisit = formatDateTime(time_of_visit);
                const formattedExpiration = formatDateTime(expirationpht);
                const imageUrl = await uploadImage(image_uri);
                const visitorID = await insertVisitor();
                await insertVisits(visitorID, visitID, time_of_visit, expirationpht, imageUrl);
                setTimeout(() => {
                    router.push({
                        pathname: '/IDgenerate',
                        params: {
                            fullName: fullName, // Pass fullName explicitly
                            cellphone: formData.cellphone,
                            idType: formData.idType,
                            idNumber: formData.idNumber,
                            purposeOfVisit: formData.purposeOfVisit,
                            visitID,
                            formattedTimeOfVisit,
                            formattedExpiration,
                        }
                    });
                }, 2000);
            } else {
                Alert.alert('Error', 'Please fill in all required fields correctly');
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', 'An unexpected error occurred during submission');
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of the component (UI, modals, styles) remains unchanged
    return (
        <SafeAreaView style={styles.container}>
            <ProgressBar progress={70} />
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    <View style={styles.formField}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.nameFieldsContainer}>
                            <TextInput
                                style={[styles.input, styles.disabledInput, styles.lastnameInput]}
                                value={last_name}
                                editable={false}
                                placeholder="Lastname"
                            />
                            <TextInput
                                style={[styles.input, styles.disabledInput, styles.firstnameInput]}
                                value={first_name}
                                editable={false}
                                placeholder="Firstname"
                            />
                            <TextInput
                                style={[styles.input, styles.disabledInput, styles.middleInitialInput]}
                                value={middle_name ? middle_name.charAt(0) + '.' : ''}
                                editable={false}
                                placeholder="M.I"
                            />
                        </View>
                    </View>
                    {/* Rest of the form fields */}
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
                    </View>
                    <View style={styles.formField}>
                        <Text style={styles.label}>Date of Visit</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDateModal(true)}
                        >
                            <Text style={styles.dateText}>{formData.dateOfVisit}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#252525" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.formField}>
                        <Text style={styles.label}>ID Type</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={formData.idType}
                            editable={false}
                        />
                    </View>
                    <View style={styles.formField}>
                        <Text style={styles.label}>ID Number</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={formData.idNumber}
                            editable={false}
                        />
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
                    </View>
                    {(errors.cellphone || errors.purposeOfVisit) && touched.cellphone && touched.purposeOfVisit && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#ff3b30" />
                            <Text style={styles.errorSummary}>Please fill all required fields</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (errors.cellphone || errors.purposeOfVisit) ? styles.submitButtonDisabled : null
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Modal visible={showDateModal} transparent={true} animationType="slide" onRequestClose={() => setShowDateModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDateModal(false)}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                            <ScrollView style={styles.pickerColumn}>
                                {months.map((month, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        style={[styles.pickerItem, selectedDate.getMonth() === index ? styles.selectedPickerItem : null]}
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
                            <ScrollView style={styles.pickerColumn}>
                                {Array.from({ length: getDaysInMonth(selectedDate.getMonth() + 1, selectedDate.getFullYear()) }, (_, i) => i + 1).map(day => (
                                    <TouchableOpacity 
                                        key={day}
                                        style={[styles.pickerItem, selectedDate.getDate() === day ? styles.selectedPickerItem : null]}
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
                            <ScrollView style={styles.pickerColumn}>
                                {years.map(year => (
                                    <TouchableOpacity 
                                        key={year}
                                        style={[styles.pickerItem, selectedDate.getFullYear() === year ? styles.selectedPickerItem : null]}
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
                            onPress={() => handleDateSelection(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate())}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingModalContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Generating ID, please wait...</Text>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

interface ProgressBarProps { progress: number; }
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
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#252525',
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
    },
    lastnameInput: {
        flex: 2,
        marginRight: 10,
    },
    firstnameInput: {
        flex: 2,
        marginRight: 10,
    },
    middleInitialInput: {
        flex: 1,
        textAlign: 'center',
    },
});