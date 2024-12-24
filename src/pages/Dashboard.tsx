import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Facebook, Twitter, Instagram, MessageCircle, Users, BarChart, Calendar } from "lucide-react";
import { CIcon } from '@coreui/icons-react';
import { cibTiktok } from '@coreui/icons';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useUser } from '../lib/useUser';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  interface PotData {
    id: number;
    total_amount: number;
    is_current: boolean;
    created_at?: string;
  }

  interface UserStats {
    total_earned: number;
    completed_offers: number;
    current_streak: number;
  }

  interface RealtimePayload {
    new: PotData;
    old: PotData;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }

  const { user } = useUser();
  const [potTotal, setPotTotal] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    total_earned: 0,
    completed_offers: 0,
    current_streak: 0
  });
  const [dashboardData, setDashboardData] = useState({
    earnings: 0,
    clicks: 0,
    referrals: 0,
    completed_offers: 0,
    referralLink: "",
    username: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      try {
        const [
          profileResult,
          clickResult,
          referralResult,
          potResult,
          userStatsResult
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("clicks").select("*", { count: "exact" }).eq("user_id", user.id),
          supabase.from("referrals").select("*", { count: "exact" }).eq("referrer_id", user.id),
          supabase.from("pot").select("*").eq("is_current", true).single<PotData>(),
          supabase.from("user_stats").select("*").eq("user_id", user.id).single()
        ]);

        const { data: profile, error: profileError } = profileResult;
        const { count: clickCount } = clickResult;
        const { count: referralCount } = referralResult;
        const { data: potData, error: potError } = potResult;
        const { data: userStatsData, error: userStatsError } = userStatsResult;

        if (profileError || !profile) {
          navigate("/complete-profile");
          return;
        }

        if (!potError && potData) {
          setPotTotal(potData.total_amount || 0);
        }

        if (!userStatsError && userStatsData) {
          setUserStats({
            total_earned: userStatsData.total_earned || 0,
            completed_offers: userStatsData.completed_offers || 0,
            current_streak: userStatsData.current_streak || 0
          });
        }

        setDashboardData({
          earnings: profile.earnings || 0,
          clicks: clickCount || 0,
          referrals: referralCount || 0,
          completed_offers: profile.completed_offers || 0,
          referralLink: `ref.santaspot.xyz/${profile.referral_code}`,
          username: profile.username
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast({
          title: "Error loading dashboard",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    // Set up realtime subscriptions
    const potChannel = supabase.channel('pot_changes');
    const userStatsChannel = supabase.channel('user_stats_changes');
    
    potChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pot',
          filter: 'is_current=eq.true'
        },
        (payload) => {
          const typedPayload = payload as unknown as RealtimePayload;
          if (typedPayload.new && typeof typedPayload.new.total_amount === 'number') {
            setPotTotal(typedPayload.new.total_amount);
          }
        }
      )
      .subscribe();

    userStatsChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user?.id}`
        },
        (payload: any) => {
          const newStats = payload.new;
          setUserStats({
            total_earned: newStats.total_earned || 0,
            completed_offers: newStats.completed_offers || 0,
            current_streak: newStats.current_streak || 0
          });
        }
      )
      .subscribe();

    return () => {
      potChannel.unsubscribe();
      userStatsChannel.unsubscribe();
    };
  }, [user, navigate, toast]);

  const copyLink = () => {
    navigator.clipboard.writeText(dashboardData.referralLink);
    toast({
      title: "Link copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 w-full flex justify-between items-center p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <div className="px-6 py-4">
              <div className="text-sm font-semibold opacity-90">Current Pot Total</div>
              <div className="text-2xl font-bold">${potTotal.toFixed(2)}</div>
            </div>
          </Card>
        </div>

        <Button>
          {dashboardData.username ? `Welcome, ${dashboardData.username}!` : "Welcome!"}
        </Button>
      </header>
          
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
            
          <Card className="bg-primary text-white p-6 mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Total Earnings</h2>
              <span className="text-3xl font-bold">${dashboardData.earnings.toFixed(2)}</span>
            </div>
          </Card>

          {/* User Stats Card */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Earned</p>
                <p className="text-2xl font-bold text-primary">
                  ${userStats.total_earned.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Completed Offers</p>
                <p className="text-2xl font-bold text-primary">
                  {userStats.completed_offers}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold text-primary">
                  {userStats.current_streak} days
                </p>
              </div>
            </div>
          </Card>

          {/* Add prominent pot display at the top */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-2">Current Community Pot</h2>
                <div className="text-5xl font-bold mb-2">
                  ${potTotal.toFixed(2)}
                </div>
                <p className="text-sm opacity-90">
                  Total amount contributed by the community
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600">
              You have {dashboardData.clicks} Click{dashboardData.clicks !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Referrals</h3>
              </div>
              <p className="text-3xl font-bold">{dashboardData.referrals}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <BarChart className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Offers</h3>
              </div>
              <p className="text-3xl font-bold">{dashboardData.completed_offers}</p>
            </Card>
          </div>

          {/* Referral Link Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Copy Your Referral Link 👇
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={dashboardData.referralLink}
                readOnly
                className="flex-1 p-2 border rounded-md bg-gray-50"
              />
              <Button onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </Card>

          {/* Social Media Sharing */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                onClick={() => window.open("https://facebook.com", "_blank")}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </Button>
              <Button
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
                onClick={() => window.open("https://twitter.com", "_blank")}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </Button>
              <Button
                className="bg-[#E4405F] hover:bg-[#E4405F]/90"
                onClick={() => window.open("https://instagram.com", "_blank")}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Share on Instagram
              </Button>
              <Button
                className="bg-gray-800/10 hover:bg-gray-800/20 text-gray-800"
                onClick={() => window.open("https://tiktok.com", "_blank")}
              >
                <CIcon icon={cibTiktok} size="xl" />
                Share on TikTok
              </Button>
              <Button
                className="bg-[#FFFC00] text-black hover:bg-[#FFFC00]/90"
                onClick={() => window.open("https://snapchat.com", "_blank")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on Snapchat
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;