import { useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from "react-native";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import React from "react";

type Admin = {
    user_id: string;
    full_name: string;
    email: string;
    created_at: Date;
    role_admin: string;
}

type CurrentUserProfile = {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: Date;
}

const TransferSuperadmin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const { user, session, signOut, refreshUserProfile, userProfile } = useAuth();
    const [currentSuperadmin, setCurrentSuperAdmin] = useState<CurrentUserProfile | null>(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);
      
    const fetchCurrentUser = async (): Promise<void> => {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session?.user.id)
                .single();
            
            if (userError) {
                console.error('Error fetching user data:', userError);
                return;
            }
            
            if (userData) {
                if (userData.role === 'superadmin') {
                    setCurrentSuperAdmin(userData);
                } else {
                    Alert.alert('Error', 'You are not a superadmin, how are you here?', [{ text: 'OK', onPress: () => signOut() }]);
                }
            } else {
                Alert.alert('Error', 'User not found');
            }
        } catch (err) {
            console.error('Exception fetching current user:', err instanceof Error ? err.message : 'Unknown error');
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('admins')
                .select('*');
            
            if (error) {
                console.error('Error fetching Admins:', error);
                Alert.alert('Error', `Failed to load Admins: ${error.message}`);
                return;
            }
            
            if (data) {
                setAdmins(data);
            } else {
                setAdmins([]);
            }
        } catch (err) {
            console.error('Exception fetching Admins:', err);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const transferSuperadminRole = async () => {
        if (!selectedAdmin) return;
        
        setIsLoading(true);
      
        const { error } = await supabase.rpc('transfer_superadmin', {
          new_superadmin_id: selectedAdmin.user_id,
          current_superadmin_id: session?.user.id
        });
        
        if (error) {
          Alert.alert('Error', `Transfer failed: ${error.message}`);
          console.error(error);
        } else {
          Alert.alert('Success', 'Superadmin role transferred!');
          await refreshUserProfile();
          if (userProfile?.role !== 'superadmin') {
            Alert.alert('Role changed', 'You are no longer a superadmin.');
            signOut();
          }
        }
      
        setIsLoading(false);
        setConfirmModal(false);
        setSelectedAdmin(null);
    };
    
    const handleTransferPress = (admin: Admin) => {
        setSelectedAdmin(admin);
        setConfirmModal(true);
    };

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (isLoading && admins.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading admins...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.warningBanner}>
                <Text style={styles.warningTitle}>⚠️ Warning: Superadmin Transfer</Text>
                <Text style={styles.warningText}>
                    Transferring superadmin privileges is irreversible. The new superadmin will gain 
                    full system access, and you will lose your superadmin status.
                </Text>
            </View>
    
            <Text style={styles.title}>Transfer Superadmin Role</Text>
            <Text style={styles.subtitle}>
                Current Superadmin: {currentSuperadmin?.full_name || 'Loading...'}
            </Text>
    
            <ScrollView style={styles.adminList}>
                {admins.length === 0 ? (
                    <Text style={styles.noDataText}>No admins found</Text>
                ) : (
                    admins.map((admin) => (
                        <View key={admin.user_id} style={styles.adminCard}>
                            <View style={styles.adminInfo}>
                                <Text style={styles.adminName}>{admin.full_name}</Text>
                                <Text style={styles.adminEmail}>{admin.email}</Text>
                                <Text style={styles.adminDate}>DateCreated: {formatDate(admin.created_at)}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.transferButton}
                                onPress={() => handleTransferPress(admin)}
                                disabled={isLoading}
                            >
                                <Text style={styles.transferButtonText}>Transfer</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={confirmModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Superadmin Transfer</Text>
                        
                        <Text style={styles.modalText}>
                            Are you sure you want to transfer superadmin privileges to:
                        </Text>
                        <Text style={styles.selectedAdminName}>
                            {selectedAdmin?.full_name}
                        </Text>
                        <Text style={styles.selectedAdminEmail}>
                            {selectedAdmin?.email}
                        </Text>
                        
                        <Text style={styles.modalWarning}>
                            This action cannot be undone. You will lose your superadmin access immediately.
                        </Text>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setConfirmModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={transferSuperadminRole}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Transfer Role</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        color: '#666',
    },
    warningBanner: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeeba',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    adminList: {
        flex: 1,
    },
    adminCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    adminInfo: {
        flex: 1,
        marginRight: 16,
    },
    adminName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    adminEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    adminDate: {
        fontSize: 12,
        color: '#888',
    },
    transferButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        minWidth: 100,
    },
    transferButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    noDataText: {
        padding: 24,
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
        textAlign: 'center',
    },
    selectedAdminName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 4,
    },
    selectedAdminEmail: {
        fontSize: 16, 
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalWarning: {
        fontSize: 14,
        color: '#dc3545',
        marginVertical: 16,
        fontWeight: '500',
        textAlign: 'center',
        backgroundColor: '#fff3f3',
        padding: 12,
        borderRadius: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 12,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    cancelButtonText: {
        color: '#495057',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmButton: {
        backgroundColor: '#dc3545',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default TransferSuperadmin;