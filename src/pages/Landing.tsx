import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Gift, Users, DollarSign, CreditCard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import LiveCounter from "@/components/LiveCounter";
import Testimonials from "@/components/Testimonials";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Account created!",
          description: "Welcome to Santas Pot.",
        });
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
<<<<<<< HEAD
        <div className="text-2xl font-bold text-primary">Santas Pot</div>
        <Button onClick={() => setIsLogin(!isLogin)} variant="outline">
          {isLogin ? "Need an account?" : "Already have an account?"}
        </Button>
=======
        <div className="flex items-center space-x-2">
          <Gift className="w-8 h-8 text-red-500" />
          <div className="text-2xl font-bold text-primary">
            ReferralPro
            <span className="text-red-500">🎅</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account?" : "Already have an account?"}
          </Button>
        </div>
>>>>>>> 2d7e1d859fa40b80ba115180cbcaa68849437db7
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold mb-6">
              Earn Money Through Your Network
              <span className="text-red-500">🎄</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Share your unique referral link, earn $2 per click and $50 for every
              successful signup. Start earning passive income today!
            </p>
            
            <LiveCounter />

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Share</h3>
                  <p className="text-sm text-gray-600">Share your unique link</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <Gift className="w-8 h-8 text-red-500 mb-4" />
                  <h3 className="font-semibold mb-2">Refer</h3>
                  <p className="text-sm text-gray-600">Invite friends to join</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-semibold mb-2">Earn</h3>
                  <p className="text-sm text-gray-600">Get paid for referrals</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="referral" className="text-sm font-medium">
                      Referral Code (Optional)
                    </label>
                    <Input
                      id="referral"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* About Section */}
      <section className="py-16 bg-white/80">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6">
              We're a global community of entrepreneurs and referral marketers,
              helping each other succeed. Our platform makes it easy to earn money
              by sharing products and services you love.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">300K+</h3>
                <p className="text-gray-600">Active Members</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">$9.7M+</h3>
                <p className="text-gray-600">Paid Out</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">500K+</h3>
                <p className="text-gray-600">Successful Referrals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Payment Methods</h2>
          <div className="flex justify-center items-center space-x-8">
            <Card className="p-6">
              <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-center font-semibold">PayPal</p>
            </Card>
            <Card className="p-6">
              <CreditCard className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-center font-semibold">Cash App</p>
            </Card>
            <Card className="p-6">
              <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <p className="text-center font-semibold">Venmo</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ReferralPro</h3>
              <p className="text-gray-400">
                Making passive income accessible to everyone.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Email: support@referralpro.com
                <br />
                Available 24/7
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 ReferralPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;