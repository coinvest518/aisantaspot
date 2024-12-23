import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Determine the correct environment variables based on your project setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables!');
}

// Create Supabase client with persistent session
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

// Type definitions
export type Profile = {
  id: string;
  username: string | null;
  referral_code: string | null;
  earnings: number;
  created_at: string;
  updated_at: string;
};

// Sign up a new user
export const signUp = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/complete-profile`, // Redirect after email confirmation
      }
    });

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    return {
      user: data.user,
      message: "Please check your email for confirmation link"
    };
  } catch (error) {
    console.error('Signup Error:', error);
    throw error;
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    return data.user;
  } catch (error) {
    console.error('Signin Error:', error);
    throw error;
  }
};

// Handle email confirmation and create user profile
export const handleEmailConfirmation = async (access_token: string, referralCode?: string) => {
  try {
    // Exchange the access token for a new session
    const { data, error } = await supabase.auth.exchangeCodeForSession(access_token);

    if (error) {
      throw error;
    }

    const userId = data.session?.user.id;
    if (!userId) {
      throw new Error("No user ID found in session");
    }

    // Generate referral code 
    const newReferralCode = uuidv4().slice(0, 8);

    // Create the profile after email confirmation
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: userId,
        username: null,
        referral_code: newReferralCode,
        earnings: 100,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      throw new Error(`Profile creation failed: ${insertError.message}`);
    }

    // Update referrer's earnings if referral code is provided
    if (referralCode) {
      await updateReferrerEarnings(referralCode, userId);
    }

    return { user: data.session?.user, message: 'Email confirmed and profile created' };
  } catch (error) {
    console.error('Email confirmation or Profile creation failed:', error);
    throw error;
  }
};

// Update referrer's earnings when a new user signs up with a referral code
const updateReferrerEarnings = async (referralCode: string, referredId: string) => {
  try {
    // Fetch the referrer profile using the referral code
    const { data: referrerProfile, error } = await supabase
      .from('profiles')
      .select('id, earnings')
      .eq('referral_code', referralCode)
      .single();

    if (error) {
      throw new Error(`Referrer fetch failed: ${error.message}`);
    }

    if (referrerProfile) {
      // Update the referrer's earnings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          earnings: (referrerProfile.earnings || 0) + 50, // Assuming 50 is the earnings increment
          updated_at: new Date().toISOString()
        })
        .eq('id', referrerProfile.id);

      if (updateError) {
        throw new Error(`Referrer earnings update failed: ${updateError.message}`);
      }

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerProfile.id,
          referred_id: referredId,
          referral_code_used: referralCode,
          status: 'completed',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Error inserting referral record: ${insertError.message}`);
      }
    }
  } catch (error) {
    console.error('Error updating referrer earnings:', error);
  }
};

// Create or fetch user profile
const createProfile = async (userId: string) => {
  if (!userId) {
    console.error('No user ID provided. User must be authenticated to create a profile.');
    return null;
  }

  try {
    console.log('Creating profile for user:', userId);
    
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return null;
    }
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return existingProfile;
    }
    
    const newReferralCode = uuidv4().slice(0, 8);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        username: null,
        referral_code: newReferralCode,
        earnings: 100,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }
    
    return newProfile;
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
};

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Signout Error:', error);
    throw error;
  }
};

// Get the current logged-in user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Failed to get current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get Current User Error:', error);
    return null;
  }
};

// Listen for auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
};

// Generate referral link
export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}/signup?referral=${referralCode}`;
};

// Create a referral entry
export const createReferralEntry = async (
  referrerId: string | null,
  referredId: string,
  referralCodeUsed: string | null
) => {
  if (!referredId) {
    console.error('Referred ID is required to create a referral entry.');
    return;
  }
  try {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referral_code_used: referralCodeUsed,
        status: referrerId ? 'completed' : 'pending',
        created_at: new Date().toISOString(),
      });
    if (error) {
      console.error('Error creating referral entry:', error);
    } else {
      console.log('Referral entry created successfully');
    }
  } catch (error) {
    console.error('Error creating referral entry:', error);
  }
};