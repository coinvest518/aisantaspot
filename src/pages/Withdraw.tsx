import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AppSidebar } from '../components/AppSidebar';

const Withdraw: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const { toast } = useToast();

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

    // Replace with actual Supabase mutation
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending'
      });

    if (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Withdrawal submitted",
        description: "Your withdrawal request has been submitted successfully.",
      });
      setAmount('');
      setPaymentDetails('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
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

