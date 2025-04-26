import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import supabase from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { router, usePathname } from 'expo-router';
import * as authService from '../services/authService';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

interface AuthContextProps {
    user: User | null;
    userProfile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
    signUp: (email: string, password: string, full_name: string, role: string) => Promise<{
        data: { user: User | null; session: Session | null } | null;
        error: Error | null;
    }>;
    signIn: (email: string, password: string, requiredRole?: 'admin' | 'security' | 'superadmin') => Promise<{
        data: { user: User | null; session: Session | null } | null;
        userData?: { role: string };
        role?: string;
        error: Error | null;
    }>;
    signOut: () => Promise<void>;
    forgetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    userProfile: null,
    session: null,
    loading: true,
    refreshUserProfile: async () => {},
    signUp: async () => ({ data: null, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => {},
    forgetPassword: async () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            
            try {
                const { session: loadedSession, user: loadedUser, error } = await authService.loadSession();
                
                if (error) {
                    setUser(null);
                    setSession(null);
                    setUserProfile(null);
                } else {
                    setSession(loadedSession);
                    setUser(loadedUser);
                    await refreshUserProfile();
                }
            } finally {
                setLoading(false);
            }
        };
    
        initializeAuth();
    
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                
                if (newSession) {
                    await authService.saveSession(newSession);
                } else {
                    await authService.clearSession();
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

    const refreshUserProfile = async () => {
        if (!session?.user?.id) return;
      
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
      
        if (error) {
          console.error('Failed to refresh user profile:', error.message);
          setUserProfile(null);
        } else {
          setUserProfile(data);
        }
      };
      

    const handleSignUp = async (email: string, password: string, full_name: string, role: string) => {
        setLoading(true);
        try {
            return await authService.signUp(email, password, full_name, role);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string, requiredRole?: 'admin' | 'security' | 'superadmin') => {
        setLoading(true);
        try {
            const result = await authService.signIn(email, password, requiredRole);
            
            if (result.error?.message?.toLowerCase().includes('email not confirmed')) {
                router.push(`/(authentication)/verify?email=${email}`);
            }
            
            return result;
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async (): Promise<void> => {
        setLoading(true);
        try {
            await authService.signOut();
        } finally {
            setLoading(false);
        }
    };

    const handleForgetPassword = async (email: string): Promise<void> => {
        setLoading(true);
        try {
            await authService.forgetPassword(email);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider
          value={{
            user,
            userProfile,
            session,
            loading,
            refreshUserProfile,
            signUp: handleSignUp,
            signIn: handleSignIn,
            signOut: handleSignOut,
            forgetPassword: handleForgetPassword
          }}
        >
          {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;