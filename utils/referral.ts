import { supabase } from '@/lib/supabase';
export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}/signup?referral=${referralCode}`;
};
export const processReferralReward = async (
  referrerId: string,
  referredId: string,
  referralCode: string,
  rewardAmount: number = 50
): Promise<boolean> => {
  try {
    if (!referrerId || !referredId || !referralCode) {
      console.error('Invalid referral data:', { referrerId, referredId, referralCode });
      return false;
    }
    // Get current referrer's profile
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('earnings')
      .eq('id', referrerId)
      .single();
    if (referrerError) {
      console.error('Error fetching referrer profile:', referrerError);
      return false;
    }
    // Update referrer's earnings
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        earnings: (referrerProfile.earnings || 0) + rewardAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', referrerId);
    if (updateError) {
      console.error('Error updating referrer earnings:', updateError);
      return false;
    }
    // Create referral record
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referral_code_used: referralCode,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    if (insertError) {
      console.error('Error inserting referral record:', insertError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error rewarding referrer:', error);
    return false;
  }
};
// Add click tracking function
export const trackReferralClick = async (userId: string, referralCode: string) => {
  const { data, error } = await supabase
    .from('referral_clicks')
    .insert([
      {
        user_id: userId,
        referral_code: referralCode,
        clicked_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error tracking click:', error);
    throw error;
  }
  return data;
};

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