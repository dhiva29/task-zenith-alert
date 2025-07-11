import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AUTHORIZED_USERS } from '@/constants/users';
import type { User as AppUser } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      // Don't update state here, let onAuthStateChange handle it
      // This prevents race conditions
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    // Check if user is authorized
    const authorizedUser = AUTHORIZED_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!authorizedUser) {
      return { error: { message: 'Invalid credentials or unauthorized user' } };
    }

    // Use username as email for Supabase auth
    const email = `${username}@afscheduler.app`;
    
    try {
      // Try to sign in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // User doesn't exist, create account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: authorizedUser.username,
              full_name: authorizedUser.name,
              first_name: authorizedUser.firstName
            }
          }
        });

        if (signUpError) {
          return { error: signUpError };
        }

        // Create profile
        if (signUpData.user) {
          await supabase
            .from('profiles')
            .insert({
              user_id: signUpData.user.id,
              username: authorizedUser.username,
              full_name: authorizedUser.name,
              first_name: authorizedUser.firstName
            });
        }

        return { data: signUpData, error: null };
      }

      return { data, error };
    } catch (err) {
      return { error: { message: 'Authentication failed' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut
  };
};