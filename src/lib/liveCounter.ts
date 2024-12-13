import { supabase } from './supabase';

export interface LiveStats {
  total_users: number;
  total_earnings: number;
  total_clicks: number;
}

export const fetchLiveStats = async (): Promise<LiveStats> => {
  console.log('Fetching live stats');
  const { data, error } = await supabase
    .from('live_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching live stats:', error);
    throw error;
  }

  return data;
};

// Subscribe to live stats updates
export const subscribeLiveStats = (callback: (stats: LiveStats) => void) => {
  console.log('Subscribing to live stats');
  const channel = supabase
    .channel('live_stats_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'live_stats'
      },
      (payload) => {
        console.log('Live stats update received:', payload);
        callback(payload.new as LiveStats);
      }
    )
    .subscribe();

  return () => {
    console.log('Unsubscribing from live stats');
    supabase.removeChannel(channel);
  };
};