import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import supabase from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { Session, User, Provider } from '@supabase/supabase-js';
import { router } from 'expo-router';

interface AuthContextProps {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, full_name: string, role: string) => Promise<{
        data: { user: User | null; session: Session | null } | null;
        error: Error | null;
    }>;
    signIn: (email: string, password: string, requiredRole?: 'admin' | 'security') => Promise<{
        data: { user: User | null; session: Session | null } | null;
        userData?: { role: string };
        role?: string;
        error: Error | null;
    }>;
    signOut: () => Promise<void>;
}
  

const AuthContext = createContext<AuthContextProps>({
    user: null,
    session: null,
    loading: true,
    signUp: async () => ({ data: null, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        const loadSession = async () => {
          setLoading(true);
          
          try {
            const storedSession = await SecureStore.getItemAsync('supabase-session');
            
            if (storedSession) {
              const sessionData = JSON.parse(storedSession);
              
              const { data, error } = await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
              });
              
              if (error) {
                await SecureStore.deleteItemAsync('supabase-session');
                setUser(null);
                setSession(null);
              } else {
                setSession(data.session);
                setUser(data.user);
              }
            }
          } catch (error) {
            console.error('Error loading auth session:', error);
          } finally {
            setLoading(false);
          }
        };
    
        loadSession();
    
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession) {
                await SecureStore.setItemAsync(
                    'supabase-session',
                    JSON.stringify({
                        access_token: newSession.access_token,
                        refresh_token: newSession.refresh_token,
                    })
                );
            } else {
                await SecureStore.deleteItemAsync('supabase-session');
                router.replace('/');
            }
          }
        );
    
        // Cleanup subscription
        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
    }, []);
      

    const signUp = async (email: string, password: string, full_name: string, role: string) => {
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({ email, password})
            
            if (error) {
                console.error('Sign-up failed:', error.message);
                Alert.alert('Error signing up', error.message);
                return { data: null, error };
            }

            if(data?.user){
                const insertError = await insertUserToUsersTable(email, data.user.id, full_name, role);
                if (insertError) {
                    console.error('Error inserting user into database:', insertError.message);
                    return { data: null, error: insertError };                
                }            
            } else {
                console.error("User data not returned from authentication");
                Alert.alert('Sign-up Error', 'Failed to create user account. Please try again.');
                return { data: null, error: new Error('User data not returned') };
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Unexpected error during sign-up:', (error as Error).message);
            Alert.alert('Sign-up Error', (error as Error).message);
            return { data: null, error: error as Error };
        } finally {
            setLoading(false);
        }
    }

    const insertUserToUsersTable = async (email: string, id: string, full_name: string, role: string) => {
        try {
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('id')
                .eq('id', id)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error checking existing user:', fetchError.message);
                return fetchError;
            }
    
            if (existingUser) return new Error('Account already exists');
    
            const { error } = await supabase.from('users').insert([
                {
                    id: id,
                    email: email,
                    full_name: full_name,
                    role: role,
                }
            ]);
    
            if (error) {
                if (error.code === '23505') {
                    return new Error('Account already exists');
                } else {
                    console.error('Insert failed:', error.message);
                    return error;
                }
            }
            
            console.log('User successfully inserted.');
            return null;
        } catch (error) {
            console.error('Unexpected error inserting user:', (error as Error).message);
            return error as Error;
        }
    };
    
    const signIn = async (email: string, password: string, requiredRole?: 'admin' | 'security') => {
        setLoading(true);
    
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            if (data.user) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();
                    
                if (userError) throw userError;
                
                if (requiredRole && userData.role !== requiredRole) {
                    throw new Error(`Access denied. This login requires ${requiredRole} privileges.`);
                }
                
                return { 
                    data, 
                    userData, 
                    role: userData.role,
                    error: null 
                };
            }
            
            return { 
                data, 
                userData: undefined,
                role: undefined,
                error: null 
            };
        } catch (error) {
            Alert.alert('Error signing in', (error as Error).message);
            return { 
                data: null, 
                userData: undefined,
                role: undefined,
                error: error as Error 
            };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        setLoading(true);
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            await SecureStore.deleteItemAsync('supabase-session');
        } catch (error) {
            Alert.alert('Error signing out', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <AuthContext.Provider
          value={{
            user,
            session,
            loading,
            signUp,
            signIn,
            signOut,
          }}
        >
          {children}
        </AuthContext.Provider>
      );
}

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};