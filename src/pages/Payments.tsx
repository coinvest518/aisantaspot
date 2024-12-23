import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaymentForm } from '../components/PaymentForm';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentIntent } from './api/create-payment-intent';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AppSidebar } from '../components/AppSidebar';
import { useUser } from '@/lib/useUser';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const Payments = () => {
  const { toast } = useToast();
  const { user, loading } = useUser(); // Access user and loading state
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [amount, setAmount] = useState<number>(10);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handlePaymentInitialization = async () => {
    if (!user) return; // Ensure user is logged in

    try {
      const { clientSecret } = await createPaymentIntent(amount);
      setClientSecret(clientSecret);
    } catch (err) {
      console.error('Payment initialization error:', err);
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // This will prevent any flickering as navigate is called in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Make a Payment</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Secure payment processing with Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="block w-full"
                />
              </div>

              <button
                onClick={handlePaymentInitialization}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Initialize Payment
              </button>

              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm clientSecret={clientSecret} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Payments;