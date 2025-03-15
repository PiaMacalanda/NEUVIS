import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabaseClient';
import { View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session?.user?.email) {
          router.replace('/?error=auth_failed');
          return;
        }

        const userEmail = data.session.user.email;

        if (!userEmail.endsWith('@neu.edu.ph')) {
          await supabase.auth.signOut();
          router.replace('/?error=invalid_email');
          return;
        }

        // Fetch user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', userEmail)
          .single();

        if (!userData?.role) {
          await supabase.auth.signOut();
          router.replace('/?error=no_role');
          return;
        }

        // Redirect to role-based page
        router.replace(userData.role === 'admin' ? '/admin' : '/neuvisLanding');
      } catch {
        router.replace('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, []);

  return <View />;
}