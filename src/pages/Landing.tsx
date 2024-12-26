import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users, DollarSign, CreditCard } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../lib/useUser';
import LiveCounter from "@/components/LiveCounter";
import Testimonials from "@/components/Testimonials";
import AuthForm from "@/components/authForm";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import DrawTimer from "@/components/DrawTimer";
import RewardPot from '@/components/RewardPot';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

// Function to process referral rewards
const processReferralReward = async (referralCode: string, newUserId: string) => {
  try {
    // Find referrer by their referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, earnings')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError) throw referrerError;

    if (referrer) {
      // Update referrer's earnings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          earnings: (referrer.earnings || 0) + 50,
          updated_at: new Date().toISOString()
        })
        .eq('id', referrer.id);

      if (updateError) throw updateError;

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: referrer.id,
          referred_id: newUserId,
          referral_code_used: referralCode,
          status: 'completed',
          reward_amount: 50,
          created_at: new Date().toISOString()
        }]);

      if (referralError) throw referralError;

      return true;
    }
  } catch (error) {
    console.error('Error processing referral:', error);
    throw error;
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const { login: loginUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [showRewardPot, setShowRewardPot] = useState(true);

  // Extract referral code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('referral');
    if (code) {
      setReferralCode(code);
    }
  }, []);

  const signUp = async (email: string, password: string, referralCode?: string) => {
    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/complete-profile`,
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Generate unique referral code for new user
        const newReferralCode = uuidv4().slice(0, 8);

        // 3. Create user profile with referral code
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            username: null,
            referral_code: newReferralCode,
            earnings: 100, // Initial bonus
            created_at: new Date().toISOString()
          }]);

        if (profileError) throw profileError;

        // 4. Process referral reward if referral code was used
        if (referralCode) {
          await processReferralReward(referralCode, data.user.id);
        }
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const userData = await signIn(email, password);
        if (userData) {
          loginUser({ id: userData.id, username: userData.user_metadata?.username });
          toast("Welcome Back! 👋", {
            description: `Successfully logged in as ${email}`,
            duration: 4000,
          });
          navigate("/dashboard");
        }
      } else {
        // Include referral code during signup if present
        await signUp(email, password, referralCode);
        toast("Check Your Email! 📧", {
          description: "We've sent you a verification link. Please verify your email before logging in.",
          duration: 6000,
        });
        setEmail("");
        setPassword("");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast("Error", {
        description: error?.message || "Something went wrong. Please try again.",
        duration: 4000,
        style: { backgroundColor: 'red', color: 'white' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Add this to your existing code
  const handleClaimReward = async () => {
    try {
      // Add your reward claiming logic here
      toast.success("🎄 Christmas Gift claimed successfully!");
      setShowRewardPot(false);
    } catch (error) {
      toast.error("Failed to claim gift");
    }
  };

  return (
    <>
    {showRewardPot && (
      <RewardPot 
        isNewUser={true} 
        onClose={handleClaimReward}
      />
    )}

    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-fuchsia-500 to-cyan-400">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <Gift className="w-8 h-8 text-red-500" />
          <div className="text-2xl font-bold text-primary">
            Santas Pot
            <span className="text-red-500">🎅</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account?" : "Already have an account?"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Earn Money Through Your Network
              <span className="text-red-500">🎄</span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Share your unique referral link, earn $2 per click and $50 for every
              successful new signup. $200 for new users. Start earning passive income today!
            </p>
            <LiveCounter />
            <div className="mt-6">
              <DrawTimer />
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-[#00d4ff] mb-4" />
                  <h3 className="font-semibold mb-2 text-white">Share</h3>
                  <p className="text-sm text-gray-300">Share your unique link</p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                <CardContent className="pt-6">
                  <Gift className="w-8 h-8 text-[#ff0080] mb-4" />
                  <h3 className="font-semibold mb-2 text-white">Refer</h3>
                  <p className="text-sm text-gray-300">Invite friends to join</p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 text-[#7928ca] mb-4" />
                  <h3 className="font-semibold mb-2 text-white">Earn</h3>
                  <p className="text-sm text-gray-300">Get paid for referrals</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
            <AuthForm
              isLogin={isLogin}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleSubmit}
            />
          </Card>
        </div>
      </main>

      {/* About Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">About Us</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-300 mb-6">
              Santa's Pot is more than just a community of hope, connection,
              and mutual support. We believe that everyone deserves a chance, and together,
              we can create unexpected moments of joy and relief.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-[#00d4ff] mb-2">300K+</h3>
                <p className="text-gray-300">Active Members</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-[#ff0080] mb-2">$9.7M+</h3>
                <p className="text-gray-300">Paid Out</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-[#7928ca] mb-2">500K+</h3>
                <p className="text-gray-300">Successful Referrals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-gradient-to-b from-[#7928ca] to-[#00d4ff]/80 relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-white text-opacity-90">
            Payment Methods
          </h2>
          <div className="flex justify-center items-center space-x-8">
            <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
              <CreditCard className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
              <p className="text-center font-semibold text-white">PayPal</p>
            </Card>
            <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
              <CreditCard className="w-12 h-12 text-[#ff0080] mx-auto mb-4" />
              <p className="text-center font-semibold text-white">Cash App</p>
            </Card>
            <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
              <CreditCard className="w-12 h-12 text-[#7928ca] mx-auto mb-4" />
              <p className="text-center font-semibold text-white">Venmo</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#7928ca] to-[#1a1a1a] text-white py-12 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00d4ff]">ReferralPro</h3>
              <p className="text-gray-300">
                Making passive income accessible to everyone.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#ff0080]">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="/" 
                     target="_blank" 
                     className="hover:text-[#00d4ff] transition-colors duration-300">
                    Home
                  </a>
                </li>
                <li>
                  <a href="https://buymeacoffee.com/coinvest/e/344832" 
                     target="_blank"
                     className="hover:text-[#00d4ff] transition-colors duration-300">
                    Want an APP Made Like this?
                  </a>
                </li>
                <li>
                  <a href="https://t.me/omniai_ai" 
                     target="_blank"
                     className="hover:text-[#00d4ff] transition-colors duration-300">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="https://www.publish0x.com/omniai/santas-pot-whitepapaer-and-faq-xoqewmq" 
                     target="_blank"
                     className="hover:text-[#00d4ff] transition-colors duration-300">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00d4ff]">Contact Us</h3>
              <p className="text-gray-300">
                Telegram: <a 
                  href="https://t.me/omniai_ai" 
                  className="text-[#ff0080] hover:text-[#00d4ff] transition-colors duration-300"
                >
                  https://t.me/omniai_ai
                </a>
                <br />
                <span className="text-[#00d4ff]">Available 24/7</span>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#ff0080]/20 text-center text-gray-300">
            <p>&copy; 2024 Referrer.IO All rights reserved.</p>
          </div>
        </div>
        
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d4ff]"></div>
      </footer>
    </div>
    </>
);
};

export default Landing;