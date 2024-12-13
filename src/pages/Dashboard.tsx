import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Users,
  BarChart,
} from "lucide-react";

import { CIcon } from '@coreui/icons-react';
import { cibTiktok } from '@coreui/icons';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserButton } from "@/components/UserButton";
import { trackShare } from "@/lib/stats";

const Dashboard = () => {
  const [earnings] = useState(108);
  const [clicks] = useState(4);
  const [referrals] = useState(0);
  const [offers] = useState(0);
  const { toast } = useToast();
  const referralLink = "ref.referralpro.com/user123";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const handleShare = async (platform: string) => {
    try {
      // Track the share
      await trackShare("user123", platform); // Replace with actual userId

      // Open share dialog
      let shareUrl = "";
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`;
          break;
        case "instagram":
          // Instagram doesn't have a direct share URL, so we'll just copy the link
          await navigator.clipboard.writeText(referralLink);
          toast({
            title: "Link copied!",
            description: "Share this link on Instagram.",
          });
          return;
        case "tiktok":
          // TikTok doesn't have a direct share URL, so we'll just copy the link
          await navigator.clipboard.writeText(referralLink);
          toast({
            title: "Link copied!",
            description: "Share this link on TikTok.",
          });
          return;
        case "snapchat":
          shareUrl = `https://www.snapchat.com/share?url=${encodeURIComponent(referralLink)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank");
      }

      toast({
        title: "Share tracked!",
        description: `Your share on ${platform} has been recorded.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1">
          <header className="flex justify-end p-4 bg-white border-b">
            <UserButton />
          </header>
          <main className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <Card className="bg-primary text-white p-6 mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Earnings</h2>
                <span className="text-3xl font-bold">${earnings.toFixed(2)}</span>
              </div>
            </Card>

            <div className="text-center mb-8">
              <p className="text-lg text-gray-600">
                You have {clicks} Click{clicks !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Referrals</h3>
                </div>
                <p className="text-3xl font-bold">{referrals}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <BarChart className="w-6 h-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Offers</h3>
                </div>
                <p className="text-3xl font-bold">{offers}</p>
              </Card>
            </div>

            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Copy Your Referral Link 👇
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-50"
                />
                <Button onClick={copyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button
                  className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button
                  className="bg-[#E4405F] hover:bg-[#E4405F]/90"
                  onClick={() => handleShare("instagram")}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Share on Instagram
                </Button>
                <Button
                  className="bg-gray-800/10 hover:bg-gray-800/20 text-gray-800"
                  onClick={() => handleShare("tiktok")}
                >
                  <CIcon icon={cibTiktok} size="xl" />
                  Share on TikTok
                </Button>
                <Button
                  className="bg-[#FFFC00] text-black hover:bg-[#FFFC00]/90"
                  onClick={() => handleShare("snapchat")}
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