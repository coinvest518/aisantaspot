import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Redirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLongUrl = async () => {
      if (!shortCode) return;

      try {
        // Get the long URL
        const { data, error } = await supabase
          .from('short_urls')
          .select('long_url, referral_code')
          .eq('short_code', shortCode)
          .single();

        if (error || !data) {
          navigate('/404');
          return;
        }

        // Track the click
        await supabase
          .from('referral_clicks')
          .insert([
            {
              short_code: shortCode,
              referral_code: data.referral_code,
              user_agent: navigator.userAgent,
            }
          ]);

        // Increment click count
        await supabase
          .rpc('increment_clicks', { short_code_param: shortCode });

        // Redirect to the long URL
        window.location.href = data.long_url;
      } catch (error) {
        console.error('Error redirecting:', error);
        navigate('/404');
      }
    };

    redirectToLongUrl();
  }, [shortCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500" />
    </div>
  );
};