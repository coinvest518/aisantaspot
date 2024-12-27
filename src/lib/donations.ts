// donations.ts
import { supabase } from './supabase';

export const recordDonation = async (userId: string, amount: number, currency: string, network: string) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert([
        {
          user_id: userId,
          amount,
          currency,
          network
        }
      ]);

    if (error) {
      throw new Error(`Failed to record donation: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error recording donation:', error);
    throw error;
  }
};