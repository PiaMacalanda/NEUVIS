import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import supabase from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { Session, User, Provider } from '@supabase/supabase-js';
import { router, usePathname } from 'expo-router';
import VisitorsLogs from '../(security)/VisitorsLogs';

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

    const pathname = usePathname();

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

        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
    }, []);
      

    useEffect(() => {
        // Throw user to landing if authenticated and in login/signup pages
        if (!session || !user) return;

        if (!user) {
            console.error("User doesn't exist");
            return;
        }
        
        const role = user.user_metadata.role;
        const authScreens = ['/', '/security-login', '/security-signup', '/admin-login', '/admin-signup'];
        const adminScreens = ['/admin', '/adminData', '/adminHome', '/adminReport', 'accessControl'];
        const securityScreens = ['/neuvisLanding', "/VisitorsLogs", '/ScannerOutput', '/Scanner', '/IDGenerate', '/ManualForm'];
    
        if (authScreens.includes(pathname)) {
            if (role === 'security') {
                router.replace('/neuvisLanding');
            } else if (role === 'admin') {
                router.replace('/admin');
            } else if (role === 'superadmin'){
                router.replace('/superadmin');
            }
        }


        if (adminScreens.includes(pathname)){
            if (role === 'security'){
                router.replace('/neuvisLanding');
            }
        } else if (securityScreens.includes(pathname)){
            if (role === 'admin'){
                router.replace('/admin');
            }
        }
    }, [session, user?.user_metadata?.role, pathname]);


    const signUp = async (email: string, password: string, full_name: string, role: string) => {
        setLoading(true);
        
        try {
            if(!email.endsWith('@neu.edu.ph')) throw new Error ('Use your institutional email');

            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: 'myapp://emailVerified',
                    data: { full_name, role }
                }
            })
            
            if (error) {
                console.error('Sign-up failed:', error.message);
                Alert.alert('Error signing up', error.message);
                return { data: null, error };
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


    const signIn = async (email: string, password: string, requiredRole?: 'admin' | 'security' | 'superadmin') => {
        setLoading(true);
    
        try {
            if (!email.endsWith('@neu.edu.ph')) throw new Error('Use your institutional email');
    
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                if (error.message.toLowerCase().includes('email not confirmed')) {
                    Alert.alert(
                        'Error during sign-in', 
                        'Email is not verified. Please check your inbox or resend verification email.',
                        [{ text: "OK", onPress: () => router.push(`/(authentication)/verify?email=${email}`) }]
                    );

                    console.error(error);
                    return { data: null, userData: undefined, role: undefined, error: error as Error };
                }

                throw error;
            }  

            const user = data.user;
            if (!user) throw new Error('User not found');
    
            if (!user.email_confirmed_at) {
                throw new Error('Please verify your email before signing in.');
            }
    
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();
    
            if (userError && userError.code !== 'PGRST116') throw userError;
    
            let userData: { role: string } | undefined;
            let role: string | undefined;
    
            if (!existingUser) {
                console.log('User is verified but not in database. Inserting...');
                const full_name = user.user_metadata?.full_name || 'Unknown';
                role = user.user_metadata?.role || 'user';

                if(!role){
                    Alert.alert('User role not found!');
                    throw new Error("User role not found!");
                }
    
                const insertError = await insertUserToUsersTable(email, user.id, full_name, role);
                if (insertError) throw insertError;
    
                userData = { role };
            } else {
                userData = { role: existingUser.role };
                role = existingUser.role;
            }
    
            if (requiredRole && role !== requiredRole) {
                throw new Error(`Access denied. This login requires ${requiredRole} privileges.`);
            }
    
            return { 
                data, 
                userData, 
                role, 
                error: null 
            };
        } catch (error) {
            console.error(error);
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

