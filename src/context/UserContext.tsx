import { createContext } from 'react';
import { User } from '../types/types';
import { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';


interface UserContextType {
  user: User | null;
  session: Session | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;

}
export const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  login: () => {},
  logout: async () => {},
  loading: true,
});

// Handle the email confirmation callback
export const handleEmailConfirmation = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw error;
  }

  if (session?.user) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const referralCode = uuidv4().slice(0, 8); // Generate a new referral code
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: session.user.id,
          username: '',
          referral_code: referralCode,
          earnings: 100 // Initial signup bonus
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }

    return session.user;
  }

  return null;
};