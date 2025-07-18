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
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, !!session?.user);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch profile data if user exists
        if (session?.user && mounted) {
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
              .then(({ data: profileData, error }) => {
                if (mounted && !error) {
                  setProfile(profileData);
                }
                if (error) {
                  console.error('Profile fetch error:', error);
                }
              });
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', !!session?.user);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user && mounted) {
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: profileData, error }) => {
              if (mounted && !error) {
                setProfile(profileData);
              }
              if (error) {
                console.error('Profile fetch error:', error);
              }
            });
        }, 0);
      }
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