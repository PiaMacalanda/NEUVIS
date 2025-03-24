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
import { useAuth } from './context/AuthContext';
import { Logo } from '../components';
import Footer from '../components/Footer';

export default function AdminLoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emailTextColor, setEmailTextColor] = useState('#B0B0B0');
  const [passwordTextColor, setPasswordTextColor] = useState('#B0B0B0');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password, 'admin');
      if (error) throw error;
      router.replace('./adminHome');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
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
          
          <Text style={styles.title}>Administrator Login</Text>
          <Text style={styles.subtitle}>Secure access for NEU administrators only</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#252525" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: email.length > 0 ? '#252525' : '#B0B0B0' }]}
                placeholder="Admin Email"
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
            
            <TouchableOpacity style={styles.forgotPassword}>
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
              onPress={() => router.push('/admin-signup')}
            >
              <Text style={styles.signupButtonText}>Request Admin Access</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.secureInfoContainer}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#252525" />
            <Text style={styles.secureInfoText}>Secure, encrypted connection</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4a89dc',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4a89dc',
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
    borderColor: '#4a89dc',
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#4a89dc',
    fontSize: 16,
    fontWeight: '600',
  },
  secureInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  secureInfoText: {
    marginLeft: 5,
    color: '#252525',
    fontSize: 12,
  },
});