import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

type PaymentStatus = 'success' | 'processing' | 'failed' | 'checking';
type PaymentData = {
    amount: number;
    status: string;
    payment_intent: string;
    user_id: string;
};

export const usePaymentProcessing = (
  paymentIntent: string | null,
  redirectStatus: string | null,
  userId: string | null
) => {
  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [hasCheckedPayment, setHasCheckedPayment] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      if (!userId || hasCheckedPayment) return;

      try {
        if (!paymentIntent) {
          console.error('Payment intent missing');
          setStatus('failed');
          setError("Payment intent is missing. Please check your URL and try again.");
          return;
        }

        console.log('Checking payment status for:', {
          paymentIntent,
          userId,
          redirectStatus
        });

        // Check payment details
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('payment_intent', paymentIntent)
          .single<PaymentData>();

        if (paymentError) {
          console.error('Error fetching payment:', paymentError);
          throw new Error("Unable to fetch payment details");
        }

        console.log('Found payment:', payment);

        if (!payment) {
          throw new Error("Payment not found");
        }

        setPaymentAmount(payment.amount);

        if (redirectStatus === 'succeeded') {
          await processPayment(payment);
        } else if (redirectStatus === 'processing') {
          handleProcessingPayment(paymentIntent);
        } else {
          setStatus('failed');
          setError("Payment status invalid");
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setHasCheckedPayment(true);
      }
    };

    const processPayment = async (payment: PaymentData) => {
      try {
        console.log('Processing payment:', payment);

        // 1. Create pot contribution
        const { error: contributionError } = await supabase
          .from('pot_contributions')
          .insert([{
            user_id: userId,
            amount: payment.amount,
            stripe_payment_id: payment.payment_intent,
            status: 'completed'
          }]);

        if (contributionError) {
          console.error('Error creating contribution:', contributionError);
          throw contributionError;
        }

        console.log('Created pot contribution');

        // 2. Update user earnings
        const { error: userError } = await supabase
          .rpc('update_user_earnings', {
            p_user_id: userId,
            p_amount: payment.amount
          });

        if (userError) {
          console.error('Error updating user earnings:', userError);
          throw userError;
        }

        console.log('Updated user earnings');

        // 3. Update pot total
        const { error: potError } = await supabase
          .rpc('update_pot_total', {
            p_amount: payment.amount
          });

        if (potError) {
          console.error('Error updating pot:', potError);
          throw potError;
        }

        console.log('Updated pot total');

        // 4. Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('payment_intent', payment.payment_intent);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
        }

        console.log('Payment processing completed successfully');

        if (isMounted) {
          toast({
            title: "Payment Successful",
            description: `Your payment of $${payment.amount.toFixed(2)} has been processed successfully!`,
          });
          setStatus('success');
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error('Error in processPayment:', error);
        if (isMounted) {
          setStatus('failed');
          setError('Failed to complete payment processing');
          toast({
            title: "Payment Processing Error",
            description: "There was an error processing your payment. Please contact support.",
            variant: "destructive"
          });
        }
      }
    };

    const handleProcessingPayment = (paymentIntentId: string) => {
      setStatus('processing');
      intervalId = setInterval(async () => {
        try {
          const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_intent', paymentIntentId)
            .single<PaymentData>();

          if (error) throw error;

          if (payment?.status === 'completed' && isMounted) {
            await processPayment(payment);
          } else if (payment?.status === 'failed' && isMounted) {
            setStatus('failed');
            setError('Payment processing failed');
          }
        } catch (checkError) {
          console.error('Error checking payment status:', checkError);
        }
      }, 5000);
    };

    checkPaymentStatus();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId, paymentIntent, redirectStatus, hasCheckedPayment, navigate, toast]);

  return { status, error, paymentAmount };
};