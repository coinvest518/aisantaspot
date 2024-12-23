// src/hooks/useUserStats.ts
import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { UserContext } from '../context/UserContext';

const useUserStats = () => {
  const { user } = useContext(UserContext);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) setUserStats(data);
        if (error) console.error('Error fetching user stats:', error);
      }
    };
    fetchUserStats();
  }, [user]);

  return userStats;
};

export default useUserStats;