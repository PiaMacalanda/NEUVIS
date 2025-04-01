import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../../components';
import Footer from '../../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function AdminSignupScreen() {
  const [fullName, setFullName] = useState('');
  // const [department, setDepartment] = useState('');
  // const [position, setPosition] = useState('');
  // const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const {loading: userCreationLoading, signUp} = useAuth();
  const router = useRouter();


const handleAdminCreation = async () => {
  setLoading(true);

    try {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords don't match");
            return;
        }

        const { data, error } = await signUp(email, password, fullName, 'admin');

        if (error) {
            console.error("Admin creation failed:", error.message);
            Alert.alert("Admin Creation Error", error.message);
            return;
        }

        Alert.alert(
            "Admin created successfully",
            "Advise the admin to check their email to verify their account.",
            [{ text: "OK", onPress: () => router.push('/superadmin') }]
        );

    } catch (error) {
        console.error("Unexpected error in handleAdminCreation:", (error as Error).message);
        Alert.alert("Admin Creation Error", (error as Error).message);
    } finally {
        setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4a89dc" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Logo size="small" />
          </View>
          
          <Text style={styles.title}>Create Admin</Text>
          <Text style={styles.subtitle}>Input the Admin Credentials</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
            
            {/* <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Department"
                value={department}
                onChangeText={setDepartment}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Position/Role"
                value={position}
                onChangeText={setPosition}
              />
            </View> 
            
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Employee ID"
                value={employeeId}
                onChangeText={setEmployeeId}
              />
            </View> */}
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email (@neu.edu.ph)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity onPress={toggleSecureEntry} style={styles.securityIcon}>
                <Ionicons 
                  name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#252525" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={confirmSecureTextEntry}
              />
        
              <TouchableOpacity onPress={toggleConfirmSecureEntry} style={styles.securityIcon}>
                <Ionicons 
                  name={confirmSecureTextEntry ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#252525" 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleAdminCreation}
            >
              <Text style={styles.signupButtonText}>Create Admin</Text>
            </TouchableOpacity>
        
            </View>
          <Footer />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#252525',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#B0B0B0',
  },
  securityIcon: {
    padding: 10,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  noteText: {
    marginLeft: 8,
    color: '#252525',
    fontSize: 12,
  },
  signupButton: {
    backgroundColor: '#4a89dc',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginPromptText: {
    color: '#252525',
    fontSize: 14,
  },
  loginLink: {
    color: '#4a89dc',
    fontSize: 14,
    fontWeight: '600',
  },
  termsContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#252525',
    textAlign: 'center',
  },
  termsLink: {
    color: '#4a89dc',
    fontWeight: '500',
  },
});