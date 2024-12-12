import { supabase } from './supabase';
import { nanoid } from 'nanoid';

export const signUp = async (email: string, password: string) => {
  console.log('Attempting to sign up user:', email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Sign up error:', authError);
    throw authError;
  }

  if (authData.user) {
    console.log('User signed up successfully:', authData.user.id);
    const referralCode = nanoid(10);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: email.split('@')[0],
        referral_code: referralCode,
        earnings: 0,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  console.log('Attempting to sign in user:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }

  console.log('User signed in successfully:', data.user?.id);
  return data;
};

export const signOut = async () => {
  console.log('Attempting to sign out user');
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  
  console.log('User signed out successfully');
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Get current user error:', error);
    throw error;
  }
  
  return user;
};

export const getReferralCode = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Get referral code error:', error);
    throw error;
  }

  return data?.referral_code;
};

export const trackReferral = async (referralCode: string, userId: string) => {
  console.log('Tracking referral:', { referralCode, userId });
  
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single();

  if (referrerError) {
    console.error('Find referrer error:', referrerError);
    throw referrerError;
  }

  if (referrer) {
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: userId,
        status: 'completed'
      });

    if (referralError) {
      console.error('Create referral error:', referralError);
      throw referralError;
    }
    
    console.log('Referral tracked successfully');
  }
};