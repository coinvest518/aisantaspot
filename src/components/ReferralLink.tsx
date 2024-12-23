import { useState } from 'react';
import { Button } from './ui/button';
import { createShortUrl } from '../services/urlService';
import { toast } from 'sonner';

interface ReferralLinkProps {
  referralCode: string;
}

export const ReferralLink = ({ referralCode }: ReferralLinkProps) => {
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const result = await createShortUrl(referralCode);
      if (result) {
        setShortUrl(result.shortUrl);
      }
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error('Failed to generate referral link');
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      // Changed 'ref' to 'referral' to match the signup implementation
      await navigator.clipboard.writeText(
        shortUrl || `${import.meta.env.VITE_APP_URL}/signup?referral=${referralCode}`
      );
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
      <div className="flex flex-col gap-4">
        {!shortUrl && (
          <Button 
            onClick={generateLink} 
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Generating...' : 'Generate Short Link'}
          </Button>
        )}
        
        {shortUrl && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={copyToClipboard} variant="outline">
                Copy
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Share this link to earn rewards when people sign up!
            </div>
          </>
        )}
      </div>
    </div>
  );
};