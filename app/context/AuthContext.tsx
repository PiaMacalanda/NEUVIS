import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import supabase from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { router, usePathname } from 'expo-router';
import * as authService from '../services/authService';

interface AuthContextProps {
    user: User | null;
    session: Session | null;
    loading: boolean;
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
    session: null,
    loading: true,
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

    const pathname = usePathname();

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            
            try {
                const { session: loadedSession, user: loadedUser, error } = await authService.loadSession();
                
                if (error) {
                    setUser(null);
                    setSession(null);
                } else {
                    setSession(loadedSession);
                    setUser(loadedUser);
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
        const securityScreens = ['/neuvisLanding', "/VisitorsLogs", '/ScannerOutput', '/Scanner', '/IDGenerate', '/ManualForm','/Notifications'];
    
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
            session,
            loading,
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