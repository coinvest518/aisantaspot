import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from '../components/AppSidebar';
import { Button } from "@/components/ui/button";
import { User } from '@supabase/supabase-js';
import { Copy, Share2, Gift, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Profile {
  id: string;
  username: string | null;
  referral_code: string;
  earnings: number;
}

interface ReferralData {
  created_at: string;
  referrer_id: string;
  referred_id: string;
  status: string;
}

const Referrals: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchReferrals();
    }
  }, [user]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchReferrals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
    } else if (data) {
      setReferrals(data);
    }
  };

  const getChartData = () => {
    // Group referrals by date
    const grouped = referrals.reduce((acc: { [key: string]: number }, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(grouped).slice(-7), // Last 7 days
      datasets: [
        {
          label: 'Referrals',
          data: Object.values(grouped).slice(-7),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const copyReferralLink = async () => {
    if (!profile?.referral_code) return;
    
    const referralLink = `${window.location.origin}/signup?referral=${profile.referral_code}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!profile?.referral_code) return;

    const referralLink = `${window.location.origin}/signup?referral=${profile.referral_code}`;
    try {
      await navigator.share({
        title: 'Join Santa\'s Pot!',
        text: 'Sign up using my referral link and earn $100!',
        url: referralLink,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-red-50 to-white">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Referral Dashboard 🎄
              </h1>
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg mb-2">Your Referral Code:</p>
                    <p className="text-3xl font-bold">{profile?.referral_code}</p>
                  </div>
                  <div className="space-x-4">
                    <Button
                      onClick={copyReferralLink}
                      variant="secondary"
                      className="bg-white text-red-600 hover:bg-gray-100"
                    >
                      {copied ? <span>Copied! ✓</span> : <><Copy className="w-4 h-4 mr-2" /> Copy Link</>}
                    </Button>
                    <Button
                      onClick={shareReferralLink}
                      variant="secondary"
                      className="bg-white text-red-600 hover:bg-gray-100"
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Total Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">
                      {referrals.length}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-green-500" />
                      Active This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">
                      {referrals.filter(r => {
                        const date = new Date(r.created_at);
                        const now = new Date();
                        return date.getMonth() === now.getMonth();
                      }).length}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-yellow-600">
                      ${profile?.earnings.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {referrals.length > 0 ? (
                      <Line
                        data={getChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Last 7 Days'
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No referral data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Referrals;