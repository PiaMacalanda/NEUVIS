import supabase from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';

export interface AuthResponse {
  data: { user: User | null; session: Session | null } | null;
  userData?: { role: string };
  role?: string;
  error: Error | null;
}

export const signUp = async (email: string, password: string, full_name: string, role: string): Promise<AuthResponse> => {
  try {
    if (!email.endsWith('@neu.edu.ph')) throw new Error('Use your institutional email');

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: 'myapp://emailVerified',
        data: { full_name, role }
      }
    });
      
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
  }
};

export const signIn = async (email: string, password: string, requiredRole?: 'admin' | 'security' | 'superadmin'): Promise<AuthResponse> => {
  try {
    if (!email.endsWith('@neu.edu.ph')) throw new Error('Use your institutional email');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        Alert.alert(
          'Error during sign-in', 
          'Email is not verified. Please check your inbox or resend verification email.',
          [{ text: 'OK', onPress: () => router.push({pathname: '/verify', params: { email: email }}) }]
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

    // Check if user profile exists in the database
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        // User exists in auth but not in users table - this should no longer happen
        // since profiles are created during email verification
        throw new Error('User profile not found. Please contact support.');
      }
      throw userError;
    }

    const role = existingUser.role;

    if (requiredRole && role !== requiredRole) {
      throw new Error(`Access denied. This login requires ${requiredRole} privileges.`);
    }

    return { 
      data, 
      userData: { role }, 
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
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await SecureStore.deleteItemAsync('supabase-session');
  } catch (error) {
    Alert.alert('Error signing out', (error as Error).message);
  }
};

export const forgetPassword = async (email: string): Promise<void> => {
  try {
    if (!email) {
      throw new Error('Error: Please enter your email');
    }
    
    if (!email.endsWith('@neu.edu.ph')) {
      throw new Error('Error: Please use your institutional email');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password',
    });

    if (error) throw error;
    
    Alert.alert(
      'Password Reset Email Sent', 
      'Check your email for a password reset link. Follow the link to set a new password.',
      [{ text: 'OK', onPress: () => router.push('/') }]
    );
  } catch (error) {
    console.error('Error reseting email:', error);
    Alert.alert('Error sending email to reset password', (error as Error).message);
  }
}

export const loadSession = async (): Promise<{ session: Session | null; user: User | null; error: Error | null }> => {
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
        return { session: null, user: null, error };
      } else {
        return { session: data.session, user: data.user, error: null };
      }
    }
    
    return { session: null, user: null, error: null };
  } catch (error) {
    console.error('Error loading auth session:', error);
    return { session: null, user: null, error: error as Error };
  } finally {
    await supabase.auth.refreshSession();
  }
};

export const saveSession = async (session: Session): Promise<void> => {
  await SecureStore.setItemAsync(
    'supabase-session',
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user_id: session.user?.id
    })
  );
};

export const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('supabase-session');
};