import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Facebook, Twitter, Instagram, MessageCircle, Users, BarChart } from "lucide-react";
import { CIcon } from '@coreui/icons-react';
import { cibTiktok } from '@coreui/icons';
import  React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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

  interface RealtimePayload {
    new: PotData;
    old: PotData;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }

  const { user } = useUser();
  const [potTotal, setPotTotal] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    earnings: 0,
    clicks: 0,
    referrals: 0,
    offers: 0,
    referralLink: "",
    username: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      try {
        // Fetch all dashboard data in parallel with proper destructuring names
        const [
          profileResult,
          clickResult,
          referralResult,
          offerResult,
          potResult
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("clicks").select("*", { count: "exact" }).eq("user_id", user.id),
          supabase.from("referrals").select("*", { count: "exact" }).eq("referrer_id", user.id),
          supabase.from("offers").select("*", { count: "exact" }).eq("user_id", user.id),
          supabase.from("pot").select("*").eq("is_current", true).single<PotData>()
        ]);

        const { data: profile, error: profileError } = profileResult;
        const { count: clickCount } = clickResult;
        const { count: referralCount } = referralResult;
        const { count: offerCount } = offerResult;
        const { data: potData, error: potError } = potResult;

        if (profileError || !profile) {
          navigate("/complete-profile");
          return;
        }

        // Set pot total
        if (!potError && potData) {
          setPotTotal(potData.total_amount || 0);
        }

        setDashboardData({
          earnings: profile.earnings || 0,
          clicks: clickCount || 0,
          referrals: referralCount || 0,
          offers: offerCount || 0,
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
  // Set up realtime subscription
  const potChannel = supabase.channel('pot_changes');
    
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
    return () => {
      potChannel.unsubscribe();
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
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          {/* Add pot total display */}
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
          
          <main className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            <Card className="bg-primary text-white p-6 mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Earnings</h2>
                <span className="text-3xl font-bold">${dashboardData.earnings.toFixed(2)}</span>
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

            <div className="text-center mb-8">
              <p className="text-lg text-gray-600">
                You have {dashboardData.clicks} Click{dashboardData.clicks !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                <p className="text-3xl font-bold">{dashboardData.offers}</p>
              </Card>
            </div>

            {/* Referral Link Card */}
            <Card className="p-6 mb-8">
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

           
          </main>
        </div>
      </div>

      
    </SidebarProvider>
  );
};

export default Dashboard;