import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/app/lib/supabaseClient';

interface ProfileEditorProps {
  initialData?: {
    name: string;
    email: string;
    role: string;
  };
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ 
  initialData = {
    name: 'Administrator',
    email: 'admin@neu.edu.ph',
    role: 'Administrator'
  }
}) => {
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState(initialData.email);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  
  // New state variables for password validation
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
  const [isPasswordMatching, setIsPasswordMatching] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Mock last password update date - this would come from your backend in production
  const lastPasswordUpdate = "02/04/2025";

  // Verify current password
  const verifyCurrentPassword = async (password: string) => {
    if (!password) {
      setIsCurrentPasswordVerified(false);
      return;
    }
    
    setIsVerifyingPassword(true);
    try {
      // This is a simplified approach - in a real app, you would verify this against your backend
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        setIsCurrentPasswordVerified(false);
      } else {
        setIsCurrentPasswordVerified(true);
      }
    } catch (error) {
      setIsCurrentPasswordVerified(false);
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword && newPassword) {
      setIsPasswordMatching(confirmPassword === newPassword);
    } else {
      setIsPasswordMatching(false);
    }
  }, [confirmPassword, newPassword]);

  // Verify current password when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPassword) {
        verifyCurrentPassword(currentPassword);
      } else {
        setIsCurrentPasswordVerified(false);
      }
    }, 500); // Debounce to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [currentPassword]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Update the user profile in the public users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: name,
          email: email
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update auth metadata if needed
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (metadataError) {
        throw metadataError;
      }

      Alert.alert(
        "Profile Updated",
        "Your profile information has been updated successfully.",
        [{ text: "OK", onPress: () => setIsEditing(false) }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update profile. Please try again."
      );
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate current password is verified
    if (!isCurrentPasswordVerified) {
      Alert.alert("Error", "Please enter your correct current password.");
      return;
    }
    
    // Validate passwords match
    if (!isPasswordMatching) {
      Alert.alert("Error", "New passwords don't match.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Password Changed",
        "Your password has been updated successfully.",
        [{ 
          text: "OK", 
          onPress: () => {
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsCurrentPasswordVerified(false);
            setIsPasswordMatching(false);
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update password. Please make sure you're properly authenticated."
      );
      console.error('Password update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // This is just UI for now, you'll implement the function later
    setShowForgotPasswordModal(false);
    Alert.alert(
      "Reset Email Sent",
      "If an account exists for this email, you will receive a password reset link.",
      [{ text: "OK" }]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(initialData.name);
    setEmail(initialData.email);
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCurrentPasswordVerified(false);
    setIsPasswordMatching(false);
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>

      {/* Profile Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.avatarName}>{name}</Text>
        <Text style={styles.avatarEmail}>{email}</Text>
        <Text style={styles.avatarRole}>{initialData.role}</Text>
      </View>

      {/* Profile Information Section - Edit button removed as requested */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>
      </View>

      {/* Password Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Password</Text>
          {!isChangingPassword ? (
            <TouchableOpacity onPress={() => setIsChangingPassword(true)} style={styles.editButton}>
              <Ionicons name="lock-closed-outline" size={20} color="#4a89dc" />
              <Text style={styles.editText}>Change</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {!isChangingPassword ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Password</Text>
              <Text style={styles.infoValue}>••••••••</Text>
            </View>
            <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              onPress={() => setShowForgotPasswordModal(true)}
            > 
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editContainer}>
            {/* Password requirements */}
            <View style={styles.passwordRequirementsContainer}>
              <Text style={styles.passwordRequirementsTitle}>Change Password</Text>
              <Text style={styles.passwordRequirementsText}>
                Your password must be at least 6 characters and should include a combination of numbers, letters and special characters (!$@%).
              </Text>
            </View>
            
            {/* Current Password with verification indicator */}
            <Text style={styles.inputLabel}>Current password</Text>
            <View style={[
              styles.passwordInputContainer,
              currentPassword ? 
                isCurrentPasswordVerified ? styles.inputSuccess : styles.inputError 
                : null
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry={!showCurrentPassword}
              />
              {isVerifyingPassword ? (
                <ActivityIndicator size="small" color="#4a89dc" style={styles.passwordIndicator} />
              ) : currentPassword ? (
                <View style={styles.passwordIndicator}>
                  <Ionicons 
                    name={isCurrentPasswordVerified ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={isCurrentPasswordVerified ? "#4caf50" : "#f44336"} 
                  />
                </View>
              ) : null}
              <TouchableOpacity 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
            
            {/* New Password - disabled if current password not verified */}
            <Text style={[
              styles.inputLabel, 
              !isCurrentPasswordVerified && styles.disabledText
            ]}>New password</Text>
            <View style={[
              styles.passwordInputContainer,
              !isCurrentPasswordVerified && styles.disabledInput
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
                editable={isCurrentPasswordVerified}
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.passwordToggle}
                disabled={!isCurrentPasswordVerified}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color={isCurrentPasswordVerified ? "#888" : "#ccc"}
                />
              </TouchableOpacity>
            </View>
            
            {/* Confirm Password with match indicator */}
            <Text style={[
              styles.inputLabel,
              !isCurrentPasswordVerified && styles.disabledText
            ]}>Retype new password</Text>
            <View style={[
              styles.passwordInputContainer,
              !isCurrentPasswordVerified && styles.disabledInput,
              (confirmPassword && isCurrentPasswordVerified) ? 
                isPasswordMatching ? styles.inputSuccess : styles.inputError 
                : null
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                editable={isCurrentPasswordVerified}
              />
              {confirmPassword && isCurrentPasswordVerified ? (
                <View style={styles.passwordIndicator}>
                  <Ionicons 
                    name={isPasswordMatching ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={isPasswordMatching ? "#4caf50" : "#f44336"} 
                  />
                </View>
              ) : null}
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
                disabled={!isCurrentPasswordVerified}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color={isCurrentPasswordVerified ? "#888" : "#ccc"}
                />
              </TouchableOpacity>
            </View>
            
            {/* Forgotten password link */}
            <TouchableOpacity 
              style={styles.forgotPasswordInlineButton} 
              onPress={() => setShowForgotPasswordModal(true)}
            >
              <Text style={styles.forgotPasswordInlineText}>Forgotten your password?</Text>
            </TouchableOpacity>
            
            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                onPress={handleCancelPasswordChange} 
                style={[styles.button, styles.cancelButton]}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleChangePassword} 
                style={[
                  styles.button, 
                  styles.saveButton,
                  (!isCurrentPasswordVerified || !isPasswordMatching) && styles.disabledButton
                ]}
                disabled={isLoading || !isCurrentPasswordVerified || !isPasswordMatching}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity 
                onPress={() => setShowForgotPasswordModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#252525" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <TextInput
              style={[styles.input, styles.modalInput]}
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                onPress={() => setShowForgotPasswordModal(false)} 
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleForgotPassword} 
                style={[styles.button, styles.saveButton, styles.modalSendButton]}
              >
                <Text style={styles.saveButtonText}>Send Reset Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4a89dc',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  avatarEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  avatarRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    marginLeft: 5,
    color: '#4a89dc',
    fontWeight: '500',
  },
  infoContainer: {
    
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#252525',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  editContainer: {
    
  },
  passwordRequirementsContainer: {
    marginBottom: 15,
  },
  passwordRequirementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 8,
  },
  passwordRequirementsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  passwordToggle: {
    padding: 10,
  },
  passwordIndicator: {
    paddingRight: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4a89dc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#a0bfed',
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: '#4a89dc',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordInlineButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  forgotPasswordInlineText: {
    color: '#4a89dc',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalSendButton: {
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New styles for password validation
  inputSuccess: {
    borderColor: '#4caf50',
  },
  inputError: {
    borderColor: '#f44336',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  disabledText: {
    color: '#aaa',
  },
});

export default ProfileEditor;