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
import LoadingOverlay from '@/components/LoadingOverlay';

export default function SecuritySignupScreen() {
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const { signUp, loading: signUpLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);

    try {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords don't match");
            return;
        }

        const { error } = await signUp(email, password, fullName, 'security');

        if (error) {
            console.error("Sign-up failed:", error.message);
            Alert.alert("Sign-up Error", error.message);
            return;
        }

        Alert.alert(
            "Verify Email",
            "Verify your email to be signed up successfully.",
            [{ text: "OK", onPress: () => router.push({ pathname: '/verify', params: { email: email } }) }]
        );

    } catch (error) {
        console.error("Unexpected error in handleSignup:", (error as Error).message);
        Alert.alert("Sign-up Error", (error as Error).message);
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
  
          <View style={styles.logoContainer}>
            <Logo size="small" />
          </View>
          
          <Text style={styles.title}>Security Guard Registration</Text>
          
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
                placeholder="Email"
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
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>
            
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
          
          <Footer />
        </View>

        <LoadingOverlay visible={signUpLoading || loading} />
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
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
    color: '#252525',
  },
  securityIcon: {
    padding: 10,
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