import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ProgressBar from '../components/ProgressBar';
import { UserContext } from '../context/UserContext';
import useUserStats from '../hooks/useUserStats';

const createWithdrawal = async (userId: string, amount: number, paymentMethod: string) => {
  const { data, error } = await supabase
    .from('withdrawals')
    .insert([
      {
        user_id: userId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'pending', // Set initial status to pending
      }
    ]);

  if (error) {
    console.error('Error creating withdrawal:', error);
    return null;
  }

  console.log('Withdrawal created successfully:', data);
  return data;
};

const calculateProgress = (stats: any) => {
  const { total_earned, completed_offers, current_streak } = stats;

  const earnedWeight = 0.4;
  const offersWeight = 0.4;
  const streakWeight = 0.2;

  const maxEarned = 1000;
  const maxOffers = 100;
  const maxStreak = 30;

  const earnedProgress = Math.min(total_earned / maxEarned, 1) * earnedWeight;
  const offersProgress = Math.min(completed_offers / maxOffers, 1) * offersWeight;
  const streakProgress = Math.min(current_streak / maxStreak, 1) * streakWeight;

  const totalProgress = (earnedProgress + offersProgress + streakProgress) * 100;

  return totalProgress;
};

const Withdraw: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const { toast } = useToast();
  const { user } = useContext(UserContext);
  const userStats = useUserStats();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      const withdrawal = await createWithdrawal(user.id, parseFloat(amount), paymentMethod);
      if (withdrawal) {
        toast({
          title: "Withdrawal submitted",
          description: "Your withdrawal request has been submitted successfully.",
        });
        setAmount('');
        setPaymentDetails('');
      } else {
        toast({
          title: "Withdrawal failed",
          description: "There was an error processing your withdrawal. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const progress = userStats ? calculateProgress(userStats) : 0;

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">🎮 Santa’sPot: The Holiday Giving Game! 🎁✨</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Welcome, {user?.email}</h2>
                <p>Here's how the withdrawal process works:</p>
                <ol className="list-decimal list-inside">
                  <li>Enter the amount you wish to withdraw.</li>
                  <li>Select your preferred payment method.</li>
                  <li>Provide the necessary payment details.</li>
                  <li>Submit your request and wait for approval.</li>
                </ol>
              </div>
              {userStats && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Your Stats:</h2>
                  <p>Donations: ${userStats.total_earned}</p>
                  <p>Completed Offers: {userStats.completed_offers}</p>
                  <p>Current Streak: {userStats.current_streak} days</p>
                  <ProgressBar value={progress} max={100} />
                </div>
              )}
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <Input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700">
                    Payment Details
                  </label>
                  <Input
                    type="text"
                    id="paymentDetails"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter payment details"
                    required
                  />
                </div>
                <Button type="submit">Submit Withdrawal Request</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Withdraw;