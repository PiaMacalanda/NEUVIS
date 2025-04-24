import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../../components';
import Footer from '../../components/Footer';
import LoadingOverlay from '@/components/LoadingOverlay';
import supabase from '../lib/supabaseClient';

export default function SecurityLoginScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emailTextColor, setEmailTextColor] = useState('#B0B0B0');
  const [passwordTextColor, setPasswordTextColor] = useState('#B0B0B0');
  const router = useRouter();
  const { signIn, loading: signInLoading } = useAuth();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // First, check if the security personnel exists and is confirmed
      const { data, error: securityError } = await supabase
        .from('security')
        .select('confirmed, active')
        .eq('email', email);
      
      if (securityError) {
        console.error('Error checking security status:', securityError);
        alert('Error checking account status. Please try again.');
        setLoading(false);
        return;
      }
      
      // Check if any security record was found
      if (!data || data.length === 0) {
        alert('Account not found. Please verify your email address.');
        setLoading(false);
        return;
      }
      
      const securityData = data[0]; // Get the first (and should be only) record
      
      // Check if the account is confirmed and active
      if (!securityData.confirmed) {
        alert('Your account is pending admin confirmation. Please contact your administrator.');
        setLoading(false);
        return;
      }
      
      if (!securityData.active) {
        alert('Your account has been deactivated. Please contact your administrator.');
        setLoading(false);
        return;
      }
      
      // If account is confirmed and active, proceed with sign in
      const { error } = await signIn(email, password, 'security');
      if (error) {
        console.error('Login error:', error);
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
          
          <Text style={styles.title}>Security Guard Login</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: email.length > 0 ? '#252525' : '#B0B0B0' }]}
                placeholder="Security Email"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailTextColor(text.length > 0 ? '#252525' : '#B0B0B0');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: password.length > 0 ? '#252525' : '#B0B0B0' }]}
                placeholder="Password"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordTextColor(text.length > 0 ? '#252525' : '#B0B0B0');
                }}
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
            
            <TouchableOpacity style={styles.forgotPassword} onPress={() => {router.push('/(authentication)/forgot-password')}}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => router.push('/neuvisLanding')}
            >
              <Text style={styles.signupButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
          
          <Footer />
        </View>
        <LoadingOverlay visible={signInLoading || loading} />
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
    marginBottom: 30,
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
    color: '#B0B0B0',
  },
  securityIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4a89dc',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#003566',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#888',
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#003566',
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#003566',
    fontSize: 16,
    fontWeight: '600',
  },
});