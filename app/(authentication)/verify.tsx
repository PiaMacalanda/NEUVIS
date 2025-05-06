import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabaseClient';
import { router, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

const VerifyScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const params = useGlobalSearchParams();
  const emailParam = Array.isArray(params['email']) ? params['email'][0] : params['email'] || null;

  const resendVerificationEmail = async () => {
    const email = user?.email || emailParam;

    if (!email) {
      Alert.alert('Error', 'Email is missing.');
      return;
    }

    setLoading(true);
        const { error } = await supabase.auth.resend({ type: 'signup', email: email });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
        Alert.alert('Success', 'Verification email resent. Check your inbox.');
    }
  };

  const goToLogin = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        A verification link has been sent to:
      </Text>
      <Text style={styles.email}>
        {user?.email || emailParam}
      </Text>

      <Text style={styles.instruction}>
        Please check your inbox and follow the link to activate your account.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#003566" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={resendVerificationEmail}>
          <Text style={styles.buttonText}>Resend Verification Email</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={goToLogin}>
        <Text style={styles.secondaryButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#003566',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#444',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#003566',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#003566',
    fontSize: 16,
    fontWeight: '500',
  },
});
