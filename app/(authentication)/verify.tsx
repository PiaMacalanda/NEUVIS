import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabaseClient';
import { router, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

const VerifyScreen = () => {
    const { user, session } = useAuth();
    const [loading, setLoading] = useState(false);
    const params = useGlobalSearchParams()
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
    

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Verify Your Email</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
                A verification email has been sent to {user?.email}. Please check your inbox.
            </Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Resend Verification Email" onPress={resendVerificationEmail} />
            )}
            <Button title="Back to Login" onPress={() => router.replace('/')} />
        </View>
    );
};

export default VerifyScreen;
