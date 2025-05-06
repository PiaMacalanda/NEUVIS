import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function forgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const {loading, forgetPassword} = useAuth();
    
    const handlePasswordReset = async () => {
        if (!email) {
            return;
        }
        
        try {
            await forgetPassword(email);
        } catch (error) {
            console.error('Error sending forget password email in the component:', error);
        }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
  
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
  
        <TouchableOpacity
          onPress={handlePasswordReset}
          style={styles.button}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </View>
    );
};  


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 26,
      fontWeight: '600',
      marginBottom: 24,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      backgroundColor: '#003566',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
});