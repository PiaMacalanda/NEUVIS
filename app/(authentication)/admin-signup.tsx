// This could be removed
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

export default function AdminSignupScreen() {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  const router = useRouter();

  // For UI demo only - will be replaced with actual registration
  const handleSignup = () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    
    // For development - show confirmation and redirect
    Alert.alert(
      "Request Submitted", 
      "Your admin access request has been submitted for approval. You will receive an email once your account is approved.",
      [{ text: "OK", onPress: () => router.push('/admin-login') }]
    );
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
          
          <Text style={styles.title}>Admin Access Request</Text>
          <Text style={styles.subtitle}>Please provide your NEU credentials</Text>
          
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
            
            <View style={styles.inputContainer}>
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
            </View>
            
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
            
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#252525" />
              <Text style={styles.noteText}>
                Admin access requires approval from system administrators
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Submit Request</Text>
            </TouchableOpacity>
            
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Already have access? </Text>
              <TouchableOpacity onPress={() => router.push('/admin-login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By requesting access, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
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
    backgroundColor: '#003566',
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