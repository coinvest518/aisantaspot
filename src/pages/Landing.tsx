import { Button } from "@/components/ui/button";
import { ArrowRight, Users, DollarSign, Share2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

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
          description: "Welcome to ReferralPro.",
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">ReferralPro</div>
        <Button onClick={() => setIsLogin(!isLogin)} variant="outline">
          {isLogin ? "Need an account?" : "Already have an account?"}
        </Button>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold mb-6">
              Earn Money Through Your Network
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Share your unique referral link, earn $2 per click and $50 for every
              successful signup. Start earning passive income today!
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="pt-6">
                  <Share2 className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Share</h3>
                  <p className="text-sm text-gray-600">Share your unique link</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Refer</h3>
                  <p className="text-sm text-gray-600">Invite friends to join</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Earn</h3>
                  <p className="text-sm text-gray-600">Get paid for referrals</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
              <CardDescription>
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Sign up to start earning"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
    </div>
  );
};

export default Landing;