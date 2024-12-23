import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '../types/types';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { UserContext } from './UserContext';
import { toast } from "@/hooks/use-toast";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(initialSession);
        if (initialSession?.user) {
          const userData: User = {
            id: initialSession.user.id,
            username: initialSession.user.user_metadata?.username || null,
          };
          setUser(userData);

          // Check if profile exists, if not create it
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error fetching profile:', profileError);
          } else if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: userData.id,
              username: initialSession.user.user_metadata?.username || null,
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const userData: User = {
            id: currentSession.user.id,
            username: currentSession.user.user_metadata?.username || null,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, session, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};