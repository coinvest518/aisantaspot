import { supabase } from './supabase';

export interface DashboardStats {
  total_earned: number;
  clicks: number;
  referrals: number;
  completed_offers: number;
  current_streak: number;
}

export const fetchUserStats = async (userId: string): Promise<DashboardStats> => {
  console.log('Fetching stats for user:', userId);

  // Fetch user stats from 'user_stats' table
  const { data: userStats, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (statsError) {
    console.error('Error fetching user stats:', statsError);
    throw statsError;
  }

  console.log('Stats fetched successfully:', userStats);

  return {
    total_earned: userStats.total_earned || 0,
    clicks: userStats.clicks || 0,
    referrals: userStats.referrals || 0,
    completed_offers: userStats.completed_offers || 0,
    current_streak: userStats.current_streak || 0,
  };
};