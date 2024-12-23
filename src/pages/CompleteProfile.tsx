import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { processReferralReward, createReferralEntry } from '../../utils/referral'; // Adjust path as needed


import { useUser } from '../lib/useUser';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null); // Store the user's referral code

  useEffect(() => {
    const checkProfileAndFetchReferralCode = async () => {
      if (!user) return; // Ensure user is authenticated

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, referral_code')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Handle case where no profile exists
            console.warn('No profile found for user:', user.id);
            return; // You might want to redirect or show a message
          }
          console.error('Error fetching profile:', error);
          return; // Handle other errors as needed
        }

        if (profile) {
          if (profile.username) {
            toast({
              title: "Profile Already Complete",
              description: "You already have a complete profile",
            });
            navigate('/dashboard');
          }
          if (profile.referral_code) {
            setUserReferralCode(profile.referral_code);
          }
        }

      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    };

    checkProfileAndFetchReferralCode();
  }, [user, navigate, toast]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "No user found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    if (!username || username.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if username is taken by another user
      const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

  if (existingProfile) {
      // Update profile
      const { error: updateError } = await supabase
          .from('profiles')
          .update({ username, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      if (updateError) throw updateError;
  } else {
      throw new Error("No profile found. Please sign up.");
  }

  let referrerId = null; // Initialize referrerId

  if (referralCode) {
      const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();

      if (referrer) {
          referrerId = referrer.id; // Set referrerId if referrer found

          const rewardSuccessful = await processReferralReward(referrer.id, user.id, referralCode);
          if (!rewardSuccessful) {
              console.error("Failed to process referral reward");
          } else {
             const { error } = await supabase
              .from('profiles')
              .update({ earnings: existingProfile.earnings + 100 })
              .eq('id', user.id);
          if (error) {
             console.error('Error updating earnings:', error);
              // Handle error appropriately
            }
          }
      }
  } else {
      // If no referralCode, update earnings with base amount
      const { error } = await supabase
      .from('profiles')
      .update({ earnings: existingProfile.earnings + 100})
      .eq('id', user.id);
      if (error) {
        console.error('Error updating base earnings:', error);
      // Handle error appropriately
      }
  }


  // Always create a referral entry
  await createReferralEntry(referrerId, user.id, referralCode || userReferralCode); // Use userReferralCode here


  toast({
      title: "Profile completed!",
      description: "Welcome to Santa's Pot. You've earned 100 points!",
  });

  navigate('/dashboard');

} catch (error) {
  console.error("Profile completion error:", error);
  toast({
      title: "Error",
      description: "Failed to complete profile. Please try again.",
      variant: "destructive",
  });
} finally {
  setIsSubmitting(false);
}
};

return (
  <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Welcome to Santa's Pot! 🎅</h2>
          <p className="text-gray-600 mt-2">Let's complete your profile to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Choose Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
              placeholder="Your unique username"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="referral" className="text-sm font-medium">
              Referral Code (Optional)
            </label>
            <Input
              id="referral"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code if you have one"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Completing Profile..." : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);
};

export default CompleteProfile;