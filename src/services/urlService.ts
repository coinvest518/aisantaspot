import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';

export const createShortUrl = async (referralCode: string) => {
  const shortCode = nanoid(6);
  // Changed 'ref' to 'referral' to match the signup implementation
  const longUrl = `${import.meta.env.VITE_APP_URL}/signup?referral=${referralCode}`;

  try {
    const { data, error } = await supabase
      .from('short_urls')
      .insert([
        {
          short_code: shortCode,
          long_url: longUrl,
          referral_code: referralCode,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      shortUrl: `${import.meta.env.VITE_APP_URL}/r/${shortCode}`,
      originalUrl: longUrl
    };
  } catch (error) {
    console.error('Error creating short URL:', error);
    return null;
  }
};