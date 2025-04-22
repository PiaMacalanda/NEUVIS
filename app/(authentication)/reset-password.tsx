import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const parseHashParams = (url: string) => {
            const hashPart = url.split('#')[1];
            if (!hashPart) return {};
            
            return hashPart.split('&').reduce((params: Record<string, string>, param) => {
                const [key, value] = param.split('=');
                if (key && value) {
                    params[key] = decodeURIComponent(value);
                }
                return params;
            }, {});
        };

        const handleDeepLink = async (url: string | null) => {
            if (!url) return;
            
            console.log("Received deep link URL:", url);
            
            try {
                if (url.includes('#')) {
                    const hashParams = parseHashParams(url);
                    console.log("Hash params:", hashParams);
                    
                    if (hashParams.error) {
                        console.error("Error in hash params:", hashParams.error_description);
                        setErrorMessage(hashParams.error_description.replace(/\+/g, ' '));
                        return;
                    }
                    
                    if (hashParams.access_token) {
                        console.log("Setting password recovery session with hash params");
                        
                        const { error } = await supabase.auth.setSession({
                            access_token: hashParams.access_token,
                            refresh_token: hashParams.refresh_token || '',
                        });
                        
                        if (error) {
                            console.error("Error setting session:", error);
                            setErrorMessage(error.message);
                        } else {
                            setIsRecoveryMode(true);
                        }
                    }
                } else {
                    const parsedUrl = Linking.parse(url);
                    console.log("Parsed URL:", parsedUrl);
                    
                    const params = parsedUrl.queryParams;
                    if (params && params.access_token) {
                        console.log("Setting password recovery session with query params");
                        
                        const accessToken = Array.isArray(params.access_token) 
                            ? params.access_token[0] 
                            : params.access_token;
                            
                        const refreshToken = params.refresh_token 
                            ? (Array.isArray(params.refresh_token) 
                                ? params.refresh_token[0] 
                                : params.refresh_token) 
                            : '';
                        
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        
                        if (error) {
                            console.error("Error setting session:", error);
                            setErrorMessage(error.message);
                        } else {
                            setIsRecoveryMode(true);
                        }
                    }
                }
            } catch (error: any) {
                console.error("Error processing deep link:", error);
                setErrorMessage(error.message || "Failed to process password reset link");
            }
        };

        const setupLinking = async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                await handleDeepLink(initialUrl);
            }
            
            const subscription = Linking.addEventListener('url', ({url}) => {
                handleDeepLink(url);
            });
            
            return () => {
                subscription.remove();
            };
        };
        
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error);
                setErrorMessage(error.message);
                return;
            }
            
            if (data.session) {
                console.log("Active session found");
                setIsRecoveryMode(true);
            } else {
                console.log("No active session found");
            }
        };
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state change:", event);
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true);
            } else if (event === 'SIGNED_IN') {
                setIsRecoveryMode(true);
            }
        });

        setupLinking();
        checkSession();
        
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleReset = async () => {
        if (!newPassword) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }
        
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ 
                password: newPassword 
            });
            
            if (error) throw new Error(`Error changing password: ${error.message}`);
            
            await supabase.auth.signOut();

            Alert.alert(
                'Success', 
                'Password updated successfully. You can now log in with your new password.',
                [{ text: 'OK', onPress: () => router.push('/') }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestNewLink = () => {
        router.push('/forgot-password');
    };

    if (errorMessage) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.error}>{errorMessage}</Text>
                <Text style={styles.message}>
                    The password reset link has expired or is invalid. Please request a new password reset link.
                </Text>
                <TouchableOpacity 
                    onPress={handleRequestNewLink} 
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Request New Link</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            
            {!isRecoveryMode && (
                <Text style={styles.warning}>
                    Waiting for authentication... If this screen persists, you may need to click the reset password link again.
                </Text>
            )}

            <TextInput
                placeholder="New Password"
                secureTextEntry
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={isRecoveryMode}
            />

            <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={isRecoveryMode}
            />

            <TouchableOpacity 
                onPress={handleReset} 
                style={[
                    styles.button,
                    !isRecoveryMode && styles.disabledButton
                ]} 
                disabled={loading || !isRecoveryMode}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Updating...' : 'Update Password'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ResetPasswordScreen;

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
  warning: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
    padding: 8,
  },
  error: {
    color: '#e74c3c',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
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
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});