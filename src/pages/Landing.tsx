import { Button } from "@/components/ui/button";
import { ArrowRight, Users, DollarSign, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">ReferralPro</div>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
          Get Started
        </Button>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            Earn Money Through Your Network
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Share your unique referral link, earn $2 per click and $50 for every
            successful signup. Start earning passive income today!
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="text-lg px-8"
          >
            Start Earning Now
            <ArrowRight className="ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Share2 className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
            <p className="text-gray-600">
              Get your unique referral link and share it across your social
              networks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Grow Your Network</h3>
            <p className="text-gray-600">
              Earn $2 for every unique click and $50 when they sign up.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
            <p className="text-gray-600">
              Withdraw your earnings easily through our secure payment system.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;