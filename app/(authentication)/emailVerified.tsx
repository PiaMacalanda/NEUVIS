import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

const EmailVerifiedScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                🎉 Email Verified!
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
                Your email has been successfully verified. You can now log in to your account.
            </Text>
            <Button title="Go to Login" onPress={() => router.replace('/')} />
        </View>
    );
};

export default EmailVerifiedScreen;