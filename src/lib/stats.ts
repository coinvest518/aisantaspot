import { supabase } from './supabase';

export interface DashboardStats {
  earnings: number;
  clicks: number;
  referrals: number;
  offers: number;
}

export const fetchUserStats = async (userId: string): Promise<DashboardStats> => {
  console.log('Fetching stats for user:', userId);
  
  // Get total earnings
  const { data: earningsData, error: earningsError } = await supabase
    .from('earnings')
    .select('amount')
    .eq('user_id', userId);
    
  if (earningsError) {
    console.error('Error fetching earnings:', earningsError);
    throw earningsError;
  }

  const totalEarnings = earningsData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

  // Get total clicks
  const { count: clickCount, error: clicksError } = await supabase
    .from('clicks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (clicksError) {
    console.error('Error fetching clicks:', clicksError);
    throw clicksError;
  }

  // Get total referrals
  const { count: referralCount, error: referralsError } = await supabase
    .from('referrals')
    .select('*', { count: 'exact' })
    .eq('referrer_id', userId)
    .eq('status', 'completed');

  if (referralsError) {
    console.error('Error fetching referrals:', referralsError);
    throw referralsError;
  }

  // Get total offers completed
  const { count: offersCount, error: offersError } = await supabase
    .from('earnings')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('type', 'offer')
    .eq('status', 'completed');

  if (offersError) {
    console.error('Error fetching offers:', offersError);
    throw offersError;
  }

  console.log('Stats fetched successfully:', {
    earnings: totalEarnings,
    clicks: clickCount,
    referrals: referralCount,
    offers: offersCount
  });

  return {
    earnings: totalEarnings,
    clicks: clickCount || 0,
    referrals: referralCount || 0,
    offers: offersCount || 0
  };
};

export const trackClick = async (referralCode: string, userId: string, ipAddress: string) => {
  console.log('Tracking click:', { referralCode, userId, ipAddress });
  
  // First check if this IP has already clicked in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { count: existingClicks, error: checkError } = await supabase
    .from('clicks')
    .select('*', { count: 'exact' })
    .eq('ip_address', ipAddress)
    .eq('referral_code', referralCode)
    .gte('created_at', twentyFourHoursAgo);

  if (checkError) {
    console.error('Error checking existing clicks:', checkError);
    throw checkError;
  }

  if (existingClicks && existingClicks > 0) {
    console.log('Click from this IP already recorded in last 24h');
    return false;
  }

  // Record the click
  const { error: clickError } = await supabase
    .from('clicks')
    .insert({
      user_id: userId,
      referral_code: referralCode,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    });

  if (clickError) {
    console.error('Error recording click:', clickError);
    throw clickError;
  }

  console.log('Click recorded successfully');

  // Add earnings for the click
  const { error: earningError } = await supabase
    .from('earnings')
    .insert({
      user_id: userId,
      amount: 2.00, // $2 per click
      type: 'click',
      status: 'pending',
      created_at: new Date().toISOString()
    });

  if (earningError) {
    console.error('Error recording earnings:', earningError);
    throw earningError;
  }

  console.log('Earnings recorded for click');

  // Update live stats
  await updateLiveStats();
  console.log('Live stats updated after click');

  return true;
};

export const trackShare = async (userId: string, platform: string) => {
  console.log('Tracking share:', { userId, platform });
  
  // Record the share
  const { error: shareError } = await supabase
    .from('shares')
    .insert({
      user_id: userId,
      platform,
      created_at: new Date().toISOString()
    });

  if (shareError) {
    console.error('Error recording share:', shareError);
    throw shareError;
  }

  console.log('Share recorded successfully');
  return true;
};

export const updateLiveStats = async () => {
  console.log('Updating live stats');
  
  // Get current totals
  const { data: stats, error: statsError } = await supabase
    .from('live_stats')
    .select('*')
    .single();

  if (statsError) {
    console.error('Error fetching live stats:', statsError);
    throw statsError;
  }

  console.log('Live stats updated successfully:', stats);
  return stats;
};