// PaymentForm.tsx
import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Make sure this matches your webhook API version
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not been properly initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-completion`,
          // Remove metadata from confirmParams as it's not allowed here
        },
        // Remove redirect parameter as it must be "always"
      });

      if (paymentError) {
        toast({
          title: "Payment Failed",
          description: paymentError.message || "An error occurred during payment.",
          variant: "destructive",
        });
        console.error('Payment error:', paymentError);
        return;
      }

      // Check PaymentIntent status
      //  This is not available in this context.  The paymentIntent is returned in the redirect.
      if (true) { // Replace with actual success check after redirect
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
          variant: "default",
        });
      } else {
        toast({          
          title: "Payment Failed",
          description: "Payment was not successful.",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
};

interface PaymentFormProps {
  clientSecret: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret }) => {
  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0066cc',
        colorBackground: '#ffffff',
        colorText: '#30313d',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      <CheckoutForm />
    </Elements>
  );
};
